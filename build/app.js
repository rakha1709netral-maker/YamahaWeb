// ============================================================
// NUSA MOTORS — portal internal dealer
// ============================================================

const MENU = [
  { section: "Ringkasan" },
  { id: "dashboard", href: "dashboard.html", icon: "▦", label: "Dashboard", roles: ["karyawan", "manajer", "owner"] },
  { id: "katalog", href: "katalog.html", icon: "◆", label: "Preview Showroom", roles: ["karyawan", "manajer", "owner"] },
  { id: "transaksi", href: "transaksi.html", icon: "⌁", label: "Penjualan / Kasir", roles: ["karyawan", "manajer", "owner"] },
  { section: "Showroom", roles: ["manajer", "owner"] },
  { id: "produk", href: "produk.html", icon: "◫", label: "Inventori Kendaraan", roles: ["manajer", "owner"] },
  { id: "kategori", href: "kategori.html", icon: "◇", label: "Jenis & Kategori", roles: ["manajer", "owner"] },
  { id: "pelanggan", href: "pelanggan.html", icon: "◎", label: "Pelanggan & Member", roles: ["karyawan", "manajer", "owner"] },
  { id: "leads", href: "leads.html", icon: "◉", label: "Prospek & Test Drive", roles: ["karyawan", "manajer", "owner"] },
  { id: "supplier", href: "supplier.html", icon: "△", label: "Distributor", roles: ["manajer", "owner"] },
  { id: "stok", href: "stok.html", icon: "↕", label: "Pergerakan Unit", roles: ["manajer", "owner"] },
  { id: "diskon", href: "diskon.html", icon: "%", label: "Program Promo", roles: ["manajer", "owner"] },
  { id: "retur", href: "retur.html", icon: "↩", label: "Pembatalan & Retur", roles: ["karyawan", "manajer", "owner"] },
  { id: "karyawan", href: "karyawan.html", icon: "♙", label: "Tim Showroom", roles: ["manajer", "owner"] },
  { section: "Analitik", roles: ["manajer", "owner"] },
  { id: "laporan-penjualan", href: "laporan-penjualan.html", icon: "↗", label: "Laporan Penjualan", roles: ["manajer", "owner"] },
  { id: "laporan-laba", href: "laporan-laba.html", icon: "≈", label: "Margin Penjualan", roles: ["owner"] },
  { section: "Sistem", roles: ["owner"] },
  { id: "users", href: "users.html", icon: "⌾", label: "Akun Staff", roles: ["owner"] },
  { id: "pengaturan", href: "pengaturan.html", icon: "⚙", label: "Pengaturan Dealer", roles: ["owner"] },
  { id: "riwayat-login", href: "riwayat-login.html", icon: "◷", label: "Riwayat Login", roles: ["owner"] },
  { id: "backup", href: "backup.html", icon: "⇩", label: "Backup Data", roles: ["owner"] },
  { section: "Akun" },
  { id: "notifikasi", href: "notifikasi.html", icon: "!", label: "Notifikasi", roles: ["karyawan", "manajer", "owner"] },
  { id: "profil", href: "profil.html", icon: "☺", label: "Profil Saya", roles: ["karyawan", "manajer", "owner"] },
  { id: "bantuan", href: "bantuan.html", icon: "?", label: "Bantuan", roles: ["karyawan", "manajer", "owner"] }
];

const PAGE_META = {
  dashboard: ["Dashboard Dealer", "Ringkasan penjualan, stok unit, dan prospek hari ini"],
  katalog: ["Preview Showroom", "Tampilan kendaraan yang dilihat calon pelanggan"],
  transaksi: ["Penjualan Kendaraan", "Buat transaksi dan terapkan promo yang sesuai"],
  produk: ["Inventori Kendaraan", "Kelola unit, spesifikasi, harga, dan thumbnail"],
  kategori: ["Jenis & Kategori", "Atur kelompok motor dan mobil"],
  pelanggan: ["Pelanggan & Member", "Kelola profil, tier, dan poin loyalitas"],
  leads: ["Prospek & Test Drive", "Tindak lanjuti permintaan dari showroom online"],
  supplier: ["Mitra Distributor", "Kelola pemasok unit kendaraan"],
  stok: ["Pergerakan Unit", "Pantau kendaraan masuk, keluar, dan booking"],
  diskon: ["Program Promo", "Hubungkan diskon ke kendaraan, jenis, merek, atau member"],
  retur: ["Pembatalan & Retur", "Kelola pembatalan pesanan dan pengembalian unit"],
  karyawan: ["Tim Showroom", "Pantau sales consultant dan target penjualan"],
  "laporan-penjualan": ["Laporan Penjualan", "Analisis transaksi dan performa kendaraan"],
  "laporan-laba": ["Margin Penjualan", "Estimasi margin dan kontribusi penjualan"],
  users: ["Akun Staff", "Atur akun dan hak akses portal internal"],
  pengaturan: ["Pengaturan Dealer", "Sesuaikan identitas, pajak, poin, dan kontak"],
  "riwayat-login": ["Riwayat Login", "Pantau aktivitas akses staff"],
  backup: ["Backup Data", "Ekspor dan pulihkan data dealer"],
  notifikasi: ["Notifikasi", "Informasi penting yang memerlukan perhatian"],
  profil: ["Profil Saya", "Perbarui informasi akun staff"],
  bantuan: ["Pusat Bantuan", "Panduan singkat mengoperasikan portal dealer"]
};

let currentEntity = null;
let editId = null;
let vehicleImageData = "";
let discountEditId = null;
let posCart = [];
let posPromoCode = "";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (value) => {
  if (!value) return "-";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};
const rowsOf = (entity) => readStore(ENTITIES[entity].storage, []);
const saveRows = (entity, rows) => writeStore(ENTITIES[entity].storage, rows);

function getSession() { return readStore("nusa_staff_session", null); }

function login(username, password) {
  seedAll();
  const user = rowsOf("users").find((item) => item.username === username && item.password === password);
  if (!user) return null;
  const session = { id: user.id, nama: user.nama, username: user.username, role: user.role, email: user.email };
  writeStore("nusa_staff_session", session);
  const logs = readStore("nusa_login_logs", []);
  logs.unshift({ id: Date.now(), user_id: user.id, nama: user.nama, username: user.username, role: user.role, waktu: new Date().toISOString() });
  writeStore("nusa_login_logs", logs.slice(0, 100));
  return user;
}

function logout() {
  localStorage.removeItem("nusa_staff_session");
  location.href = "../staff-login.html";
}

function guard(pageId) {
  const session = getSession();
  if (!session) { location.href = "../staff-login.html"; return null; }
  const menu = MENU.find((item) => item.id === pageId);
  if (menu && !menu.roles.includes(session.role)) { location.href = "dashboard.html"; return null; }
  return session;
}

function bootPage(pageId) {
  seedAll();
  const session = guard(pageId);
  if (!session) return;
  document.title = `${PAGE_META[pageId]?.[0] || APP.name} · ${APP.name}`;
  renderSidebar(pageId, session);
  renderTopbar(pageId, session);
  const renderers = {
    dashboard: renderDashboard,
    katalog: renderShowroomPreview,
    transaksi: renderPOS,
    produk: renderVehicleAdmin,
    kategori: () => renderCrudPage("kategori"),
    pelanggan: () => renderCrudPage("pelanggan"),
    leads: () => renderCrudPage("leads"),
    supplier: () => renderCrudPage("supplier"),
    stok: () => renderCrudPage("stok"),
    diskon: renderDiscountAdmin,
    retur: () => renderCrudPage("retur"),
    karyawan: () => renderCrudPage("karyawan"),
    "laporan-penjualan": renderSalesReport,
    "laporan-laba": renderMarginReport,
    users: () => renderCrudPage("users"),
    pengaturan: renderSettings,
    "riwayat-login": renderLoginHistory,
    backup: renderBackup,
    notifikasi: renderNotifications,
    profil: renderProfile,
    bantuan: renderHelp
  };
  (renderers[pageId] || renderDashboard)();
}

function renderSidebar(activeId, session) {
  const unread = readStore("nusa_notifikasi", []).filter((item) => !item.read).length;
  let html = `<div class="sidebar-head"><a class="brand" href="dashboard.html"><span class="brand-mark">NM</span><span>${APP.name}</span></a><button class="icon-btn sidebar-close" onclick="toggleSidebar(false)" aria-label="Tutup menu">×</button></div>
  <div class="store-status"><span class="status-dot"></span><span>Showroom aktif</span><small>Penjualan & katalog online</small></div><nav class="sidebar-nav" aria-label="Navigasi portal">`;
  MENU.forEach((item) => {
    if (item.section) {
      if (!item.roles || item.roles.includes(session.role)) html += `<div class="nav-section">${esc(item.section)}</div>`;
      return;
    }
    if (!item.roles.includes(session.role)) return;
    html += `<a class="nav-item ${item.id === activeId ? "active" : ""}" href="${item.href}"><span class="nav-icon">${item.icon}</span><span>${esc(item.label)}</span>${item.id === "leads" ? `<b class="nav-count">${rowsOf("leads").filter((lead) => lead.status === "Baru").length}</b>` : item.id === "notifikasi" && unread ? `<b class="nav-count">${unread}</b>` : ""}</a>`;
  });
  html += `</nav><div class="sidebar-user"><div class="avatar" style="--avatar:${ROLE_COLORS[session.role]}">${esc(session.nama.charAt(0))}</div><div><strong>${esc(session.nama)}</strong><span>${ROLE_LABEL[session.role]}</span></div><button class="logout-btn" onclick="logout()" aria-label="Keluar">↗</button></div>`;
  $("#sidebar").innerHTML = html;
}

function renderTopbar(pageId, session) {
  const meta = PAGE_META[pageId];
  $("#page-title").textContent = meta?.[0] || APP.name;
  $("#page-subtitle").textContent = meta?.[1] || APP.tagline;
  const unread = readStore("nusa_notifikasi", []).filter((item) => !item.read).length;
  $("#user-chip").innerHTML = `<a class="public-site-link" href="../index.html" target="_blank">Lihat website ↗</a><a class="notification-link" href="notifikasi.html" aria-label="Notifikasi"><span>!</span>${unread ? `<b>${unread}</b>` : ""}</a><div class="top-user"><span class="avatar small" style="--avatar:${ROLE_COLORS[session.role]}">${esc(session.nama.charAt(0))}</span><div><strong>${esc(session.nama)}</strong><span>${ROLE_LABEL[session.role]}</span></div></div>`;
}

function toggleSidebar(show) { document.body.classList.toggle("sidebar-open", show ?? !document.body.classList.contains("sidebar-open")); }

function badgeClass(value) {
  return ({ Aktif: "green", Tersedia: "green", Selesai: "green", Masuk: "green", Disetujui: "green", Gold: "amber", Platinum: "purple", Pending: "amber", Diproses: "amber", Cuti: "amber", Booking: "amber", Baru: "red", Dihubungi: "blue", Terjadwal: "purple", Bronze: "red", Nonaktif: "red", Dibatalkan: "red", Batal: "red", Terjual: "gray", Ditolak: "red", Resign: "red", Silver: "blue", Keluar: "red", Kredit: "purple", Motor: "orange", Mobil: "blue", owner: "red", manajer: "blue", karyawan: "green" })[value] || "blue";
}

function toast(message, tone = "success") {
  const region = $("#toast-region");
  if (!region) return;
  const item = document.createElement("div");
  item.className = `toast ${tone}`;
  item.innerHTML = `<span>${tone === "success" ? "✓" : "!"}</span><p>${esc(message)}</p>`;
  region.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  setTimeout(() => { item.classList.remove("show"); setTimeout(() => item.remove(), 250); }, 2800);
}

function vehicleMedia(vehicle, className = "") {
  if (vehicle.thumbnail) return `<img class="vehicle-image ${className}" src="${esc(vehicle.thumbnail)}" alt="${esc(vehicle.nama)}">`;
  return `<div class="vehicle-placeholder ${className}" role="img" aria-label="Foto ${esc(vehicle.nama)} belum tersedia"><span>${esc(vehicle.jenis)}</span><strong>${APP.shortName}</strong><small>Foto belum tersedia</small></div>`;
}

function renderDashboard() {
  const vehicles = rowsOf("kendaraan");
  const transactions = rowsOf("transaksi");
  const complete = transactions.filter((item) => item.status === "Selesai");
  const leads = rowsOf("leads");
  const settings = readStore("nusa_pengaturan", SETTINGS_SEED);
  const low = vehicles.filter((vehicle) => vehicle.status === "Tersedia" && Number(vehicle.stok) <= Number(settings.batas_stok_min || 2));
  const revenue = complete.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const session = getSession();
  $("#page-root").innerHTML = `<section class="dealer-welcome"><div><span class="eyebrow">${esc(new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase())}</span><h2>Selamat datang, ${esc(session.nama.split(" ")[0])}.</h2><p>${vehicles.filter((v) => v.status === "Tersedia").length} model tersedia dan ${leads.filter((lead) => lead.status === "Baru").length} prospek baru menunggu tindak lanjut.</p></div><a class="btn btn-light" href="transaksi.html">Buat penjualan →</a></section>
  <section class="stats">${statCard("Nilai penjualan", rupiah(revenue), `${complete.length} transaksi selesai`, "red", "↗")}${statCard("Unit tersedia", vehicles.reduce((sum, item) => sum + Number(item.stok || 0), 0), `${vehicles.length} model kendaraan`, "blue", "◆")}${statCard("Prospek aktif", leads.filter((lead) => !["Selesai", "Batal"].includes(lead.status)).length, `${leads.filter((lead) => lead.status === "Baru").length} belum dihubungi`, "amber", "◉")}${statCard("Stok kritis", low.length, "Batas 2 unit", "gray", "!")}</section>
  <section class="dashboard-grid"><article class="card"><div class="card-head"><div><span class="card-kicker">STOK SHOWROOM</span><h2>Kendaraan siap dijual</h2></div><a class="text-link" href="produk.html">Kelola inventori</a></div><div class="inventory-strip">${vehicles.filter((v) => v.status === "Tersedia").slice(0, 4).map((vehicle) => `<div class="inventory-unit">${vehicleMedia(vehicle, "compact")}<div><strong>${esc(vehicle.nama)}</strong><span>${esc(vehicle.jenis)} · ${vehicle.tahun}</span></div><b>${vehicle.stok} unit</b></div>`).join("")}</div></article>
  <article class="card"><div class="card-head"><div><span class="card-kicker">TINDAK LANJUT</span><h2>Prospek terbaru</h2></div><a class="text-link" href="leads.html">Lihat semua</a></div><div class="lead-stack">${leads.slice().reverse().slice(0, 4).map((lead) => `<div class="lead-row"><span>${esc(lead.nama.charAt(0))}</span><div><strong>${esc(lead.nama)}</strong><small>${esc(lead.tipe)} · ${esc(lead.kendaraan)}</small></div><b class="badge ${badgeClass(lead.status)}">${esc(lead.status)}</b></div>`).join("")}</div></article></section>
  <section class="card"><div class="card-head"><div><span class="card-kicker">TRANSAKSI TERBARU</span><h2>Penjualan kendaraan</h2></div><a class="text-link" href="laporan-penjualan.html">Buka laporan</a></div>${transactionTable(transactions.slice().reverse().slice(0, 5), false)}</section>`;
}

function statCard(label, value, note, tone, icon) {
  return `<article class="stat-card ${tone}"><div class="stat-icon">${icon}</div><div class="stat-copy"><span>${label}</span><strong>${value}</strong><small>${note}</small></div></article>`;
}

function renderCrudPage(entity) {
  currentEntity = entity;
  const config = ENTITIES[entity];
  $("#page-root").innerHTML = `<section class="section-intro"><div class="intro-icon">${config.icon}</div><div><h2>${esc(config.title)}</h2><p>${esc(config.description)}</p></div></section><section class="card"><div class="card-head table-tools"><div><span class="card-kicker">DATABASE DEALER</span><h2>${esc(config.title)}</h2><p id="row-count" class="muted"></p></div><div class="toolbar"><label class="search-wrap"><span>⌕</span><input id="search" class="search" type="search" placeholder="Cari data..." oninput="renderTable('${entity}')"></label><button class="btn btn-primary" onclick="openForm('${entity}')">＋ Tambah data</button></div></div><div id="table-wrap"></div></section>`;
  renderTable(entity);
}

function formatCell(column, value) {
  if (["harga", "subtotal", "diskon", "pajak", "total", "maksimal_diskon", "minimal_transaksi"].includes(column)) return esc(rupiah(value));
  if (column === "persen") return `${esc(value)}%`;
  if (["status", "tier", "role", "tipe", "jenis"].includes(column)) return `<span class="badge ${badgeClass(value)}">${esc(value)}</span>`;
  if (["tanggal", "mulai", "selesai", "bergabung"].includes(column)) return esc(fmtDate(value));
  return esc(value ?? "-");
}

function renderTable(entity) {
  const config = ENTITIES[entity];
  const rows = rowsOf(entity);
  const keyword = ($("#search")?.value || "").trim().toLowerCase();
  const filtered = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(keyword));
  if ($("#row-count")) $("#row-count").textContent = `${filtered.length} dari ${rows.length} data`;
  if (!filtered.length) { $("#table-wrap").innerHTML = emptyState("⌕", "Tidak ada data yang cocok."); return; }
  $("#table-wrap").innerHTML = `<div class="table-scroll"><table><thead><tr>${config.columns.map((col) => `<th>${esc(config.labels[col] || col)}</th>`).join("")}<th class="actions-col">Aksi</th></tr></thead><tbody>${filtered.map((row) => `<tr>${config.columns.map((col) => `<td>${formatCell(col, row[col])}</td>`).join("")}<td class="actions"><button class="table-action edit" onclick="openForm('${entity}',${Number(row.id)})">Edit</button><button class="table-action delete" onclick="deleteRow('${entity}',${Number(row.id)})">Hapus</button></td></tr>`).join("")}</tbody></table></div>`;
}

function openForm(entity, id = null) {
  editId = id;
  currentEntity = entity;
  const config = ENTITIES[entity];
  const row = id ? rowsOf(entity).find((item) => item.id === id) || {} : {};
  const fields = config.fields.map((field) => {
    const value = row[field.name] ?? "";
    const attributes = `${field.required ? "required" : ""} ${field.min !== undefined ? `min="${field.min}"` : ""}`;
    let control = `<input id="f-${field.name}" type="${field.type}" value="${esc(value)}" ${attributes}>`;
    if (field.type === "select") control = `<select id="f-${field.name}" ${attributes}>${field.options.map((option) => `<option ${option === value ? "selected" : ""}>${esc(option)}</option>`).join("")}</select>`;
    if (field.type === "textarea") control = `<textarea id="f-${field.name}" rows="3" ${attributes}>${esc(value)}</textarea>`;
    return `<label class="field ${field.type === "textarea" ? "full" : ""}"><span>${esc(field.label)}</span>${control}</label>`;
  }).join("");
  showModal(`${id ? "Edit" : "Tambah"} ${config.title}`, `<form id="entity-form" class="form-grid" onsubmit="event.preventDefault();saveGeneric('${entity}')">${fields}<div class="modal-foot full"><button class="btn btn-ghost" type="button" onclick="closeModal()">Batal</button><button class="btn btn-primary" type="submit">Simpan data</button></div></form>`);
}

function saveGeneric(entity) {
  const form = $("#entity-form");
  if (!form.reportValidity()) return;
  const config = ENTITIES[entity];
  const values = {};
  config.fields.forEach((field) => { let value = $(`#f-${field.name}`).value.trim(); if (field.type === "number") value = Number(value); values[field.name] = value; });
  const rows = rowsOf(entity);
  if (entity === "users" && rows.some((item) => item.username === values.username && item.id !== editId)) { toast("Username sudah digunakan.", "error"); return; }
  const wasEdit = Boolean(editId);
  const oldMovement = entity === "stok" && editId ? rows.find((item) => item.id === editId) : null;
  if (editId) { const index = rows.findIndex((item) => item.id === editId); rows[index] = { ...rows[index], ...values }; }
  else { values.id = nextId(rows); if (entity === "pelanggan") values.bergabung = today(); rows.push(values); }
  saveRows(entity, rows);
  if (entity === "stok") { if (oldMovement) applyStockMovement(oldMovement, true); applyStockMovement(editId ? rows.find((item) => item.id === editId) : values, false); }
  if (entity === "users" && editId === getSession().id) writeStore("nusa_staff_session", { ...getSession(), nama: values.nama, username: values.username, role: values.role, email: values.email });
  closeModal(); renderTable(entity); toast(wasEdit ? "Data berhasil diperbarui." : "Data berhasil ditambahkan.");
}

function deleteRow(entity, id) {
  if (entity === "users" && id === getSession().id) { toast("Akun yang sedang digunakan tidak dapat dihapus.", "error"); return; }
  if (!confirm("Hapus data ini?")) return;
  const rows = rowsOf(entity);
  const target = rows.find((item) => item.id === id);
  if (entity === "stok" && target) applyStockMovement(target, true);
  saveRows(entity, rows.filter((item) => item.id !== id));
  renderTable(entity); toast("Data telah dihapus.");
}

function applyStockMovement(movement, reverse) {
  if (!["Masuk", "Keluar"].includes(movement.tipe)) return;
  const vehicles = rowsOf("kendaraan");
  const vehicle = vehicles.find((item) => item.nama === movement.kendaraan);
  if (!vehicle) return;
  const direction = movement.tipe === "Masuk" ? 1 : -1;
  vehicle.stok = Math.max(0, Number(vehicle.stok) + Number(movement.jumlah) * direction * (reverse ? -1 : 1));
  vehicle.status = vehicle.stok > 0 ? "Tersedia" : "Terjual";
  saveRows("kendaraan", vehicles);
}

function renderVehicleAdmin() {
  const vehicles = rowsOf("kendaraan");
  const keyword = ($("#vehicle-search")?.value || "").trim().toLowerCase();
  const filtered = vehicles.filter((vehicle) => JSON.stringify(vehicle).toLowerCase().includes(keyword));
  $("#page-root").innerHTML = `<section class="vehicle-admin-head"><div><span class="card-kicker">INVENTORI SHOWROOM</span><h2>${vehicles.reduce((sum, item) => sum + Number(item.stok), 0)} unit dari ${vehicles.length} model</h2><p>Thumbnail yang diunggah akan langsung tampil di website customer.</p></div><button class="btn btn-primary" onclick="openVehicleForm()">＋ Tambah kendaraan</button></section><section class="card"><div class="card-head table-tools"><div><span class="card-kicker">DAFTAR UNIT</span><h2>Motor & mobil</h2></div><label class="search-wrap"><span>⌕</span><input id="vehicle-search" class="search" value="${esc(keyword)}" placeholder="Cari kendaraan..." oninput="renderVehicleAdmin()"></label></div><div class="vehicle-admin-grid">${filtered.length ? filtered.map((vehicle) => `<article class="admin-vehicle-card">${vehicleMedia(vehicle)}<div class="admin-vehicle-copy"><div><span class="badge ${badgeClass(vehicle.jenis)}">${vehicle.jenis}</span><span class="badge ${badgeClass(vehicle.status)}">${vehicle.status}</span></div><h3>${esc(vehicle.nama)}</h3><p>${esc(vehicle.kode)} · ${vehicle.tahun} · ${esc(vehicle.warna)}</p><strong>${rupiah(vehicle.harga)}</strong><small>${vehicle.stok} unit tersedia</small></div><div class="admin-card-actions"><button onclick="openVehicleForm(${vehicle.id})">Edit unit</button><button class="danger" onclick="deleteVehicle(${vehicle.id})">Hapus</button></div></article>`).join("") : emptyState("◆", "Kendaraan tidak ditemukan.")}</div></section>`;
}

function openVehicleForm(id = null) {
  editId = id;
  const vehicle = id ? rowsOf("kendaraan").find((item) => item.id === id) || {} : { jenis: "Motor", tahun: new Date().getFullYear(), stok: 1, kondisi: "Baru", status: "Tersedia", unggulan: false };
  vehicleImageData = vehicle.thumbnail || "";
  const distributors = rowsOf("supplier").filter((item) => item.status === "Aktif");
  showModal(`${id ? "Edit" : "Tambah"} Kendaraan`, `<form id="vehicle-form" class="vehicle-form" onsubmit="event.preventDefault();saveVehicle()"><div class="upload-panel"><div id="vehicle-preview">${vehicleMedia(vehicle, "preview")}</div><label class="btn btn-secondary upload-button">↑ Pilih foto<input type="file" accept="image/png,image/jpeg,image/webp" onchange="previewVehicleUpload(event)"></label><button class="text-button danger" type="button" onclick="removeVehicleImage()">Hapus foto</button><small>JPG, PNG, atau WebP. Maksimal 3 MB.</small></div><div class="form-grid vehicle-fields">
  ${fieldInput("kode", "Kode Unit", vehicle.kode, "text", true)}${fieldInput("nama", "Nama Kendaraan", vehicle.nama, "text", true, "full")}${fieldSelect("jenis", "Jenis", ["Motor", "Mobil"], vehicle.jenis)}${fieldInput("merek", "Merek", vehicle.merek, "text", true)}${fieldInput("model", "Model", vehicle.model, "text", true)}${fieldInput("tahun", "Tahun", vehicle.tahun, "number", true)}${fieldInput("harga", "Harga OTR (Rp)", vehicle.harga, "number", true)}${fieldInput("stok", "Jumlah Unit", vehicle.stok, "number", true)}${fieldInput("warna", "Warna", vehicle.warna, "text", true)}${fieldInput("transmisi", "Transmisi", vehicle.transmisi, "text", true)}${fieldSelect("bahan_bakar", "Bahan Bakar", ["Bensin", "Diesel", "Hybrid", "Listrik"], vehicle.bahan_bakar)}${fieldInput("kapasitas_mesin", "Kapasitas Mesin", vehicle.kapasitas_mesin, "text")}${fieldSelect("kondisi", "Kondisi", ["Baru", "Bekas Tersertifikasi"], vehicle.kondisi)}${fieldSelect("supplier", "Distributor", distributors.map((item) => item.nama), vehicle.supplier)}${fieldSelect("status", "Status", ["Tersedia", "Booking", "Terjual", "Nonaktif"], vehicle.status)}<label class="switch-row"><span><strong>Kendaraan unggulan</strong><small>Tampilkan di beranda publik</small></span><input id="f-unggulan" type="checkbox" ${vehicle.unggulan ? "checked" : ""}><i></i></label><label class="field full"><span>Deskripsi</span><textarea id="f-deskripsi" rows="4">${esc(vehicle.deskripsi || "")}</textarea></label><div class="modal-foot full"><button class="btn btn-ghost" type="button" onclick="closeModal()">Batal</button><button class="btn btn-primary" type="submit">Simpan kendaraan</button></div></div></form>`, "modal-wide");
}

function fieldInput(name, label, value = "", type = "text", required = false, extraClass = "") { return `<label class="field ${extraClass}"><span>${label}</span><input id="f-${name}" type="${type}" value="${esc(value ?? "")}" ${required ? "required" : ""} ${type === "number" ? "min=0" : ""}></label>`; }
function fieldSelect(name, label, options, value = "") { return `<label class="field"><span>${label}</span><select id="f-${name}">${options.map((option) => `<option ${option === value ? "selected" : ""}>${esc(option)}</option>`).join("")}</select></label>`; }

async function previewVehicleUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { toast("Ukuran foto maksimal 3 MB.", "error"); event.target.value = ""; return; }
  try { vehicleImageData = await resizeImage(file, 1280, 820, 0.84); $("#vehicle-preview").innerHTML = `<img class="vehicle-image preview" src="${vehicleImageData}" alt="Preview foto kendaraan">`; }
  catch { toast("Foto tidak dapat diproses.", "error"); }
}

function resizeImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio); canvas.height = Math.round(image.height * ratio);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", quality));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function removeVehicleImage() {
  vehicleImageData = "";
  $("#vehicle-preview").innerHTML = `<div class="vehicle-placeholder preview"><span>FOTO KENDARAAN</span><strong>${APP.shortName}</strong><small>Belum ada foto</small></div>`;
}

function saveVehicle() {
  const form = $("#vehicle-form");
  if (!form.reportValidity()) return;
  const values = { kode: valueOf("kode"), nama: valueOf("nama"), jenis: valueOf("jenis"), merek: valueOf("merek"), model: valueOf("model"), tahun: Number(valueOf("tahun")), harga: Number(valueOf("harga")), stok: Number(valueOf("stok")), warna: valueOf("warna"), transmisi: valueOf("transmisi"), bahan_bakar: valueOf("bahan_bakar"), kapasitas_mesin: valueOf("kapasitas_mesin"), kondisi: valueOf("kondisi"), supplier: valueOf("supplier"), status: valueOf("status"), unggulan: $("#f-unggulan").checked, deskripsi: valueOf("deskripsi"), thumbnail: vehicleImageData };
  const vehicles = rowsOf("kendaraan");
  if (vehicles.some((item) => item.kode.toLowerCase() === values.kode.toLowerCase() && item.id !== editId)) { toast("Kode unit sudah digunakan.", "error"); return; }
  const wasEdit = Boolean(editId);
  if (editId) { const index = vehicles.findIndex((item) => item.id === editId); vehicles[index] = { ...vehicles[index], ...values }; }
  else { values.id = nextId(vehicles); vehicles.push(values); }
  saveRows("kendaraan", vehicles); closeModal(); renderVehicleAdmin(); toast(wasEdit ? "Kendaraan berhasil diperbarui." : "Kendaraan berhasil ditambahkan.");
}

function deleteVehicle(id) {
  if (!confirm("Hapus kendaraan ini dari inventori dan katalog?")) return;
  saveRows("kendaraan", rowsOf("kendaraan").filter((item) => item.id !== id));
  renderVehicleAdmin(); toast("Kendaraan telah dihapus.");
}

function valueOf(name) { return $(`#f-${name}`)?.value.trim() || ""; }

function renderDiscountAdmin() {
  const promos = rowsOf("diskon").map(enrichPromo);
  $("#page-root").innerHTML = `<section class="promo-admin-hero"><div><span class="eyebrow">PROMO ENGINE</span><h2>Diskon yang benar-benar terhubung ke kendaraan.</h2><p>Promo aktif otomatis dihitung di showroom dan kasir sesuai target yang dipilih.</p></div><button class="btn btn-light" onclick="openDiscountForm()">＋ Buat promo</button></section><section class="card"><div class="card-head"><div><span class="card-kicker">PROGRAM BERJALAN</span><h2>Daftar promo dealer</h2></div></div><div class="promo-admin-grid">${promos.map((promo) => `<article class="promo-admin-card"><div class="promo-percent"><strong>${promo.persen}%</strong><span>maks ${rupiah(promo.maksimal_diskon)}</span></div><div class="promo-admin-copy"><div><span class="badge ${badgeClass(promo.status)}">${promo.status}</span>${promo.kode ? `<code>${esc(promo.kode)}</code>` : `<span class="auto-label">Otomatis</span>`}</div><h3>${esc(promo.nama)}</h3><p>${esc(promo.cakupan)} · ${esc(promo.target)}</p><small>${fmtDate(promo.mulai)} — ${fmtDate(promo.selesai)}</small></div><div class="promo-actions"><button onclick="openDiscountForm(${promo.id})">Edit</button><button class="danger" onclick="deleteDiscount(${promo.id})">Hapus</button></div></article>`).join("")}</div></section>`;
}

function enrichPromo(promo) {
  const vehicles = rowsOf("kendaraan");
  let target = "Semua kendaraan";
  if (promo.cakupan === "Produk") target = vehicles.filter((vehicle) => (promo.target_ids || []).map(Number).includes(vehicle.id)).map((vehicle) => vehicle.nama).join(", ") || "Belum dipilih";
  else if (promo.cakupan !== "Semua") target = promo.target_nilai || "Belum dipilih";
  return { ...promo, target, periode: `${fmtDate(promo.mulai)} – ${fmtDate(promo.selesai)}` };
}

function openDiscountForm(id = null) {
  discountEditId = id;
  const promo = id ? rowsOf("diskon").find((item) => item.id === id) : { persen: 5, cakupan: "Produk", target_ids: [], target_nilai: "", minimal_transaksi: 0, maksimal_diskon: 5000000, mulai: today(), selesai: "2026-12-31", status: "Aktif", kode: "" };
  showModal(`${id ? "Edit" : "Buat"} Program Promo`, `<form id="discount-form" class="form-grid" onsubmit="event.preventDefault();saveDiscount()">${fieldInput("nama", "Nama Promo", promo.nama, "text", true, "full")}${fieldInput("kode", "Kode Promo (opsional)", promo.kode)}${fieldInput("persen", "Diskon (%)", promo.persen, "number", true)}${fieldSelect("cakupan", "Cakupan Promo", ["Produk", "Jenis", "Merek", "Member", "Semua"], promo.cakupan)}<div class="field full" id="discount-target-field"></div>${fieldInput("minimal_transaksi", "Minimal Transaksi", promo.minimal_transaksi, "number")}${fieldInput("maksimal_diskon", "Maksimal Diskon", promo.maksimal_diskon, "number")}${fieldInput("mulai", "Tanggal Mulai", promo.mulai, "date", true)}${fieldInput("selesai", "Tanggal Selesai", promo.selesai, "date", true)}${fieldSelect("status", "Status", ["Aktif", "Nonaktif"], promo.status)}<div class="discount-hint full"><b>Cara kerja</b><p>Promo tanpa kode diterapkan otomatis. Promo berkode aktif setelah kode dimasukkan di kasir. Sistem selalu memilih potongan terbaik dan tidak menumpuk diskon.</p></div><div class="modal-foot full"><button class="btn btn-ghost" type="button" onclick="closeModal()">Batal</button><button class="btn btn-primary" type="submit">Simpan promo</button></div></form>`, "modal-wide");
  $("#f-cakupan").addEventListener("change", () => updateDiscountTargetField());
  updateDiscountTargetField(promo);
}

function updateDiscountTargetField(promo = null) {
  const scope = valueOf("cakupan");
  const current = promo || (discountEditId ? rowsOf("diskon").find((item) => item.id === discountEditId) : {});
  const wrap = $("#discount-target-field");
  if (scope === "Produk") {
    wrap.innerHTML = `<span>Pilih Kendaraan</span><div class="target-checkboxes">${rowsOf("kendaraan").map((vehicle) => `<label><input type="checkbox" name="promo-vehicle" value="${vehicle.id}" ${(current.target_ids || []).map(Number).includes(vehicle.id) ? "checked" : ""}><span>${esc(vehicle.nama)}</span></label>`).join("")}</div>`;
  } else if (scope === "Jenis") wrap.innerHTML = `<span>Jenis Kendaraan</span><select id="f-target_nilai"><option ${current.target_nilai === "Motor" ? "selected" : ""}>Motor</option><option ${current.target_nilai === "Mobil" ? "selected" : ""}>Mobil</option></select>`;
  else if (scope === "Merek") { const brands = [...new Set(rowsOf("kendaraan").map((item) => item.merek))]; wrap.innerHTML = `<span>Merek</span><select id="f-target_nilai">${brands.map((brand) => `<option ${current.target_nilai === brand ? "selected" : ""}>${esc(brand)}</option>`).join("")}</select>`; }
  else if (scope === "Member") wrap.innerHTML = `<span>Tier Member</span><select id="f-target_nilai">${["Bronze", "Silver", "Gold", "Platinum"].map((tier) => `<option ${current.target_nilai === tier ? "selected" : ""}>${tier}</option>`).join("")}</select>`;
  else wrap.innerHTML = `<span>Target</span><div class="all-target">Promo berlaku untuk semua kendaraan.</div>`;
}

function saveDiscount() {
  const form = $("#discount-form"); if (!form.reportValidity()) return;
  const scope = valueOf("cakupan");
  const targetIds = scope === "Produk" ? $$('input[name="promo-vehicle"]:checked').map((input) => Number(input.value)) : [];
  if (scope === "Produk" && !targetIds.length) { toast("Pilih minimal satu kendaraan untuk promo.", "error"); return; }
  const values = { nama: valueOf("nama"), kode: valueOf("kode").toUpperCase(), persen: Number(valueOf("persen")), cakupan: scope, target_ids: targetIds, target_nilai: scope === "Semua" || scope === "Produk" ? "" : valueOf("target_nilai"), minimal_transaksi: Number(valueOf("minimal_transaksi")), maksimal_diskon: Number(valueOf("maksimal_diskon")), mulai: valueOf("mulai"), selesai: valueOf("selesai"), status: valueOf("status") };
  if (values.persen < 0 || values.persen > 100) { toast("Persentase diskon harus 0–100%.", "error"); return; }
  const rows = rowsOf("diskon"); const wasEdit = Boolean(discountEditId);
  if (discountEditId) { const index = rows.findIndex((item) => item.id === discountEditId); rows[index] = { ...rows[index], ...values }; }
  else { values.id = nextId(rows); rows.push(values); }
  saveRows("diskon", rows); closeModal(); renderDiscountAdmin(); toast(wasEdit ? "Promo berhasil diperbarui." : "Promo berhasil dibuat.");
}

function deleteDiscount(id) { if (!confirm("Hapus program promo ini?")) return; saveRows("diskon", rowsOf("diskon").filter((item) => item.id !== id)); renderDiscountAdmin(); toast("Promo telah dihapus."); }

function renderShowroomPreview() {
  const vehicles = rowsOf("kendaraan").filter((item) => item.status !== "Nonaktif");
  $("#page-root").innerHTML = `<section class="showroom-preview-head"><div><span class="card-kicker">PREVIEW WEBSITE</span><h2>Stok kendaraan yang dilihat customer</h2><p>Foto, harga promo, dan ketersediaan mengikuti data inventori.</p></div><a class="btn btn-secondary" href="../catalog.html" target="_blank">Buka katalog publik ↗</a></section><section class="admin-showroom-grid">${vehicles.map(adminShowroomCard).join("")}</section>`;
}

function adminShowroomCard(vehicle) {
  const price = vehicleDisplayPrice(vehicle);
  return `<article class="showroom-card">${vehicleMedia(vehicle)}<div class="showroom-card-body"><div><span class="badge ${badgeClass(vehicle.jenis)}">${vehicle.jenis}</span>${price.promo ? `<span class="deal-badge">-${price.promo.persen}%</span>` : ""}</div><h3>${esc(vehicle.nama)}</h3><p>${vehicle.tahun} · ${esc(vehicle.transmisi)} · ${esc(vehicle.bahan_bakar)}</p>${price.discount ? `<small class="old-price">${rupiah(price.original)}</small>` : ""}<strong>${rupiah(price.final)}</strong><span class="stock-label">${vehicle.stok ? `${vehicle.stok} unit tersedia` : "Stok habis"}</span></div></article>`;
}

function loadCart() { try { posCart = JSON.parse(sessionStorage.getItem("nusa_pos_cart") || "[]"); } catch { posCart = []; } }
function saveCart() { sessionStorage.setItem("nusa_pos_cart", JSON.stringify(posCart)); }

function renderPOS() {
  loadCart();
  const vehicles = rowsOf("kendaraan").filter((item) => item.status === "Tersedia" && item.stok > 0);
  const members = rowsOf("pelanggan").filter((item) => item.status === "Aktif");
  $("#page-root").innerHTML = `<section class="pos-layout"><div class="pos-products card"><div class="card-head"><div><span class="card-kicker">PILIH KENDARAAN</span><h2>Unit tersedia</h2></div><label class="search-wrap"><span>⌕</span><input class="search" placeholder="Cari motor atau mobil..." oninput="filterPOS(this.value)"></label></div><div class="pos-vehicle-grid" id="pos-products">${vehicles.map((vehicle) => `<button class="pos-vehicle" data-search="${esc(`${vehicle.nama} ${vehicle.merek} ${vehicle.jenis}`.toLowerCase())}" onclick="addToCart(${vehicle.id})">${vehicleMedia(vehicle, "pos-thumb")}<span><b class="badge ${badgeClass(vehicle.jenis)}">${vehicle.jenis}</b><strong>${esc(vehicle.nama)}</strong><small>${rupiah(vehicle.harga)} · ${vehicle.stok} unit</small></span><i>＋</i></button>`).join("")}</div></div><aside class="cart-card card"><div class="card-head"><div><span class="card-kicker">RINCIAN PENJUALAN</span><h2>Pesanan kendaraan</h2></div><span class="cart-count" id="cart-count"></span></div><div id="cart-items"></div><div class="checkout-fields"><label class="field"><span>Pelanggan / Member</span><select id="checkout-member" onchange="renderCart()"><option value="">Pelanggan umum</option>${members.map((member) => `<option value="${member.id}">${esc(member.nama)} · ${member.tier}</option>`).join("")}</select></label><label class="field"><span>Metode pembayaran</span><select id="checkout-method"><option>Transfer</option><option>Kredit</option><option>Tunai</option><option>Kartu Debit</option><option>Kartu Kredit</option></select></label><div class="promo-code-field"><label class="field"><span>Kode promo</span><input id="promo-code" value="${esc(posPromoCode)}" placeholder="Contoh: MOTORHEMAT"></label><button class="btn btn-secondary" onclick="applyPromoCode()">Terapkan</button></div></div><div id="cart-summary"></div></aside></section><section class="card transaction-history"><div class="card-head"><div><span class="card-kicker">PENJUALAN TERBARU</span><h2>Riwayat transaksi</h2></div><a class="text-link" href="laporan-penjualan.html">Laporan lengkap</a></div>${transactionTable(rowsOf("transaksi").slice().reverse().slice(0, 5), true)}</section>`;
  renderCart();
}

function filterPOS(value) { const keyword = value.trim().toLowerCase(); $$(".pos-vehicle").forEach((item) => item.hidden = !item.dataset.search.includes(keyword)); }

function addToCart(vehicleId) {
  const vehicle = rowsOf("kendaraan").find((item) => item.id === vehicleId);
  if (!vehicle) return;
  const item = posCart.find((entry) => entry.vehicleId === vehicleId);
  if (item && item.qty >= vehicle.stok) { toast("Jumlah melebihi stok unit.", "error"); return; }
  if (item) item.qty += 1; else posCart.push({ vehicleId, qty: 1 });
  saveCart(); renderCart(); toast(`${vehicle.nama} ditambahkan.`);
}

function changeCart(vehicleId, delta) {
  const item = posCart.find((entry) => entry.vehicleId === vehicleId); const vehicle = rowsOf("kendaraan").find((entry) => entry.id === vehicleId); if (!item || !vehicle) return;
  if (item.qty + delta > vehicle.stok) { toast("Stok unit tidak mencukupi.", "error"); return; }
  item.qty += delta; if (item.qty <= 0) posCart = posCart.filter((entry) => entry.vehicleId !== vehicleId); saveCart(); renderCart();
}

function applyPromoCode() {
  const code = $("#promo-code").value.trim().toUpperCase();
  if (code && !getActiveDiscounts().some((promo) => promo.kode.toUpperCase() === code)) { toast("Kode promo tidak ditemukan atau tidak aktif.", "error"); return; }
  posPromoCode = code; renderCart(); toast(code ? `Kode ${code} diterapkan.` : "Kode promo dihapus.");
}

function cartCalculation() {
  const vehicles = rowsOf("kendaraan");
  const memberId = Number($("#checkout-member")?.value || 0);
  const member = rowsOf("pelanggan").find((item) => item.id === memberId) || null;
  const lines = posCart.map((item) => { const vehicle = vehicles.find((entry) => entry.id === item.vehicleId); const gross = Number(vehicle.harga) * item.qty; const deal = bestDiscountForVehicle(vehicle, gross, posPromoCode, member); return { ...item, vehicle, gross, deal, discount: deal?.amount || 0, net: gross - (deal?.amount || 0) }; });
  const subtotal = lines.reduce((sum, line) => sum + line.gross, 0); const discount = lines.reduce((sum, line) => sum + line.discount, 0); const settings = readStore("nusa_pengaturan", SETTINGS_SEED); const tax = Math.round((subtotal - discount) * Number(settings.pajak_persen || 0) / 100); return { lines, subtotal, discount, tax, total: subtotal - discount + tax, member, settings };
}

function renderCart() {
  const vehicles = rowsOf("kendaraan"); posCart = posCart.filter((item) => vehicles.some((vehicle) => vehicle.id === item.vehicleId)); saveCart();
  const calc = cartCalculation();
  if ($("#cart-count")) $("#cart-count").textContent = `${calc.lines.reduce((sum, item) => sum + item.qty, 0)} unit`;
  $("#cart-items").innerHTML = calc.lines.length ? calc.lines.map((line) => `<div class="cart-item vehicle-cart-item">${vehicleMedia(line.vehicle, "cart-thumb")}<div><strong>${esc(line.vehicle.nama)}</strong><small>${rupiah(line.vehicle.harga)}</small>${line.deal ? `<em>−${line.deal.promo.persen}% ${esc(line.deal.promo.nama)}</em>` : ""}</div><div class="qty-control"><button onclick="changeCart(${line.vehicleId},-1)">−</button><b>${line.qty}</b><button onclick="changeCart(${line.vehicleId},1)">＋</button></div></div>`).join("") : emptyState("◆", "Belum ada kendaraan dipilih.");
  $("#cart-summary").innerHTML = `<div class="summary-row"><span>Harga kendaraan</span><b>${rupiah(calc.subtotal)}</b></div><div class="summary-row discount"><span>Potongan promo</span><b>− ${rupiah(calc.discount)}</b></div><div class="summary-row"><span>Pajak (${calc.settings.pajak_persen}%)</span><b>${rupiah(calc.tax)}</b></div><div class="summary-total"><span>Total pembayaran</span><strong>${rupiah(calc.total)}</strong></div>${calc.member ? `<div class="point-preview">Member memperoleh <b>${Math.floor(calc.total / calc.settings.rupiah_per_poin).toLocaleString("id-ID")} poin</b></div>` : ""}<button class="btn btn-primary checkout-btn" onclick="checkout()" ${calc.lines.length ? "" : "disabled"}>Selesaikan penjualan →</button>`;
}

function checkout() {
  const calc = cartCalculation(); if (!calc.lines.length) return;
  const vehicles = rowsOf("kendaraan");
  if (calc.lines.some((line) => line.qty > line.vehicle.stok)) { toast("Ada unit dengan stok tidak mencukupi.", "error"); return; }
  const transactions = rowsOf("transaksi"); const details = readStore("nusa_detail_transaksi", []); const movements = rowsOf("stok"); const id = nextId(transactions); const code = `INV-${String(new Date().getFullYear()).slice(-2)}${String(id).padStart(4, "0")}`; const session = getSession(); const points = calc.member ? Math.floor(calc.total / calc.settings.rupiah_per_poin) : 0;
  transactions.push({ id, kode: code, tanggal: today(), pelanggan: calc.member?.nama || "Pelanggan Umum", pelanggan_id: calc.member?.id || null, kasir: session.nama, subtotal: calc.subtotal, diskon: calc.discount, pajak: calc.tax, total: calc.total, metode: $("#checkout-method").value, promo: [...new Set(calc.lines.filter((line) => line.deal).map((line) => line.deal.promo.nama))].join(", ") || "-", poin_didapat: points, status: "Selesai" });
  calc.lines.forEach((line) => { const vehicle = vehicles.find((item) => item.id === line.vehicleId); vehicle.stok -= line.qty; if (!vehicle.stok) vehicle.status = "Terjual"; details.push({ id: nextId(details), transaksi_id: id, kendaraan_id: vehicle.id, kendaraan: vehicle.nama, qty: line.qty, harga: vehicle.harga, diskon: line.discount, subtotal: line.net }); movements.push({ id: nextId(movements), tanggal: today(), kendaraan: vehicle.nama, tipe: "Keluar", jumlah: line.qty, keterangan: `Penjualan ${code}` }); });
  if (calc.member) { const members = rowsOf("pelanggan"); const member = members.find((item) => item.id === calc.member.id); member.poin = Number(member.poin || 0) + points; saveRows("pelanggan", members); }
  saveRows("transaksi", transactions); saveRows("kendaraan", vehicles); saveRows("stok", movements); writeStore("nusa_detail_transaksi", details); posCart = []; posPromoCode = ""; saveCart(); renderPOS(); toast(`${code} berhasil diselesaikan.`);
}

function transactionTable(rows, detail) {
  if (!rows.length) return emptyState("⌁", "Belum ada transaksi.");
  return `<div class="table-scroll"><table><thead><tr><th>Kode</th><th>Tanggal</th><th>Pelanggan</th><th>Sales</th><th>Promo</th><th>Total</th><th>Status</th>${detail ? "<th></th>" : ""}</tr></thead><tbody>${rows.map((item) => `<tr><td><strong>${esc(item.kode)}</strong></td><td>${fmtDate(item.tanggal)}</td><td>${esc(item.pelanggan)}</td><td>${esc(item.kasir)}</td><td>${esc(item.promo || "-")}</td><td><strong>${rupiah(item.total)}</strong></td><td><span class="badge ${badgeClass(item.status)}">${esc(item.status)}</span></td>${detail ? `<td><button class="table-action edit" onclick="openTransactionDetail(${item.id})">Detail</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}

function openTransactionDetail(id) {
  const transaction = rowsOf("transaksi").find((item) => item.id === id); const details = readStore("nusa_detail_transaksi", []).filter((item) => item.transaksi_id === id); if (!transaction) return;
  showModal(`Detail ${transaction.kode}`, `<div class="receipt-meta"><span>${fmtDate(transaction.tanggal)}</span><span>${esc(transaction.pelanggan)}</span><span>${esc(transaction.metode)}</span></div><div class="receipt-lines">${details.map((item) => `<div><span>${esc(item.kendaraan)} <small>× ${item.qty}</small></span><b>${rupiah(item.subtotal)}</b></div>`).join("") || `<p class="muted">Detail tidak tersedia.</p>`}</div><div class="receipt-summary"><div><span>Subtotal</span><b>${rupiah(transaction.subtotal)}</b></div><div><span>Diskon</span><b>− ${rupiah(transaction.diskon)}</b></div><div><span>Pajak</span><b>${rupiah(transaction.pajak)}</b></div></div><div class="receipt-total"><span>Total</span><strong>${rupiah(transaction.total)}</strong></div>`);
}

function renderSalesReport() {
  const transactions = rowsOf("transaksi"); const complete = transactions.filter((item) => item.status === "Selesai"); const revenue = complete.reduce((sum, item) => sum + item.total, 0); const discounts = complete.reduce((sum, item) => sum + item.diskon, 0); const units = readStore("nusa_detail_transaksi", []).filter((detail) => complete.some((trx) => trx.id === detail.transaksi_id)).reduce((sum, item) => sum + item.qty, 0);
  $("#page-root").innerHTML = `<section class="report-filter card"><div><span class="card-kicker">PERIODE LAPORAN</span><h2>September 2026</h2></div><button class="btn btn-secondary" onclick="exportReportCSV()">↓ Ekspor CSV</button></section><section class="stats three">${statCard("Nilai penjualan", rupiah(revenue), `${complete.length} transaksi selesai`, "red", "↗")}${statCard("Unit terjual", units, "Motor dan mobil", "blue", "◆")}${statCard("Promo diberikan", rupiah(discounts), "Potongan terpakai", "amber", "%")}</section><section class="card"><div class="card-head"><div><span class="card-kicker">TRANSAKSI</span><h2>Rincian penjualan</h2></div></div>${transactionTable(transactions.slice().reverse(), true)}</section>`;
}

function exportReportCSV() {
  const headers = ["Kode", "Tanggal", "Pelanggan", "Sales", "Subtotal", "Diskon", "Pajak", "Total", "Metode", "Status"];
  const csv = [headers, ...rowsOf("transaksi").map((item) => [item.kode, item.tanggal, item.pelanggan, item.kasir, item.subtotal, item.diskon, item.pajak, item.total, item.metode, item.status])].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadBlob(`\uFEFF${csv}`, `laporan-penjualan-${today()}.csv`, "text/csv;charset=utf-8"); toast("Laporan CSV berhasil dibuat.");
}

function renderMarginReport() {
  const complete = rowsOf("transaksi").filter((item) => item.status === "Selesai"); const sales = complete.reduce((sum, item) => sum + Number(item.subtotal - item.diskon), 0); const estimatedCost = Math.round(sales * .91); const gross = sales - estimatedCost; const margin = sales ? Math.round(gross / sales * 100) : 0;
  $("#page-root").innerHTML = `<section class="profit-hero"><div><span class="eyebrow">ESTIMASI MARGIN KOTOR</span><strong>${rupiah(gross)}</strong><p>${margin}% dari nilai penjualan setelah diskon.</p></div><div class="profit-ring" style="--progress:${margin * 3.6}deg"><span><b>${margin}%</b><small>margin</small></span></div></section><section class="profit-grid"><article class="card profit-statement"><div class="card-head"><div><span class="card-kicker">RINGKASAN</span><h2>Kontribusi penjualan</h2></div></div><div class="statement-row"><span>Penjualan setelah diskon</span><strong>${rupiah(sales)}</strong></div><div class="statement-row cost"><span>Estimasi harga pokok unit (91%)</span><strong>− ${rupiah(estimatedCost)}</strong></div><div class="statement-row total"><span>Estimasi margin kotor</span><strong>${rupiah(gross)}</strong></div><p class="fine-print">Estimasi ini untuk dashboard operasional. Masukkan harga beli aktual tiap unit untuk laporan keuangan resmi.</p></article><aside class="card insight-panel"><span class="card-kicker">CATATAN DEALER</span><h2>Jaga kualitas margin</h2><ul><li>Gunakan batas maksimal diskon pada setiap promo.</li><li>Evaluasi insentif distributor per model.</li><li>Pantau biaya kredit dan administrasi secara terpisah.</li></ul></aside></section>`;
}

function renderSettings() {
  const settings = readStore("nusa_pengaturan", SETTINGS_SEED);
  $("#page-root").innerHTML = `<form class="settings-grid" onsubmit="event.preventDefault();saveSettings()"><section class="card"><div class="card-head"><div><span class="card-kicker">IDENTITAS DEALER</span><h2>Informasi publik</h2></div></div><div class="form-grid">${fieldInput("nama_dealer", "Nama Dealer", settings.nama_dealer, "text", true, "full")}${fieldInput("telepon", "Telepon", settings.telepon)}${fieldInput("whatsapp", "WhatsApp", settings.whatsapp)}${fieldInput("email", "Email", settings.email, "email")}${fieldInput("alamat", "Alamat Showroom", settings.alamat, "text", true, "full")}</div></section><section class="card"><div class="card-head"><div><span class="card-kicker">PENJUALAN & MEMBER</span><h2>Aturan transaksi</h2></div></div><div class="form-grid">${fieldInput("pajak_persen", "Pajak (%)", settings.pajak_persen, "number")}${fieldInput("rupiah_per_poin", "Rupiah per 1 Poin", settings.rupiah_per_poin, "number")}${fieldInput("batas_stok_min", "Batas Stok Minimum", settings.batas_stok_min, "number")}<label class="switch-row full"><span><strong>Notifikasi stok minimum</strong><small>Tampilkan peringatan unit kritis.</small></span><input id="f-notif_stok_min" type="checkbox" ${settings.notif_stok_min ? "checked" : ""}><i></i></label></div><button class="btn btn-primary settings-save">Simpan pengaturan</button></section></form>`;
}

function saveSettings() {
  const settings = { nama_dealer: valueOf("nama_dealer"), alamat: valueOf("alamat"), telepon: valueOf("telepon"), whatsapp: valueOf("whatsapp"), email: valueOf("email"), pajak_persen: Number(valueOf("pajak_persen")), rupiah_per_poin: Number(valueOf("rupiah_per_poin")), batas_stok_min: Number(valueOf("batas_stok_min")), notif_stok_min: $("#f-notif_stok_min").checked };
  writeStore("nusa_pengaturan", settings); toast("Pengaturan dealer berhasil disimpan.");
}

function renderLoginHistory() {
  const logs = readStore("nusa_login_logs", []);
  $("#page-root").innerHTML = `<section class="card"><div class="card-head table-tools"><div><span class="card-kicker">KEAMANAN</span><h2>Aktivitas masuk staff</h2><p class="muted">${logs.length} aktivitas</p></div><button class="btn btn-ghost" onclick="clearLoginHistory()">Bersihkan riwayat</button></div>${logs.length ? `<div class="table-scroll"><table><thead><tr><th>Staff</th><th>Username</th><th>Role</th><th>Waktu</th><th>Status</th></tr></thead><tbody>${logs.map((log) => `<tr><td><strong>${esc(log.nama)}</strong></td><td>${esc(log.username)}</td><td><span class="badge ${badgeClass(log.role)}">${esc(log.role)}</span></td><td>${esc(new Date(log.waktu).toLocaleString("id-ID"))}</td><td><span class="login-status"><i></i> Berhasil</span></td></tr>`).join("")}</tbody></table></div>` : emptyState("◷", "Belum ada riwayat login.")}</section>`;
}
function clearLoginHistory() { if (!confirm("Hapus seluruh riwayat login?")) return; writeStore("nusa_login_logs", []); renderLoginHistory(); toast("Riwayat login dibersihkan."); }

function renderBackup() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith("nusa_") && !key.includes("session")); const size = keys.reduce((sum, key) => sum + (localStorage.getItem(key)?.length || 0), 0);
  $("#page-root").innerHTML = `<section class="backup-hero"><div class="backup-icon">⇩</div><div><span class="eyebrow">PUSAT DATA</span><h2>Backup data dealer dan foto kendaraan.</h2><p>Data thumbnail ikut masuk ke file backup JSON.</p></div><span class="backup-size">${(size / 1024).toFixed(1)} KB</span></section><section class="backup-grid"><article class="card backup-card"><span class="backup-step">01</span><h2>Ekspor backup</h2><p>Unduh inventori, foto, promo, member, transaksi, dan pengaturan.</p><button class="btn btn-primary" onclick="exportBackup()">↓ Unduh backup</button></article><article class="card backup-card"><span class="backup-step">02</span><h2>Impor backup</h2><p>Pulihkan data Nusa Motors dari file JSON yang valid.</p><label class="btn btn-secondary file-button">↑ Pilih file<input type="file" accept="application/json,.json" onchange="importBackup(event)"></label></article><article class="card backup-card danger-zone"><span class="backup-step">03</span><h2>Reset data demo</h2><p>Kembalikan semua data ke kondisi awal kendaraan.</p><button class="btn btn-danger" onclick="resetDemoData()">Reset data</button></article></section>`;
}

function exportBackup() { const data = {}; Object.keys(localStorage).filter((key) => key.startsWith("nusa_") && !key.includes("session")).forEach((key) => data[key] = readStore(key, null)); downloadBlob(JSON.stringify({ app: APP.name, version: 2, exported_at: new Date().toISOString(), data }, null, 2), `nusa-motors-backup-${today()}.json`, "application/json"); toast("Backup berhasil diunduh."); }
function importBackup(event) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const backup = JSON.parse(reader.result); if (backup.app !== APP.name || !backup.data) throw new Error(); if (!confirm("Impor akan mengganti data dealer saat ini. Lanjutkan?")) return; Object.entries(backup.data).forEach(([key, value]) => { if (key.startsWith("nusa_") && !key.includes("session")) writeStore(key, value); }); renderBackup(); toast("Backup berhasil dipulihkan."); } catch { toast("File backup tidak valid.", "error"); } }; reader.readAsText(file); }
function resetDemoData() { if (!confirm("Reset seluruh data ke kondisi awal?")) return; Object.keys(localStorage).filter((key) => key.startsWith("nusa_") && !key.includes("session")).forEach((key) => localStorage.removeItem(key)); seedAll(); renderBackup(); toast("Data demo dipulihkan."); }
function downloadBlob(content, filename, type) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500); }

function renderNotifications() {
  const notifications = readStore("nusa_notifikasi", []);
  $("#page-root").innerHTML = `<section class="card notifications-card"><div class="card-head table-tools"><div><span class="card-kicker">INBOX</span><h2>Notifikasi dealer</h2><p class="muted">${notifications.filter((item) => !item.read).length} belum dibaca</p></div><button class="btn btn-ghost" onclick="markAllRead()">Tandai semua dibaca</button></div><div class="notification-list">${notifications.map((item) => `<button class="notification-item ${item.read ? "read" : ""}" onclick="markNotification(${item.id})"><span class="notification-icon ${item.tone}">${item.icon}</span><span class="notification-copy"><strong>${esc(item.title)}</strong><span>${esc(item.body)}</span><small>${esc(item.time)}</small></span>${item.read ? "" : `<i class="unread-dot"></i>`}</button>`).join("")}</div></section>`;
}
function markNotification(id) { const items = readStore("nusa_notifikasi", []); const item = items.find((entry) => entry.id === id); if (item) item.read = true; writeStore("nusa_notifikasi", items); renderNotifications(); renderTopbar("notifikasi", getSession()); renderSidebar("notifikasi", getSession()); }
function markAllRead() { writeStore("nusa_notifikasi", readStore("nusa_notifikasi", []).map((item) => ({ ...item, read: true }))); renderNotifications(); renderTopbar("notifikasi", getSession()); renderSidebar("notifikasi", getSession()); toast("Semua notifikasi telah dibaca."); }

function renderProfile() {
  const session = getSession();
  $("#page-root").innerHTML = `<section class="profile-layout"><aside class="profile-card card"><div class="profile-avatar" style="--avatar:${ROLE_COLORS[session.role]}">${esc(session.nama.charAt(0))}</div><h2>${esc(session.nama)}</h2><span class="badge ${badgeClass(session.role)}">${ROLE_LABEL[session.role]}</span><p>${esc(session.email)}</p><div class="profile-meta"><span><small>Username</small><b>@${esc(session.username)}</b></span><span><small>ID Staff</small><b>#${String(session.id).padStart(4, "0")}</b></span></div></aside><form class="card profile-form" onsubmit="event.preventDefault();saveProfile()"><div class="card-head"><div><span class="card-kicker">AKUN STAFF</span><h2>Edit profil</h2></div></div><div class="form-grid">${fieldInput("profile_name", "Nama Lengkap", session.nama, "text", true, "full")}${fieldInput("profile_username", "Username", session.username, "text", true)}${fieldInput("profile_email", "Email", session.email, "email")}${fieldInput("profile_password", "Password Baru (opsional)", "", "password", false, "full")}</div><button class="btn btn-primary settings-save">Simpan perubahan</button></form></section>`;
}
function saveProfile() { const session = getSession(); const users = rowsOf("users"); const user = users.find((item) => item.id === session.id); const username = valueOf("profile_username"); if (users.some((item) => item.username === username && item.id !== session.id)) { toast("Username sudah digunakan.", "error"); return; } user.nama = valueOf("profile_name"); user.username = username; user.email = valueOf("profile_email"); if (valueOf("profile_password")) user.password = valueOf("profile_password"); saveRows("users", users); writeStore("nusa_staff_session", { ...session, nama: user.nama, username: user.username, email: user.email }); renderProfile(); renderTopbar("profil", getSession()); renderSidebar("profil", getSession()); toast("Profil berhasil diperbarui."); }

function renderHelp() {
  const guides = [["01", "Upload foto kendaraan", "Buka Inventori Kendaraan, pilih Tambah atau Edit, lalu unggah JPG, PNG, atau WebP. Foto otomatis dioptimalkan dan tampil pada website customer."], ["02", "Hubungkan promo", "Pada Program Promo, pilih cakupan Produk dan centang kendaraan. Promo tanpa kode otomatis muncul pada harga kendaraan."], ["03", "Kelola test drive", "Permintaan customer masuk ke Prospek & Test Drive. Ubah status menjadi Dihubungi, Terjadwal, atau Selesai."], ["04", "Poin member", "Pilih member saat membuat penjualan. Poin dihitung otomatis berdasarkan aturan di Pengaturan Dealer."]];
  $("#page-root").innerHTML = `<section class="help-hero"><span class="eyebrow">PUSAT BANTUAN</span><h2>Panduan operasional Nusa Motors</h2><div class="help-search"><span>⌕</span><input placeholder="Cari panduan..." oninput="filterHelp(this.value)"></div></section><section class="help-grid">${guides.map((guide) => `<article class="card help-card" data-search="${esc(`${guide[1]} ${guide[2]}`.toLowerCase())}"><span>${guide[0]}</span><h3>${guide[1]}</h3><p>${guide[2]}</p></article>`).join("")}</section>`;
}
function filterHelp(value) { const keyword = value.trim().toLowerCase(); $$(".help-card").forEach((item) => item.hidden = !item.dataset.search.includes(keyword)); }

function showModal(title, content, className = "") { document.body.insertAdjacentHTML("beforeend", `<div class="modal-overlay show" id="modal-overlay" onclick="if(event.target===this)closeModal()"><section class="modal ${className}" role="dialog" aria-modal="true"><div class="modal-head"><div><span class="card-kicker">NUSA MOTORS</span><h3>${esc(title)}</h3></div><button class="icon-btn" onclick="closeModal()" aria-label="Tutup">×</button></div>${content}</section></div>`); }
function closeModal() { $("#modal-overlay")?.remove(); editId = null; discountEditId = null; }
function nextId(rows) { return rows.length ? Math.max(...rows.map((item) => Number(item.id))) + 1 : 1; }
function emptyState(icon, message) { return `<div class="empty-state"><span>${icon}</span><p>${esc(message)}</p></div>`; }

seedAll();

// ============================================================
// TOKOKU — aplikasi penjualan berbasis localStorage
// ============================================================

const MENU = [
  { section: "Utama" },
  { id: "dashboard", href: "dashboard.html", icon: "▦", label: "Dashboard", roles: ["karyawan", "manajer", "owner"] },
  { id: "katalog", href: "katalog.html", icon: "◫", label: "Katalog Produk", roles: ["karyawan", "manajer", "owner"] },
  { id: "transaksi", href: "transaksi.html", icon: "⌁", label: "Transaksi / Kasir", roles: ["karyawan", "manajer", "owner"] },
  { section: "Manajemen Data", roles: ["manajer", "owner"] },
  { id: "produk", href: "produk.html", icon: "□", label: "Produk", roles: ["manajer", "owner"] },
  { id: "kategori", href: "kategori.html", icon: "◇", label: "Kategori", roles: ["manajer", "owner"] },
  { id: "pelanggan", href: "pelanggan.html", icon: "○", label: "Pelanggan", roles: ["karyawan", "manajer", "owner"] },
  { id: "supplier", href: "supplier.html", icon: "△", label: "Supplier", roles: ["manajer", "owner"] },
  { id: "stok", href: "stok.html", icon: "↕", label: "Stok Barang", roles: ["manajer", "owner"] },
  { id: "diskon", href: "diskon.html", icon: "%", label: "Diskon / Promo", roles: ["manajer", "owner"] },
  { id: "retur", href: "retur.html", icon: "↩", label: "Retur Barang", roles: ["karyawan", "manajer", "owner"] },
  { id: "karyawan", href: "karyawan.html", icon: "◎", label: "Karyawan", roles: ["manajer", "owner"] },
  { section: "Laporan", roles: ["manajer", "owner"] },
  { id: "laporan-penjualan", href: "laporan-penjualan.html", icon: "⌁", label: "Laporan Penjualan", roles: ["manajer", "owner"] },
  { id: "laporan-laba", href: "laporan-laba.html", icon: "↗", label: "Laba Rugi", roles: ["owner"] },
  { section: "Sistem", roles: ["owner"] },
  { id: "users", href: "users.html", icon: "♙", label: "Manajemen User", roles: ["owner"] },
  { id: "pengaturan", href: "pengaturan.html", icon: "⚙", label: "Pengaturan Toko", roles: ["owner"] },
  { id: "riwayat-login", href: "riwayat-login.html", icon: "◷", label: "Riwayat Login", roles: ["owner"] },
  { id: "backup", href: "backup.html", icon: "⇩", label: "Backup Data", roles: ["owner"] },
  { section: "Akun" },
  { id: "notifikasi", href: "notifikasi.html", icon: "◉", label: "Notifikasi", roles: ["karyawan", "manajer", "owner"] },
  { id: "profil", href: "profil.html", icon: "☺", label: "Profil Saya", roles: ["karyawan", "manajer", "owner"] },
  { id: "bantuan", href: "bantuan.html", icon: "?", label: "Bantuan", roles: ["karyawan", "manajer", "owner"] }
];

const PAGE_META = {
  dashboard: ["Dashboard", "Ringkasan aktivitas toko hari ini"],
  katalog: ["Katalog Produk", "Temukan produk aktif dan cek ketersediaannya"],
  transaksi: ["Transaksi / Kasir", "Buat transaksi baru dengan cepat"],
  produk: ["Produk", "Kelola data dan persediaan produk"],
  kategori: ["Kategori", "Atur kelompok produk"],
  pelanggan: ["Pelanggan", "Kelola data dan loyalitas pelanggan"],
  supplier: ["Supplier", "Kelola mitra pemasok toko"],
  stok: ["Stok Barang", "Pantau arus barang masuk dan keluar"],
  diskon: ["Diskon / Promo", "Atur promosi yang sedang berjalan"],
  retur: ["Retur Barang", "Tindak lanjuti pengembalian barang"],
  karyawan: ["Karyawan", "Kelola tim operasional toko"],
  "laporan-penjualan": ["Laporan Penjualan", "Analisis performa transaksi"],
  "laporan-laba": ["Laporan Laba Rugi", "Estimasi kesehatan finansial toko"],
  users: ["Manajemen User", "Atur akun dan hak akses"],
  pengaturan: ["Pengaturan Toko", "Sesuaikan identitas dan preferensi operasional"],
  "riwayat-login": ["Riwayat Login", "Pantau aktivitas akses pengguna"],
  backup: ["Backup Data", "Ekspor, impor, dan pulihkan data aplikasi"],
  notifikasi: ["Notifikasi", "Informasi yang memerlukan perhatian Anda"],
  profil: ["Profil Saya", "Perbarui informasi akun Anda"],
  bantuan: ["Pusat Bantuan", "Panduan singkat menggunakan TokoKu"]
};

let _entity = null;
let _editId = null;
let _catalogFilter = "Semua";
let _catalogSearch = "";
let _cart = [];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const readJSON = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
};
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");
const fmtRp = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};
const getRows = (entity) => readJSON(ENTITIES[entity].storage, []);
const setRows = (entity, rows) => writeJSON(ENTITIES[entity].storage, rows);

function getSession() { return readJSON("tws_session", null); }

function login(username, password) {
  seedAll();
  const user = getRows("users").find((item) => item.username === username && item.password === password);
  if (!user) return null;
  const session = { id: user.id, nama: user.nama, username: user.username, role: user.role, email: user.email };
  writeJSON("tws_session", session);
  const logs = readJSON("tws_login_logs", []);
  logs.unshift({ id: Date.now(), user_id: user.id, nama: user.nama, username: user.username, role: user.role, waktu: new Date().toISOString() });
  writeJSON("tws_login_logs", logs.slice(0, 100));
  return user;
}

function logout() {
  localStorage.removeItem("tws_session");
  location.href = "../index.html";
}

function guard(pageId) {
  const session = getSession();
  if (!session) {
    location.href = "../index.html";
    return null;
  }
  const item = MENU.find((menu) => menu.id === pageId);
  if (item && !item.roles.includes(session.role)) {
    location.href = "dashboard.html";
    return null;
  }
  return session;
}

function bootPage(pageId) {
  seedAll();
  const session = guard(pageId);
  if (!session) return;
  document.body.dataset.page = pageId;
  document.title = `${PAGE_META[pageId]?.[0] || "TokoKu"} · TokoKu`;
  renderSidebar(pageId, session);
  renderTopbar(pageId, session);
  closeSidebarOnNavigate();

  const renderers = {
    dashboard: renderDashboard,
    katalog: renderKatalog,
    transaksi: renderPOS,
    produk: () => renderCrudPage("produk"),
    kategori: () => renderCrudPage("kategori"),
    pelanggan: () => renderCrudPage("pelanggan"),
    supplier: () => renderCrudPage("supplier"),
    stok: () => renderCrudPage("stok"),
    diskon: () => renderCrudPage("diskon"),
    retur: () => renderCrudPage("retur"),
    karyawan: () => renderCrudPage("karyawan"),
    "laporan-penjualan": renderSalesReport,
    "laporan-laba": renderProfitReport,
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
  const sidebar = $("#sidebar");
  if (!sidebar) return;
  let html = `
    <div class="sidebar-head">
      <a class="brand" href="dashboard.html" aria-label="TokoKu Dashboard"><span class="brand-mark">T</span><span>TokoKu</span></a>
      <button class="icon-btn sidebar-close" type="button" onclick="toggleSidebar(false)" aria-label="Tutup menu">×</button>
    </div>
    <div class="store-status"><span class="status-dot"></span><span>Toko aktif</span><small>Semua sistem normal</small></div>
    <nav class="sidebar-nav" aria-label="Navigasi utama">`;

  MENU.forEach((item) => {
    if (item.section) {
      if (!item.roles || item.roles.includes(session.role)) html += `<div class="nav-section">${escapeHtml(item.section)}</div>`;
      return;
    }
    if (!item.roles.includes(session.role)) return;
    html += `<a class="nav-item ${item.id === activeId ? "active" : ""}" href="${item.href}">
      <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${escapeHtml(item.label)}</span>
      ${item.id === "notifikasi" && unreadNotifications() ? `<b class="nav-count">${unreadNotifications()}</b>` : ""}
    </a>`;
  });

  html += `</nav><div class="sidebar-user">
    <div class="avatar" style="--avatar:${ROLE_COLORS[session.role]}">${escapeHtml(session.nama.charAt(0))}</div>
    <div><strong>${escapeHtml(session.nama)}</strong><span>${ROLE_LABEL[session.role]}</span></div>
    <button class="logout-btn" onclick="logout()" title="Keluar" aria-label="Keluar">↗</button>
  </div>`;
  sidebar.innerHTML = html;
}

function renderTopbar(pageId, session) {
  const meta = PAGE_META[pageId] || ["TokoKu", "Sistem penjualan terpadu"];
  const title = $("#page-title");
  const subtitle = $("#page-subtitle");
  const userChip = $("#user-chip");
  if (title) title.textContent = meta[0];
  if (subtitle) subtitle.textContent = meta[1];
  if (userChip) userChip.innerHTML = `
    <a class="notification-link" href="notifikasi.html" aria-label="Notifikasi">
      <span>◉</span>${unreadNotifications() ? `<b>${unreadNotifications()}</b>` : ""}
    </a>
    <div class="top-user"><span class="avatar small" style="--avatar:${ROLE_COLORS[session.role]}">${escapeHtml(session.nama.charAt(0))}</span>
    <div><strong>${escapeHtml(session.nama)}</strong><span>${ROLE_LABEL[session.role]}</span></div></div>`;
}

function toggleSidebar(show) {
  document.body.classList.toggle("sidebar-open", show ?? !document.body.classList.contains("sidebar-open"));
}

function closeSidebarOnNavigate() {
  $$(".nav-item").forEach((link) => link.addEventListener("click", () => toggleSidebar(false)));
}

function unreadNotifications() {
  return readJSON("tws_notifikasi", []).filter((item) => !item.read).length;
}

function badgeClass(value) {
  return ({
    Aktif: "green", Selesai: "green", Masuk: "green", Disetujui: "green", Gold: "amber", Platinum: "purple",
    Pending: "amber", Diproses: "amber", Cuti: "amber", Bronze: "red", Nonaktif: "red", Dibatalkan: "red",
    Ditolak: "red", Resign: "red", Silver: "blue", Keluar: "red", owner: "pink", manajer: "purple",
    karyawan: "blue", green: "green", blue: "blue", amber: "amber", purple: "purple", pink: "pink", red: "red"
  })[value] || "blue";
}

function toast(message, tone = "success") {
  const region = $("#toast-region");
  if (!region) return;
  const item = document.createElement("div");
  item.className = `toast ${tone}`;
  item.innerHTML = `<span>${tone === "success" ? "✓" : "!"}</span><p>${escapeHtml(message)}</p>`;
  region.appendChild(item);
  requestAnimationFrame(() => item.classList.add("show"));
  setTimeout(() => {
    item.classList.remove("show");
    setTimeout(() => item.remove(), 250);
  }, 2800);
}

function renderDashboard() {
  const products = getRows("produk");
  const transactions = getRows("transaksi");
  const customers = getRows("pelanggan");
  const complete = transactions.filter((item) => item.status === "Selesai");
  const revenue = complete.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const lowStock = products.filter((item) => item.status === "Aktif" && Number(item.stok) <= 20);
  const session = getSession();
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 19 ? "Selamat sore" : "Selamat malam";
  const chart = buildDailySales(transactions);

  $("#page-root").innerHTML = `
    <section class="welcome-card">
      <div><span class="eyebrow">RINGKASAN TOKO · ${escapeHtml(new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase())}</span>
      <h2>${greeting}, ${escapeHtml(session.nama.split(" ")[0])}.</h2>
      <p>${complete.length} transaksi selesai dan ${lowStock.length} produk perlu perhatian stok.</p></div>
      <a class="btn btn-light" href="transaksi.html">Buka kasir <span>→</span></a>
    </section>

    <section class="stats" aria-label="Ringkasan statistik">
      ${statCard("Total pendapatan", fmtRp(revenue), "+12,5% bulan ini", "violet", "↗")}
      ${statCard("Transaksi selesai", complete.length, `${transactions.length} transaksi tercatat`, "pink", "✓")}
      ${statCard("Pelanggan", customers.length, "Member aktif", "blue", "◎")}
      ${statCard("Stok menipis", lowStock.length, lowStock.length ? "Perlu ditindaklanjuti" : "Stok aman", "amber", "!")}
    </section>

    <section class="dashboard-grid">
      <article class="card chart-card">
        <div class="card-head"><div><span class="card-kicker">PERFORMA</span><h2>Penjualan 7 hari terakhir</h2></div><span class="metric-pill">${fmtRp(chart.reduce((sum, item) => sum + item.value, 0))}</span></div>
        <div class="bar-chart" aria-label="Grafik penjualan mingguan">
          ${chart.map((item) => `<div class="bar-column"><span class="bar-value">${Math.round(item.value / 1000)}k</span><div class="bar-track"><i style="height:${item.percent}%"></i></div><small>${item.label}</small></div>`).join("")}
        </div>
      </article>
      <article class="card attention-card">
        <div class="card-head"><div><span class="card-kicker">PERLU PERHATIAN</span><h2>Stok minimum</h2></div><a class="text-link" href="stok.html">Lihat semua</a></div>
        <div class="stock-list">
          ${lowStock.length ? lowStock.map((item) => `<div class="stock-item"><span class="product-icon" style="background:${KATALOG_BG[item.kategori] || "#e2e8f0"}">${KATALOG_EMOJI[item.kategori] || "📦"}</span><div><strong>${escapeHtml(item.nama)}</strong><small>${escapeHtml(item.kategori)}</small></div><b class="stock-number">${item.stok}</b></div>`).join("") : emptyState("✓", "Semua stok berada di atas batas minimum.")}
        </div>
      </article>
    </section>

    <section class="card">
      <div class="card-head"><div><span class="card-kicker">AKTIVITAS TERBARU</span><h2>Transaksi terakhir</h2></div><a class="text-link" href="laporan-penjualan.html">Buka laporan</a></div>
      ${transactionTable(transactions.slice().reverse().slice(0, 5), false)}
    </section>`;
}

function statCard(label, value, note, tone, icon) {
  return `<article class="stat-card ${tone}"><div class="stat-icon">${icon}</div><div class="stat-copy"><span>${label}</span><strong>${value}</strong><small>${note}</small></div></article>`;
}

function buildDailySales(transactions) {
  const days = [];
  const base = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(base);
    date.setDate(base.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const value = transactions.filter((item) => String(item.tanggal).slice(0, 10) === key && item.status === "Selesai").reduce((sum, item) => sum + Number(item.total || 0), 0);
    days.push({ label: date.toLocaleDateString("id-ID", { weekday: "short" }).slice(0, 3), value });
  }
  const max = Math.max(...days.map((item) => item.value), 1);
  return days.map((item) => ({ ...item, percent: item.value ? Math.max(16, Math.round((item.value / max) * 100)) : 6 }));
}

function renderCrudPage(entity) {
  _entity = entity;
  const config = ENTITIES[entity];
  $("#page-root").innerHTML = `
    <section class="section-intro">
      <div class="intro-icon">${config.icon}</div><div><h2>${escapeHtml(config.title)}</h2><p>${escapeHtml(config.description)}</p></div>
    </section>
    <section class="card">
      <div class="card-head table-tools">
        <div><span class="card-kicker">DATABASE</span><h2>${escapeHtml(config.title)}</h2><p id="row-count" class="muted"></p></div>
        <div class="toolbar"><label class="search-wrap"><span>⌕</span><input id="search" class="search" type="search" placeholder="Cari data..." oninput="renderTable('${entity}')" aria-label="Cari data"></label>
        <button class="btn btn-primary" type="button" onclick="openForm('${entity}')"><span>＋</span> Tambah data</button></div>
      </div>
      <div id="table-wrap"></div>
    </section>`;
  renderTable(entity);
}

function formatCell(column, value) {
  if (["harga", "total", "gaji"].includes(column)) return escapeHtml(fmtRp(value));
  if (column === "persen") return `${escapeHtml(value)}%`;
  if (["status", "tier", "role", "tipe", "warna"].includes(column)) return `<span class="badge ${badgeClass(value)}">${escapeHtml(value)}</span>`;
  if (["tanggal", "mulai", "selesai"].includes(column)) return escapeHtml(formatDate(value));
  return escapeHtml(value ?? "-");
}

function renderTable(entity) {
  _entity = entity;
  const config = ENTITIES[entity];
  const rows = getRows(entity);
  const keyword = ($("#search")?.value || "").trim().toLowerCase();
  const filtered = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(keyword));
  const counter = $("#row-count");
  if (counter) counter.textContent = `${filtered.length} dari ${rows.length} data`;
  const wrap = $("#table-wrap");
  if (!wrap) return;
  if (!filtered.length) {
    wrap.innerHTML = emptyState("⌕", "Tidak ada data yang cocok dengan pencarian Anda.");
    return;
  }
  wrap.innerHTML = `<div class="table-scroll"><table><thead><tr>${config.columns.map((column) => `<th>${escapeHtml(config.labels[column] || column)}</th>`).join("")}<th class="actions-col">Aksi</th></tr></thead>
    <tbody>${filtered.map((row) => `<tr>${config.columns.map((column) => `<td>${formatCell(column, row[column])}</td>`).join("")}
    <td class="actions"><button class="table-action edit" type="button" onclick="openForm('${entity}',${Number(row.id)})" aria-label="Edit">Edit</button>
    <button class="table-action delete" type="button" onclick="delRow('${entity}',${Number(row.id)})" aria-label="Hapus">Hapus</button></td></tr>`).join("")}</tbody></table></div>`;
}

function openForm(entity, id = null) {
  _entity = entity;
  _editId = id;
  const config = ENTITIES[entity];
  const row = id ? getRows(entity).find((item) => item.id === id) || {} : {};
  const fields = config.fields.map((field) => {
    const value = row[field.name] ?? "";
    const attributes = `${field.required ? "required" : ""} ${field.min !== undefined ? `min="${field.min}"` : ""} ${field.max !== undefined ? `max="${field.max}"` : ""}`;
    let control;
    if (field.type === "select") {
      control = `<select id="f-${field.name}" ${attributes}>${field.options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
    } else if (field.type === "textarea") {
      control = `<textarea id="f-${field.name}" rows="3" ${attributes}>${escapeHtml(value)}</textarea>`;
    } else {
      control = `<input id="f-${field.name}" type="${field.type}" value="${escapeHtml(value)}" ${attributes}>`;
    }
    return `<label class="field ${field.type === "textarea" ? "full" : ""}"><span>${escapeHtml(field.label)}</span>${control}</label>`;
  }).join("");

  document.body.insertAdjacentHTML("beforeend", `<div class="modal-overlay show" id="modal-overlay" onclick="overlayClose(event)">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-head"><div><span class="card-kicker">${id ? "PERBARUI DATA" : "DATA BARU"}</span><h3 id="modal-title">${id ? "Edit" : "Tambah"} ${escapeHtml(config.title.replace("Data ", ""))}</h3></div>
      <button class="icon-btn" type="button" onclick="closeModal()" aria-label="Tutup">×</button></div>
      <form id="entity-form" class="form-grid" onsubmit="event.preventDefault();saveRow('${entity}')">${fields}
        <div class="modal-foot full"><button class="btn btn-ghost" type="button" onclick="closeModal()">Batal</button><button class="btn btn-primary" type="submit">Simpan data</button></div>
      </form>
    </section></div>`);
  setTimeout(() => $("#entity-form input, #entity-form select, #entity-form textarea")?.focus(), 30);
}

function overlayClose(event) { if (event.target.id === "modal-overlay") closeModal(); }
function closeModal() { $("#modal-overlay")?.remove(); _editId = null; }

function saveRow(entity) {
  const form = $("#entity-form");
  if (!form?.reportValidity()) return;
  const config = ENTITIES[entity];
  const values = {};
  config.fields.forEach((field) => {
    let value = $(`#f-${field.name}`).value.trim();
    if (field.type === "number") value = Number(value);
    values[field.name] = value;
  });

  const rows = getRows(entity);
  if (entity === "users" && rows.some((item) => item.username === values.username && item.id !== _editId)) {
    toast("Username sudah digunakan.", "error");
    return;
  }

  const wasEditing = Boolean(_editId);
  const oldStockLog = entity === "stok" && _editId ? rows.find((item) => item.id === _editId) : null;
  if (_editId) {
    const index = rows.findIndex((item) => item.id === _editId);
    if (index >= 0) rows[index] = { ...rows[index], ...values };
  } else {
    values.id = rows.length ? Math.max(...rows.map((item) => Number(item.id))) + 1 : 1;
    rows.push(values);
  }
  setRows(entity, rows);

  if (entity === "stok") {
    if (oldStockLog) applyStockMovement(oldStockLog, true);
    applyStockMovement(_editId ? rows.find((item) => item.id === _editId) : values, false);
  }
  if (entity === "users" && _editId === getSession()?.id) syncCurrentSession(values);

  closeModal();
  renderTable(entity);
  toast(wasEditing ? "Data berhasil diperbarui." : "Data baru berhasil disimpan.");
}

function delRow(entity, id) {
  if (entity === "users" && id === getSession()?.id) {
    toast("Akun yang sedang digunakan tidak dapat dihapus.", "error");
    return;
  }
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  const rows = getRows(entity);
  const target = rows.find((item) => item.id === id);
  if (entity === "stok" && target) applyStockMovement(target, true);
  setRows(entity, rows.filter((item) => item.id !== id));
  renderTable(entity);
  toast("Data telah dihapus.");
}

function applyStockMovement(log, reverse) {
  const products = getRows("produk");
  const product = products.find((item) => item.nama === log.produk);
  if (!product) return;
  const direction = log.tipe === "Masuk" ? 1 : -1;
  product.stok = Math.max(0, Number(product.stok) + Number(log.jumlah) * direction * (reverse ? -1 : 1));
  setRows("produk", products);
}

function syncCurrentSession(values) {
  const session = getSession();
  writeJSON("tws_session", { ...session, nama: values.nama, username: values.username, role: values.role, email: values.email });
}

function renderKatalog() {
  const products = getRows("produk").filter((item) => item.status === "Aktif");
  const categories = ["Semua", ...new Set(products.map((item) => item.kategori))];
  const visible = products.filter((item) => (_catalogFilter === "Semua" || item.kategori === _catalogFilter) && item.nama.toLowerCase().includes(_catalogSearch.toLowerCase()));
  $("#page-root").innerHTML = `
    <section class="catalog-hero">
      <div><span class="eyebrow">KATALOG TOKOKU</span><h2>Produk pilihan, siap dijual.</h2><p>Cek harga dan stok, lalu tambahkan produk langsung ke kasir.</p></div>
      <div class="catalog-search"><span>⌕</span><input type="search" value="${escapeHtml(_catalogSearch)}" placeholder="Cari produk..." oninput="setCatalogSearch(this.value)" aria-label="Cari produk"></div>
    </section>
    <div class="chip-row">${categories.map((category) => `<button class="chip ${_catalogFilter === category ? "active" : ""}" type="button" onclick="setCatalogFilter(decodeURIComponent('${encodeURIComponent(category)}'))">${escapeHtml(category)}</button>`).join("")}</div>
    <section class="catalog-grid">
      ${visible.length ? visible.map(productCard).join("") : emptyState("⌕", "Produk tidak ditemukan. Coba kata kunci lain.")}
    </section>`;
}

function productCard(item) {
  const low = Number(item.stok) <= 20;
  return `<article class="product-card">
    <div class="product-visual" style="background:${KATALOG_BG[item.kategori] || "#cbd5e1"}"><span>${KATALOG_EMOJI[item.kategori] || "📦"}</span><b class="stock-chip ${low ? "low" : ""}">${low ? "Stok menipis" : `${item.stok} tersedia`}</b></div>
    <div class="product-body"><span class="product-category">${escapeHtml(item.kategori)}</span><h3>${escapeHtml(item.nama)}</h3>
    <div class="product-footer"><strong>${fmtRp(item.harga)}</strong><button class="round-add" type="button" onclick="goToTransaction(${Number(item.id)})" aria-label="Tambahkan ${escapeHtml(item.nama)} ke kasir">＋</button></div></div>
  </article>`;
}

function setCatalogFilter(value) { _catalogFilter = value; renderKatalog(); }
function setCatalogSearch(value) { _catalogSearch = value; renderKatalog(); $(".catalog-search input")?.focus(); }

function loadCart() {
  try { _cart = JSON.parse(sessionStorage.getItem("tws_cart") || "[]"); }
  catch { _cart = []; }
}
function saveCart() { sessionStorage.setItem("tws_cart", JSON.stringify(_cart)); }

function goToTransaction(productId) {
  loadCart();
  addProductToCart(productId, false);
  location.href = "transaksi.html";
}

function renderPOS() {
  loadCart();
  const products = getRows("produk").filter((item) => item.status === "Aktif");
  const customers = getRows("pelanggan");
  $("#page-root").innerHTML = `
    <section class="pos-layout">
      <div class="pos-products card">
        <div class="card-head"><div><span class="card-kicker">PILIH PRODUK</span><h2>Produk tersedia</h2></div><label class="search-wrap"><span>⌕</span><input class="search" id="pos-search" type="search" placeholder="Cari produk..." oninput="filterPOSProducts(this.value)" aria-label="Cari produk"></label></div>
        <div class="pos-product-grid" id="pos-products">${products.map(posProductButton).join("")}</div>
      </div>
      <aside class="cart-card card">
        <div class="card-head"><div><span class="card-kicker">PESANAN</span><h2>Keranjang kasir</h2></div><span class="cart-count" id="cart-count"></span></div>
        <div id="cart-items"></div>
        <div class="checkout-fields">
          <label class="field"><span>Pelanggan</span><select id="checkout-customer"><option value="Umum">Pelanggan umum</option>${customers.map((item) => `<option value="${escapeHtml(item.nama)}">${escapeHtml(item.nama)} · ${escapeHtml(item.tier)}</option>`).join("")}</select></label>
          <label class="field"><span>Metode pembayaran</span><select id="checkout-method"><option>Tunai</option><option>QRIS</option><option>Transfer</option><option>Kartu Kredit</option></select></label>
        </div>
        <div id="cart-summary"></div>
      </aside>
    </section>
    <section class="card transaction-history"><div class="card-head"><div><span class="card-kicker">TRANSAKSI</span><h2>Riwayat terbaru</h2></div><a class="text-link" href="laporan-penjualan.html">Laporan lengkap</a></div>${transactionTable(getRows("transaksi").slice().reverse().slice(0, 5), true)}</section>`;
  renderCart();
}

function posProductButton(item) {
  return `<button class="pos-product" type="button" data-search="${escapeHtml(`${item.nama} ${item.kategori}`.toLowerCase())}" onclick="addProductToCart(${Number(item.id)})">
    <span class="mini-visual" style="background:${KATALOG_BG[item.kategori] || "#cbd5e1"}">${KATALOG_EMOJI[item.kategori] || "📦"}</span><span><strong>${escapeHtml(item.nama)}</strong><small>${fmtRp(item.harga)} · stok ${item.stok}</small></span><b>＋</b>
  </button>`;
}

function filterPOSProducts(value) {
  const keyword = value.trim().toLowerCase();
  $$(".pos-product").forEach((item) => item.hidden = !item.dataset.search.includes(keyword));
}

function addProductToCart(productId, notify = true) {
  const product = getRows("produk").find((item) => item.id === productId && item.status === "Aktif");
  if (!product) return;
  const existing = _cart.find((item) => item.productId === productId);
  const currentQty = existing?.qty || 0;
  if (currentQty >= Number(product.stok)) {
    if (notify) toast("Jumlah melebihi stok yang tersedia.", "error");
    return;
  }
  if (existing) existing.qty += 1;
  else _cart.push({ productId, qty: 1 });
  saveCart();
  if ($("#cart-items")) renderCart();
  if (notify) toast(`${product.nama} ditambahkan ke keranjang.`);
}

function updateCart(productId, delta) {
  const item = _cart.find((entry) => entry.productId === productId);
  const product = getRows("produk").find((entry) => entry.id === productId);
  if (!item || !product) return;
  const next = item.qty + delta;
  if (next > Number(product.stok)) { toast("Stok tidak mencukupi.", "error"); return; }
  if (next <= 0) _cart = _cart.filter((entry) => entry.productId !== productId);
  else item.qty = next;
  saveCart();
  renderCart();
}

function renderCart() {
  const products = getRows("produk");
  _cart = _cart.filter((item) => products.some((product) => product.id === item.productId));
  saveCart();
  const detailed = _cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }));
  const subtotal = detailed.reduce((sum, item) => sum + Number(item.product.harga) * item.qty, 0);
  const settings = readJSON("tws_pengaturan", PENGATURAN_SEED);
  const tax = Math.round(subtotal * Number(settings.pajak_persen || 0) / 100);
  const total = subtotal + tax;
  const items = $("#cart-items");
  const summary = $("#cart-summary");
  const count = $("#cart-count");
  if (count) count.textContent = `${detailed.reduce((sum, item) => sum + item.qty, 0)} item`;
  if (items) items.innerHTML = detailed.length ? detailed.map((item) => `<div class="cart-item"><span class="cart-emoji" style="background:${KATALOG_BG[item.product.kategori] || "#e2e8f0"}">${KATALOG_EMOJI[item.product.kategori] || "📦"}</span><div><strong>${escapeHtml(item.product.nama)}</strong><small>${fmtRp(item.product.harga)}</small></div><div class="qty-control"><button type="button" onclick="updateCart(${item.productId},-1)">−</button><b>${item.qty}</b><button type="button" onclick="updateCart(${item.productId},1)">＋</button></div></div>`).join("") : emptyState("🛒", "Keranjang masih kosong. Pilih produk untuk memulai transaksi.");
  if (summary) summary.innerHTML = `<div class="summary-row"><span>Subtotal</span><b>${fmtRp(subtotal)}</b></div><div class="summary-row"><span>Pajak (${settings.pajak_persen || 0}%)</span><b>${fmtRp(tax)}</b></div><div class="summary-total"><span>Total</span><strong>${fmtRp(total)}</strong></div><button class="btn btn-primary checkout-btn" type="button" onclick="checkout()" ${detailed.length ? "" : "disabled"}>Selesaikan transaksi <span>→</span></button>`;
}

function checkout() {
  if (!_cart.length) return;
  const products = getRows("produk");
  for (const cartItem of _cart) {
    const product = products.find((item) => item.id === cartItem.productId);
    if (!product || cartItem.qty > Number(product.stok)) {
      toast(`Stok ${product?.nama || "produk"} tidak mencukupi.`, "error");
      return;
    }
  }
  const transactions = getRows("transaksi");
  const details = readJSON("tws_detail_transaksi", []);
  const stockLogs = getRows("stok");
  const settings = readJSON("tws_pengaturan", PENGATURAN_SEED);
  const id = transactions.length ? Math.max(...transactions.map((item) => Number(item.id))) + 1 : 1;
  const subtotal = _cart.reduce((sum, item) => sum + Number(products.find((product) => product.id === item.productId).harga) * item.qty, 0);
  const total = subtotal + Math.round(subtotal * Number(settings.pajak_persen || 0) / 100);
  const code = `TRX-${String(id).padStart(3, "0")}`;
  const session = getSession();
  transactions.push({ id, kode: code, tanggal: todayISO(), pelanggan: $("#checkout-customer").value, kasir: session.nama, total, metode: $("#checkout-method").value, status: "Selesai" });

  _cart.forEach((cartItem) => {
    const product = products.find((item) => item.id === cartItem.productId);
    product.stok = Number(product.stok) - cartItem.qty;
    details.push({ id: details.length ? Math.max(...details.map((item) => Number(item.id))) + 1 : 1, transaksi_id: id, produk_id: product.id, produk: product.nama, qty: cartItem.qty, harga: product.harga, subtotal: Number(product.harga) * cartItem.qty });
    stockLogs.push({ id: stockLogs.length ? Math.max(...stockLogs.map((item) => Number(item.id))) + 1 : 1, tanggal: todayISO(), produk: product.nama, tipe: "Keluar", jumlah: cartItem.qty, keterangan: `Penjualan ${code}` });
  });

  setRows("transaksi", transactions);
  setRows("produk", products);
  setRows("stok", stockLogs);
  writeJSON("tws_detail_transaksi", details);
  _cart = [];
  saveCart();
  renderPOS();
  toast(`${code} berhasil diselesaikan.`);
}

function transactionTable(rows, allowDetail) {
  if (!rows.length) return emptyState("🧾", "Belum ada transaksi tercatat.");
  return `<div class="table-scroll"><table><thead><tr><th>Kode</th><th>Tanggal</th><th>Pelanggan</th><th>Kasir</th><th>Metode</th><th>Status</th><th>Total</th>${allowDetail ? "<th></th>" : ""}</tr></thead><tbody>${rows.map((item) => `<tr><td><strong>${escapeHtml(item.kode)}</strong></td><td>${formatDate(item.tanggal)}</td><td>${escapeHtml(item.pelanggan || "Umum")}</td><td>${escapeHtml(item.kasir || "-")}</td><td>${escapeHtml(item.metode)}</td><td><span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td><td><strong>${fmtRp(item.total)}</strong></td>${allowDetail ? `<td><button class="table-action edit" onclick="openTransactionDetail(${Number(item.id)})">Detail</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}

function openTransactionDetail(transactionId) {
  const transaction = getRows("transaksi").find((item) => item.id === transactionId);
  const details = readJSON("tws_detail_transaksi", []).filter((item) => item.transaksi_id === transactionId);
  if (!transaction) return;
  document.body.insertAdjacentHTML("beforeend", `<div class="modal-overlay show" id="modal-overlay" onclick="overlayClose(event)"><section class="modal receipt-modal" role="dialog" aria-modal="true"><div class="modal-head"><div><span class="card-kicker">RINCIAN TRANSAKSI</span><h3>${escapeHtml(transaction.kode)}</h3></div><button class="icon-btn" onclick="closeModal()">×</button></div>
  <div class="receipt-meta"><span>${formatDate(transaction.tanggal)}</span><span>${escapeHtml(transaction.pelanggan || "Umum")}</span><span>${escapeHtml(transaction.metode)}</span></div>
  <div class="receipt-lines">${details.length ? details.map((item) => `<div><span>${escapeHtml(item.produk)} <small>× ${item.qty}</small></span><b>${fmtRp(item.subtotal)}</b></div>`).join("") : `<p class="muted">Detail item tidak tersedia.</p>`}</div>
  <div class="receipt-total"><span>Total transaksi</span><strong>${fmtRp(transaction.total)}</strong></div></section></div>`);
}

function renderSalesReport() {
  const transactions = getRows("transaksi");
  const complete = transactions.filter((item) => item.status === "Selesai");
  const revenue = complete.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const average = complete.length ? revenue / complete.length : 0;
  const methods = ["Tunai", "QRIS", "Transfer", "Kartu Kredit"].map((method) => ({ method, value: complete.filter((item) => item.metode === method).reduce((sum, item) => sum + Number(item.total || 0), 0) }));
  const maxMethod = Math.max(...methods.map((item) => item.value), 1);
  $("#page-root").innerHTML = `
    <section class="report-filter card"><div><span class="card-kicker">PERIODE LAPORAN</span><h2>September 2026</h2></div><div class="date-range"><label>Dari<input type="date" value="2026-09-01"></label><span>—</span><label>Sampai<input type="date" value="2026-09-30"></label><button class="btn btn-secondary" onclick="toast('Filter periode diterapkan.')">Terapkan</button></div></section>
    <section class="stats three">${statCard("Pendapatan selesai", fmtRp(revenue), `${complete.length} transaksi`, "violet", "↗")}${statCard("Rata-rata transaksi", fmtRp(average), "Per transaksi selesai", "blue", "≈")}${statCard("Transaksi pending", transactions.filter((item) => item.status === "Pending").length, "Perlu verifikasi", "amber", "◷")}</section>
    <section class="report-grid"><article class="card"><div class="card-head"><div><span class="card-kicker">KANAL PEMBAYARAN</span><h2>Kontribusi pendapatan</h2></div></div><div class="progress-list">${methods.map((item) => `<div class="progress-item"><div><span>${item.method}</span><b>${fmtRp(item.value)}</b></div><div class="progress-track"><i style="width:${Math.round(item.value / maxMethod * 100)}%"></i></div></div>`).join("")}</div></article>
    <article class="card report-note"><span class="report-orb">↗</span><span class="card-kicker">SOROTAN</span><h2>${complete.length ? "Penjualan berada di jalur positif." : "Belum ada transaksi selesai."}</h2><p>QRIS dan pembayaran tunai menjadi kanal utama. Pantau transaksi pending agar arus kas tetap akurat.</p></article></section>
    <section class="card"><div class="card-head"><div><span class="card-kicker">RINCIAN</span><h2>Semua transaksi</h2></div><button class="btn btn-ghost" onclick="exportReportCSV()">↓ Ekspor CSV</button></div>${transactionTable(transactions.slice().reverse(), true)}</section>`;
}

function exportReportCSV() {
  const rows = getRows("transaksi");
  const headers = ["Kode", "Tanggal", "Pelanggan", "Kasir", "Metode", "Status", "Total"];
  const csv = [headers, ...rows.map((item) => [item.kode, item.tanggal, item.pelanggan, item.kasir, item.metode, item.status, item.total])]
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadBlob(csv, "laporan-penjualan.csv", "text/csv;charset=utf-8");
  toast("Laporan CSV berhasil dibuat.");
}

function renderProfitReport() {
  const complete = getRows("transaksi").filter((item) => item.status === "Selesai");
  const revenue = complete.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const hpp = Math.round(revenue * 0.62);
  const gross = revenue - hpp;
  const operating = Math.round(revenue * 0.15);
  const net = gross - operating;
  const margin = revenue ? Math.round(net / revenue * 100) : 0;
  $("#page-root").innerHTML = `
    <section class="profit-hero"><div><span class="eyebrow">ESTIMASI LABA BERSIH</span><strong>${fmtRp(net)}</strong><p>Margin bersih ${margin}% dari pendapatan transaksi selesai.</p></div><div class="profit-ring" style="--progress:${margin * 3.6}deg"><span><b>${margin}%</b><small>margin</small></span></div></section>
    <section class="profit-grid">
      <article class="card profit-statement"><div class="card-head"><div><span class="card-kicker">LABA RUGI</span><h2>Ringkasan periode</h2></div><span class="metric-pill">September 2026</span></div>
      <div class="statement-row"><span>Pendapatan penjualan</span><strong>${fmtRp(revenue)}</strong></div><div class="statement-row cost"><span>Estimasi harga pokok (62%)</span><strong>− ${fmtRp(hpp)}</strong></div><div class="statement-row subtotal"><span>Laba kotor</span><strong>${fmtRp(gross)}</strong></div><div class="statement-row cost"><span>Estimasi biaya operasional (15%)</span><strong>− ${fmtRp(operating)}</strong></div><div class="statement-row total"><span>Estimasi laba bersih</span><strong>${fmtRp(net)}</strong></div>
      <p class="fine-print">Nilai HPP dan biaya operasional merupakan estimasi untuk prototipe. Hubungkan dengan data pembelian dan biaya aktual untuk laporan akuntansi resmi.</p></article>
      <aside class="card insight-panel"><span class="card-kicker">INSIGHT</span><h2>Kondisi usaha</h2><div class="insight-score"><b>${margin >= 20 ? "Sehat" : "Perlu perhatian"}</b><span class="badge ${margin >= 20 ? "green" : "amber"}">${margin}% margin</span></div><ul><li>Pendapatan berasal dari ${complete.length} transaksi selesai.</li><li>Laba kotor diperkirakan ${fmtRp(gross)}.</li><li>Verifikasi biaya aktual sebelum pengambilan keputusan.</li></ul></aside>
    </section>`;
}

function renderSettings() {
  const settings = readJSON("tws_pengaturan", PENGATURAN_SEED);
  $("#page-root").innerHTML = `<form class="settings-grid" onsubmit="event.preventDefault();saveSettings()">
    <section class="card"><div class="card-head"><div><span class="card-kicker">IDENTITAS TOKO</span><h2>Informasi utama</h2></div></div><div class="form-grid">
      <label class="field full"><span>Nama toko</span><input id="setting-name" value="${escapeHtml(settings.nama_toko)}" required></label>
      <label class="field"><span>Telepon</span><input id="setting-phone" value="${escapeHtml(settings.telepon)}"></label>
      <label class="field full"><span>Alamat</span><textarea id="setting-address" rows="3">${escapeHtml(settings.alamat)}</textarea></label>
    </div></section>
    <section class="card"><div class="card-head"><div><span class="card-kicker">OPERASIONAL</span><h2>Preferensi transaksi</h2></div></div><div class="form-grid">
      <label class="field"><span>Pajak penjualan (%)</span><input id="setting-tax" type="number" min="0" max="100" value="${Number(settings.pajak_persen)}"></label>
      <label class="field"><span>Batas stok minimum</span><input id="setting-stock" type="number" min="0" value="${Number(settings.batas_stok_min || 20)}"></label>
      <label class="switch-row full"><span><strong>Notifikasi stok minimum</strong><small>Tampilkan peringatan saat stok menyentuh batas.</small></span><input id="setting-notif" type="checkbox" ${settings.notif_stok_min ? "checked" : ""}><i></i></label>
    </div><button class="btn btn-primary settings-save" type="submit">Simpan pengaturan</button></section>
  </form>`;
}

function saveSettings() {
  const settings = { nama_toko: $("#setting-name").value.trim(), alamat: $("#setting-address").value.trim(), telepon: $("#setting-phone").value.trim(), pajak_persen: Number($("#setting-tax").value), batas_stok_min: Number($("#setting-stock").value), notif_stok_min: $("#setting-notif").checked };
  writeJSON("tws_pengaturan", settings);
  toast("Pengaturan toko berhasil disimpan.");
}

function renderLoginHistory() {
  const logs = readJSON("tws_login_logs", []);
  $("#page-root").innerHTML = `<section class="card"><div class="card-head table-tools"><div><span class="card-kicker">KEAMANAN</span><h2>Aktivitas masuk</h2><p class="muted">${logs.length} aktivitas terakhir</p></div><button class="btn btn-ghost" onclick="clearLoginHistory()">Bersihkan riwayat</button></div>
  ${logs.length ? `<div class="table-scroll"><table><thead><tr><th>Pengguna</th><th>Username</th><th>Role</th><th>Waktu masuk</th><th>Status</th></tr></thead><tbody>${logs.map((log) => `<tr><td><strong>${escapeHtml(log.nama)}</strong></td><td>${escapeHtml(log.username || "-")}</td><td><span class="badge ${badgeClass(log.role)}">${escapeHtml(log.role)}</span></td><td>${escapeHtml(new Date(log.waktu).toLocaleString("id-ID"))}</td><td><span class="login-status"><i></i> Berhasil</span></td></tr>`).join("")}</tbody></table></div>` : emptyState("◷", "Riwayat login akan muncul setelah pengguna masuk.")}</section>`;
}

function clearLoginHistory() {
  if (!confirm("Hapus seluruh riwayat login?")) return;
  writeJSON("tws_login_logs", []);
  renderLoginHistory();
  toast("Riwayat login telah dibersihkan.");
}

function renderBackup() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith("tws_") && key !== "tws_session");
  const size = keys.reduce((sum, key) => sum + (localStorage.getItem(key)?.length || 0), 0);
  $("#page-root").innerHTML = `<section class="backup-hero"><div class="backup-icon">⇩</div><div><span class="eyebrow">PUSAT DATA</span><h2>Data toko Anda tersimpan di perangkat ini.</h2><p>Buat salinan berkala sebelum membersihkan browser atau memindahkan perangkat.</p></div><span class="backup-size">${(size / 1024).toFixed(1)} KB</span></section>
  <section class="backup-grid">
    <article class="card backup-card"><span class="backup-step">01</span><h2>Ekspor backup</h2><p>Unduh seluruh data master, transaksi, stok, dan pengaturan sebagai satu file JSON.</p><button class="btn btn-primary" onclick="exportBackup()">↓ Unduh backup</button></article>
    <article class="card backup-card"><span class="backup-step">02</span><h2>Impor backup</h2><p>Pulihkan data dari file backup TokoKu. Data aktif akan diganti setelah konfirmasi.</p><label class="btn btn-secondary file-button">↑ Pilih file<input type="file" accept="application/json,.json" onchange="importBackup(event)"></label></article>
    <article class="card backup-card danger-zone"><span class="backup-step">03</span><h2>Reset data demo</h2><p>Kembalikan seluruh data ke kondisi awal yang tercantum di schema.sql.</p><button class="btn btn-danger" onclick="resetDemoData()">Reset data</button></article>
  </section>`;
}

function exportBackup() {
  const data = {};
  Object.keys(localStorage).filter((key) => key.startsWith("tws_") && key !== "tws_session").forEach((key) => { data[key] = readJSON(key, null); });
  downloadBlob(JSON.stringify({ app: "TokoKu", version: 1, exported_at: new Date().toISOString(), data }, null, 2), `tokoku-backup-${todayISO()}.json`, "application/json");
  toast("Backup berhasil diunduh.");
}

function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const backup = JSON.parse(reader.result);
      if (backup.app !== "TokoKu" || !backup.data) throw new Error("Format tidak valid");
      if (!confirm("Impor akan mengganti data TokoKu saat ini. Lanjutkan?")) return;
      Object.entries(backup.data).forEach(([key, value]) => { if (key.startsWith("tws_") && key !== "tws_session") writeJSON(key, value); });
      renderBackup();
      toast("Backup berhasil dipulihkan.");
    } catch { toast("File backup tidak valid.", "error"); }
  };
  reader.readAsText(file);
}

function resetDemoData() {
  if (!confirm("Kembalikan semua data ke kondisi awal? Perubahan Anda akan hilang.")) return;
  Object.keys(localStorage).filter((key) => key.startsWith("tws_") && key !== "tws_session").forEach((key) => localStorage.removeItem(key));
  seedAll();
  renderBackup();
  toast("Data demo berhasil dipulihkan.");
}

function downloadBlob(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function renderNotifications() {
  const notifications = readJSON("tws_notifikasi", []);
  $("#page-root").innerHTML = `<section class="card notifications-card"><div class="card-head table-tools"><div><span class="card-kicker">INBOX</span><h2>Notifikasi terbaru</h2><p class="muted">${notifications.filter((item) => !item.read).length} belum dibaca</p></div><button class="btn btn-ghost" onclick="markAllRead()">Tandai semua dibaca</button></div>
    <div class="notification-list">${notifications.length ? notifications.map((item) => `<button class="notification-item ${item.read ? "read" : ""}" onclick="markNotification(${Number(item.id)})"><span class="notification-icon ${item.tone}">${item.icon}</span><span class="notification-copy"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.body)}</span><small>${escapeHtml(item.time)}</small></span>${item.read ? "" : `<i class="unread-dot"></i>`}</button>`).join("") : emptyState("◉", "Tidak ada notifikasi saat ini.")}</div></section>`;
}

function markNotification(id) {
  const notifications = readJSON("tws_notifikasi", []);
  const item = notifications.find((entry) => entry.id === id);
  if (item) item.read = true;
  writeJSON("tws_notifikasi", notifications);
  renderNotifications();
  renderTopbar("notifikasi", getSession());
  renderSidebar("notifikasi", getSession());
}

function markAllRead() {
  const notifications = readJSON("tws_notifikasi", []).map((item) => ({ ...item, read: true }));
  writeJSON("tws_notifikasi", notifications);
  renderNotifications();
  renderTopbar("notifikasi", getSession());
  renderSidebar("notifikasi", getSession());
  toast("Semua notifikasi ditandai sudah dibaca.");
}

function renderProfile() {
  const session = getSession();
  $("#page-root").innerHTML = `<section class="profile-layout">
    <aside class="profile-card card"><div class="profile-avatar" style="--avatar:${ROLE_COLORS[session.role]}">${escapeHtml(session.nama.charAt(0))}</div><h2>${escapeHtml(session.nama)}</h2><span class="badge ${badgeClass(session.role)}">${ROLE_LABEL[session.role]}</span><p>${escapeHtml(session.email || "Email belum diatur")}</p><div class="profile-meta"><span><small>Username</small><b>@${escapeHtml(session.username)}</b></span><span><small>ID pengguna</small><b>#${String(session.id).padStart(4, "0")}</b></span></div></aside>
    <form class="card profile-form" onsubmit="event.preventDefault();saveProfile()"><div class="card-head"><div><span class="card-kicker">INFORMASI AKUN</span><h2>Edit profil</h2></div></div><div class="form-grid">
      <label class="field full"><span>Nama lengkap</span><input id="profile-name" value="${escapeHtml(session.nama)}" required></label>
      <label class="field"><span>Username</span><input id="profile-username" value="${escapeHtml(session.username)}" required></label>
      <label class="field"><span>Email</span><input id="profile-email" type="email" value="${escapeHtml(session.email || "")}"></label>
      <label class="field full"><span>Password baru <small>(kosongkan jika tidak diubah)</small></span><input id="profile-password" type="password" placeholder="••••••••"></label>
    </div><button class="btn btn-primary" type="submit">Simpan perubahan</button></form>
  </section>`;
}

function saveProfile() {
  const session = getSession();
  const users = getRows("users");
  const user = users.find((item) => item.id === session.id);
  const username = $("#profile-username").value.trim();
  if (users.some((item) => item.username === username && item.id !== session.id)) { toast("Username sudah digunakan.", "error"); return; }
  user.nama = $("#profile-name").value.trim();
  user.username = username;
  user.email = $("#profile-email").value.trim();
  if ($("#profile-password").value) user.password = $("#profile-password").value;
  setRows("users", users);
  writeJSON("tws_session", { ...session, nama: user.nama, username: user.username, email: user.email });
  renderProfile();
  renderTopbar("profil", getSession());
  renderSidebar("profil", getSession());
  toast("Profil berhasil diperbarui.");
}

function renderHelp() {
  const guides = [
    ["01", "Mulai transaksi", "Buka menu Transaksi / Kasir, pilih produk, tentukan pelanggan dan metode pembayaran, lalu selesaikan transaksi."],
    ["02", "Kelola stok", "Setiap transaksi selesai otomatis mengurangi stok. Gunakan halaman Stok Barang untuk mencatat barang masuk atau koreksi."],
    ["03", "Baca laporan", "Laporan Penjualan menampilkan pendapatan dan kanal pembayaran. Owner juga dapat membuka estimasi Laba Rugi."],
    ["04", "Amankan data", "Gunakan Backup Data untuk mengunduh salinan JSON sebelum membersihkan browser atau berpindah perangkat."]
  ];
  $("#page-root").innerHTML = `<section class="help-hero"><span class="eyebrow">PUSAT BANTUAN</span><h2>Apa yang ingin Anda pelajari?</h2><div class="help-search"><span>⌕</span><input type="search" placeholder="Cari panduan..." oninput="filterHelp(this.value)" aria-label="Cari panduan"></div></section>
  <section class="help-grid">${guides.map((guide) => `<article class="card help-card" data-search="${escapeHtml(`${guide[1]} ${guide[2]}`.toLowerCase())}"><span>${guide[0]}</span><h3>${guide[1]}</h3><p>${guide[2]}</p></article>`).join("")}</section>
  <section class="card faq-card"><div class="card-head"><div><span class="card-kicker">PERTANYAAN UMUM</span><h2>Jawaban cepat</h2></div></div>
  ${[["Di mana data disimpan?", "Pada prototipe ini, data disimpan di localStorage browser. schema.sql disiapkan sebagai acuan saat aplikasi dihubungkan ke MySQL."], ["Mengapa menu saya berbeda?", "Menu mengikuti role akun. Owner memiliki akses penuh, manajer mengelola operasional, dan karyawan fokus pada kasir serta pelanggan."], ["Bagaimana mengembalikan data awal?", "Masuk sebagai owner, buka Backup Data, lalu gunakan Reset Data Demo. Buat backup terlebih dahulu bila perubahan masih diperlukan."]].map((item, index) => `<details ${index === 0 ? "open" : ""}><summary>${item[0]}<span>＋</span></summary><p>${item[1]}</p></details>`).join("")}</section>`;
}

function filterHelp(value) {
  const keyword = value.trim().toLowerCase();
  $$(".help-card").forEach((item) => item.hidden = !item.dataset.search.includes(keyword));
}

function emptyState(icon, message) {
  return `<div class="empty-state"><span>${icon}</span><p>${escapeHtml(message)}</p></div>`;
}

seedAll();

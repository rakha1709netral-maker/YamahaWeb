// ============================================================
// NUSA MOTORS — website publik & area member
// ============================================================

let publicCatalogType = "Semua";
let publicCatalogBrand = "Semua";
let publicCatalogSearch = "";
let publicCatalogMaxPrice = 1000000000;

const p$ = (selector, root = document) => root.querySelector(selector);
const p$$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const pEsc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const pRupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const memberSession = () => readStore("nusa_member_session", null);

function favoriteIdsFor(memberId = memberSession()?.id) {
  if (!memberId) return [];
  return readStore("nusa_favorit", []).flatMap((row) => {
    if (typeof row === "number") return memberId === 1 ? [row] : [];
    return Number(row.pelanggan_id) === Number(memberId) ? [Number(row.kendaraan_id)] : [];
  });
}

function memberReturnUrl() {
  const requested = new URLSearchParams(location.search).get("return");
  return requested && !requested.startsWith("//") && !requested.includes("://") ? requested : "member.html";
}

function bootPublic(page) {
  seedAll();
  renderPublicHeader(page);
  renderPublicFooter();
  const renderers = { home: renderPublicHome, catalog: renderPublicCatalog, vehicle: renderVehicleDetail, credit: renderCreditCalculator, promo: renderPublicPromos, "member-login": renderMemberAuth, member: renderMemberDashboard };
  (renderers[page] || renderPublicHome)();
}

function renderPublicHeader(active) {
  const member = memberSession();
  p$("#public-header").innerHTML = `<div class="public-nav-wrap"><a class="public-brand" href="index.html"><span>NM</span><div><strong>${APP.name}</strong><small>${APP.tagline}</small></div></a><button class="public-menu-toggle" onclick="togglePublicMenu()" aria-label="Buka menu">☰</button><nav class="public-nav" id="public-nav" aria-label="Navigasi website"><a class="${active === "home" ? "active" : ""}" href="index.html">Beranda</a><a class="${active === "catalog" || active === "vehicle" ? "active" : ""}" href="catalog.html">Stok Kendaraan</a><a class="${active === "promo" ? "active" : ""}" href="promo.html">Promo</a><a class="${active === "credit" ? "active" : ""}" href="credit.html">Simulasi Kredit</a></nav><div class="public-nav-actions"><a class="staff-link" href="staff-login.html">Portal Staff</a><a class="member-button" href="${member ? "member.html" : "member-login.html"}">${member ? `Hai, ${pEsc(member.nama.split(" ")[0])}` : "Masuk Member"}<span>→</span></a></div></div>`;
}

function renderPublicFooter() {
  const settings = readStore("nusa_pengaturan", SETTINGS_SEED);
  p$("#public-footer").innerHTML = `<div class="footer-main"><div><a class="public-brand light" href="index.html"><span>NM</span><div><strong>${APP.name}</strong><small>${APP.tagline}</small></div></a><p>Showroom motor dan mobil pilihan dengan informasi stok transparan, promo terhubung, dan layanan konsultasi personal.</p></div><div><b>Jelajahi</b><a href="catalog.html">Stok kendaraan</a><a href="promo.html">Program promo</a><a href="credit.html">Simulasi kredit</a></div><div><b>Layanan</b><a href="member-login.html">Member Nusa</a><a href="catalog.html">Jadwalkan test drive</a><a href="staff-login.html">Portal staff</a></div><div><b>Showroom</b><span>${pEsc(settings.alamat)}</span><span>${pEsc(settings.telepon)}</span><span>${pEsc(settings.email)}</span></div></div><div class="footer-bottom"><span>© 2026 ${APP.name}. Semua harga dapat berubah sesuai kebijakan dealer.</span><span>Motor • Mobil • Trade-in • Pembiayaan</span></div>`;
}

function togglePublicMenu() { p$("#public-nav").classList.toggle("open"); }

function publicMedia(vehicle, className = "") {
  if (vehicle.thumbnail) return `<img class="public-vehicle-image ${className}" src="${pEsc(vehicle.thumbnail)}" alt="${pEsc(vehicle.nama)}">`;
  return `<div class="public-vehicle-placeholder ${className}" role="img" aria-label="Foto ${pEsc(vehicle.nama)} belum tersedia"><span>${pEsc(vehicle.jenis)} · ${vehicle.tahun}</span><strong>NM</strong><small>Foto segera hadir</small></div>`;
}

function renderPublicHome() {
  const vehicles = readStore("nusa_kendaraan", []);
  const available = vehicles.filter((vehicle) => vehicle.status === "Tersedia" && vehicle.stok > 0);
  const featured = available.filter((vehicle) => vehicle.unggulan).slice(0, 3);
  p$("#public-root").innerHTML = `<section class="auto-hero"><div class="auto-hero-copy"><span class="hero-kicker">MOTOR & MOBIL PILIHAN</span><h1>Kendaraan yang tepat untuk langkah berikutnya.</h1><p>Bandingkan unit, lihat harga promo, hitung cicilan, dan jadwalkan test drive tanpa perlu login.</p><div class="hero-actions"><a class="auto-btn primary" href="catalog.html">Lihat stok tersedia <span>→</span></a><a class="auto-btn ghost" href="credit.html">Hitung cicilan</a></div><div class="hero-trust"><span><b>${available.reduce((sum, item) => sum + item.stok, 0)}+</b> unit tersedia</span><span><b>${new Set(available.map((item) => item.merek)).size}</b> merek pilihan</span><span><b>7 hari</b> dukungan sales</span></div></div><div class="hero-display"><div class="hero-display-top"><span>SHOWROOM UPDATE</span><b>11.09.2026</b></div><div class="hero-type-word">DRIVE</div><div class="hero-unit-card"><span>Unit unggulan</span><strong>${pEsc(featured[0]?.nama || "Kendaraan pilihan")}</strong><small>${featured[0] ? `${pRupiah(vehicleDisplayPrice(featured[0]).final)} · ${featured[0].stok} unit` : "Segera hadir"}</small></div><div class="hero-lines"><i></i><i></i><i></i></div></div></section>
  <section class="public-section quick-explore"><div class="section-heading"><div><span>JELAJAHI STOK</span><h2>Pilih gaya berkendara Anda.</h2></div><a href="catalog.html">Lihat semua kendaraan →</a></div><div class="type-panels"><a href="catalog.html?type=Motor" class="type-panel motor"><div><small>RODA DUA</small><h3>Motor</h3><p>Skutik, sport, dan commuter untuk setiap karakter perjalanan.</p></div><b>${available.filter((item) => item.jenis === "Motor").length} model</b></a><a href="catalog.html?type=Mobil" class="type-panel car"><div><small>RODA EMPAT</small><h3>Mobil</h3><p>SUV, MPV, dan hybrid untuk keluarga maupun aktivitas bisnis.</p></div><b>${available.filter((item) => item.jenis === "Mobil").length} model</b></a></div></section>
  <section class="public-section featured-stock"><div class="section-heading"><div><span>REKOMENDASI SHOWROOM</span><h2>Unit unggulan minggu ini.</h2></div><p>Harga promo dihitung otomatis dari program yang sedang aktif.</p></div><div class="public-vehicle-grid">${featured.map(publicVehicleCard).join("")}</div></section>
  <section class="public-section service-band"><div><span>01</span><b>Harga transparan</b><p>Harga normal, potongan promo, dan estimasi cicilan ditampilkan jelas.</p></div><div><span>02</span><b>Test drive fleksibel</b><p>Pilih kendaraan dan ajukan jadwal langsung dari halaman detail.</p></div><div><span>03</span><b>Benefit member</b><p>Kumpulkan poin dari pembelian dan akses promo sesuai tier.</p></div><div><span>04</span><b>Konsultasi sales</b><p>Setiap permintaan masuk ke tim showroom untuk ditindaklanjuti.</p></div></section>
  <section class="public-section member-cta"><div><span class="hero-kicker">MEMBER NUSA</span><h2>Setiap perjalanan memberi Anda nilai lebih.</h2><p>Masuk hanya saat ingin mengecek poin, histori pembelian, kendaraan favorit, dan promo khusus member.</p></div><a class="auto-btn light" href="member-login.html">Buka area member →</a></section>`;
}

function publicVehicleCard(vehicle) {
  const price = vehicleDisplayPrice(vehicle, memberSession());
  const favorites = favoriteIdsFor();
  return `<article class="public-vehicle-card"><div class="public-card-media">${publicMedia(vehicle)}<button class="favorite-button ${favorites.includes(vehicle.id) ? "active" : ""}" onclick="event.preventDefault();toggleFavorite(${vehicle.id})" aria-label="Simpan kendaraan">♡</button><span class="availability ${vehicle.stok ? "" : "sold"}">${vehicle.stok ? `${vehicle.stok} unit` : "Terjual"}</span></div><div class="public-card-copy"><div class="vehicle-tags"><span>${pEsc(vehicle.jenis)}</span><span>${pEsc(vehicle.kondisi)}</span>${price.promo ? `<b>-${price.promo.persen}%</b>` : ""}</div><h3><a href="vehicle.html?id=${vehicle.id}">${pEsc(vehicle.nama)}</a></h3><p>${vehicle.tahun} · ${pEsc(vehicle.transmisi)} · ${pEsc(vehicle.bahan_bakar)}</p><div class="public-card-price">${price.discount ? `<small>${pRupiah(price.original)}</small>` : ""}<strong>${pRupiah(price.final)}</strong>${price.promo ? `<span>${pEsc(price.promo.nama)}</span>` : ""}</div><a class="card-detail-link" href="vehicle.html?id=${vehicle.id}">Lihat detail <span>→</span></a></div></article>`;
}

function renderPublicCatalog() {
  const params = new URLSearchParams(location.search);
  if (params.get("type")) publicCatalogType = params.get("type");
  const vehicles = readStore("nusa_kendaraan", []).filter((vehicle) => vehicle.status !== "Nonaktif");
  const brands = ["Semua", ...new Set(vehicles.map((vehicle) => vehicle.merek))];
  const visible = vehicles.filter((vehicle) => (publicCatalogType === "Semua" || vehicle.jenis === publicCatalogType) && (publicCatalogBrand === "Semua" || vehicle.merek === publicCatalogBrand) && vehicle.nama.toLowerCase().includes(publicCatalogSearch.toLowerCase()) && Number(vehicle.harga) <= publicCatalogMaxPrice);
  p$("#public-root").innerHTML = `<section class="catalog-title"><div><span>SHOWROOM ONLINE</span><h1>Temukan kendaraan yang cocok.</h1><p>Filter motor dan mobil berdasarkan jenis, merek, atau kisaran harga.</p></div><div class="catalog-count"><b>${visible.length}</b><span>model ditemukan</span></div></section><section class="catalog-workspace"><aside class="catalog-filters"><div class="filter-mobile-head"><b>Filter kendaraan</b><button onclick="this.closest('.catalog-filters').classList.toggle('open')">Atur filter</button></div><div class="filter-content"><label class="public-search"><span>⌕</span><input value="${pEsc(publicCatalogSearch)}" placeholder="Cari model..." oninput="setCatalogSearch(this.value)"></label><div class="filter-group"><b>Jenis kendaraan</b>${["Semua", "Motor", "Mobil"].map((type) => `<button class="${publicCatalogType === type ? "active" : ""}" onclick="setCatalogType('${type}')"><span>${type}</span><i>${type === "Semua" ? vehicles.length : vehicles.filter((v) => v.jenis === type).length}</i></button>`).join("")}</div><div class="filter-group"><b>Merek</b><select onchange="setCatalogBrand(this.value)">${brands.map((brand) => `<option ${brand === publicCatalogBrand ? "selected" : ""}>${pEsc(brand)}</option>`).join("")}</select></div><div class="filter-group price-filter"><b>Harga maksimal</b><strong>${pRupiah(publicCatalogMaxPrice)}</strong><input type="range" min="50000000" max="1000000000" step="25000000" value="${publicCatalogMaxPrice}" oninput="setCatalogPrice(this.value)"></div><button class="reset-filter" onclick="resetCatalogFilter()">Reset semua filter</button></div></aside><div class="catalog-results">${visible.length ? `<div class="public-vehicle-grid">${visible.map(publicVehicleCard).join("")}</div>` : `<div class="public-empty"><b>Belum ada kendaraan yang cocok.</b><p>Coba ubah jenis, merek, atau batas harga.</p><button onclick="resetCatalogFilter()">Reset filter</button></div>`}</div></section>`;
}

function setCatalogType(value) { publicCatalogType = value; renderPublicCatalog(); }
function setCatalogBrand(value) { publicCatalogBrand = value; renderPublicCatalog(); }
function setCatalogSearch(value) { publicCatalogSearch = value; renderPublicCatalog(); p$(".public-search input")?.focus(); }
function setCatalogPrice(value) { publicCatalogMaxPrice = Number(value); renderPublicCatalog(); }
function resetCatalogFilter() { publicCatalogType = "Semua"; publicCatalogBrand = "Semua"; publicCatalogSearch = ""; publicCatalogMaxPrice = 1000000000; history.replaceState({}, "", "catalog.html"); renderPublicCatalog(); }

function renderVehicleDetail() {
  const id = Number(new URLSearchParams(location.search).get("id"));
  const vehicle = readStore("nusa_kendaraan", []).find((item) => item.id === id);
  if (!vehicle) { p$("#public-root").innerHTML = `<div class="public-not-found"><span>404</span><h1>Kendaraan tidak ditemukan.</h1><a href="catalog.html">Kembali ke katalog</a></div>`; return; }
  document.title = `${vehicle.nama} · ${APP.name}`;
  const price = vehicleDisplayPrice(vehicle, memberSession());
  p$("#public-root").innerHTML = `<div class="detail-breadcrumb"><a href="index.html">Beranda</a><span>/</span><a href="catalog.html">Stok Kendaraan</a><span>/</span><b>${pEsc(vehicle.nama)}</b></div><section class="vehicle-detail"><div class="detail-media">${publicMedia(vehicle, "detail-image")}<div class="detail-media-caption"><span>${pEsc(vehicle.kode)}</span><span>${vehicle.stok ? `${vehicle.stok} unit tersedia` : "Stok habis"}</span></div></div><div class="detail-copy"><div class="vehicle-tags"><span>${pEsc(vehicle.jenis)}</span><span>${pEsc(vehicle.kondisi)}</span><span>${vehicle.tahun}</span></div><h1>${pEsc(vehicle.nama)}</h1><p class="detail-description">${pEsc(vehicle.deskripsi)}</p><div class="detail-price">${price.discount ? `<small>${pRupiah(price.original)}</small>` : ""}<strong>${pRupiah(price.final)}</strong>${price.promo ? `<span>Hemat ${pRupiah(price.discount)} · ${pEsc(price.promo.nama)}</span>` : `<span>Harga OTR estimasi</span>`}</div><div class="detail-actions"><button class="auto-btn primary" onclick="openLeadModal(${vehicle.id},'Test Drive')">Jadwalkan test drive</button><a class="auto-btn ghost dark" href="credit.html?id=${vehicle.id}">Simulasi kredit</a></div><button class="save-detail" onclick="toggleFavorite(${vehicle.id})">♡ Simpan ke favorit member</button></div></section><section class="public-section spec-section"><div class="section-heading"><div><span>SPESIFIKASI UTAMA</span><h2>Informasi kendaraan.</h2></div></div><div class="spec-grid">${[["Merek", vehicle.merek], ["Model", vehicle.model], ["Tahun", vehicle.tahun], ["Warna", vehicle.warna], ["Transmisi", vehicle.transmisi], ["Bahan bakar", vehicle.bahan_bakar], ["Mesin", vehicle.kapasitas_mesin], ["Kondisi", vehicle.kondisi]].map((spec) => `<div><span>${spec[0]}</span><b>${pEsc(spec[1])}</b></div>`).join("")}</div></section><section class="public-section consultation-band"><div><span>MASIH MEMBANDINGKAN?</span><h2>Minta penawaran personal dari sales kami.</h2></div><button class="auto-btn light" onclick="openLeadModal(${vehicle.id},'Penawaran')">Minta penawaran →</button></section>`;
}

function openLeadModal(vehicleId, type) {
  const vehicle = readStore("nusa_kendaraan", []).find((item) => item.id === vehicleId); const member = memberSession();
  document.body.insertAdjacentHTML("beforeend", `<div class="public-modal-overlay" id="public-modal" onclick="if(event.target===this)this.remove()"><section class="public-modal"><button class="modal-x" onclick="p$('#public-modal').remove()">×</button><span class="hero-kicker">${pEsc(type.toUpperCase())}</span><h2>${pEsc(vehicle.nama)}</h2><p>Tim showroom akan menghubungi Anda untuk konfirmasi.</p><form onsubmit="event.preventDefault();submitLead(${vehicle.id},'${pEsc(type)}')"><label>Nama lengkap<input id="lead-name" value="${pEsc(member?.nama || "")}" required></label><div class="lead-form-row"><label>No. telepon<input id="lead-phone" value="${pEsc(member?.telepon || "")}" required></label><label>Email<input id="lead-email" type="email" value="${pEsc(member?.email || "")}"></label></div>${type === "Test Drive" ? `<label>Tanggal yang diinginkan<input id="lead-date" type="date" min="${new Date().toISOString().slice(0, 10)}" required></label>` : ""}<label>Catatan<textarea id="lead-note" rows="3" placeholder="Waktu yang mudah dihubungi atau kebutuhan lain..."></textarea></label><button class="auto-btn primary" type="submit">Kirim permintaan →</button></form></section></div>`);
}

function submitLead(vehicleId, type) {
  const vehicle = readStore("nusa_kendaraan", []).find((item) => item.id === vehicleId); const leads = readStore("nusa_leads", []);
  leads.push({ id: leads.length ? Math.max(...leads.map((item) => Number(item.id))) + 1 : 1, tanggal: p$("#lead-date")?.value || new Date().toISOString().slice(0, 10), nama: p$("#lead-name").value.trim(), telepon: p$("#lead-phone").value.trim(), email: p$("#lead-email").value.trim(), kendaraan: vehicle.nama, kendaraan_id: vehicle.id, tipe: type, status: "Baru", catatan: p$("#lead-note").value.trim() });
  writeStore("nusa_leads", leads); p$("#public-modal").remove(); publicToast("Permintaan berhasil dikirim. Tim kami akan segera menghubungi Anda.");
}

function renderCreditCalculator() {
  const vehicles = readStore("nusa_kendaraan", []).filter((item) => item.status === "Tersedia");
  const selectedId = Number(new URLSearchParams(location.search).get("id")) || vehicles[0]?.id;
  p$("#public-root").innerHTML = `<section class="credit-hero"><span>SIMULASI PEMBIAYAAN</span><h1>Rencanakan cicilan dengan lebih tenang.</h1><p>Hasil ini merupakan estimasi awal dan bukan persetujuan pembiayaan.</p></section><section class="credit-workspace"><form class="credit-form" onsubmit="event.preventDefault();calculateCredit()"><div><span>01</span><label>Pilih kendaraan<select id="credit-vehicle" onchange="calculateCredit()">${vehicles.map((vehicle) => `<option value="${vehicle.id}" ${vehicle.id === selectedId ? "selected" : ""}>${pEsc(vehicle.nama)} — ${pRupiah(vehicleDisplayPrice(vehicle).final)}</option>`).join("")}</select></label></div><div><span>02</span><label>Uang muka <b id="dp-label">20%</b><input id="credit-dp" type="range" min="10" max="60" step="5" value="20" oninput="calculateCredit()"></label></div><div><span>03</span><label>Tenor<select id="credit-tenor" onchange="calculateCredit()"><option value="12">12 bulan</option><option value="24">24 bulan</option><option value="36" selected>36 bulan</option><option value="48">48 bulan</option><option value="60">60 bulan</option></select></label></div><div><span>04</span><label>Estimasi bunga / tahun<input id="credit-rate" type="number" value="6.5" min="0" max="30" step="0.1" oninput="calculateCredit()"></label></div></form><aside class="credit-result" id="credit-result"></aside></section>`;
  calculateCredit();
}

function calculateCredit() {
  const vehicle = readStore("nusa_kendaraan", []).find((item) => item.id === Number(p$("#credit-vehicle").value)); const price = vehicleDisplayPrice(vehicle).final; const dpPercent = Number(p$("#credit-dp").value); const months = Number(p$("#credit-tenor").value); const annualRate = Number(p$("#credit-rate").value) / 100; const dp = Math.round(price * dpPercent / 100); const principal = price - dp; const totalInterest = Math.round(principal * annualRate * (months / 12)); const installment = Math.round((principal + totalInterest) / months); p$("#dp-label").textContent = `${dpPercent}%`;
  p$("#credit-result").innerHTML = `<span>ESTIMASI CICILAN</span><h2>${pRupiah(installment)}<small>/bulan</small></h2><div><p><span>Harga promo kendaraan</span><b>${pRupiah(price)}</b></p><p><span>Uang muka (${dpPercent}%)</span><b>${pRupiah(dp)}</b></p><p><span>Pokok pembiayaan</span><b>${pRupiah(principal)}</b></p><p><span>Estimasi total bunga</span><b>${pRupiah(totalInterest)}</b></p></div><button class="auto-btn light" onclick="openLeadModal(${vehicle.id},'Konsultasi Kredit')">Konsultasi dengan sales →</button><small class="credit-disclaimer">Belum termasuk biaya administrasi, asuransi, dan ketentuan perusahaan pembiayaan.</small>`;
}

function renderPublicPromos() {
  const promos = getActiveDiscounts(); const vehicles = readStore("nusa_kendaraan", []);
  p$("#public-root").innerHTML = `<section class="promo-public-hero"><div><span>PROMO NUSA MOTORS</span><h1>Lebih dekat dengan kendaraan pilihan.</h1><p>Promo otomatis sudah tercermin pada harga katalog. Promo berkode dapat digunakan saat transaksi di showroom.</p></div><b>${promos.length}<small>promo aktif</small></b></section><section class="public-section public-promos"><div class="promo-public-grid">${promos.map((promo, index) => { const target = promo.cakupan === "Produk" ? vehicles.filter((v) => (promo.target_ids || []).includes(v.id)).map((v) => v.nama).join(", ") : promo.cakupan === "Semua" ? "Semua kendaraan" : `${promo.cakupan}: ${promo.target_nilai}`; return `<article class="public-promo-card tone-${index % 3}"><div><span>HEMAT</span><strong>${promo.persen}%</strong><small>Maks. ${pRupiah(promo.maksimal_diskon)}</small></div><section><div>${promo.kode ? `<code>${pEsc(promo.kode)}</code>` : `<b>OTOMATIS</b>`}<span>s.d. ${new Date(`${promo.selesai}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span></div><h2>${pEsc(promo.nama)}</h2><p>Berlaku untuk ${pEsc(target)}. Minimal transaksi ${pRupiah(promo.minimal_transaksi)}.</p><a href="catalog.html">Lihat kendaraan →</a></section></article>`; }).join("")}</div></section>`;
}

function renderMemberAuth(tab = "login") {
  if (memberSession()) { location.href = "member.html"; return; }
  p$("#public-root").innerHTML = `<section class="member-auth-layout"><div class="member-auth-story"><span>MEMBER NUSA</span><h1>Benefit yang ikut bertumbuh bersama perjalanan Anda.</h1><p>Akun member hanya diperlukan untuk melihat poin, histori pembelian, favorit, dan promo tier. Katalog tetap bebas diakses siapa pun.</p><div><b>1 poin</b><span>setiap Rp100.000 transaksi</span></div><div><b>4 tier</b><span>Bronze hingga Platinum</span></div></div><div class="member-auth-card"><div class="auth-tabs"><button class="${tab === "login" ? "active" : ""}" onclick="renderMemberAuth('login')">Masuk</button><button class="${tab === "register" ? "active" : ""}" onclick="renderMemberAuth('register')">Daftar</button></div>${tab === "login" ? memberLoginForm() : memberRegisterForm()}</div></section>`;
}

function memberLoginForm() { return `<form onsubmit="event.preventDefault();loginMember()"><span class="auth-label">AKUN MEMBER</span><h2>Selamat datang kembali.</h2><p>Gunakan email yang terdaftar sebagai member.</p><label>Email<input id="member-email" type="email" placeholder="nama@email.com" required></label><label>Password<input id="member-password" type="password" placeholder="••••••••" required></label><button class="auto-btn primary">Masuk ke akun →</button><div class="member-demo"><b>Akun demo</b><span>dewi@mail.com / member123</span></div></form>`; }
function memberRegisterForm() { return `<form onsubmit="event.preventDefault();registerMember()"><span class="auth-label">MEMBER BARU</span><h2>Mulai kumpulkan poin.</h2><p>Pendaftaran tidak membatasi akses Anda ke katalog.</p><label>Nama lengkap<input id="reg-name" required></label><div class="lead-form-row"><label>Email<input id="reg-email" type="email" required></label><label>No. telepon<input id="reg-phone" required></label></div><label>Password<input id="reg-password" type="password" minlength="6" required></label><button class="auto-btn primary">Daftar member →</button></form>`; }

function loginMember() { const email = p$("#member-email").value.trim().toLowerCase(); const password = p$("#member-password").value; const member = readStore("nusa_pelanggan", []).find((item) => item.email.toLowerCase() === email && item.password === password && item.status === "Aktif"); if (!member) { publicToast("Email atau password member tidak sesuai.", "error"); return; } writeStore("nusa_member_session", { id: member.id, nama: member.nama, email: member.email, telepon: member.telepon, tier: member.tier }); location.href = memberReturnUrl(); }
function registerMember() { const members = readStore("nusa_pelanggan", []); const email = p$("#reg-email").value.trim().toLowerCase(); if (members.some((item) => item.email.toLowerCase() === email)) { publicToast("Email sudah terdaftar.", "error"); return; } const member = { id: members.length ? Math.max(...members.map((item) => item.id)) + 1 : 1, nama: p$("#reg-name").value.trim(), telepon: p$("#reg-phone").value.trim(), email, password: p$("#reg-password").value, alamat: "", tier: "Bronze", poin: 0, status: "Aktif", bergabung: new Date().toISOString().slice(0, 10) }; members.push(member); writeStore("nusa_pelanggan", members); writeStore("nusa_member_session", { id: member.id, nama: member.nama, email: member.email, telepon: member.telepon, tier: member.tier }); location.href = memberReturnUrl(); }

function renderMemberDashboard() {
  const session = memberSession(); if (!session) { location.href = "member-login.html"; return; }
  const member = readStore("nusa_pelanggan", []).find((item) => item.id === session.id); if (!member) { memberLogout(); return; }
  const tiers = [{ name: "Bronze", min: 0 }, { name: "Silver", min: 1500 }, { name: "Gold", min: 4000 }, { name: "Platinum", min: 8000 }]; const index = tiers.findIndex((tier) => tier.name === member.tier); const next = tiers[index + 1]; const progress = next ? Math.min(100, Math.round((member.poin - tiers[index].min) / (next.min - tiers[index].min) * 100)) : 100; const transactions = readStore("nusa_transaksi", []).filter((item) => item.pelanggan_id === member.id); const favorites = favoriteIdsFor(member.id); const vehicles = readStore("nusa_kendaraan", []).filter((vehicle) => favorites.includes(vehicle.id));
  p$("#public-root").innerHTML = `<section class="member-dashboard-head"><div><span>MEMBER DASHBOARD</span><h1>Halo, ${pEsc(member.nama.split(" ")[0])}.</h1><p>Ringkasan benefit dan aktivitas Anda bersama ${APP.name}.</p></div><button onclick="memberLogout()">Keluar</button></section><section class="member-summary-grid"><article class="points-card"><span>POIN TERSEDIA</span><strong>${Number(member.poin).toLocaleString("id-ID")}</strong><p>Dapat digunakan pada program promo member yang berlaku.</p><div class="tier-progress"><div><b>${member.tier}</b><span>${next ? `${next.min - member.poin} poin menuju ${next.name}` : "Tier tertinggi"}</span></div><i><b style="width:${progress}%"></b></i></div></article><article class="member-stat"><span>Tier member</span><strong>${member.tier}</strong><p>Sejak ${new Date(`${member.bergabung}T00:00:00`).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p></article><article class="member-stat"><span>Total pembelian</span><strong>${transactions.length}</strong><p>${pRupiah(transactions.reduce((sum, item) => sum + Number(item.total), 0))}</p></article><article class="member-stat"><span>Kendaraan favorit</span><strong>${favorites.length}</strong><p>Tersimpan di akun Anda</p></article></section><section class="member-dashboard-grid"><article><div class="member-section-head"><div><span>HISTORI PEMBELIAN</span><h2>Transaksi terakhir</h2></div></div>${transactions.length ? `<div class="member-transactions">${transactions.slice().reverse().map((item) => `<div><span><b>${pEsc(item.kode)}</b><small>${pEsc(item.kasir)} · ${item.metode}</small></span><span><b>${pRupiah(item.total)}</b><small>+${item.poin_didapat} poin</small></span></div>`).join("")}</div>` : `<div class="member-empty">Belum ada transaksi yang terhubung ke akun ini.</div>`}</article><article><div class="member-section-head"><div><span>FAVORIT</span><h2>Kendaraan tersimpan</h2></div><a href="catalog.html">Cari kendaraan</a></div>${vehicles.length ? `<div class="member-favorites">${vehicles.map((vehicle) => `<a href="vehicle.html?id=${vehicle.id}">${publicMedia(vehicle, "favorite-thumb")}<span><b>${pEsc(vehicle.nama)}</b><small>${pRupiah(vehicleDisplayPrice(vehicle, member).final)}</small></span></a>`).join("")}</div>` : `<div class="member-empty">Belum ada kendaraan favorit.</div>`}</article></section>`;
}

function memberLogout() { localStorage.removeItem("nusa_member_session"); location.href = "index.html"; }

function toggleFavorite(vehicleId) {
  const member = memberSession(); if (!member) { location.href = `member-login.html?return=${encodeURIComponent(location.pathname + location.search)}`; return; }
  const rows = readStore("nusa_favorit", []).filter((row) => typeof row !== "number");
  const index = rows.findIndex((row) => Number(row.pelanggan_id) === Number(member.id) && Number(row.kendaraan_id) === Number(vehicleId));
  if (index >= 0) rows.splice(index, 1); else rows.push({ pelanggan_id: member.id, kendaraan_id: vehicleId });
  writeStore("nusa_favorit", rows); publicToast(index >= 0 ? "Kendaraan dihapus dari favorit." : "Kendaraan disimpan ke favorit.");
  if (document.body.dataset.publicPage === "catalog") renderPublicCatalog();
  if (document.body.dataset.publicPage === "member") renderMemberDashboard();
}

function publicToast(message, tone = "success") {
  const region = p$("#public-toast"); const item = document.createElement("div"); item.className = `public-toast ${tone}`; item.textContent = message; region.appendChild(item); requestAnimationFrame(() => item.classList.add("show")); setTimeout(() => { item.classList.remove("show"); setTimeout(() => item.remove(), 200); }, 3200);
}

seedAll();

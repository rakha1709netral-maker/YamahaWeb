// ============================================================
// NUSA MOTORS — data demo dealer motor & mobil
// Struktur ini mengikuti schema.sql dan memakai localStorage untuk prototipe lokal.
// ============================================================

const APP = {
  name: "Nusa Motors",
  shortName: "NM",
  tagline: "Motor & Mobil Pilihan",
  phone: "021-555-0199",
  whatsapp: "628125550199"
};

const SEED_USERS = [];

const ROLE_COLORS = { owner: "#ef3d23", manajer: "#2563eb", karyawan: "#0f9f72" };
const ROLE_LABEL = { owner: "Owner", manajer: "Manajer", karyawan: "Sales" };

const VEHICLE_SEEDS = [
  {
    id: 1, kode: "MTR-001", nama: "Yamaha NMAX Turbo Tech Max", jenis: "Motor", merek: "Yamaha", model: "NMAX",
    tahun: 2026, harga: 45550000, stok: 8, warna: "Magma Black", transmisi: "CVT", bahan_bakar: "Bensin",
    kapasitas_mesin: "155 cc", kondisi: "Baru", supplier: "Yamaha Indonesia", status: "Tersedia", unggulan: true,
    thumbnail: "", deskripsi: "Skutik premium untuk mobilitas harian dan perjalanan jauh dengan posisi berkendara nyaman serta fitur konektivitas modern."
  },
  {
    id: 2, kode: "MTR-002", nama: "Honda PCX 160 RoadSync", jenis: "Motor", merek: "Honda", model: "PCX",
    tahun: 2026, harga: 40750000, stok: 6, warna: "RoadSync Red", transmisi: "CVT", bahan_bakar: "Bensin",
    kapasitas_mesin: "160 cc", kondisi: "Baru", supplier: "Honda Prospect", status: "Tersedia", unggulan: true,
    thumbnail: "", deskripsi: "Skutik elegan dengan kabin lapang, karakter mesin halus, dan teknologi pendukung perjalanan urban."
  },
  {
    id: 3, kode: "MBL-001", nama: "Toyota Yaris Cross Hybrid", jenis: "Mobil", merek: "Toyota", model: "Yaris Cross",
    tahun: 2026, harga: 454950000, stok: 3, warna: "Platinum White Pearl", transmisi: "e-CVT", bahan_bakar: "Hybrid",
    kapasitas_mesin: "1.500 cc", kondisi: "Baru", supplier: "Toyota Astra Motor", status: "Tersedia", unggulan: true,
    thumbnail: "", deskripsi: "SUV kompak hybrid dengan efisiensi tinggi, kabin fleksibel, dan fitur keselamatan untuk keluarga modern."
  },
  {
    id: 4, kode: "MBL-002", nama: "Honda BR-V Prestige", jenis: "Mobil", merek: "Honda", model: "BR-V",
    tahun: 2025, harga: 373400000, stok: 2, warna: "Crystal Black Pearl", transmisi: "CVT", bahan_bakar: "Bensin",
    kapasitas_mesin: "1.500 cc", kondisi: "Baru", supplier: "Honda Prospect", status: "Tersedia", unggulan: false,
    thumbnail: "", deskripsi: "Low SUV tujuh penumpang dengan ruang kabin praktis dan karakter berkendara yang ringan."
  },
  {
    id: 5, kode: "MTR-003", nama: "Kawasaki Ninja ZX-25R SE", jenis: "Motor", merek: "Kawasaki", model: "Ninja ZX-25R",
    tahun: 2025, harga: 129900000, stok: 1, warna: "Lime Green", transmisi: "Manual 6-speed", bahan_bakar: "Bensin",
    kapasitas_mesin: "250 cc", kondisi: "Baru", supplier: "Kawasaki Motor Indonesia", status: "Tersedia", unggulan: false,
    thumbnail: "", deskripsi: "Sport bike empat silinder untuk pengendara yang mencari performa, presisi, dan karakter mesin khas."
  },
  {
    id: 6, kode: "MBL-003", nama: "Suzuki Jimny 5-Door", jenis: "Mobil", merek: "Suzuki", model: "Jimny",
    tahun: 2025, harga: 503900000, stok: 0, warna: "Jungle Green", transmisi: "Automatic", bahan_bakar: "Bensin",
    kapasitas_mesin: "1.500 cc", kondisi: "Baru", supplier: "Suzuki Indomobil", status: "Terjual", unggulan: false,
    thumbnail: "", deskripsi: "SUV kompak berkarakter kuat dengan sistem penggerak yang siap menemani perjalanan di berbagai medan."
  }
];

const CUSTOMER_SEEDS = [];

const DISCOUNT_SEEDS = [
  { id: 1, nama: "Drive Home September", kode: "", persen: 5, cakupan: "Produk", target_ids: [1, 3], target_nilai: "", minimal_transaksi: 0, maksimal_diskon: 8000000, mulai: "2026-09-01", selesai: "2026-09-30", status: "Aktif" },
  { id: 2, nama: "Promo Motor Pilihan", kode: "MOTORHEMAT", persen: 3, cakupan: "Jenis", target_ids: [], target_nilai: "Motor", minimal_transaksi: 30000000, maksimal_diskon: 2500000, mulai: "2026-01-01", selesai: "2026-12-31", status: "Aktif" },
  { id: 3, nama: "Privilege Member Gold", kode: "GOLDPLUS", persen: 2, cakupan: "Member", target_ids: [], target_nilai: "Gold", minimal_transaksi: 0, maksimal_diskon: 5000000, mulai: "2026-01-01", selesai: "2026-12-31", status: "Aktif" }
];

const ENTITIES = {
  kendaraan: {
    title: "Inventori Kendaraan", storage: "nusa_kendaraan", icon: "◆",
    description: "Kelola unit motor dan mobil, spesifikasi, harga, serta thumbnail katalog.",
    columns: ["thumbnail", "kode", "nama", "jenis", "tahun", "harga", "stok", "status"],
    labels: { thumbnail: "Foto", kode: "Kode", nama: "Kendaraan", jenis: "Jenis", tahun: "Tahun", harga: "Harga", stok: "Unit", status: "Status" },
    seeds: VEHICLE_SEEDS
  },
  kategori: {
    title: "Jenis & Kategori", storage: "nusa_kategori", icon: "◇",
    description: "Atur kelompok kendaraan yang tampil pada showroom.",
    fields: [
      { name: "nama", label: "Nama Kategori", type: "text", required: true },
      { name: "jenis", label: "Jenis", type: "select", options: ["Motor", "Mobil"] },
      { name: "deskripsi", label: "Deskripsi", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] }
    ],
    columns: ["nama", "jenis", "deskripsi", "status"],
    labels: { nama: "Kategori", jenis: "Jenis", deskripsi: "Deskripsi", status: "Status" },
    seeds: [
      { id: 1, nama: "Skutik", jenis: "Motor", deskripsi: "Motor matik untuk mobilitas harian", status: "Aktif" },
      { id: 2, nama: "Sport", jenis: "Motor", deskripsi: "Motor berkarakter performa", status: "Aktif" },
      { id: 3, nama: "SUV", jenis: "Mobil", deskripsi: "Kendaraan serbaguna dengan ground clearance tinggi", status: "Aktif" },
      { id: 4, nama: "MPV", jenis: "Mobil", deskripsi: "Mobil keluarga dengan kabin lapang", status: "Aktif" }
    ]
  },
  pelanggan: {
    title: "Pelanggan & Member", storage: "nusa_pelanggan", icon: "◎",
    description: "Kelola identitas member, tier loyalitas, dan perolehan poin.",
    fields: [
      { name: "nama", label: "Nama Lengkap", type: "text", required: true },
      { name: "telepon", label: "No. Telepon", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password Member", type: "password", required: true },
      { name: "alamat", label: "Kota / Alamat", type: "textarea" },
      { name: "tier", label: "Tier", type: "select", options: ["Bronze", "Silver", "Gold", "Platinum"] },
      { name: "poin", label: "Poin", type: "number", min: 0 },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] }
    ],
    columns: ["nama", "telepon", "email", "tier", "poin", "status"],
    labels: { nama: "Nama", telepon: "Telepon", email: "Email", tier: "Tier", poin: "Poin", status: "Status" },
    seeds: CUSTOMER_SEEDS
  },
  supplier: {
    title: "Mitra Distributor", storage: "nusa_supplier", icon: "△",
    description: "Daftar distributor dan ATPM pemasok unit kendaraan.",
    fields: [
      { name: "nama", label: "Nama Distributor", type: "text", required: true },
      { name: "merek", label: "Merek", type: "text", required: true },
      { name: "telepon", label: "No. Telepon", type: "text" },
      { name: "alamat", label: "Alamat", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] }
    ],
    columns: ["nama", "merek", "telepon", "status"],
    labels: { nama: "Distributor", merek: "Merek", telepon: "Telepon", status: "Status" },
    seeds: [
      { id: 1, nama: "Yamaha Indonesia", merek: "Yamaha", telepon: "021-555-1001", alamat: "Jakarta", status: "Aktif" },
      { id: 2, nama: "Honda Prospect", merek: "Honda", telepon: "021-555-1002", alamat: "Jakarta", status: "Aktif" },
      { id: 3, nama: "Toyota Astra Motor", merek: "Toyota", telepon: "021-555-1003", alamat: "Jakarta", status: "Aktif" },
      { id: 4, nama: "Suzuki Indomobil", merek: "Suzuki", telepon: "021-555-1004", alamat: "Bekasi", status: "Aktif" }
    ]
  },
  transaksi: {
    title: "Penjualan Kendaraan", storage: "nusa_transaksi", icon: "⌁",
    description: "Riwayat transaksi kendaraan, potongan promo, pajak, dan poin member.",
    columns: ["kode", "tanggal", "pelanggan", "kasir", "subtotal", "diskon", "total", "status"],
    labels: { kode: "Kode", tanggal: "Tanggal", pelanggan: "Pelanggan", kasir: "Sales", subtotal: "Subtotal", diskon: "Diskon", total: "Total", status: "Status" },
    seeds: [
      { id: 1, kode: "INV-260901", tanggal: "2026-09-04", pelanggan: "Dewi Anggraini", pelanggan_id: 1, kasir: "Andi Pratama", subtotal: 45550000, diskon: 2277500, pajak: 4763000, total: 48035500, metode: "Transfer", promo: "Drive Home September", poin_didapat: 480, status: "Selesai" },
      { id: 2, kode: "INV-260902", tanggal: "2026-09-08", pelanggan: "Rizky Pratama", pelanggan_id: 2, kasir: "Andi Pratama", subtotal: 373400000, diskon: 0, pajak: 41074000, total: 414474000, metode: "Kredit", promo: "-", poin_didapat: 4144, status: "Selesai" },
      { id: 3, kode: "INV-260903", tanggal: "2026-09-10", pelanggan: "Maya Putri", pelanggan_id: 3, kasir: "Sari Wijaya", subtotal: 129900000, diskon: 0, pajak: 14289000, total: 144189000, metode: "Kartu Kredit", promo: "-", poin_didapat: 0, status: "Pending" }
    ]
  },
  diskon: {
    title: "Program Promo", storage: "nusa_diskon", icon: "%",
    description: "Tentukan potongan untuk kendaraan, jenis, merek, atau tier member tertentu.",
    columns: ["nama", "kode", "cakupan", "target", "persen", "periode", "status"],
    labels: { nama: "Promo", kode: "Kode", cakupan: "Cakupan", target: "Target", persen: "Diskon", periode: "Periode", status: "Status" },
    seeds: DISCOUNT_SEEDS
  },
  leads: {
    title: "Prospek & Test Drive", storage: "nusa_leads", icon: "◉",
    description: "Tindak lanjuti pertanyaan, permintaan penawaran, dan jadwal test drive dari pengunjung.",
    fields: [
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "nama", label: "Nama Calon Pelanggan", type: "text", required: true },
      { name: "telepon", label: "No. Telepon", type: "text", required: true },
      { name: "kendaraan", label: "Kendaraan", type: "text", required: true },
      { name: "tipe", label: "Kebutuhan", type: "select", options: ["Test Drive", "Penawaran", "Konsultasi Kredit"] },
      { name: "status", label: "Status", type: "select", options: ["Baru", "Dihubungi", "Terjadwal", "Selesai", "Batal"] },
      { name: "catatan", label: "Catatan", type: "textarea" }
    ],
    columns: ["tanggal", "nama", "telepon", "kendaraan", "tipe", "status"],
    labels: { tanggal: "Tanggal", nama: "Calon Pelanggan", telepon: "Telepon", kendaraan: "Kendaraan", tipe: "Kebutuhan", status: "Status" },
    seeds: [
      { id: 1, tanggal: "2026-09-11", nama: "Fajar Nugraha", telepon: "0812-7000-5511", kendaraan: "Toyota Yaris Cross Hybrid", tipe: "Test Drive", status: "Terjadwal", catatan: "Sabtu pukul 10.00" },
      { id: 2, tanggal: "2026-09-11", nama: "Nabila Putri", telepon: "0821-9900-1177", kendaraan: "Yamaha NMAX Turbo Tech Max", tipe: "Penawaran", status: "Baru", catatan: "Minta simulasi tenor 36 bulan" }
    ]
  },
  retur: {
    title: "Pembatalan & Retur", storage: "nusa_retur", icon: "↩",
    description: "Catat pembatalan pesanan atau pengembalian unit sesuai kebijakan dealer.",
    fields: [
      { name: "kode", label: "Kode", type: "text", required: true },
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "kendaraan", label: "Kendaraan", type: "text", required: true },
      { name: "alasan", label: "Alasan", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["Diproses", "Disetujui", "Ditolak"] }
    ],
    columns: ["kode", "tanggal", "kendaraan", "alasan", "status"],
    labels: { kode: "Kode", tanggal: "Tanggal", kendaraan: "Kendaraan", alasan: "Alasan", status: "Status" },
    seeds: [{ id: 1, kode: "CAN-001", tanggal: "2026-09-09", kendaraan: "Honda BR-V Prestige", alasan: "Pengajuan pembiayaan tidak disetujui", status: "Diproses" }]
  },
  karyawan: {
    title: "Tim Showroom", storage: "nusa_karyawan", icon: "♙",
    description: "Kelola sales consultant, supervisor, dan tim operasional dealer.",
    fields: [
      { name: "nama", label: "Nama Karyawan", type: "text", required: true },
      { name: "jabatan", label: "Jabatan", type: "select", options: ["Sales Consultant", "Admin Stok", "Finance", "Supervisor", "Manajer"] },
      { name: "telepon", label: "No. Telepon", type: "text" },
      { name: "target", label: "Target Unit / Bulan", type: "number", min: 0 },
      { name: "terjual", label: "Unit Terjual", type: "number", min: 0 },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Cuti", "Resign"] }
    ],
    columns: ["nama", "jabatan", "telepon", "target", "terjual", "status"],
    labels: { nama: "Nama", jabatan: "Jabatan", telepon: "Telepon", target: "Target", terjual: "Terjual", status: "Status" },
    seeds: [
      { id: 1, nama: "Andi Pratama", jabatan: "Sales Consultant", telepon: "0812-1111-2222", target: 8, terjual: 5, status: "Aktif" },
      { id: 2, nama: "Rina Wulandari", jabatan: "Admin Stok", telepon: "0813-3333-4444", target: 0, terjual: 0, status: "Aktif" },
      { id: 3, nama: "Bagus Saputra", jabatan: "Supervisor", telepon: "0815-5555-6666", target: 12, terjual: 9, status: "Cuti" }
    ]
  },
  stok: {
    title: "Pergerakan Unit", storage: "nusa_stok", icon: "↕",
    description: "Catat unit kendaraan masuk, keluar, booking, dan koreksi inventori.",
    fields: [
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "kendaraan", label: "Kendaraan", type: "text", required: true },
      { name: "tipe", label: "Tipe", type: "select", options: ["Masuk", "Keluar", "Booking", "Koreksi"] },
      { name: "jumlah", label: "Jumlah Unit", type: "number", min: 1, required: true },
      { name: "keterangan", label: "Keterangan", type: "textarea" }
    ],
    columns: ["tanggal", "kendaraan", "tipe", "jumlah", "keterangan"],
    labels: { tanggal: "Tanggal", kendaraan: "Kendaraan", tipe: "Pergerakan", jumlah: "Unit", keterangan: "Keterangan" },
    seeds: [
      { id: 1, tanggal: "2026-09-02", kendaraan: "Yamaha NMAX Turbo Tech Max", tipe: "Masuk", jumlah: 5, keterangan: "Pengiriman unit batch September" },
      { id: 2, tanggal: "2026-09-04", kendaraan: "Yamaha NMAX Turbo Tech Max", tipe: "Keluar", jumlah: 1, keterangan: "Penjualan INV-260901" },
      { id: 3, tanggal: "2026-09-08", kendaraan: "Honda BR-V Prestige", tipe: "Keluar", jumlah: 1, keterangan: "Penjualan INV-260902" }
    ]
  },
  users: {
    title: "Akun Staff", storage: "nusa_users", icon: "⌾",
    description: "Atur akun portal internal dan hak akses staff dealer.",
    fields: [
      { name: "nama", label: "Nama", type: "text", required: true },
      { name: "username", label: "Username", type: "text", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "role", label: "Role", type: "select", options: ["owner", "manajer", "karyawan"] },
      { name: "email", label: "Email", type: "email" }
    ],
    columns: ["nama", "username", "role", "email"],
    labels: { nama: "Nama", username: "Username", role: "Role", email: "Email" },
    seeds: SEED_USERS
  }
};

const DETAIL_TRANSAKSI_SEED = [
  { id: 1, transaksi_id: 1, kendaraan_id: 1, kendaraan: "Yamaha NMAX Turbo Tech Max", qty: 1, harga: 45550000, diskon: 2277500, subtotal: 43272500 },
  { id: 2, transaksi_id: 2, kendaraan_id: 4, kendaraan: "Honda BR-V Prestige", qty: 1, harga: 373400000, diskon: 0, subtotal: 373400000 },
  { id: 3, transaksi_id: 3, kendaraan_id: 5, kendaraan: "Kawasaki Ninja ZX-25R SE", qty: 1, harga: 129900000, diskon: 0, subtotal: 129900000 }
];

const SETTINGS_SEED = {
  nama_dealer: "Nusa Motors",
  alamat: "Jl. Boulevard Otomotif No. 88, Jakarta",
  telepon: "021-555-0199",
  whatsapp: "628125550199",
  email: "halo@nusamotors.id",
  pajak_persen: 11,
  rupiah_per_poin: 100000,
  batas_stok_min: 2,
  notif_stok_min: true
};

const NOTIFICATION_SEEDS = [
  { id: 1, icon: "!", title: "Stok Kawasaki Ninja ZX-25R tersisa 1 unit", body: "Hubungi distributor atau tandai unit sebagai limited stock.", time: "10 menit lalu", read: false, tone: "amber" },
  { id: 2, icon: "◆", title: "Permintaan test drive baru", body: "Nabila meminta jadwal test drive Yamaha NMAX.", time: "35 menit lalu", read: false, tone: "blue" },
  { id: 3, icon: "%", title: "Promo Drive Home September aktif", body: "Potongan otomatis berlaku untuk dua kendaraan pilihan.", time: "Hari ini", read: true, tone: "red" }
];

function readStore(key, fallback = []) { return javaRead(key, fallback); }
function writeStore(key, value) { javaWrite(key, value); }
function seedAll() {}

function getActiveDiscounts() {
  const today = new Date().toISOString().slice(0, 10);
  return readStore("nusa_diskon", []).filter((promo) => promo.status === "Aktif" && (!promo.mulai || promo.mulai <= today) && (!promo.selesai || promo.selesai >= today));
}

function discountTargetsVehicle(promo, vehicle, member = null) {
  if (promo.cakupan === "Semua") return true;
  if (promo.cakupan === "Produk") return (promo.target_ids || []).map(Number).includes(Number(vehicle.id));
  if (promo.cakupan === "Jenis") return promo.target_nilai === vehicle.jenis;
  if (promo.cakupan === "Merek") return promo.target_nilai === vehicle.merek;
  if (promo.cakupan === "Member") return Boolean(member && promo.target_nilai === member.tier);
  return false;
}

function bestDiscountForVehicle(vehicle, lineTotal, promoCode = "", member = null) {
  const normalizedCode = String(promoCode || "").trim().toUpperCase();
  const eligible = getActiveDiscounts().filter((promo) => {
    const codeAllowed = promo.kode ? promo.kode.toUpperCase() === normalizedCode : true;
    return codeAllowed && Number(lineTotal) >= Number(promo.minimal_transaksi || 0) && discountTargetsVehicle(promo, vehicle, member);
  });
  if (!normalizedCode) {
    for (let index = eligible.length - 1; index >= 0; index -= 1) if (eligible[index].kode) eligible.splice(index, 1);
  }
  return eligible.map((promo) => ({
    promo,
    amount: Math.min(Math.round(Number(lineTotal) * Number(promo.persen || 0) / 100), Number(promo.maksimal_diskon || Number.MAX_SAFE_INTEGER))
  })).sort((a, b) => b.amount - a.amount)[0] || null;
}

function vehicleDisplayPrice(vehicle, member = null) {
  const deal = bestDiscountForVehicle(vehicle, Number(vehicle.harga), "", member);
  return { original: Number(vehicle.harga), discount: deal?.amount || 0, final: Number(vehicle.harga) - (deal?.amount || 0), promo: deal?.promo || null };
}

seedAll();

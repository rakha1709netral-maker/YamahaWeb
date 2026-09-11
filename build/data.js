// Data demo TokoKu. Struktur penyimpanan mengikuti entitas pada schema.sql,
// tetapi disimpan di localStorage agar prototipe dapat berjalan tanpa server database.

const SEED_USERS = [
  { id: 1, nama: "Budi Owner", username: "owner", password: "owner123", role: "owner", email: "owner@toko.id" },
  { id: 2, nama: "Sari Manajer", username: "manajer", password: "manajer123", role: "manajer", email: "manajer@toko.id" },
  { id: 3, nama: "Andi Karyawan", username: "karyawan", password: "karyawan123", role: "karyawan", email: "karyawan@toko.id" }
];

const ROLE_COLORS = { owner: "#ec4899", manajer: "#6366f1", karyawan: "#0ea5e9" };
const ROLE_LABEL = { owner: "Owner", manajer: "Manajer", karyawan: "Karyawan" };

const ENTITIES = {
  produk: {
    title: "Data Produk", storage: "tws_produk", icon: "📦",
    description: "Kelola harga, stok, kategori, dan supplier produk.",
    fields: [
      { name: "nama", label: "Nama Produk", type: "text", required: true },
      { name: "kategori", label: "Kategori", type: "select", options: ["Elektronik", "Pakaian", "Makanan", "Minuman", "Kosmetik", "Olahraga"] },
      { name: "harga", label: "Harga (Rp)", type: "number", min: 0, required: true },
      { name: "stok", label: "Stok", type: "number", min: 0, required: true },
      { name: "supplier", label: "Supplier", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] }
    ],
    columns: ["nama", "kategori", "harga", "stok", "status"],
    labels: { nama: "Nama", kategori: "Kategori", harga: "Harga", stok: "Stok", status: "Status" },
    seeds: [
      { id: 1, nama: "Earphone Bluetooth", kategori: "Elektronik", harga: 150000, stok: 25, supplier: "PT Tekno Jaya", status: "Aktif" },
      { id: 2, nama: "Kaos Polos Premium", kategori: "Pakaian", harga: 85000, stok: 60, supplier: "CV Fashion Nusantara", status: "Aktif" },
      { id: 3, nama: "Kopi Arabika 250g", kategori: "Makanan", harga: 95000, stok: 40, supplier: "UD Kopi Lestari", status: "Aktif" },
      { id: 4, nama: "Serum Vitamin C", kategori: "Kosmetik", harga: 120000, stok: 15, supplier: "PT Tekno Jaya", status: "Aktif" },
      { id: 5, nama: "Botol Minum Sport", kategori: "Olahraga", harga: 75000, stok: 50, supplier: "CV Fashion Nusantara", status: "Nonaktif" }
    ]
  },
  kategori: {
    title: "Data Kategori", storage: "tws_kategori", icon: "🏷️",
    description: "Kelompokkan produk agar katalog dan laporan lebih mudah dibaca.",
    fields: [
      { name: "nama", label: "Nama Kategori", type: "text", required: true },
      { name: "deskripsi", label: "Deskripsi", type: "textarea" },
      { name: "warna", label: "Warna Badge", type: "select", options: ["green", "blue", "amber", "purple", "pink", "red"] }
    ],
    columns: ["nama", "deskripsi", "warna"],
    labels: { nama: "Nama", deskripsi: "Deskripsi", warna: "Warna" },
    seeds: [
      { id: 1, nama: "Elektronik", deskripsi: "Gadget & perangkat elektronik", warna: "blue" },
      { id: 2, nama: "Pakaian", deskripsi: "Pakaian pria & wanita", warna: "purple" },
      { id: 3, nama: "Makanan", deskripsi: "Makanan & minuman kemasan", warna: "green" },
      { id: 4, nama: "Kosmetik", deskripsi: "Perawatan kecantikan", warna: "pink" },
      { id: 5, nama: "Olahraga", deskripsi: "Perlengkapan olahraga", warna: "amber" }
    ]
  },
  pelanggan: {
    title: "Data Pelanggan", storage: "tws_pelanggan", icon: "👥",
    description: "Simpan data pelanggan dan tingkatan loyalitas mereka.",
    fields: [
      { name: "nama", label: "Nama Pelanggan", type: "text", required: true },
      { name: "telepon", label: "No. Telepon", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "alamat", label: "Alamat", type: "textarea" },
      { name: "tier", label: "Tier", type: "select", options: ["Bronze", "Silver", "Gold", "Platinum"] }
    ],
    columns: ["nama", "telepon", "email", "tier"],
    labels: { nama: "Nama", telepon: "Telepon", email: "Email", tier: "Tier" },
    seeds: [
      { id: 1, nama: "Dewi Anggraini", telepon: "0812-3456-7890", email: "dewi@mail.com", alamat: "Jl. Merdeka No. 12, Bandung", tier: "Gold" },
      { id: 2, nama: "Rizky Pratama", telepon: "0813-9876-5432", email: "rizky@mail.com", alamat: "Jl. Sudirman No. 45, Jakarta", tier: "Silver" },
      { id: 3, nama: "Maya Putri", telepon: "0821-1122-3344", email: "maya@mail.com", alamat: "Jl. Ahmad Yani No. 8, Surabaya", tier: "Platinum" }
    ]
  },
  supplier: {
    title: "Data Supplier", storage: "tws_supplier", icon: "🚚",
    description: "Daftar mitra pemasok beserta status kerja samanya.",
    fields: [
      { name: "nama", label: "Nama Supplier", type: "text", required: true },
      { name: "telepon", label: "No. Telepon", type: "text" },
      { name: "alamat", label: "Alamat", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] }
    ],
    columns: ["nama", "telepon", "alamat", "status"],
    labels: { nama: "Nama", telepon: "Telepon", alamat: "Alamat", status: "Status" },
    seeds: [
      { id: 1, nama: "PT Tekno Jaya", telepon: "021-555-1234", alamat: "Jl. Gatot Subroto, Jakarta", status: "Aktif" },
      { id: 2, nama: "CV Fashion Nusantara", telepon: "022-444-5678", alamat: "Jl. Asia Afrika, Bandung", status: "Aktif" },
      { id: 3, nama: "UD Kopi Lestari", telepon: "024-333-8765", alamat: "Jl. Pemuda, Semarang", status: "Aktif" }
    ]
  },
  transaksi: {
    title: "Riwayat Transaksi", storage: "tws_transaksi", icon: "🧾",
    description: "Pantau transaksi yang dibuat melalui halaman kasir.",
    fields: [
      { name: "kode", label: "Kode Transaksi", type: "text", required: true },
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "pelanggan", label: "Pelanggan", type: "text" },
      { name: "kasir", label: "Kasir", type: "text" },
      { name: "total", label: "Total (Rp)", type: "number", min: 0 },
      { name: "metode", label: "Metode Bayar", type: "select", options: ["Tunai", "QRIS", "Transfer", "Kartu Kredit"] },
      { name: "status", label: "Status", type: "select", options: ["Selesai", "Pending", "Dibatalkan"] }
    ],
    columns: ["kode", "tanggal", "pelanggan", "kasir", "total", "metode", "status"],
    labels: { kode: "Kode", tanggal: "Tanggal", pelanggan: "Pelanggan", kasir: "Kasir", total: "Total", metode: "Metode", status: "Status" },
    seeds: [
      { id: 1, kode: "TRX-001", tanggal: "2026-09-08", pelanggan: "Dewi Anggraini", kasir: "Andi Karyawan", total: 320000, metode: "QRIS", status: "Selesai" },
      { id: 2, kode: "TRX-002", tanggal: "2026-09-09", pelanggan: "Rizky Pratama", kasir: "Andi Karyawan", total: 150000, metode: "Tunai", status: "Selesai" },
      { id: 3, kode: "TRX-003", tanggal: "2026-09-10", pelanggan: "Maya Putri", kasir: "Andi Karyawan", total: 275000, metode: "Transfer", status: "Pending" }
    ]
  },
  diskon: {
    title: "Diskon & Promo", storage: "tws_diskon", icon: "🎟️",
    description: "Atur periode promosi dan persentase potongan harga.",
    fields: [
      { name: "nama", label: "Nama Promo", type: "text", required: true },
      { name: "persen", label: "Diskon (%)", type: "number", min: 0, max: 100 },
      { name: "mulai", label: "Tanggal Mulai", type: "date" },
      { name: "selesai", label: "Tanggal Selesai", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"] }
    ],
    columns: ["nama", "persen", "mulai", "selesai", "status"],
    labels: { nama: "Nama", persen: "Diskon", mulai: "Mulai", selesai: "Selesai", status: "Status" },
    seeds: [
      { id: 1, nama: "Promo 9.9 Sale", persen: 25, mulai: "2026-09-09", selesai: "2026-09-11", status: "Aktif" },
      { id: 2, nama: "Member Diskon", persen: 10, mulai: "2026-01-01", selesai: "2026-12-31", status: "Aktif" },
      { id: 3, nama: "Clearance Sale", persen: 50, mulai: "2026-08-01", selesai: "2026-08-31", status: "Nonaktif" }
    ]
  },
  retur: {
    title: "Retur Barang", storage: "tws_retur", icon: "↩️",
    description: "Proses pengembalian barang dan pantau status persetujuannya.",
    fields: [
      { name: "kode", label: "Kode Retur", type: "text", required: true },
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "produk", label: "Produk", type: "text" },
      { name: "alasan", label: "Alasan", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: ["Diproses", "Disetujui", "Ditolak"] }
    ],
    columns: ["kode", "tanggal", "produk", "alasan", "status"],
    labels: { kode: "Kode", tanggal: "Tanggal", produk: "Produk", alasan: "Alasan", status: "Status" },
    seeds: [
      { id: 1, kode: "RTR-001", tanggal: "2026-09-07", produk: "Earphone Bluetooth", alasan: "Barang rusak saat diterima", status: "Disetujui" },
      { id: 2, kode: "RTR-002", tanggal: "2026-09-10", produk: "Kaos Polos Premium", alasan: "Ukuran tidak sesuai", status: "Diproses" }
    ]
  },
  karyawan: {
    title: "Data Karyawan", storage: "tws_karyawan", icon: "🪪",
    description: "Kelola jabatan, kontak, gaji, dan status karyawan.",
    fields: [
      { name: "nama", label: "Nama Karyawan", type: "text", required: true },
      { name: "jabatan", label: "Jabatan", type: "select", options: ["Kasir", "Admin Gudang", "Supervisor", "Manajer"] },
      { name: "telepon", label: "No. Telepon", type: "text" },
      { name: "gaji", label: "Gaji (Rp)", type: "number", min: 0 },
      { name: "status", label: "Status", type: "select", options: ["Aktif", "Cuti", "Resign"] }
    ],
    columns: ["nama", "jabatan", "telepon", "gaji", "status"],
    labels: { nama: "Nama", jabatan: "Jabatan", telepon: "Telepon", gaji: "Gaji", status: "Status" },
    seeds: [
      { id: 1, nama: "Andi Karyawan", jabatan: "Kasir", telepon: "0812-1111-2222", gaji: 4500000, status: "Aktif" },
      { id: 2, nama: "Rina Wulandari", jabatan: "Admin Gudang", telepon: "0813-3333-4444", gaji: 5000000, status: "Aktif" },
      { id: 3, nama: "Bagus Saputra", jabatan: "Supervisor", telepon: "0815-5555-6666", gaji: 7000000, status: "Cuti" }
    ]
  },
  stok: {
    title: "Riwayat Stok", storage: "tws_stok", icon: "📚",
    description: "Catat pergerakan barang masuk dan keluar dari gudang.",
    fields: [
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "produk", label: "Produk", type: "text", required: true },
      { name: "tipe", label: "Tipe", type: "select", options: ["Masuk", "Keluar"] },
      { name: "jumlah", label: "Jumlah", type: "number", min: 1, required: true },
      { name: "keterangan", label: "Keterangan", type: "textarea" }
    ],
    columns: ["tanggal", "produk", "tipe", "jumlah", "keterangan"],
    labels: { tanggal: "Tanggal", produk: "Produk", tipe: "Tipe", jumlah: "Jumlah", keterangan: "Keterangan" },
    seeds: [
      { id: 1, tanggal: "2026-09-08", produk: "Earphone Bluetooth", tipe: "Masuk", jumlah: 30, keterangan: "Pembelian dari PT Tekno Jaya" },
      { id: 2, tanggal: "2026-09-09", produk: "Kopi Arabika 250g", tipe: "Keluar", jumlah: 5, keterangan: "Penjualan TRX-002" },
      { id: 3, tanggal: "2026-09-10", produk: "Serum Vitamin C", tipe: "Keluar", jumlah: 3, keterangan: "Penjualan TRX-003" }
    ]
  },
  users: {
    title: "Manajemen User", storage: "tws_users", icon: "🔐",
    description: "Atur akun dan hak akses pengguna sistem.",
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
  { id: 1, transaksi_id: 1, produk_id: 1, produk: "Earphone Bluetooth", qty: 2, harga: 150000, subtotal: 300000 },
  { id: 2, transaksi_id: 1, produk_id: 3, produk: "Kopi Arabika 250g", qty: 1, harga: 95000, subtotal: 95000 },
  { id: 3, transaksi_id: 2, produk_id: 1, produk: "Earphone Bluetooth", qty: 1, harga: 150000, subtotal: 150000 },
  { id: 4, transaksi_id: 3, produk_id: 4, produk: "Serum Vitamin C", qty: 2, harga: 120000, subtotal: 240000 },
  { id: 5, transaksi_id: 3, produk_id: 5, produk: "Botol Minum Sport", qty: 1, harga: 75000, subtotal: 75000 }
];

const PENGATURAN_SEED = {
  nama_toko: "TokoKu",
  alamat: "Jl. Merdeka No. 12, Bandung",
  telepon: "022-123-4567",
  pajak_persen: 11,
  notif_stok_min: true,
  batas_stok_min: 20
};

const NOTIFIKASI_SEED = [
  { id: 1, icon: "⚠️", title: "Stok Serum Vitamin C menipis", body: "Tersisa 15 unit. Pertimbangkan pemesanan ulang.", time: "10 menit lalu", read: false, tone: "amber" },
  { id: 2, icon: "💳", title: "Transaksi TRX-003 masih pending", body: "Pembayaran transfer perlu diverifikasi.", time: "1 jam lalu", read: false, tone: "blue" },
  { id: 3, icon: "↩️", title: "Retur baru sedang diproses", body: "RTR-002 menunggu keputusan supervisor.", time: "Kemarin", read: true, tone: "pink" }
];

const KATALOG_EMOJI = { Elektronik: "🎧", Pakaian: "👕", Makanan: "☕", Minuman: "🥤", Kosmetik: "🧴", Olahraga: "🏀" };
const KATALOG_BG = {
  Elektronik: "linear-gradient(135deg,#4338ca,#818cf8)",
  Pakaian: "linear-gradient(135deg,#db2777,#fb7185)",
  Makanan: "linear-gradient(135deg,#d97706,#fbbf24)",
  Minuman: "linear-gradient(135deg,#0891b2,#38bdf8)",
  Kosmetik: "linear-gradient(135deg,#9333ea,#e879f9)",
  Olahraga: "linear-gradient(135deg,#059669,#34d399)"
};

function seedAll() {
  Object.values(ENTITIES).forEach((entity) => {
    if (!localStorage.getItem(entity.storage)) {
      localStorage.setItem(entity.storage, JSON.stringify(entity.seeds));
    }
  });
  if (!localStorage.getItem("tws_detail_transaksi")) localStorage.setItem("tws_detail_transaksi", JSON.stringify(DETAIL_TRANSAKSI_SEED));
  if (!localStorage.getItem("tws_pengaturan")) localStorage.setItem("tws_pengaturan", JSON.stringify(PENGATURAN_SEED));
  if (!localStorage.getItem("tws_notifikasi")) localStorage.setItem("tws_notifikasi", JSON.stringify(NOTIFIKASI_SEED));
  if (!localStorage.getItem("tws_login_logs")) localStorage.setItem("tws_login_logs", JSON.stringify([]));
}

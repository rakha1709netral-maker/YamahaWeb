-- ============================================================
-- DATABASE SISTEM PENJUALAN "TOKOKU"
-- ============================================================
CREATE DATABASE IF NOT EXISTS db_tokoku
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_tokoku;

-- ========== 1. USERS (login: karyawan, manajer, owner) ==========
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner','manajer','karyawan') NOT NULL DEFAULT 'karyawan',
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO users (nama, username, password, role, email) VALUES
('Budi Owner','owner','owner123','owner','owner@toko.id'),
('Sari Manajer','manajer','manajer123','manajer','manajer@toko.id'),
('Andi Karyawan','karyawan','karyawan123','karyawan','karyawan@toko.id');

-- ========== 2. KATEGORI ==========
CREATE TABLE kategori (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  deskripsi TEXT,
  warna VARCHAR(20) DEFAULT 'blue'
) ENGINE=InnoDB;

INSERT INTO kategori (nama, deskripsi, warna) VALUES
('Elektronik','Gadget & perangkat elektronik','blue'),
('Pakaian','Pakaian pria & wanita','purple'),
('Makanan','Makanan & minuman kemasan','green'),
('Kosmetik','Perawatan kecantikan','pink'),
('Olahraga','Perlengkapan olahraga','amber');

-- ========== 3. SUPPLIER ==========
CREATE TABLE supplier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  telepon VARCHAR(20),
  alamat TEXT,
  status ENUM('Aktif','Nonaktif') DEFAULT 'Aktif'
) ENGINE=InnoDB;

INSERT INTO supplier (nama, telepon, alamat, status) VALUES
('PT Tekno Jaya','021-555-1234','Jl. Gatot Subroto, Jakarta','Aktif'),
('CV Fashion Nusantara','022-444-5678','Jl. Asia Afrika, Bandung','Aktif'),
('UD Kopi Lestari','024-333-8765','Jl. Pemuda, Semarang','Aktif');

-- ========== 4. PELANGGAN ==========
CREATE TABLE pelanggan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  telepon VARCHAR(20),
  email VARCHAR(100),
  alamat TEXT,
  tier ENUM('Bronze','Silver','Gold','Platinum') DEFAULT 'Bronze'
) ENGINE=InnoDB;

INSERT INTO pelanggan (nama, telepon, email, alamat, tier) VALUES
('Dewi Anggraini','0812-3456-7890','dewi@mail.com','Jl. Merdeka No. 12, Bandung','Gold'),
('Rizky Pratama','0813-9876-5432','rizky@mail.com','Jl. Sudirman No. 45, Jakarta','Silver'),
('Maya Putri','0821-1122-3344','maya@mail.com','Jl. Ahmad Yani No. 8, Surabaya','Platinum');

-- ========== 5. PRODUK ==========
CREATE TABLE produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori_id INT NOT NULL,
  supplier_id INT,
  nama VARCHAR(150) NOT NULL,
  harga INT NOT NULL DEFAULT 0,
  stok INT NOT NULL DEFAULT 0,
  status ENUM('Aktif','Nonaktif') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id),
  FOREIGN KEY (supplier_id) REFERENCES supplier(id)
) ENGINE=InnoDB;

INSERT INTO produk (kategori_id, supplier_id, nama, harga, stok, status) VALUES
(1,1,'Earphone Bluetooth',150000,25,'Aktif'),
(2,2,'Kaos Polos Premium',85000,60,'Aktif'),
(3,3,'Kopi Arabika 250g',95000,40,'Aktif'),
(4,1,'Serum Vitamin C',120000,15,'Aktif'),
(5,2,'Botol Minum Sport',75000,50,'Nonaktif');

-- ========== 6. DISKON / PROMO ==========
CREATE TABLE diskon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  persen INT NOT NULL DEFAULT 0,
  mulai DATE,
  selesai DATE,
  status ENUM('Aktif','Nonaktif') DEFAULT 'Aktif'
) ENGINE=InnoDB;

INSERT INTO diskon (nama, persen, mulai, selesai, status) VALUES
('Promo 9.9 Sale',25,'2026-09-09','2026-09-11','Aktif'),
('Member Diskon',10,'2026-01-01','2026-12-31','Aktif'),
('Clearance Sale',50,'2026-08-01','2026-08-31','Nonaktif');

-- ========== 7. KARYAWAN ==========
CREATE TABLE karyawan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  nama VARCHAR(100) NOT NULL,
  jabatan ENUM('Kasir','Admin Gudang','Supervisor','Manajer') DEFAULT 'Kasir',
  telepon VARCHAR(20),
  gaji INT DEFAULT 0,
  status ENUM('Aktif','Cuti','Resign') DEFAULT 'Aktif',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO karyawan (user_id, nama, jabatan, telepon, gaji, status) VALUES
(3,'Andi Karyawan','Kasir','0812-1111-2222',4500000,'Aktif'),
(NULL,'Rina Wulandari','Admin Gudang','0813-3333-4444',5000000,'Aktif'),
(NULL,'Bagus Saputra','Supervisor','0815-5555-6666',7000000,'Cuti');

-- ========== 8. TRANSAKSI ==========
CREATE TABLE transaksi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(20) UNIQUE NOT NULL,
  tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
  pelanggan_id INT,
  user_id INT NOT NULL,
  total INT NOT NULL DEFAULT 0,
  metode ENUM('Tunai','QRIS','Transfer','Kartu Kredit') DEFAULT 'Tunai',
  status ENUM('Selesai','Pending','Dibatalkan') DEFAULT 'Pending',
  FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO transaksi (kode, tanggal, pelanggan_id, user_id, total, metode, status) VALUES
('TRX-001','2026-09-08 10:30:00',1,3,320000,'QRIS','Selesai'),
('TRX-002','2026-09-09 14:15:00',2,3,150000,'Tunai','Selesai'),
('TRX-003','2026-09-10 09:05:00',3,3,275000,'Transfer','Pending');

-- ========== 9. DETAIL TRANSAKSI ==========
CREATE TABLE detail_transaksi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaksi_id INT NOT NULL,
  produk_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  harga INT NOT NULL DEFAULT 0,
  subtotal INT NOT NULL DEFAULT 0,
  FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id)
) ENGINE=InnoDB;

INSERT INTO detail_transaksi (transaksi_id, produk_id, qty, harga, subtotal) VALUES
(1,1,2,150000,300000),(1,3,1,95000,95000),
(2,1,1,150000,150000),
(3,4,2,120000,240000),(3,5,1,75000,75000);

-- ========== 10. STOK LOG ==========
CREATE TABLE stok_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
  produk_id INT NOT NULL,
  tipe ENUM('Masuk','Keluar') NOT NULL,
  jumlah INT NOT NULL,
  keterangan VARCHAR(255),
  FOREIGN KEY (produk_id) REFERENCES produk(id)
) ENGINE=InnoDB;

INSERT INTO stok_log (tanggal, produk_id, tipe, jumlah, keterangan) VALUES
('2026-09-08 08:00:00',1,'Masuk',30,'Pembelian dari PT Tekno Jaya'),
('2026-09-09 14:20:00',3,'Keluar',5,'Penjualan TRX-002'),
('2026-09-10 09:10:00',4,'Keluar',3,'Penjualan TRX-003');

-- ========== 11. RETUR ==========
CREATE TABLE retur (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(20) UNIQUE NOT NULL,
  tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
  produk_id INT,
  alasan TEXT,
  status ENUM('Diproses','Disetujui','Ditolak') DEFAULT 'Diproses',
  FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO retur (kode, tanggal, produk_id, alasan, status) VALUES
('RTR-001','2026-09-07 11:00:00',1,'Barang rusak saat diterima','Disetujui'),
('RTR-002','2026-09-10 16:40:00',2,'Ukuran tidak sesuai','Diproses');

-- ========== 12. PENGATURAN TOKO ==========
CREATE TABLE pengaturan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kunci VARCHAR(50) UNIQUE NOT NULL,
  nilai VARCHAR(255)
) ENGINE=InnoDB;

INSERT INTO pengaturan (kunci, nilai) VALUES
('nama_toko','TokoKu'),('alamat','Jl. Merdeka No. 12, Bandung'),
('telepon','022-123-4567'),('pajak_persen','11'),('notif_stok_min','Aktif');

-- ========== 13. RIWAYAT LOGIN ==========
CREATE TABLE riwayat_login (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ========== VIEW BERGUNA ==========
CREATE VIEW v_laporan_penjualan AS
SELECT t.kode, t.tanggal, p.nama AS pelanggan, u.nama AS kasir,
       t.metode, t.status, t.total
FROM transaksi t
LEFT JOIN pelanggan p ON p.id = t.pelanggan_id
LEFT JOIN users u ON u.id = t.user_id;
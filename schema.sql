-- ============================================================
-- NUSA MOTORS - SKEMA DEALER MOTOR DAN MOBIL
-- MySQL 8 / MariaDB 10.5+
-- Password data demo hanya untuk prototipe. Produksi wajib memakai hash.
-- Foto disimpan di storage server; database hanya menyimpan path/URL.
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_nusa_motors
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_nusa_motors;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_laporan_penjualan;
DROP VIEW IF EXISTS v_harga_kendaraan;
DROP TABLE IF EXISTS riwayat_login, pengaturan, pembatalan_retur,
  mutasi_poin, favorit, prospek, stok_log, detail_transaksi, transaksi,
  diskon_kendaraan, diskon, kendaraan, kategori, supplier, karyawan,
  pelanggan, users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Akun portal internal.
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','manajer','karyawan') NOT NULL DEFAULT 'karyawan',
  email VARCHAR(120) NULL UNIQUE,
  status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Profil tim showroom.
CREATE TABLE karyawan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  jabatan ENUM('Sales Consultant','Admin Stok','Finance','Supervisor','Manajer') NOT NULL,
  telepon VARCHAR(25) NULL,
  target_unit SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  unit_terjual SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('Aktif','Cuti','Resign') NOT NULL DEFAULT 'Aktif',
  CONSTRAINT fk_karyawan_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Pelanggan bisa melihat katalog tanpa akun. Password hanya diisi untuk member.
CREATE TABLE pelanggan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  telepon VARCHAR(25) NOT NULL,
  email VARCHAR(120) NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  alamat TEXT NULL,
  tier ENUM('Bronze','Silver','Gold','Platinum') NOT NULL DEFAULT 'Bronze',
  poin INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  bergabung DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Distributor atau ATPM kendaraan.
CREATE TABLE supplier (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  merek VARCHAR(80) NOT NULL,
  telepon VARCHAR(25) NULL,
  alamat TEXT NULL,
  status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif'
) ENGINE=InnoDB;

-- 5. Kategori kendaraan.
CREATE TABLE kategori (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(80) NOT NULL,
  jenis ENUM('Motor','Mobil') NOT NULL,
  deskripsi TEXT NULL,
  status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  UNIQUE KEY uk_kategori_jenis_nama (jenis, nama)
) ENGINE=InnoDB;

-- 6. Inventori kendaraan sekaligus sumber katalog publik.
CREATE TABLE kendaraan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kategori_id BIGINT UNSIGNED NULL,
  supplier_id BIGINT UNSIGNED NULL,
  kode VARCHAR(30) NOT NULL UNIQUE,
  nama VARCHAR(160) NOT NULL,
  jenis ENUM('Motor','Mobil') NOT NULL,
  merek VARCHAR(80) NOT NULL,
  model VARCHAR(100) NOT NULL,
  tahun YEAR NOT NULL,
  harga DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  harga_modal DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  stok SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  warna VARCHAR(80) NULL,
  transmisi VARCHAR(80) NULL,
  bahan_bakar VARCHAR(50) NULL,
  kapasitas_mesin VARCHAR(50) NULL,
  kondisi ENUM('Baru','Bekas Tersertifikasi') NOT NULL DEFAULT 'Baru',
  thumbnail VARCHAR(500) NULL COMMENT 'Path atau URL foto hasil upload admin/manajer',
  deskripsi TEXT NULL,
  unggulan BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM('Tersedia','Booking','Terjual','Nonaktif') NOT NULL DEFAULT 'Tersedia',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kendaraan_katalog (status, jenis, merek, harga),
  CONSTRAINT fk_kendaraan_kategori FOREIGN KEY (kategori_id) REFERENCES kategori(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_kendaraan_supplier FOREIGN KEY (supplier_id) REFERENCES supplier(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Program promo. Cakupan menentukan cara promo ditargetkan.
CREATE TABLE diskon (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  kode VARCHAR(50) NULL UNIQUE COMMENT 'NULL berarti diterapkan otomatis',
  persen DECIMAL(5,2) UNSIGNED NOT NULL,
  cakupan ENUM('Produk','Jenis','Merek','Member','Semua') NOT NULL,
  target_nilai VARCHAR(100) NULL COMMENT 'Motor/Mobil, merek, atau tier member',
  minimal_transaksi DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  maksimal_diskon DECIMAL(15,2) UNSIGNED NULL,
  mulai DATE NOT NULL,
  selesai DATE NOT NULL,
  status ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_diskon_persen CHECK (persen > 0 AND persen <= 100),
  CONSTRAINT chk_diskon_periode CHECK (selesai >= mulai),
  CONSTRAINT fk_diskon_user FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- Relasi eksplisit untuk promo dengan cakupan Produk.
CREATE TABLE diskon_kendaraan (
  diskon_id BIGINT UNSIGNED NOT NULL,
  kendaraan_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (diskon_id, kendaraan_id),
  CONSTRAINT fk_dk_diskon FOREIGN KEY (diskon_id) REFERENCES diskon(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_dk_kendaraan FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Header transaksi penjualan.
CREATE TABLE transaksi (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(30) NOT NULL UNIQUE,
  tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pelanggan_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  diskon_id BIGINT UNSIGNED NULL,
  subtotal DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  diskon_total DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  pajak DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  total DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  metode ENUM('Tunai','Transfer','QRIS','Kartu Kredit','Kredit') NOT NULL,
  promo_digunakan VARCHAR(120) NULL,
  poin_didapat INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('Selesai','Pending','Dibatalkan') NOT NULL DEFAULT 'Pending',
  catatan TEXT NULL,
  CONSTRAINT fk_transaksi_pelanggan FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_transaksi_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_transaksi_diskon FOREIGN KEY (diskon_id) REFERENCES diskon(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Detail unit yang dijual beserta potongan aktual per kendaraan.
CREATE TABLE detail_transaksi (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaksi_id BIGINT UNSIGNED NOT NULL,
  kendaraan_id BIGINT UNSIGNED NOT NULL,
  qty SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  harga DECIMAL(15,2) UNSIGNED NOT NULL,
  diskon DECIMAL(15,2) UNSIGNED NOT NULL DEFAULT 0,
  subtotal DECIMAL(15,2) UNSIGNED NOT NULL,
  CONSTRAINT fk_detail_transaksi FOREIGN KEY (transaksi_id) REFERENCES transaksi(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detail_kendaraan FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. Audit pergerakan stok/unit.
CREATE TABLE stok_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kendaraan_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  transaksi_id BIGINT UNSIGNED NULL,
  tipe ENUM('Masuk','Keluar','Booking','Koreksi') NOT NULL,
  jumlah SMALLINT UNSIGNED NOT NULL,
  keterangan VARCHAR(255) NULL,
  CONSTRAINT fk_stok_kendaraan FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_stok_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_stok_transaksi FOREIGN KEY (transaksi_id) REFERENCES transaksi(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. Prospek yang dibuat dari katalog publik.
CREATE TABLE prospek (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kendaraan_id BIGINT UNSIGNED NOT NULL,
  assigned_user_id BIGINT UNSIGNED NULL,
  tanggal DATE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  telepon VARCHAR(25) NOT NULL,
  email VARCHAR(120) NULL,
  tipe ENUM('Test Drive','Penawaran','Konsultasi Kredit') NOT NULL,
  status ENUM('Baru','Dihubungi','Terjadwal','Selesai','Batal') NOT NULL DEFAULT 'Baru',
  catatan TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prospek_kendaraan FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_prospek_sales FOREIGN KEY (assigned_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. Favorit bersifat per member, bukan global.
CREATE TABLE favorit (
  pelanggan_id BIGINT UNSIGNED NOT NULL,
  kendaraan_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pelanggan_id, kendaraan_id),
  CONSTRAINT fk_favorit_pelanggan FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_favorit_kendaraan FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Buku besar poin member.
CREATE TABLE mutasi_poin (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pelanggan_id BIGINT UNSIGNED NOT NULL,
  transaksi_id BIGINT UNSIGNED NULL,
  tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipe ENUM('Dapat','Pakai','Koreksi') NOT NULL,
  jumlah INT NOT NULL,
  saldo_setelah INT UNSIGNED NOT NULL,
  keterangan VARCHAR(255) NULL,
  CONSTRAINT fk_poin_pelanggan FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_poin_transaksi FOREIGN KEY (transaksi_id) REFERENCES transaksi(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. Pembatalan atau retur unit.
CREATE TABLE pembatalan_retur (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(30) NOT NULL UNIQUE,
  tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  transaksi_id BIGINT UNSIGNED NULL,
  kendaraan_id BIGINT UNSIGNED NULL,
  alasan TEXT NOT NULL,
  status ENUM('Diproses','Disetujui','Ditolak') NOT NULL DEFAULT 'Diproses',
  CONSTRAINT fk_retur_transaksi FOREIGN KEY (transaksi_id) REFERENCES transaksi(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_retur_kendaraan FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 15. Pengaturan dealer dan audit login.
CREATE TABLE pengaturan (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kunci VARCHAR(80) NOT NULL UNIQUE,
  nilai TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE riwayat_login (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  waktu DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alamat_ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  berhasil BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- DATA DEMO
-- ============================================================
INSERT INTO users (nama, username, password_hash, role, email) VALUES
('Budi Santoso','owner','DEMO_ONLY_owner123','owner','owner@nusamotors.id'),
('Sari Wijaya','manajer','DEMO_ONLY_manajer123','manajer','manajer@nusamotors.id'),
('Andi Pratama','sales','DEMO_ONLY_sales123','karyawan','sales@nusamotors.id');

INSERT INTO karyawan (user_id, nama, jabatan, telepon, target_unit, unit_terjual, status) VALUES
(3,'Andi Pratama','Sales Consultant','0812-1111-2222',8,5,'Aktif'),
(NULL,'Rina Wulandari','Admin Stok','0813-3333-4444',0,0,'Aktif'),
(NULL,'Bagus Saputra','Supervisor','0815-5555-6666',12,9,'Cuti');

INSERT INTO pelanggan (nama, telepon, email, password_hash, alamat, tier, poin, status, bergabung) VALUES
('Dewi Anggraini','0812-3456-7890','dewi@mail.com','DEMO_ONLY_member123','Bandung','Gold',4280,'Aktif','2025-02-18'),
('Rizky Pratama','0813-9876-5432','rizky@mail.com','DEMO_ONLY_member123','Jakarta','Silver',1850,'Aktif','2025-08-09'),
('Maya Putri','0821-1122-3344','maya@mail.com','DEMO_ONLY_member123','Surabaya','Platinum',8750,'Aktif','2024-11-27');

INSERT INTO supplier (nama, merek, telepon, alamat, status) VALUES
('Yamaha Indonesia','Yamaha','021-555-1001','Jakarta','Aktif'),
('Honda Prospect','Honda','021-555-1002','Jakarta','Aktif'),
('Toyota Astra Motor','Toyota','021-555-1003','Jakarta','Aktif'),
('Kawasaki Motor Indonesia','Kawasaki','021-555-1004','Bekasi','Aktif'),
('Suzuki Indomobil','Suzuki','021-555-1005','Bekasi','Aktif');

INSERT INTO kategori (nama, jenis, deskripsi, status) VALUES
('Skutik','Motor','Motor matik untuk mobilitas harian','Aktif'),
('Sport','Motor','Motor berkarakter performa','Aktif'),
('SUV','Mobil','Kendaraan serbaguna dengan ground clearance tinggi','Aktif'),
('MPV','Mobil','Mobil keluarga dengan kabin lapang','Aktif');

INSERT INTO kendaraan
(kategori_id, supplier_id, kode, nama, jenis, merek, model, tahun, harga, harga_modal, stok, warna, transmisi, bahan_bakar, kapasitas_mesin, kondisi, thumbnail, deskripsi, unggulan, status) VALUES
(1,1,'MTR-001','Yamaha NMAX Turbo Tech Max','Motor','Yamaha','NMAX',2026,45550000,41000000,8,'Magma Black','CVT','Bensin','155 cc','Baru',NULL,'Skutik premium untuk mobilitas harian dan perjalanan jauh.',TRUE,'Tersedia'),
(1,2,'MTR-002','Honda PCX 160 RoadSync','Motor','Honda','PCX',2026,40750000,37000000,6,'RoadSync Red','CVT','Bensin','160 cc','Baru',NULL,'Skutik elegan dengan teknologi pendukung perjalanan urban.',TRUE,'Tersedia'),
(3,3,'MBL-001','Toyota Yaris Cross Hybrid','Mobil','Toyota','Yaris Cross',2026,454950000,420000000,3,'Platinum White Pearl','e-CVT','Hybrid','1.500 cc','Baru',NULL,'SUV kompak hybrid yang efisien untuk keluarga modern.',TRUE,'Tersedia'),
(3,2,'MBL-002','Honda BR-V Prestige','Mobil','Honda','BR-V',2025,373400000,345000000,2,'Crystal Black Pearl','CVT','Bensin','1.500 cc','Baru',NULL,'Low SUV tujuh penumpang dengan kabin praktis.',FALSE,'Tersedia'),
(2,4,'MTR-003','Kawasaki Ninja ZX-25R SE','Motor','Kawasaki','Ninja ZX-25R',2025,129900000,118000000,1,'Lime Green','Manual 6-speed','Bensin','250 cc','Baru',NULL,'Sport bike empat silinder dengan karakter performa kuat.',FALSE,'Tersedia'),
(3,5,'MBL-003','Suzuki Jimny 5-Door','Mobil','Suzuki','Jimny',2025,503900000,475000000,0,'Jungle Green','Automatic','Bensin','1.500 cc','Baru',NULL,'SUV kompak berkarakter untuk berbagai medan.',FALSE,'Terjual');

INSERT INTO diskon
(nama, kode, persen, cakupan, target_nilai, minimal_transaksi, maksimal_diskon, mulai, selesai, status, created_by) VALUES
('Drive Home September',NULL,5,'Produk',NULL,0,8000000,'2026-09-01','2026-09-30','Aktif',2),
('Promo Motor Pilihan','MOTORHEMAT',3,'Jenis','Motor',30000000,2500000,'2026-01-01','2026-12-31','Aktif',2),
('Privilege Member Gold','GOLDPLUS',2,'Member','Gold',0,5000000,'2026-01-01','2026-12-31','Aktif',1);

INSERT INTO diskon_kendaraan (diskon_id, kendaraan_id) VALUES (1,1),(1,3);

INSERT INTO transaksi
(kode, tanggal, pelanggan_id, user_id, diskon_id, subtotal, diskon_total, pajak, total, metode, promo_digunakan, poin_didapat, status) VALUES
('INV-260901','2026-09-04 10:30:00',1,3,1,45550000,2277500,4763000,48035500,'Transfer','Drive Home September',480,'Selesai'),
('INV-260902','2026-09-08 14:15:00',2,3,NULL,373400000,0,41074000,414474000,'Kredit',NULL,4144,'Selesai'),
('INV-260903','2026-09-10 09:05:00',3,2,NULL,129900000,0,14289000,144189000,'Kartu Kredit',NULL,0,'Pending');

INSERT INTO detail_transaksi (transaksi_id, kendaraan_id, qty, harga, diskon, subtotal) VALUES
(1,1,1,45550000,2277500,43272500),
(2,4,1,373400000,0,373400000),
(3,5,1,129900000,0,129900000);

INSERT INTO stok_log (tanggal, kendaraan_id, user_id, transaksi_id, tipe, jumlah, keterangan) VALUES
('2026-09-02 08:00:00',1,2,NULL,'Masuk',5,'Pengiriman unit batch September'),
('2026-09-04 10:35:00',1,3,1,'Keluar',1,'Penjualan INV-260901'),
('2026-09-08 14:20:00',4,3,2,'Keluar',1,'Penjualan INV-260902');

INSERT INTO prospek (kendaraan_id, assigned_user_id, tanggal, nama, telepon, email, tipe, status, catatan) VALUES
(3,3,'2026-09-13','Fajar Nugraha','0812-7000-5511',NULL,'Test Drive','Terjadwal','Sabtu pukul 10.00'),
(1,NULL,'2026-09-11','Nabila Putri','0821-9900-1177',NULL,'Penawaran','Baru','Minta simulasi tenor 36 bulan');

INSERT INTO pembatalan_retur (kode, tanggal, transaksi_id, kendaraan_id, alasan, status) VALUES
('CAN-001','2026-09-09 16:00:00',NULL,4,'Pengajuan pembiayaan tidak disetujui','Diproses');

INSERT INTO pengaturan (kunci, nilai) VALUES
('nama_dealer','Nusa Motors'),
('alamat','Jl. Boulevard Otomotif No. 88, Jakarta'),
('telepon','021-555-0199'),
('whatsapp','628125550199'),
('email','halo@nusamotors.id'),
('pajak_persen','11'),
('rupiah_per_poin','100000'),
('batas_stok_min','2'),
('notif_stok_min','1');

-- Harga katalog efektif: promo otomatis aktif dipilih berdasarkan diskon terbesar.
CREATE VIEW v_harga_kendaraan AS
SELECT
  k.id, k.kode, k.nama, k.jenis, k.merek, k.harga,
  COALESCE(MAX(CASE
    WHEN d.id IS NOT NULL AND d.kode IS NULL AND d.status = 'Aktif'
      AND CURRENT_DATE BETWEEN d.mulai AND d.selesai
      AND k.harga >= d.minimal_transaksi
    THEN LEAST(k.harga * d.persen / 100, COALESCE(d.maksimal_diskon, k.harga))
    ELSE 0 END), 0) AS potongan_otomatis,
  k.harga - COALESCE(MAX(CASE
    WHEN d.id IS NOT NULL AND d.kode IS NULL AND d.status = 'Aktif'
      AND CURRENT_DATE BETWEEN d.mulai AND d.selesai
      AND k.harga >= d.minimal_transaksi
    THEN LEAST(k.harga * d.persen / 100, COALESCE(d.maksimal_diskon, k.harga))
    ELSE 0 END), 0) AS harga_efektif
FROM kendaraan k
LEFT JOIN diskon_kendaraan dk ON dk.kendaraan_id = k.id
LEFT JOIN diskon d ON d.id = dk.diskon_id
GROUP BY k.id, k.kode, k.nama, k.jenis, k.merek, k.harga;

CREATE VIEW v_laporan_penjualan AS
SELECT
  t.kode, t.tanggal, p.nama AS pelanggan, u.nama AS sales,
  t.subtotal, t.diskon_total, t.pajak, t.total,
  t.metode, t.promo_digunakan, t.status
FROM transaksi t
LEFT JOIN pelanggan p ON p.id = t.pelanggan_id
JOIN users u ON u.id = t.user_id;

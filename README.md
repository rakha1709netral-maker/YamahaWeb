# Nusa Motors Java

Web Java 21 untuk localhost dengan tampilan HTML/CSS dari proyek Yamaha asli.
Backend Java menangani login, session cookie, penyimpanan, penjualan, stok,
diskon, poin member, dan pembatasan akses halaman staff.

## Menjalankan

1. Klik dua kali `start.bat`.
2. Biarkan jendela terminal tersebut terbuka.
3. Buka **http://localhost:8080** di browser.
4. Tekan Ctrl+C di terminal atau klik `stop.bat` untuk menghentikan server.

JDK 21 sudah ditemukan di komputer ini. Tidak perlu NetBeans, Maven, Tomcat,
Laragon, atau MySQL untuk menjalankan versi ini. Aplikasi mengompilasi Java
secara otomatis setiap kali `start.bat` dijalankan.

Jika port 8080 digunakan aplikasi lain, jalankan `start.bat 8081` dari terminal,
lalu buka http://localhost:8081. Tutup instance server sebelumnya sebelum
menjalankan instance lain pada folder data yang sama.

## Halaman dan akun demo

- Customer: `/` dan `/catalog.html`, bebas login.
- Staff: `/staff-login.html`.
- Member: `/member-login.html`.
- Owner: `owner` / `owner123`.
- Manajer: `manajer` / `manajer123`.
- Sales: `sales` / `sales123`.
- Member: `dewi@mail.com` / `member123`.

Upload/ganti/hapus foto tersedia di Inventori Kendaraan untuk owner/manajer.
Foto dikompresi oleh browser dan disimpan di server bersama data kendaraan.
Tidak ada gambar AI. Promo September dari versi asli sudah berakhir;
edit tanggal promo lewat Program Promo bila ingin mengaktifkannya kembali.

## Mengatur website

Masuk sebagai owner/admin, buka **Pengaturan Dealer**, lalu bagian
**Konten, footer & susunan beranda**. Informasi publik di bagian atas mengatur
nama dealer, alamat, email, telepon dan WhatsApp. Editor website mengatur
tagline, deskripsi footer, jam buka, tautan lokasi/Instagram, credit, judul dan
deskripsi beranda, serta warna aksen. Tautan lokasi membuka Maps di tab baru.
Gunakan panah naik/turun untuk mengurutkan lima bagian beranda dan centang
untuk menampilkan/menyembunyikannya. Minimal satu bagian harus tampil.
Klik **Simpan semua pengaturan**; perubahan terlihat saat halaman customer
dimuat ulang dan ikut dalam backup. Ini editor bagian beranda, bukan editor
drag-and-drop bebas untuk seluruh halaman. Hak ubah hanya untuk owner/admin.

## Penyimpanan data

Kembali ke Beranda (`/` atau `/index.html`) mengakhiri sesi staff dan member
di browser tersebut. Membuka portal lagi memerlukan login. Tab lain dalam
browser yang sama ikut kehilangan akses sesi; sesi browser lain tetap aktif.
Navigasi antarmenu di dalam portal tetap mempertahankan login.

Data aktif ada di `data/store.json`; salinan sebelum perubahan terakhir ada
di `data/store.previous.json`. Password disimpan sebagai hash PBKDF2, session
login berada di memori server, dan logout/server restart mengakhiri session.
Java menulis melalui berkas sementara lalu mengganti berkas utama secara atomik.
Penjualan menghitung ulang harga/promo/stok/poin di Java dalam satu operasi.

Backup dapat diunduh/dipulihkan dari halaman Backup Data dengan akun owner.
Alternatif: hentikan server, lalu salin seluruh folder proyek ini sebagai backup.
Backup mencakup data akun; simpan di tempat pribadi.

Versi ini memakai penyimpanan JSON di disk, **belum menggunakan MySQL**.
`schema-reference.sql` adalah referensi skema asli, bukan skrip yang perlu
diimpor untuk menjalankan aplikasi ini. Data yang sebelumnya hanya tersimpan
di localStorage browser versi lama tidak otomatis ikut dipindahkan. Untuk
memindahkannya, ekspor dari menu Backup Data versi lama lalu impor di versi Java.

Server hanya menerima koneksi lokal pada 127.0.0.1. Aplikasi ini disiapkan
untuk pemakaian localhost, belum untuk hosting internet atau banyak pengguna.
Form administrasi biasa masih memperbarui satu kumpulan data sekaligus;
jangan mengedit kumpulan data yang sama serentak dari beberapa tab.

## Struktur

- `src/NusaServer.java`: HTTP server, autentikasi, penyimpanan, dan logika penjualan.
- `src/Json.java`: parser/serializer JSON tanpa dependensi tambahan.
- `web/`: 29 halaman, CSS asli, dan adapter JavaScript ke API Java.
- `seed.json`: data demo awal, hanya dibaca server saat inisialisasi/reset.
- `start.bat`: kompilasi dan menjalankan aplikasi.
- `scripts/verify.cjs`: pemeriksaan integrasi opsional, memerlukan Node.js dan server aktif.
- `scripts/prepare.cjs`: skrip migrasi awal; jangan jalankan ulang setelah mengubah versi Java.

## Folder Yamaha setelah pembaruan

Semua update Yamaha-Java sudah diterapkan ke `C:\laragon\www\Yamaha`.
Jalankan `start.bat` dari folder Yamaha ini. Folder Yamaha-Java tetap tersedia
sebagai salinan terpisah; perubahan berikutnya tidak otomatis tersinkron.

Cadangan versi Yamaha sebelum pembaruan ada di `backups/` dalam format ZIP.
Data aktif disalin dari Yamaha-Java, termasuk foto dan pengaturan website.
Data browser localStorage dari versi statis tidak otomatis digabungkan.

Java melayani halaman dari `web/`. Salinan frontend di root dan `build/` juga
sudah diperbarui saat migrasi ini. Untuk pengembangan berikutnya edit `web/`;
pengaturan konten sehari-hari dapat diubah melalui Pengaturan Dealer.
Gunakan http://localhost:8080, karena membuka file HTML langsung atau melalui
server statis Laragon tidak menyediakan API Java. Konfigurasi Sites lama tidak
menerbitkan backend Java ini; pembaruan ini hanya dijalankan secara lokal.

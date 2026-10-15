@echo off
setlocal
cd /d "%~dp0"
where java >nul 2>nul
if errorlevel 1 (
  echo Java 21 belum ditemukan. Pasang JDK 21 atau lebih baru.
  pause
  exit /b 1
)
where javac >nul 2>nul
if errorlevel 1 (
  echo javac belum ditemukan. Pastikan yang terpasang JDK, bukan hanya JRE.
  pause
  exit /b 1
)
if not exist out mkdir out
javac -encoding UTF-8 --release 21 --add-modules jdk.httpserver -d out src\Json.java src\NusaServer.java
if errorlevel 1 (
  echo Kompilasi gagal. Lihat pesan di atas.
  pause
  exit /b 1
)
set "NUSA_PORT=8080"
if not "%~1"=="" set "NUSA_PORT=%~1"
echo Buka http://localhost:%NUSA_PORT% di browser.
java --add-modules jdk.httpserver -cp "%~dp0out" NusaServer %NUSA_PORT%
pause

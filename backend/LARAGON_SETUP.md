# Database Setup untuk Laragon

Script ini akan mengatur database MySQL di Laragon secara otomatis.

## Prerequisites

1. **Laragon sudah terinstall dan berjalan**
2. **MySQL service aktif di Laragon**
3. **Node.js dependencies sudah terinstall**

## Quick Setup

1. Pastikan Laragon MySQL berjalan
2. Jalankan script setup:

```bash
cd backend
node setup_laragon_database.js
```

## Konfigurasi Default Laragon

- Host: `localhost`
- Port: `3306`
- Username: `root`
- Password: (kosong)
- Database: `musda1`

## Apa yang Dilakukan Script

### 1. Membuat Database
- Membuat database `musda1` jika belum ada
- Set charset: `utf8mb4` dan collation: `utf8mb4_unicode_ci`

### 2. Membuat Tabel
- `users` - User authentication
- `admins` - Admin management
- `guests` - Guest registration
- `countdown` - Event countdown
- `sponsors` - Sponsor management
- `agendas` - Event agenda
- `sph_content` - SPH page content
- `sph_settings` - SPH configuration
- `sph_participants` - SPH registrations
- `sph_payment_settings` - Payment configuration

### 3. Data Default
- Admin default: username `admin`, password `admin123`
- Countdown target: 31 Desember 2025
- SPH payment settings dengan harga Umum Rp 150.000 dan Mahasiswa Rp 100.000
- Sample agenda SPH
- SPH content untuk halaman

## Update File .env

Setelah menjalankan script, update file `.env` dengan:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=musda1
```

## Testing Koneksi

Test koneksi database:

```bash
node -e "const db = require('./src/utils/db'); db.execute('SELECT 1').then(() => console.log('✅ Database connected')).catch(err => console.error('❌ Error:', err.message))"
```

## Troubleshooting

### MySQL Service Tidak Berjalan
1. Buka Laragon
2. Klik "Start All" atau start MySQL service
3. Pastikan ikon MySQL hijau

### Port 3306 Digunakan
Jika port 3306 sudah digunakan aplikasi lain:
1. Stop aplikasi yang menggunakan port 3306
2. Atau ubah port MySQL di Laragon

### Permission Denied
Jika ada error permission:
1. Jalankan command prompt sebagai Administrator
2. Atau ubah permission folder project

## Manual Database Setup

Jika script otomatis gagal, jalankan SQL manual:

1. Buka phpMyAdmin di `http://localhost/phpmyadmin`
2. Import file SQL yang ada di folder `migrations/`
3. Atau copy-paste SQL dari script ke phpMyAdmin

## Verification

Setelah setup berhasil, verifikasi dengan:

1. **Cek tabel di phpMyAdmin**: `http://localhost/phpmyadmin`
2. **Test API**: Start backend dan test endpoint
3. **Check payment settings**: Akses `/api/sph-payment-settings/pricing`

## Contact

Jika ada masalah, pastikan:
- Laragon MySQL aktif
- Port 3306 tersedia
- Node.js terinstall
- Dependencies sudah di-install (`npm install`)
# 🚀 MUSDA Migration System (Laravel Style)

Migration system ini menggunakan Knex.js untuk mengelola database seperti di Laravel.

## 📋 **Perintah Migration Tersedia:**

### **Migration Commands:**
```bash
# Jalankan semua migration
npm run migrate

# Rollback migration terakhir
npm run migrate:rollback

# Reset semua migration dan jalankan ulang
npm run migrate:fresh

# Reset database dan isi dengan data sample
npm run db:fresh
```

### **Seeder Commands:**
```bash
# Jalankan semua seeder
npm run db:seed
```

## 🗃️ **Struktur Database:**

### **Tabel yang dibuat:**
1. **users** - Data user/admin
2. **admins** - Data admin khusus
3. **guests** - Data tamu/peserta
4. **agendas** - Agenda acara
5. **sponsors** - Data sponsor
6. **countdown** - Pengaturan countdown

## 🔑 **Login Credentials (Setelah Seeding):**

| Username   | Password      | Role        |
|------------|---------------|-------------|
| superadmin | superadmin123 | super_admin |
| admin      | admin123      | admin       |
| panitia    | panitia123    | moderator   |
| viewer     | viewer123     | viewer      |

## 📝 **Cara Menggunakan:**

### **Setup Database Baru:**
```bash
# 1. Pastikan database 'musda' sudah dibuat di MySQL
# 2. Jalankan migration untuk membuat tabel
npm run migrate

# 3. Isi dengan data sample
npm run db:seed
```

### **Reset Database (Fresh Install):**
```bash
# Reset semua dan isi ulang dengan data sample
npm run db:fresh
```

### **Membuat Migration Baru:**
```bash
# Buat file migration baru
npx knex migrate:make nama_migration

# Contoh: npx knex migrate:make create_news_table
```

### **Membuat Seeder Baru:**
```bash
# Buat file seeder baru
npx knex seed:make nama_seeder

# Contoh: npx knex seed:make news_seeder
```

## 🔧 **File Konfigurasi:**

- **knexfile.js** - Konfigurasi database dan migration
- **src/migrations/** - File-file migration
- **src/seeds/** - File-file seeder

## ⚠️ **Catatan Penting:**

1. Pastikan MySQL XAMPP sudah berjalan
2. Database `musda` harus sudah dibuat di phpMyAdmin
3. File `.env` harus berisi konfigurasi database yang benar
4. Gunakan `npm run db:fresh` untuk reset total database

## 🎯 **Workflow Development:**

1. **Development baru:** `npm run db:fresh`
2. **Update schema:** Buat migration baru → `npm run migrate`
3. **Update data:** Edit seeder → `npm run db:seed`
4. **Reset saat testing:** `npm run db:fresh`

Sekarang Anda punya sistem migration lengkap seperti Laravel! 🎉
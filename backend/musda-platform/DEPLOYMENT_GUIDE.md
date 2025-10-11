# 🚀 **PANDUAN DEPLOY GRATIS - MUSDA HIMPERRA**

## **Platform Hosting Gratis Terbaik:**
1. **Vercel** - Frontend & API (Recommended) ⭐⭐⭐⭐⭐
2. **Railway** - Database MySQL (Free tier) ⭐⭐⭐⭐
3. **Freenom** - Domain gratis (.tk, .ga, .cf) ⭐⭐⭐

---

## **🎯 LANGKAH 1: Setup Database Cloud (Railway)**

### **A. Daftar Railway**
1. Buka https://railway.app
2. Klik **"Start a New Project"**
3. Login dengan GitHub
4. Pilih **"Provision MySQL"**

### **B. Setup Database MySQL**
1. Setelah MySQL instance dibuat, klik **"Variables"**
2. Catat informasi ini:
   - `MYSQL_HOST`
   - `MYSQL_PORT` 
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

### **C. Import Database Schema**
1. Download MySQL Workbench atau phpMyAdmin
2. Connect ke Railway MySQL dengan kredensial di atas
3. Import file SQL ini:

```sql
-- Jalankan query ini di Railway MySQL
CREATE DATABASE IF NOT EXISTS musda_production;
USE musda_production;

-- Copy semua table dari database lokal musda1
-- Atau jalankan migration scripts yang sudah ada
```

---

## **🎯 LANGKAH 2: Deploy Backend ke Vercel**

### **A. Persiapan Repository GitHub**
```bash
# Di folder MUSDA utama
git init
git add .
git commit -m "Initial commit - MUSDA HIMPERRA"

# Buat repository di GitHub (musda-himperra)
git remote add origin https://github.com/USERNAME/musda-himperra.git
git push -u origin main
```

### **B. Deploy ke Vercel**
1. Buka https://vercel.com
2. Login dengan GitHub
3. Klik **"Import Project"**
4. Pilih repository **musda-himperra**
5. **Root Directory:** Kosongkan (root folder)
6. **Framework Preset:** Other
7. **Build Command:** `npm run build`
8. **Output Directory:** `frontend/dist`

### **C. Environment Variables di Vercel**
Di Vercel Dashboard > Project > Settings > Environment Variables:

```
NODE_ENV=production
DB_HOST=[Railway MySQL Host]
DB_USER=[Railway MySQL User] 
DB_PASSWORD=[Railway MySQL Password]
DB_NAME=[Railway MySQL Database]
DB_PORT=3306
JWT_SECRET=musda_super_secret_key_2024_himperra_lampung
FRONTEND_URL=https://[your-vercel-url].vercel.app
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/tmp/uploads
```

---

## **🎯 LANGKAH 3: Setup Domain Gratis**

### **A. Dapatkan Domain Gratis di Freenom**
1. Buka https://freenom.com
2. Cari domain yang diinginkan (contoh: `musdahimperra`)
3. Pilih ekstensi gratis: `.tk`, `.ga`, `.cf`, `.ml`
4. Checkout gratis (12 bulan)

### **B. Setup DNS di Freenom**
1. Login ke Freenom
2. My Domains > Manage Domain
3. Management Tools > Nameservers
4. Pilih **"Use custom nameservers"**
5. Masukkan Vercel nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

### **C. Setup Custom Domain di Vercel**
1. Vercel Dashboard > Project > Settings > Domains
2. Add Domain: `musdahimperra.tk` (domain freenom kamu)
3. Tunggu verifikasi DNS (5-60 menit)

---

## **🎯 LANGKAH 4: Update Konfigurasi untuk Production**

### **A. Update API Base URL**
Edit file `frontend/src/config.ts` atau tambahkan:

```typescript
// frontend/src/config/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-vercel-url.vercel.app/api'
  : 'http://localhost:5001/api';

export default API_BASE_URL;
```

### **B. Update semua fetch calls**
Ganti semua `http://localhost:5001/api` dengan `API_BASE_URL`:

```typescript
// Contoh di components
import API_BASE_URL from '../config/api';

const response = await fetch(`${API_BASE_URL}/gallery`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

---

## **🎯 LANGKAH 5: Testing & Go Live**

### **A. Test Functionality**
1. ✅ Registration form
2. ✅ Admin login
3. ✅ Gallery upload/delete
4. ✅ Agenda management
5. ✅ Poster/flyer system
6. ✅ QR scanner

### **B. Performance Optimization**
```bash
# Build frontend dengan optimisasi
cd frontend
npm run build

# Check bundle size
npm install -g bundlesize
bundlesize
```

---

## **🎯 ALTERNATIF HOSTING GRATIS**

### **Plan B: Netlify + Railway**
- **Frontend:** Netlify (https://netlify.com)
- **Backend:** Railway (Node.js deployment)
- **Database:** Railway MySQL

### **Plan C: GitHub Pages + Vercel API**
- **Frontend:** GitHub Pages (static only)
- **Backend:** Vercel Serverless Functions
- **Database:** PlanetScale (MySQL compatible)

---

## **💰 ESTIMASI BIAYA**

### **Gratis Selamanya:**
- ✅ Vercel: 100GB bandwidth/bulan
- ✅ Railway: $5 kredit gratis/bulan
- ✅ Freenom: Domain gratis 1 tahun
- ✅ Total: **$0/bulan** 

### **Upgrade Options (opsional):**
- Vercel Pro: $20/bulan (unlimited bandwidth)
- Railway Pro: $5/bulan (lebih resource)
- Domain .com: $10/tahun

---

## **🔧 TROUBLESHOOTING**

### **Error: Cannot find module**
```bash
# Install ulang dependencies
npm run install:all
```

### **Database Connection Error**
```bash
# Check environment variables di Vercel
# Pastikan DB credentials Railway benar
```

### **File Upload Error**
```javascript
// Vercel memiliki limit 5MB per request
// Pastikan MAX_FILE_SIZE <= 5242880 (5MB)
```

---

## **📞 SUPPORT**

Jika ada masalah deployment:
1. Check Vercel Function Logs
2. Check Railway Database Logs  
3. Test API endpoints langsung
4. Verify environment variables

**Ready to deploy? Let's go! 🚀**
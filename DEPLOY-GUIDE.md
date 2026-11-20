# 🚀 Panduan Deploy: GitHub → Vercel → Supabase

Panduan lengkap untuk push project undangan digital ke GitHub,
deploy otomatis di Vercel, dan menghubungkan ke Supabase Cloud Sync.

---

## 📋 BAGIAN 1: Push ke GitHub

### Step 1 — Install Git (jika belum)

```bash
# Cek apakah git sudah terinstall
git --version

# Jika belum, install:
# Windows: download dari https://git-scm.com/download/win
# Mac:     brew install git
# Linux:   sudo apt install git
```

### Step 2 — Buat Repository Baru di GitHub

1. Buka **https://github.com/new**
2. Isi nama repository, contoh: `undangan-iwan-ica`
3. Pilih **Public** atau **Private**
4. ⚠️ **JANGAN** centang "Add a README file"
5. ⚠️ **JANGAN** centang "Add .gitignore"
6. Klik **Create repository**
7. Salin URL repository (contoh: `https://github.com/USERNAME/undangan-iwan-ica.git`)

### Step 3 — Buat file `.gitignore`

```bash
# Jalankan di folder project
cat > .gitignore << 'EOF'
node_modules
dist
.DS_Store
*.local
.env
.env.local
.env.production
EOF
```

### Step 4 — Inisialisasi Git & Push

```bash
# 1. Masuk ke folder project
cd /path/to/project-undangan

# 2. Inisialisasi git
git init

# 3. Tambahkan semua file
git add .

# 4. Commit pertama
git commit -m "🎉 Initial commit: Undangan Digital Iwan & Ica"

# 5. Rename branch ke main
git branch -M main

# 6. Tambahkan remote (GANTI dengan URL repo Anda)
git remote add origin https://github.com/USERNAME/undangan-iwan-ica.git

# 7. Push ke GitHub
git push -u origin main
```

### Step 5 — Jika diminta login GitHub

```bash
# Opsi A: Pakai Personal Access Token (PAT)
# 1. Buka https://github.com/settings/tokens
# 2. Klik "Generate new token (classic)"
# 3. Centang scope "repo"
# 4. Copy token
# 5. Saat diminta password, paste token (bukan password GitHub)

# Opsi B: Pakai GitHub CLI
brew install gh        # atau: winget install GitHub.cli
gh auth login          # ikuti instruksi
git push -u origin main
```

### Step 6 — Verifikasi

Buka `https://github.com/USERNAME/undangan-iwan-ica` di browser.
Pastikan semua file sudah terupload.

---

## 📋 BAGIAN 2: Deploy ke Vercel (Gratis)

### Step 1 — Daftar & Hubungkan

1. Buka **https://vercel.com** → Sign Up with GitHub
2. Klik **"Add New Project"**
3. Pilih repository `undangan-iwan-ica`
4. Framework Preset: **Vite**
5. Klik **Deploy**
6. Tunggu 1-2 menit → dapat URL seperti `undangan-iwan-ica.vercel.app`

### Step 2 — Custom Domain (Opsional)

1. Di dashboard Vercel → project → **Settings** → **Domains**
2. Ketik domain Anda, contoh: `undangan.iwandanica.com`
3. Ikuti instruksi DNS yang muncul (tambah CNAME di panel domain Anda)

### Step 3 — Auto Deploy

Setiap kali Anda `git push`, Vercel otomatis rebuild & deploy ulang.

```bash
# Contoh update dan push ulang:
git add .
git commit -m "✏️ Update data pasangan"
git push
# → Vercel otomatis deploy ulang dalam 1-2 menit
```

---

## 📋 BAGIAN 3: Setup Supabase Cloud Sync

### Step 1 — Buat Project Supabase

1. Buka **https://app.supabase.com** → Sign Up (gratis)
2. Klik **"New Project"**
3. Isi nama project, contoh: `undangan-digital`
4. Pilih region terdekat: **Southeast Asia (Singapore)**
5. Set database password (catat, tapi tidak dipakai di sini)
6. Klik **Create new project** → tunggu ~2 menit

### Step 2 — Catat Credentials

1. Buka **Project Settings** → **API**
2. Salin:
   - **Project URL**: `https://xxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJ...` (yang panjang)

### Step 3 — Buat Storage Bucket

1. Di sidebar kiri, klik **Storage**
2. Klik **"New bucket"**
3. Nama bucket: `invite` (huruf kecil, persis)
4. ✅ Aktifkan toggle **"Public bucket"**
5. Klik **Create bucket**

### Step 4 — Tambahkan RLS Policy (Wajib!)

1. Di sidebar kiri, klik **SQL Editor**
2. Klik **"New query"**
3. Paste SQL berikut:

```sql
-- Policy BACA (tamu bisa baca file)
CREATE POLICY "allow_read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'invite');

-- Policy TULIS (admin bisa upload)
CREATE POLICY "allow_insert" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'invite');

-- Policy UPDATE (admin bisa timpa file)
CREATE POLICY "allow_update" ON storage.objects
  FOR UPDATE TO anon
  USING (bucket_id = 'invite');

-- Policy HAPUS (admin bisa hapus file)
CREATE POLICY "allow_delete" ON storage.objects
  FOR DELETE TO anon
  USING (bucket_id = 'invite');
```

4. Klik **Run** → pastikan "Success. No rows returned"

### Step 5 — Hubungkan di Admin Panel

1. Buka undangan Anda: `https://undangan-iwan-ica.vercel.app/#admin`
2. Masukkan PIN: `140626`
3. Buka tab **☁ Cloud Sync**
4. Isi:
   - **Project URL**: `https://xxxxxxxxxxx.supabase.co`
   - **Bucket Name**: `invite`
   - **Anon Public Key**: `eyJhbGciOiJ...`
5. Klik **Simpan Config**
6. Klik **Uji Koneksi** → harus muncul "✓ Koneksi berhasil!"
7. Klik **⬆ Push ke Cloud** → semua data terupload

---

## 📋 BAGIAN 4: Kirim Undangan ke Tamu

### Step 1 — Tambah Daftar Tamu

1. Buka **Admin Panel** → tab **📋 Tamu**
2. Ketik nama & no. WhatsApp → klik **+ Tambah**
3. Atau **⬆ Import XLSX** untuk import massal dari Excel

### Step 2 — Kirim via WhatsApp

1. Di daftar tamu, klik **Kirim WA** di sebelah nama
2. WhatsApp terbuka otomatis dengan pesan lengkap + link personal
3. Status berubah menjadi **"Terkirim"**

### Step 3 — Format Link Tamu

Setiap tamu mendapat link unik:
```
https://undangan-iwan-ica.vercel.app?to=Budi+Santoso&c=xxxxxxxxxxx
```

- `?to=Nama` → nama tamu tampil di kartu "Kepada Yth."
- `&c=ref`   → auto-sync data dari Supabase

---

## 📋 BAGIAN 5: Update Rutin

### Alur kerja sehari-hari:

```bash
# 1. Edit kode di komputer
# 2. Test lokal
npm run dev

# 3. Kalau sudah bagus, push ke GitHub
git add .
git commit -m "✏️ deskripsi perubahan"
git push

# 4. Vercel otomatis deploy ulang (1-2 menit)
# 5. Buka Admin Panel → Push ke Cloud (kalau ada perubahan data)
```

### Kalau hanya ubah data (bukan kode):

Cukup buka **Admin Panel** di browser → edit → klik **Simpan & Sync**.
Tidak perlu push ke GitHub — data tersimpan di Supabase.

---

## 🔧 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `git push` ditolak | Pastikan sudah `git pull` dulu, atau `git push --force` (hati-hati) |
| Vercel build gagal | Cek log di dashboard Vercel → biasanya error TypeScript |
| Supabase 403 | Jalankan ulang 4 SQL policy di Step 4 |
| Bucket not found | Pastikan nama bucket persis `invite` (huruf kecil) |
| Cloud sync gagal | Project Supabase mungkin "paused" — resume di dashboard |
| Ucapan tamu hilang | Klik **⬇ Pull dari Cloud** di tab Ucapan admin |

---

## 📁 Struktur File Penting

```
├── src/
│   ├── App.tsx                  ← Router utama (#admin vs undangan)
│   ├── lib/
│   │   ├── adminSettings.ts     ← Config admin (toggle, data pasangan)
│   │   ├── cloud.ts             ← Push/Pull ke Supabase Storage
│   │   ├── cloudConfig.ts       ← URL, bucket, anonKey
│   │   ├── guestBook.ts         ← Daftar tamu + template WA
│   │   ├── wishes.ts            ← Ucapan/RSVP store
│   │   └── music.ts             ← Musik latar (Web Audio)
│   ├── pages/
│   │   ├── AdminLogin.tsx       ← Halaman PIN
│   │   ├── AdminPage.tsx        ← Layout admin + tabs
│   │   └── admin/
│   │       ├── TabCloud.tsx     ← Setup Supabase
│   │       ├── TabSettings.tsx  ← Edit data pasangan
│   │       ├── TabSections.tsx  ← Toggle section ON/OFF
│   │       ├── TabGifts.tsx     ← Kelola rekening
│   │       ├── TabWishes.tsx    ← Kelola ucapan
│   │       └── TabGuests.tsx    ← Daftar tamu + kirim WA
│   └── sections/                ← Section-section undangan
├── index.html
├── package.json
├── vite.config.ts
└── DEPLOY-GUIDE.md              ← File ini
```

---

**Selamat! 🎉 Undangan digital Anda siap online.**

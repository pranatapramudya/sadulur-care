# 🏥 Sadulur Care (Smart-Nursing) - Frontend Web & Mobile APK

**Sadulur Care** adalah aplikasi pemantauan pasien dan perawatan pasca-operasi modern berstandar _enterprise_. Sistem ini menyediakan antarmuka _real-time_ yang mulus untuk pasien (melalui Native Android APK) dan tenaga medis profesional (melalui Web Dashboard yang aman).

_Catatan: Repositori ini berisi antarmuka UI Frontend dan Capacitor Mobile Engine. Backend API (PostgreSQL + Prisma) dikelola pada repositori terpisah._

## 🛠️ Tumpukan Teknologi Modern (Tech Stack)

- **Framework:** Next.js 15+ (App Router)
- **Bahasa:** TypeScript (Strict Type Safety)
- **Mobile Engine:** Capacitor JS (Integrasi Web ke Native Android APK)
- **Styling:** Tailwind CSS 4.0
- **Autentikasi:** Clerk React / Next.js dengan **Role-Based Access Control (RBAC)**
- **Ikon & UI:** Lucide React
- **Plugin Native:** `@capacitor/share` (Untuk fitur berbagi dokumen bawaan HP)

## ✨ Fitur Utama & Kapabilitas

### 📱 Aplikasi Mobile Pasien (Android APK)

- **Pengalaman Native:** Dukungan layar penuh (_Notch support_) dan gestur _Smart Swipe-to-Go-Back_.
- **Tele-Monitoring Harian:** Formulir _Check-in_ interaktif (Skala Nyeri 1-10, Indikator Demam, Pelacak Minum Obat, dan Catatan Keluhan).
- **Kartu Pasien Digital (RM 14):** Pembuatan Med-ID unik secara otomatis (cth: `MED-3DO5EV`) dengan integrasi _Dynamic QR Code_.
- **Berbagi Dokumen Native:** Terintegrasi dengan fitur _Share_ bawaan Android untuk menyimpan atau membagikan dokumen PDF RM 14 secara praktis.
- **Portal Edukasi:** Pusat informasi untuk panduan video perawatan pasca-operasi dan artikel kesehatan.

### 💻 Dashboard Tenaga Medis (Admin / Perawat)

- **Keamanan RBAC Ketat:** Rute admin dilindungi secara ketat menggunakan _Public Metadata_ Clerk (`role: "NURSE"`). Akses yang tidak sah akan langsung dialihkan (_redirect_).
- **Analitik Real-Time:** _Dashboard_ yang menampilkan total _check-in_, rata-rata skala nyeri, dan kondisi pasien kritis.
- **Monitoring Pasien Langsung:** Tabel data dinamis yang menerima sinyal _check-in_ secara _real-time_ dari perangkat pasien.
- **Manajemen Ringkasan Pulang (RM 14):** Formulir digital komprehensif bagi dokter/perawat untuk memasukkan diagnosa akhir, batasan diet, tanggal kontrol, dan aturan minum obat.
- **Evaluasi Gizi:** Melacak dan mengevaluasi pemahaman pasien terhadap batasan diet mereka setelah pulang dari rumah sakit.

## 🔒 Arsitektur Keamanan

- **Identity as a Service:** Autentikasi data sensitif ditangani sepenuhnya oleh infrastruktur keamanan Clerk.
- **Route Guards:** Penggunaan _Middleware_ Next.js dan pelindung rute tingkat _Layout_ untuk mencegah akses rute yang tidak sah.
- **Proteksi JWT:** Semua permintaan API keluar ditandatangani dengan _Bearer Tokens_ untuk verifikasi di sisi _Backend_.

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Instalasi

_Clone_ repositori ini dan instal dependensi yang dibutuhkan:

```bash
npm install
```

2. Pengaturan Environment
   Buat file .env.local di direktori root. Anda akan membutuhkan kunci API Clerk dan URL absolut untuk Backend API Anda.
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Tautan ke deployment Vercel Backend yang terpisah

NEXT_PUBLIC_API_URL=[https://sadulur-api.vercel.app](https://sadulur-api.vercel.app)

3. Menjalankan Versi Web (Development)
   Mulai server development Next.js:
   npm run dev

4. Build untuk Android (Capacitor)
   Untuk membuat, menyinkronkan, atau memperbarui Native Android APK, jalankan perintah berikut:
   npm run build
   npx cap sync android
   npx cap open android
   (Pastikan Android Studio Anda dikonfigurasi untuk menargetkan Android API Level 28+ dan local.properties diatur dengan benar mengarah ke Android SDK lokal Anda).

📁 Struktur Direktori
/app - Next.js App Router (Termasuk rute terlindungi /(admin) dan rute pasien /(dashboard)).

/components - Komponen UI yang dapat digunakan kembali (Navbar, Sidebar, Modals).

/android - Kode sumber Native Android yang dihasilkan oleh Capacitor (Diabaikan di Git, di-generate secara lokal).

🛡️ Lisensi
Perangkat Lunak Proprietary. Dikembangkan secara khusus untuk Sistem Medis Sadulur Care. Dilarang keras menyalin atau mendistribusikan tanpa izin.

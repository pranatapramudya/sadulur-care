"use client";

import {
  QrCode,
  Calendar,
  Activity,
  ChevronRight,
  Home,
  Pill,
  CalendarCheck,
  BookOpen,
  User as UserIcon,
  Bell,
  X,
  Thermometer,
  Stethoscope,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  MessageSquare,
  MessageCircle,
  PhoneCall,
} from "lucide-react";
import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ScheduleData {
  id: string;
  date: string;
  status: string;
  department?: string;
}

interface CheckinData {
  id: string;
  date: string;
  adminReply?: string;
  emergencyContact?: string;
}

export default function PatientDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [jadwalTerdekat, setJadwalTerdekat] = useState<ScheduleData | null>(null);

  // === STATE FINAL BOSS: PESAN BALASAN CHAT ===
  const [latestReply, setLatestReply] = useState<CheckinData | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isEmptyMessageOpen, setIsEmptyMessageOpen] = useState(false);

  // STATE KHUSUS CHECK-IN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [painScale, setPainScale] = useState(5);
  const [hasFever, setHasFever] = useState(false);
  const [tookMedicine, setTookMedicine] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ symptoms?: string }>({});

  // Redirect kalau belum login
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/");
    }
  }, [isLoaded, isSignedIn]);

  // FUNGSI NARIK DATA JADWAL & PESAN BALASAN DARI BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();

        // 1. Tarik Jadwal (Kodingan asli lu)
        const resJadwal = await fetch(
          "https://sadulur-api.vercel.app/api/kontrol",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resJadwal.ok) {
          const data = await resJadwal.json();
          const sekarang = new Date();
          const mendatang = data.filter(
            (j: ScheduleData) =>
              new Date(j.date) >= sekarang || j.status === "SCHEDULED",
          );
          if (mendatang.length > 0) {
            setJadwalTerdekat(mendatang[0]);
          }
        }

        // 2. Tarik Riwayat Check-in Buat Nyari Pesan Balasan (TAMBAHAN BARU)
        const resCheckin = await fetch(
          "https://sadulur-api.vercel.app/api/checkin",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resCheckin.ok) {
          const dataCheckin = await resCheckin.json();
          // Cari checkin yang field 'adminReply'-nya udah keisi
          const repliedCheckins = dataCheckin.filter((c: CheckinData) => c.adminReply);
          if (repliedCheckins.length > 0) {
            // Ambil pesan yang paling baru (diurutkan berdasarkan tanggal)
            repliedCheckins.sort(
              (a: CheckinData, b: CheckinData) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            setLatestReply(repliedCheckins[0]);
          }
        }
      } catch (e) {
        console.error("Gagal narik data beranda:", e);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchData();
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans antialiased">
        <div className="w-full max-w-md flex items-center justify-center bg-slate-50 shadow-2xl">
          <p className="text-teal-600 font-bold text-lg animate-pulse">
            Memuat Data Pasien...
          </p>
        </div>
      </div>
    );
  }

  // === TRIK NINJA: Tarik data langsung dari session Clerk ===
  // Karena saat perawat bikin akun, ID Medis disimpen di lastName!
  const namaPanggilan = user?.firstName || "Pasien";
  const idMedis = user?.lastName || "Menunggu Data...";

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Inline
    const errors: { symptoms?: string } = {};
    if (!symptoms.trim()) {
      errors.symptoms = "Keluhan Lain wajib diisi.";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const token = await getToken();

      // TARUH LINK LENGKAPNYA DI SINI BRE:
      const response = await fetch(
        "https://sadulur-api.vercel.app/api/checkin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            painScale,
            hasFever,
            tookMedicine,
            symptoms,
            patientId: idMedis, // <--- Pastikan ini jangan sampai ketinggalan!
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal mengirim data ke server");
      }

      setIsSubmitting(false);
      setIsModalOpen(false);
      setIsSuccessOpen(true);
      setPainScale(5);
      setHasFever(false);
      setTookMedicine(false);
      setSymptoms("");
      setFormErrors({});
    } catch (error: unknown) {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghubungi server");
      setIsErrorOpen(true);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans antialiased text-slate-900">
      <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen relative pb-28 shadow-2xl overflow-x-hidden">
        {/* Header */}
        <header className="bg-teal-600 px-6 pt-8 pb-6 rounded-b-[2rem] shadow-md sticky top-0 z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="bg-white/25 p-2 rounded-xl backdrop-blur-sm shadow-sm">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-teal-50 font-extrabold text-sm tracking-widest uppercase opacity-95">
              Sadulur
            </span>
          </div>

          <div className="flex justify-between items-center text-white mt-2">
            <div>
              <p className="text-teal-100 text-sm font-semibold mb-0.5">
                Selamat Datang,
              </p>
              <h1 className="text-2xl font-black tracking-tight capitalize">
                {namaPanggilan}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* 🚀 TOMBOL PESAN DENGAN NOTIF KEDAP-KEDIP */}
              <button
                onClick={() =>
                  latestReply
                    ? setIsReplyModalOpen(true)
                    : setIsEmptyMessageOpen(true)
                }
                className="relative p-2 bg-white/20 rounded-full backdrop-blur-sm shadow-inner transform transition hover:bg-white/30 active:scale-95"
              >
                <MessageSquare size={22} className="text-white" />
                {latestReply && (
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                  </span>
                )}
              </button>
              <div className="flex items-center justify-center bg-white/20 rounded-full p-1.5 backdrop-blur-sm shadow-inner transform transition hover:bg-white/30 active:scale-95">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-5 -mt-4 relative z-20">
          {/* 1. LINK MENUJU KARTU PASIEN RM 14 */}
          <Link
            href="/dashboard/kartu-pasien"
            className="block bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
                  <QrCode size={28} />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-800 text-lg">
                    Kartu Pasien (RM 14)
                  </h2>
                  <p className="text-xs font-mono text-slate-500 font-bold mt-0.5 uppercase tracking-wider">
                    {idMedis}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 w-6 h-6" />
            </div>
          </Link>

          {/* ======================================================== */}
          {/* 2. BANNER CHECK-IN HARIAN (NAIK KE ATAS SINI BRE)        */}
          {/* ======================================================== */}
          <section className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity size={110} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <Activity size={22} className="text-teal-200" />
                <h2 className="font-bold text-xl tracking-tight">
                  Check-in Harian
                </h2>
              </div>
              <p className="text-teal-50 text-sm mb-5 pr-4 leading-relaxed font-medium">
                Bagaimana kondisi pemulihanmu hari ini? Catat untuk dipantau
                perawat.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-teal-700 hover:bg-teal-50 px-6 py-3.5 rounded-xl font-extrabold w-full shadow-md transition-colors text-base active:scale-95"
              >
                Kondisi Anda Saat Ini?
              </button>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 3. BANNER MENUJU KUIS GIZI (TURUN KE BAWAH SINI)         */}
          {/* ======================================================== */}
          <section
            style={{ backgroundColor: "#0d9488" }}
            className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit size={110} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <BrainCircuit size={22} className="text-teal-100" />
                <h2 className="font-bold text-xl tracking-tight">
                  Evaluasi Quis
                </h2>
              </div>
              <p className="text-teal-50 text-sm mb-5 pr-4 leading-relaxed font-medium">
                Sudah paham anjuran diet dari perawat? Yuk tes pengetahuanmu dan
                dapatkan skor terbaik!
              </p>
              <Link
                href="/dashboard/kuis"
                className="block text-center bg-white text-teal-700 hover:bg-teal-50 px-6 py-3.5 rounded-xl font-extrabold w-full shadow-md transition-colors text-base active:scale-95"
              >
                Mulai Kuis Sekarang
              </Link>
            </div>
          </section>

          {/* 4. JADWAL BERIKUTNYA */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Calendar size={20} className="text-teal-600" /> Jadwal
                Berikutnya
              </h2>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  {jadwalTerdekat
                    ? jadwalTerdekat.department || "Poli Umum"
                    : "Kontrol Rutin"}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  {jadwalTerdekat
                    ? new Date(jadwalTerdekat.date).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" },
                      )
                    : "Belum Ada Jadwal"}
                </p>
              </div>
              <div className="bg-slate-200 text-slate-600 text-xs font-black px-3 py-1.5 rounded-lg">
                {jadwalTerdekat
                  ? new Date(jadwalTerdekat.date).toLocaleTimeString("id-ID", {
                      timeZone: "Asia/Jakarta",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </div>
            </div>
          </section>
        </main>

        {/* Navigasi Bawah */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-white border-t border-slate-100 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 px-2 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] rounded-t-3xl">
          <div className="flex justify-between items-end pb-3 px-4">
            <button className="flex flex-col items-center gap-1.5 text-teal-600 w-14 group -mt-7">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3.5 rounded-full shadow-[0_8px_20px_rgba(13,148,136,0.4)] text-white transform transition active:scale-95 border-[4px] border-white">
                <Home size={24} strokeWidth={2.5} className="fill-white/20" />
              </div>
              <span className="text-[11px] font-extrabold text-teal-700">
                Beranda
              </span>
            </button>

            <Link
              href="/dashboard/obat"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors w-14 active:scale-95 pb-1"
            >
              <div className="p-1 rounded-xl hover:bg-teal-50 transition-colors">
                <Pill size={24} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold">Obat</span>
            </Link>

            <Link
              href="/dashboard/kontrol"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors w-14 active:scale-95 pb-1"
            >
              <div className="p-1 rounded-xl hover:bg-teal-50 transition-colors">
                <CalendarCheck size={24} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold">Kontrol</span>
            </Link>

            <Link
              href="/dashboard/edukasi"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors w-14 active:scale-95 pb-1"
            >
              <div className="p-1 rounded-xl hover:bg-teal-50 transition-colors">
                <BookOpen size={24} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold">Edukasi</span>
            </Link>

            <Link
              href="/dashboard/profil"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors w-14 active:scale-95 pb-1"
            >
              <div className="p-1 rounded-xl hover:bg-teal-50 transition-colors">
                <UserIcon size={24} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold">Profil</span>
            </Link>
          </div>
        </nav>

        {/* MODAL FORM CHECK-IN */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">
              <div className="bg-teal-600 p-5 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-teal-200" />
                  <h3 className="font-extrabold text-lg">Form Check-in</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmitCheckIn} className="p-6 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                    <Activity size={16} className="text-teal-600" />
                    Skala Nyeri (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={painScale}
                    onChange={(e) => setPainScale(Number(e.target.value))}
                    className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-2 px-1">
                    <span>1 (Ringan)</span>
                    <span className="text-teal-600 text-lg">{painScale}</span>
                    <span>10 (Berat)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                      <Thermometer size={14} className="text-orange-500" /> Ada
                      Demam?
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setHasFever(true)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${hasFever ? "bg-orange-500 text-white shadow-md" : "bg-slate-200 text-slate-500"}`}
                      >
                        Ya
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasFever(false)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${!hasFever ? "bg-teal-600 text-white shadow-md" : "bg-slate-200 text-slate-500"}`}
                      >
                        Tidak
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                      <Pill size={14} className="text-teal-500" /> Minum Obat?
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTookMedicine(true)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${tookMedicine ? "bg-teal-600 text-white shadow-md" : "bg-slate-200 text-slate-500"}`}
                      >
                        Sudah
                      </button>
                      <button
                        type="button"
                        onClick={() => setTookMedicine(false)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${!tookMedicine ? "bg-orange-500 text-white shadow-md" : "bg-slate-200 text-slate-500"}`}
                      >
                        Belum
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                    <Stethoscope size={16} className="text-teal-600" /> Keluhan
                    Lain
                  </label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Contoh: Mual, pusing, dsb..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none font-medium"
                  ></textarea>
                  {formErrors.symptoms && (
                    <p className="text-red-500 text-xs font-bold mt-1.5">{formErrors.symptoms}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Data Check-in"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL SUKSES CHECKIN */}
        {isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-8 shadow-inner border-4 border-white ring-8 ring-teal-50">
                <CheckCircle2 size={64} className="text-teal-600" />
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">
                Terkirim!
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium px-2">
                Data kondisimu terkirim! Silakan tunggu konfirmasi dan instruksi
                resep obat dari perawat kami.
              </p>
              <button
                onClick={() => setIsSuccessOpen(false)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-4 rounded-2xl shadow-lg active:scale-95 transition-all transform"
              >
                OKE, MENGERTI
              </button>
            </div>
          </div>
        )}

        {/* MODAL ERROR CHECKIN */}
        {isErrorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 shadow-inner border-4 border-white ring-8 ring-red-50">
                <XCircle size={64} className="text-red-500 animate-pulse" />
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">
                Waduh, Gagal!
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium px-2">
                {errorMessage}
              </p>
              <button
                onClick={() => setIsErrorOpen(false)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-4 rounded-2xl shadow-lg active:scale-95 transition-all transform"
              >
                TUTUP & COBA LAGI
              </button>
            </div>
          </div>
        )}
      </div>
      {/* 🚀 MODAL FINAL BOSS: BACA PESAN BALASAN (GAYA BOTTOM SHEET MODERN) */}
      {isReplyModalOpen && latestReply && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsReplyModalOpen(false)} // Klik area luar buat tutup
        >
          {/* Kontainer Sheet (Meluncur dari bawah) */}
          <div
            className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl overflow-hidden animate-slide-up-bottom p-1"
            onClick={(e) => e.stopPropagation()} // Biar gak tutup kalo klik dalem sheet
          >
            {/* Handle Visual di Atas (Ciri khas Mobile Sheet) */}
            <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2"></div>

            {/* Header Sheet (Lebih Bersih) */}
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Respon Medis
                  </h3>
                  <p className="text-[11px] text-slate-400 font-bold -mt-0.5">
                    Dari Dokter / Perawat Sadulur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* Isi Pesan (Gaya Quote Modern) */}
            <div className="p-7 space-y-6">
              <div className="relative bg-slate-50 p-6 rounded-3xl border border-slate-100/50 shadow-inner">
                {/* Ikon Kutip Hiasan */}
                <span className="absolute -top-3 -left-1 text-5xl text-teal-200 font-serif opacity-70">
                  “
                </span>
                <p className="text-sm text-slate-800 font-semibold leading-relaxed italic relative z-10 px-2">
                  {latestReply.adminReply}
                </p>
              </div>

              {/* Bagian Darurat (Kalo Ada) */}
              {latestReply.emergencyContact && (
                <div className="space-y-4 pt-2 mt-4 border-t border-slate-100/50">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-rose-500 animate-pulse"></span>
                    Kontak Darurat
                  </p>

                  {/* Tombol Hubungi WA/Telp Modern (Vibrant Gradient) */}
                  <a
                    href={`https://wa.me/${latestReply.emergencyContact.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-16 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all flex justify-center items-center gap-3 group"
                  >
                    <div className="p-2.5 bg-white/20 rounded-full group-hover:rotate-12 transition-transform">
                      <PhoneCall size={20} className="animate-pulse" />
                    </div>
                    <span className="text-base">Hubungi Sekarang</span>
                  </a>
                </div>
              )}

              {/* Tombol Tutup (Modern Outline) */}
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="w-full bg-white hover:bg-slate-50 text-slate-500 font-extrabold py-4 rounded-xl transition-all mt-4 border border-slate-200 active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================
            MODAL POP-UP: BELUM ADA PESAN
            ========================================= */}
      {isEmptyMessageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center animate-slide-up overflow-hidden">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white ring-8 ring-teal-50">
              <MessageCircle size={40} className="text-teal-600" />
            </div>
            <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">
              Belum Ada Pesan
            </h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium px-2">
              Dokter atau perawat belum memberikan balasan terkait kondisimu.
              Silakan cek kembali nanti ya!
            </p>
            <button
              onClick={() => setIsEmptyMessageOpen(false)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              OKE, MENGERTI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Home,
  Pill,
  CalendarCheck,
  BookOpen,
  User as UserIcon,
  ChevronLeft,
  Info,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

interface Appointment {
  id: string;
  date: string;
  department: string | null;
  doctorName: string | null;
  location: string | null;
  notes: string | null;
  status: string;
}

export default function KontrolPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [jadwal, setJadwal] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // === STATE UNTUK POPUP KEREN ===
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // === FETCH DATA DARI BACKEND LOKAL (Sesuai route.ts lu) ===
  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          "https://sadulur-api.vercel.app/api/kontrol",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) throw new Error("Gagal mengambil data jadwal");
        const data = await response.json();
        setJadwal(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && isSignedIn) fetchJadwal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  const sekarang = new Date();
  const jadwalMendatang = jadwal.filter(
    (j) => new Date(j.date) >= sekarang || j.status === "SCHEDULED",
  );
  const riwayatKontrol = jadwal.filter(
    (j) => new Date(j.date) < sekarang && j.status !== "SCHEDULED",
  );

  const getBulan = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", { month: "short" });
  const getTanggal = (dateStr: string) => new Date(dateStr).getDate();
  const getJam = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });
  const getFullDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans antialiased text-slate-900">
      <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen relative pb-28 shadow-2xl overflow-x-hidden">
        {/* Header */}
        <header className="bg-teal-600 px-6 pt-8 pb-6 rounded-b-[2rem] shadow-md sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4 text-white">
            <Link
              href="/dashboard"
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition active:scale-95"
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="font-extrabold text-sm tracking-widest uppercase opacity-95">
              Jadwal Kontrol
            </span>
            <div className="w-9"></div>
          </div>
          <div className="mt-2 text-white">
            <h1 className="text-2xl font-black tracking-tight mb-1">
              Agenda Medis 📅
            </h1>
            <p className="text-teal-100 text-sm font-medium">
              Cek jadwal kontrol rutinmu di sini.
            </p>
          </div>
        </header>

        {/* Konten Utama */}
        <main className="p-6 space-y-6 -mt-2 relative z-20">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <Loader2 className="animate-spin text-teal-600 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-500">
                Menarik data jadwal...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-xl text-red-600 text-center text-sm font-bold">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div>
                <h2 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2">
                  <CalendarIcon size={18} className="text-teal-600" /> Jadwal
                  Mendatang
                </h2>

                {jadwalMendatang.length > 0 ? (
                  jadwalMendatang.map((item) => (
                    <section
                      key={item.id}
                      className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-5 shadow-md border border-teal-100 relative overflow-hidden mb-4"
                    >
                      <div className="absolute top-0 right-0 w-2 h-full bg-teal-500"></div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-w-[60px]">
                          <span className="text-xs font-bold text-slate-400 uppercase">
                            {getBulan(item.date)}
                          </span>
                          <span className="text-2xl font-black text-teal-600">
                            {getTanggal(item.date)}
                          </span>
                        </div>
                        <div className="bg-teal-100 text-teal-800 text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase">
                          {item.status === "SCHEDULED"
                            ? "Terkonfirmasi"
                            : item.status}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-lg mb-1">
                        {item.department || "Poli Umum"}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 mb-4">
                        {item.doctorName || "Dokter Jaga"}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <Clock size={16} className="text-teal-500" /> Pukul{" "}
                          {getJam(item.date)} WIB
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <MapPin size={16} className="text-teal-500" />{" "}
                            {item.location}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-teal-100/50">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setModalMessage(
                              "Jadwal kehadiranmu sudah tercatat di sistem admin klinik.",
                            );
                            setIsSuccessOpen(true);
                          }}
                          className="w-full bg-slate-900 text-white text-sm font-bold py-3 rounded-xl shadow-sm hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CalendarCheck size={16} /> Jadwal Aktif
                        </button>
                      </div>
                    </section>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
                    <CalendarIcon
                      size={40}
                      className="text-slate-300 mx-auto mb-3"
                    />
                    <p className="text-slate-500 font-bold text-sm">
                      Belum ada jadwal kontrol mendatang.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-extrabold text-slate-800 text-base mb-3 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" /> Riwayat Kontrol
                </h2>

                <div className="space-y-3">
                  {riwayatKontrol.length > 0 ? (
                    riwayatKontrol.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 opacity-70"
                      >
                        <div className="bg-slate-100 p-3 rounded-xl text-slate-500">
                          <CalendarIcon size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-700 text-sm">
                            {item.department || "Poli Umum"}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getFullDate(item.date)} •{" "}
                            {item.status === "COMPLETED"
                              ? "Selesai"
                              : item.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-400 font-bold text-sm">
                        Belum ada riwayat kontrol yang lewat.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start mt-4 mb-8">
            <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-blue-800 leading-relaxed">
              Mohon bawa KTP, Kartu Pasien, dan hasil lab terakhir saat kontrol
              berikutnya. Datang 15 menit lebih awal.
            </p>
          </div>
        </main>

        {/* MODAL SUKSES */}
        {isSuccessOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-8 shadow-inner border-4 border-white ring-8 ring-teal-50">
                <CheckCircle2 size={64} className="text-teal-500" />
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">
                Sukses!
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium px-2">
                {modalMessage}
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

        {/* Navigasi Bawah */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg bg-white border-t border-slate-100 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 px-2 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] rounded-t-3xl">
          <div className="flex justify-between items-end pb-3 px-4">
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors w-14 active:scale-95 pb-1"
            >
              <div className="p-1 rounded-xl hover:bg-teal-50 transition-colors">
                <Home size={24} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold">Beranda</span>
            </Link>
            <Link
              href="/dashboard/obat"
              className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-teal-600 transition-colors w-14 active:scale-95 pb-1"
            >
              <div className="p-1 rounded-xl hover:bg-teal-50 transition-colors">
                <Pill size={24} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold">Obat</span>
            </Link>
            <button className="flex flex-col items-center gap-1.5 text-teal-600 w-14 group -mt-7">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3.5 rounded-full shadow-[0_8px_20px_rgba(13,148,136,0.4)] text-white transform transition active:scale-95 border-[4px] border-white">
                <CalendarCheck
                  size={24}
                  strokeWidth={2.5}
                  className="fill-white/20"
                />
              </div>
              <span className="text-[11px] font-extrabold text-teal-700">
                Kontrol
              </span>
            </button>
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
      </div>
    </div>
  );
}

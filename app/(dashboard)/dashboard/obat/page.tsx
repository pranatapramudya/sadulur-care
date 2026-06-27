"use client";

import { useState, useEffect } from "react";
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  CalendarCheck,
  BookOpen,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Loader2,
  CalendarDays,
  Check,
  FileText,
  Activity,
  XCircle,
} from "lucide-react";
import Link from "next/link";
// 🚀 Tambahin useUser di sini buat ngambil patientId
import { useAuth, useUser } from "@clerk/nextjs";

interface Obat {
  id: string;
  name: string;
  rules: string;
  dosage?: string | null;
  timeToTake?: string | null;
  isTaken: boolean;
  updatedAt: string;
}

export default function ObatPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser(); // 🚀 Nangkep data user yang login (buat ambil ID MED-XXX)

  const [dataObat, setDataObat] = useState<Obat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // === STATE UNTUK POP-UP MODERN ===
  const [popup, setPopup] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const [activeTab, setActiveTab] = useState("hari-ini");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const showPopup = (type: "success" | "error", message: string) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // === 1. FETCH API OBAT LOKAL (LANGSUNG DARI RM 14) ===
  const fetchObat = async () => {
    if (!user?.lastName) return; // Pastikan ID Pasien ada

    try {
      // 🚀 Tembak langsung ke dokumen RM 14 pasien ini
      const response = await fetch(
        `https://sadulur-api.vercel.app/api/admin/rm14?patientId=${user.lastName}`,
      );

      if (response.ok) {
        const data = await response.json();
        // Sedot data obat dari dalam dischargeSummary
        const rawMeds = data.dischargeSummary?.medications || [];

        // Mapping biar formatnya sesuai sama state aplikasi lu
        const formattedMeds = rawMeds.map((med: { name: string; dosage?: string; rules?: string; timeToTake?: string; isTaken?: boolean; updatedAt?: string }) => ({
          ...med,
          isTaken: med.isTaken || false,
          updatedAt: med.updatedAt || new Date().toISOString(),
        }));

        setDataObat(formattedMeds);
      }
    } catch (err) {
      console.error("Gagal menarik data obat dari RM14:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user) fetchObat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user]);

  // === 2. UPDATE STATUS OBAT KE DATABASE ===
  const handleTandaiDiminum = async (idObat: string) => {
    setIsUpdating(idObat);
    try {
      const token = await getToken();
      const response = await fetch(
        `https://sadulur-api.vercel.app/api/medications/${idObat}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isTaken: true }),
        },
      );

      if (response.ok) {
        await fetchObat();
        showPopup("success", "Mantap! Obat berhasil dicatat ke Riwayat.");
      } else {
        showPopup("error", "Gagal menyimpan ke database.");
      }
    } catch (err) {
      showPopup("error", "Koneksi terputus. Pastikan backend menyala.");
    } finally {
      setIsUpdating(null);
    }
  };

  // === FILTER & PAGINATION ===
  const obatHariIni = dataObat.filter((obat) => !obat.isTaken);
  const obatRiwayat = dataObat.filter((obat) => obat.isTaken);

  const activeData = activeTab === "hari-ini" ? obatHariIni : obatRiwayat;
  const totalPages = Math.ceil(activeData.length / itemsPerPage);
  const currentItems = activeData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const ubahTab = (tabBaru: string) => {
    setActiveTab(tabBaru);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans antialiased text-slate-900 relative">
      <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen relative pb-28 shadow-2xl overflow-x-hidden">
        {/* HEADER */}
        <header className="bg-teal-600 px-6 pt-8 pb-6 rounded-b-[2rem] shadow-md sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4 text-white">
            <Link
              href="/dashboard"
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition active:scale-95"
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="font-extrabold text-sm tracking-widest uppercase opacity-95">
              Manajemen Obat
            </span>
            <div className="w-9"></div>
          </div>

          <div className="mt-2 text-white">
            <h1 className="text-2xl font-black tracking-tight mb-1">
              Daftar Obat 💊
            </h1>
            <p className="text-teal-100 text-sm font-medium">
              Pastikan diminum sesuai anjuran dokter ya!
            </p>
          </div>

          <div className="flex bg-teal-700/50 p-1 rounded-xl mt-5 backdrop-blur-sm">
            <button
              onClick={() => ubahTab("hari-ini")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "hari-ini" ? "bg-white text-teal-700 shadow-sm" : "text-teal-100"}`}
            >
              Hari Ini ({obatHariIni.length})
            </button>
            <button
              onClick={() => ubahTab("riwayat")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "riwayat" ? "bg-white text-teal-700 shadow-sm" : "text-teal-100"}`}
            >
              Riwayat ({obatRiwayat.length})
            </button>
          </div>
        </header>

        {/* KONTEN UTAMA */}
        <main className="p-4 space-y-4 -mt-2 relative z-20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-teal-600 space-y-3 mt-20">
              <Activity size={32} className="animate-pulse" />
              <p className="font-bold text-sm">Menarik data resep obat...</p>
            </div>
          ) : currentItems.length > 0 ? (
            <>
              {/* === TAB HARI INI === */}
              {activeTab === "hari-ini" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
                      Jadwal Minum
                    </span>
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                      Wajib Tuntas
                    </span>
                  </div>

                  <div className="overflow-x-auto pb-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                          <th className="p-4 whitespace-nowrap">
                            Nama Obat & Dosis
                          </th>
                          <th className="p-4 whitespace-nowrap">
                            Aturan Minum
                          </th>
                          <th className="p-4 whitespace-nowrap text-center">
                            Waktu
                          </th>
                          <th className="p-4 text-center whitespace-nowrap">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((obat) => (
                          <tr
                            key={obat.id}
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4">
                              <p className="font-black text-slate-800 text-sm whitespace-nowrap">
                                {obat.name}
                              </p>
                              <p className="text-[10px] font-bold text-teal-600 mt-0.5">
                                {obat.dosage || "Sesuai resep"}
                              </p>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-600 text-xs whitespace-nowrap">
                                {obat.rules}
                              </p>
                            </td>
                            <td className="p-4 text-center">
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md">
                                {obat.timeToTake || "-"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleTandaiDiminum(obat.id)}
                                disabled={isUpdating === obat.id}
                                className="w-10 h-10 mx-auto rounded-full bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-50 border border-teal-100 shadow-sm hover:shadow-md active:scale-90"
                              >
                                {isUpdating === obat.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Check size={20} strokeWidth={3} />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* === TAB RIWAYAT === */}
              {activeTab === "riwayat" &&
                currentItems.map((obat) => (
                  <section
                    key={obat.id}
                    className="bg-emerald-50/30 rounded-2xl p-5 relative overflow-hidden transition-all shadow-sm border border-emerald-200"
                  >
                    <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                      <CheckCircle2 size={100} className="text-emerald-500" />
                    </div>

                    <div className="flex items-start gap-4 relative z-10">
                      <div className="p-3 rounded-2xl flex-shrink-0 bg-emerald-100 text-emerald-600">
                        <Check size={28} strokeWidth={3} />
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                          <h2 className="font-black text-lg leading-tight text-emerald-900">
                            {obat.name}
                          </h2>
                          <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest mt-1">
                            Selesai
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs mt-4 p-3 rounded-xl border bg-white/60 border-emerald-100">
                          <div className="flex flex-col">
                            <span className="text-slate-400 font-bold mb-0.5 text-[10px] uppercase">
                              Dosis
                            </span>
                            <span className="font-black text-emerald-700">
                              {obat.dosage || "-"}
                            </span>
                          </div>
                          <div className="flex flex-col border-l border-emerald-200/50 pl-2">
                            <span className="text-slate-400 font-bold mb-0.5 text-[10px] uppercase">
                              Jadwal
                            </span>
                            <span className="font-black text-emerald-700">
                              {obat.timeToTake || "-"}
                            </span>
                          </div>
                          <div className="flex flex-col border-l border-emerald-200/50 pl-2">
                            <span className="text-slate-400 font-bold mb-0.5 text-[10px] uppercase">
                              Aturan
                            </span>
                            <span className="font-black text-emerald-700 break-words">
                              {obat.rules}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-emerald-100/80">
                          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                            <Clock size={12} className="text-emerald-500" />{" "}
                            Diminum Jam:{" "}
                            <span className="text-emerald-800">
                              {formatTime(obat.updatedAt)} WIB
                            </span>
                          </p>
                          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                            <CalendarDays
                              size={12}
                              className="text-emerald-500"
                            />{" "}
                            Tanggal:{" "}
                            <span className="text-emerald-800">
                              {formatDate(obat.updatedAt)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                ))}

              {/* PAGINASI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 pb-24 px-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition active:scale-95 shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Hal {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition active:scale-95 shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-6 mt-10">
              <FileText size={48} className="mb-4 text-slate-300" />
              <h3 className="font-black text-base text-slate-600 mb-1">
                {activeTab === "hari-ini"
                  ? "Tidak Ada Jadwal Obat"
                  : "Belum Ada Riwayat"}
              </h3>
              <p className="text-sm">
                {activeTab === "hari-ini"
                  ? "Resep kosong atau semua obat sudah diminum. Pemulihan yang bagus!"
                  : "Data akan muncul setelah kamu mencentang obat hari ini."}
              </p>
            </div>
          )}
        </main>

        {/* BOTTOM NAV BAR */}
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
            <button className="flex flex-col items-center gap-1.5 text-teal-600 w-14 group -mt-7">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3.5 rounded-full shadow-[0_8px_20px_rgba(13,148,136,0.4)] text-white transform transition active:scale-95 border-[4px] border-white">
                <Pill size={24} strokeWidth={2.5} className="fill-white/20" />
              </div>
              <span className="text-[11px] font-extrabold text-teal-700">
                Obat
              </span>
            </button>
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

        {/* =========================================
            MODAL POP-UP MODERN (TOAST)
            ========================================= */}
        {popup.show && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in slide-in-from-top-10 fade-in duration-300">
            <div
              className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 ${
                popup.type === "success"
                  ? "bg-white border-emerald-100 shadow-emerald-600/10"
                  : "bg-white border-red-100 shadow-red-600/10"
              }`}
            >
              <div
                className={`p-2 rounded-full ${popup.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
              >
                {popup.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>
              <p className="font-bold text-sm text-slate-800 flex-1">
                {popup.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

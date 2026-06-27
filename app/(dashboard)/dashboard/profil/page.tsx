"use client";

import {
  Home,
  Pill,
  CalendarCheck,
  BookOpen,
  User as UserIcon,
  ChevronLeft,
  Settings,
  FileText,
  HelpCircle,
  LogOut,
  QrCode,
  ChevronRight,
  Info, // 🔥 Tambahan icon buat pop-up modern
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState } from "react";

export default function ProfilPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({ title: "", message: "" });

  const namaLengkap = user?.fullName || user?.firstName || "Pasien";
  const emailUser =
    user?.primaryEmailAddress?.emailAddress || "email@pasien.com";
  // 🚀 Mengambil ID presisi dari data lastName Clerk (Format: MED-XXXX)
  const idMedis = user?.lastName || "SYNCING...";

  // Fungsi buat nyalin teks ke clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(idMedis);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Gagal nyalin:", err);
    }
  };

  const handleMenuClick = (menuName: string) => {
    if (menuName === "Pengaturan Akun") {
      openUserProfile();
    } else if (menuName === "Pusat Bantuan") {
      const waNumber = "6281234567890";
      const message =
        "Halo Admin Sadulur, saya butuh bantuan terkait aplikasi.";
      window.open(
        `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    } else if (menuName === "Dokumen Medis Saya") {
      // 🚀 Arahin langsung ke halaman rekam medis pasien
      router.push("/dashboard/kartu-pasien");
    } else {
      setModalInfo({
        title: "Segera Hadir!",
        message: `Sabar bre, fitur ${menuName} masih dalam tahap pengembangan. Ditunggu update selanjutnya ya! 🚀`,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans antialiased text-slate-900">
      <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen relative pb-28 shadow-2xl overflow-x-hidden">
        {/* Header Profil */}
        <header className="bg-teal-600 px-6 pt-8 pb-16 rounded-b-[3rem] shadow-md relative z-10">
          <div className="flex items-center justify-between mb-4 text-white">
            <Link
              href="/dashboard"
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition active:scale-95"
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="font-extrabold text-sm tracking-widest uppercase opacity-95">
              Profil Pasien
            </span>
            <div className="w-9"></div>
          </div>
        </header>

        {/* Card Data Profil */}
        <main className="px-6 space-y-6 -mt-10 relative z-20">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg -mt-16 bg-slate-200 overflow-hidden mb-3">
              <img
                src={
                  user?.imageUrl ||
                  "https://ui-avatars.com/api/?name=Pasien&background=0D9488&color=fff"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {namaLengkap}
            </h2>
            <p className="text-sm font-medium text-slate-500 mb-4">
              {emailUser}
            </p>

            <div className="w-full bg-teal-50 rounded-2xl p-4 flex items-center justify-between border border-teal-100">
              <div className="flex items-center gap-3">
                <div className="bg-teal-600 p-2 rounded-xl text-white">
                  <QrCode size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                    ID Rekam Medis
                  </p>
                  <p className="font-mono font-bold text-slate-700 text-sm">
                    {idMedis}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`text-xs font-black px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all ${
                  isCopied ? "bg-teal-600 text-white" : "bg-white text-teal-700"
                }`}
              >
                {isCopied ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>

          {/* Menu Pengaturan */}
          <div>
            <h3 className="font-extrabold text-slate-800 text-base mb-3 px-2">
              Pengaturan & Bantuan
            </h3>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button
                onClick={() => handleMenuClick("Pengaturan Akun")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors active:bg-slate-100 border-b border-slate-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
                    <Settings size={20} />
                  </div>
                  <span className="font-bold text-sm text-slate-700">
                    Pengaturan Akun
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>

              <button
                onClick={() => handleMenuClick("Dokumen Medis Saya")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors active:bg-slate-100 border-b border-slate-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="font-bold text-sm text-slate-700">
                    Dokumen Medis Saya
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>

              <button
                onClick={() => handleMenuClick("Pusat Bantuan")}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors active:bg-slate-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
                    <HelpCircle size={20} />
                  </div>
                  <span className="font-bold text-sm text-slate-700">
                    Pusat Bantuan
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </button>
            </div>
          </div>

          {/* Tombol Logout */}
          <button
            onClick={() => signOut()}
            className="w-full mt-6 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-extrabold py-4 rounded-2xl transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut size={18} strokeWidth={2.5} /> Keluar Aplikasi
          </button>

          <p className="text-center text-xs font-bold text-slate-400 mt-6">
            Sadulur App v1.0.0
          </p>
        </main>

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

            {/* Profil (Aktif) */}
            <button className="flex flex-col items-center gap-1.5 text-teal-600 w-14 group -mt-7">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3.5 rounded-full shadow-[0_8px_20px_rgba(13,148,136,0.4)] text-white transform transition active:scale-95 border-[4px] border-white">
                <UserIcon
                  size={24}
                  strokeWidth={2.5}
                  className="fill-white/20"
                />
              </div>
              <span className="text-[11px] font-extrabold text-teal-700">
                Profil
              </span>
            </button>
          </div>
        </nav>

        {/* 🔥 MODAL POP-UP MODERN 🔥 */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 shadow-inner border-4 border-white ring-8 ring-blue-50">
                <Info size={56} className="text-blue-500" />
              </div>

              <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">
                {modalInfo.title}
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium px-2">
                {modalInfo.message}
              </p>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-lg active:scale-95 transition-all transform"
              >
                OKE, MENGERTI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

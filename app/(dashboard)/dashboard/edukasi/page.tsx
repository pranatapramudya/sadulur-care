"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Pill,
  CalendarCheck,
  BookOpen,
  User as UserIcon,
  ChevronLeft,
  PlayCircle,
  FileText,
  Loader2,
  HeartPulse,
  Syringe,
  Activity,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

interface Edukasi {
  id: string;
  title: string;
  mediaUrl: string | null;
  category: string;
  createdAt: string;
}

const getYoutubeThumbnail = (url: string | null) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;

  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return "";
};

export default function EdukasiPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [dataEdukasi, setDataEdukasi] = useState<Edukasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("SEMUA");

  useEffect(() => {
    const fetchEdukasi = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          "https://sadulur-api.vercel.app/api/admin/edukasi",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setDataEdukasi(data);
        }
      } catch (error) {
        console.error("Gagal menarik data edukasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && isSignedIn) fetchEdukasi();
  }, [isLoaded, isSignedIn, getToken]);

  const filteredVideos =
    activeCategory === "SEMUA"
      ? dataEdukasi
      : dataEdukasi.filter((item) => item.category === activeCategory);

  return (
    <div className="flex justify-center min-h-screen bg-slate-100 font-sans antialiased text-slate-900">
      <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen relative pb-28 shadow-2xl overflow-x-hidden">
        {/* Header */}
        <header className="bg-teal-600 px-6 pt-8 pb-8 rounded-b-[2.5rem] shadow-md sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6 text-white">
            <Link
              href="/dashboard"
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition active:scale-95"
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="font-extrabold text-sm tracking-widest uppercase opacity-95">
              Pusat Edukasi
            </span>
            <div className="w-9"></div>
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-black tracking-tight mb-2">
              Edukasi Medis 📚
            </h1>
            <p className="text-teal-100 text-sm font-medium leading-relaxed">
              Pelajari cara perawatan mandiri agar pemulihanmu lebih cepat dan
              aman.
            </p>
          </div>
        </header>

        {/* Konten Utama */}
        <main className="p-5 space-y-6 -mt-4 relative z-20">
          {/* =========================================
              TAB FILTER KATEGORI (UDAH ANTI MBLUBER)
              ========================================= */}
          <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar px-1 mt-2 w-full">
            <button
              onClick={() => setActiveCategory("SEMUA")}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
                activeCategory === "SEMUA"
                  ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid size={16} /> Semua
            </button>
            <button
              onClick={() => setActiveCategory("RING_JANTUNG")}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
                activeCategory === "RING_JANTUNG"
                  ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <HeartPulse
                size={16}
                className={
                  activeCategory === "RING_JANTUNG"
                    ? "text-white"
                    : "text-rose-500"
                }
              />{" "}
              Ring Jantung
            </button>
            <button
              onClick={() => setActiveCategory("GULA_DIABETES")}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
                activeCategory === "GULA_DIABETES"
                  ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Syringe
                size={16}
                className={
                  activeCategory === "GULA_DIABETES"
                    ? "text-white"
                    : "text-blue-500"
                }
              />{" "}
              Diabetes
            </button>
            <button
              onClick={() => setActiveCategory("GINJAL")}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
                activeCategory === "GINJAL"
                  ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Activity
                size={16}
                className={
                  activeCategory === "GINJAL" ? "text-white" : "text-amber-500"
                }
              />{" "}
              Ginjal (HD)
            </button>
          </div>

          {/* 👇👇👇 TAMBAHAN 7 TOMBOL BARU 👇👇👇 */}
          <button
            onClick={() => setActiveCategory("HIPERTENSI")}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
              activeCategory === "HIPERTENSI"
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity
              size={16}
              className={
                activeCategory === "HIPERTENSI" ? "text-white" : "text-red-500"
              }
            />{" "}
            Hipertensi
          </button>

          <button
            onClick={() => setActiveCategory("HIV")}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
              activeCategory === "HIV"
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity
              size={16}
              className={
                activeCategory === "HIV" ? "text-white" : "text-purple-500"
              }
            />{" "}
            HIV
          </button>

          <button
            onClick={() => setActiveCategory("STROKE")}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
              activeCategory === "STROKE"
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity
              size={16}
              className={
                activeCategory === "STROKE" ? "text-white" : "text-orange-500"
              }
            />{" "}
            Stroke
          </button>

          <button
            onClick={() => setActiveCategory("KANKER")}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
              activeCategory === "KANKER"
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity
              size={16}
              className={
                activeCategory === "KANKER" ? "text-white" : "text-pink-500"
              }
            />{" "}
            Kanker
          </button>

          <button
            onClick={() => setActiveCategory("JANTUNG_KORONER")}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
              activeCategory === "JANTUNG_KORONER"
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <HeartPulse
              size={16}
              className={
                activeCategory === "JANTUNG_KORONER"
                  ? "text-white"
                  : "text-rose-700"
              }
            />{" "}
            Jantung Koroner
          </button>

          <button
            onClick={() => setActiveCategory("GASTRITIS")}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
              activeCategory === "GASTRITIS"
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity
              size={16}
              className={
                activeCategory === "GASTRITIS"
                  ? "text-white"
                  : "text-yellow-600"
              }
            />{" "}
            Gastritis
          </button>

          <button
            onClick={() => setActiveCategory("PPOK")}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all duration-300 border shrink-0 w-max ${
              activeCategory === "PPOK"
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-105"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Activity
              size={16}
              className={
                activeCategory === "PPOK" ? "text-white" : "text-teal-500"
              }
            />{" "}
            Penyakit Paru Obstruksi Kronis
          </button>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <Loader2 className="animate-spin text-teal-600 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-500">
                Memuat modul edukasi...
              </p>
            </div>
          ) : (
            <>
              {/* Bagian Video List */}
              <div>
                <h2 className="font-extrabold text-slate-800 text-base mb-4 flex items-center gap-2 px-1">
                  <PlayCircle size={18} className="text-teal-600" /> Video
                  Panduan{" "}
                  {activeCategory !== "SEMUA" && (
                    <span className="text-[10px] font-black text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md ml-1 uppercase tracking-widest">
                      {activeCategory.replace("_", " ")}
                    </span>
                  )}
                </h2>

                {filteredVideos.length > 0 ? (
                  <div className="space-y-4 px-1">
                    {filteredVideos.map((vid) => (
                      <a
                        key={vid.id}
                        href={vid.mediaUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100 group hover:shadow-md transition-all active:scale-95"
                      >
                        {/* Thumbnail YouTube Beraksi Disini */}
                        <div
                          className="w-full h-44 bg-slate-800 rounded-2xl relative overflow-hidden mb-4 bg-cover bg-center"
                          style={{
                            backgroundImage: vid.mediaUrl
                              ? `url(${getYoutubeThumbnail(vid.mediaUrl)})`
                              : undefined,
                          }}
                        >
                          <div className="absolute inset-0 bg-teal-900/40 mix-blend-multiply transition-all group-hover:bg-teal-900/20"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/30 backdrop-blur-sm p-3.5 rounded-full text-white transform group-hover:scale-110 transition-transform shadow-lg border border-white/20">
                              <PlayCircle
                                size={36}
                                strokeWidth={2}
                                className="fill-white/20"
                              />
                            </div>
                          </div>

                          {/* Badge Kategori di dalam Thumbnail */}
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 uppercase tracking-wider">
                            {vid.category === "RING_JANTUNG" && (
                              <HeartPulse size={12} className="text-rose-400" />
                            )}
                            {vid.category === "GULA_DIABETES" && (
                              <Syringe size={12} className="text-blue-400" />
                            )}
                            {vid.category === "GINJAL" && (
                              <Activity size={12} className="text-amber-400" />
                            )}
                            {vid.category === "UMUM" && (
                              <BookOpen size={12} className="text-teal-400" />
                            )}
                            {vid.category.replace("_", " ")}
                          </div>
                        </div>

                        <div className="px-2 pb-1">
                          <h3 className="font-black text-slate-800 text-base leading-snug mb-1.5 line-clamp-2">
                            {vid.title}
                          </h3>
                          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <CalendarCheck size={12} /> Diupload:{" "}
                            {new Date(vid.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6 bg-white rounded-3xl border border-slate-100 shadow-sm mt-4 mx-1">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <FileText size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-700 font-black text-base mb-1">
                      Belum Ada Video
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Perawat belum mengunggah materi edukasi untuk kategori
                      ini.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
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

            <button className="flex flex-col items-center gap-1.5 text-teal-600 w-14 group -mt-7">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3.5 rounded-full shadow-[0_8px_20px_rgba(13,148,136,0.4)] text-white transform transition active:scale-95 border-[4px] border-white">
                <BookOpen
                  size={24}
                  strokeWidth={2.5}
                  className="fill-white/20"
                />
              </div>
              <span className="text-[11px] font-extrabold text-teal-700">
                Edukasi
              </span>
            </button>

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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  Activity,
  Stethoscope,
  Utensils,
  CalendarDays,
  CalendarCheck,
  MapPin,
  FileText,
  Pill,
  Download,
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function KartuPasienPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [rmData, setRmData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // === FIX 1: Sinkronisasi ID Medis (Tarik dari lastName Clerk) ===
  const namaPanggilan = user?.firstName || "Pasien";
  const idMedis = user?.lastName || "SYNCING...";

  // === FIX 2: Perbaiki URL QR Code biar dokter gampang ngebacanya ===
  const qrUrlValue = user?.lastName
    ? `https://sadulur-care.vercel.app/rekam-medis/${user.lastName}`
    : "https://sadulur-care.vercel.app";

  useEffect(() => {
    const fetchRm14 = async () => {
      // Pastikan nunggu ID Medis-nya ke-load dulu dari Clerk
      if (!user?.lastName) return;

      try {
        const token = await getToken();
        // === FIX 3: Tambahin parameter ?patientId=MED-XXXX di URL ===
        const res = await fetch(
          `https://sadulur-api.vercel.app/api/admin/rm14?patientId=${user.lastName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          console.log("Data RM 14 ditarik:", data);
          // Karena API kita ngembaliin data di dalam object dischargeSummary
          if (data && data.dischargeSummary) {
            setRmData(data.dischargeSummary);
          } else {
            // Jaga-jaga kalau strukturnya langsung
            setRmData(data);
          }
        }
      } catch (error) {
        console.error("Gagal narik data RM 14:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchRm14();
    }
  }, [isLoaded, isSignedIn, getToken, user?.lastName]); // Jadikan user.lastName sebagai trigger

  const handleDownloadPdf = () => {
    // Arahin langsung ke halaman QR murni biar pasien bisa unduh PDF aslinya
    if (qrUrlValue) {
      window.open(qrUrlValue, "_blank");
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans antialiased text-slate-900 print:bg-white">
      <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen relative pb-28 shadow-2xl overflow-x-hidden">
        {/* Header Navigation */}
        <header className="bg-teal-600 px-4 pt-8 pb-4 flex items-center gap-3 text-white shadow-md z-10 shrink-0 print:hidden">
          <Link
            href="/dashboard"
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="font-black text-lg leading-tight">
              Kartu & Dokumen
            </h2>
            <p className="text-teal-100 text-[10px] font-mono tracking-wider">
              {idMedis} • {namaPanggilan}
            </p>
          </div>
        </header>

        {/* Header Khusus untuk versi PDF/Print */}
        <div className="hidden print:block text-center mb-6 pt-4 border-b-2 border-slate-800 pb-4">
          <h1 className="text-2xl font-black uppercase tracking-widest">
            INSTRUKSI PERAWATAN PASIEN DI RUMAH
          </h1>
          <h2 className="text-lg font-bold text-slate-600">(RM 14)</h2>
          <div className="flex justify-between mt-4 text-left text-sm font-medium">
            <div>
              <p>
                ID Pasien: <strong>{idMedis}</strong>
              </p>
              <p>
                Nama: <strong>{namaPanggilan}</strong>
              </p>
            </div>
            <div className="text-right">
              <p>Dokumen Resmi</p>
              <p>Sadulur Care</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-10 print:overflow-visible print:p-0">
          {/* KARTU PASIEN DIGITAL + QR CODE */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg flex items-center justify-between mb-6 print:hidden border border-slate-700">
            <div>
              <p className="text-[10px] text-teal-400 font-bold tracking-widest uppercase mb-1">
                Kartu Sadulur Care
              </p>
              <h2 className="text-xl font-black mb-2">{namaPanggilan}</h2>
              <div className="bg-slate-700/50 inline-block px-3 py-1 rounded-lg">
                <p className="text-xs font-mono text-slate-300">
                  ID: <span className="text-white font-bold">{idMedis}</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-inner shrink-0">
              <QRCodeSVG
                value={qrUrlValue}
                size={76}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"H"}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-teal-600 space-y-3 print:hidden">
              <Activity size={32} className="animate-pulse" />
              <p className="font-bold text-sm">Menarik dokumen RM 14...</p>
            </div>
          ) : rmData ? (
            <div className="space-y-4 print:space-y-6">
              <button
                onClick={handleDownloadPdf}
                className="w-full bg-teal-600 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:bg-teal-700 transition-colors active:scale-95 print:hidden"
              >
                <Download size={18} /> Unduh Dokumen RM14 (PDF)
              </button>

              {/* BAGIAN 1: Diagnosa & Tindakan */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 print:border-slate-300 print:shadow-none">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2 print:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">
                    Halaman 1
                  </span>
                  <Stethoscope
                    size={16}
                    className="text-teal-600 print:hidden"
                  />
                </div>

                <h4 className="text-[10px] font-black text-teal-600 mb-1 uppercase tracking-widest print:text-slate-800">
                  Diagnosa Medis Akhir
                </h4>
                <p className="font-extrabold text-slate-800 text-sm mb-5">
                  {rmData.diagnosaMedis}
                </p>

                <h4 className="text-[10px] font-black text-teal-600 mb-1 uppercase tracking-widest print:text-slate-800">
                  Tindakan Yang Diberikan
                </h4>
                <p className="font-extrabold text-slate-800 text-sm">
                  {rmData.tindakanDiberikan}
                </p>
              </div>

              {/* BAGIAN 2: Instruksi & Tanda Bahaya */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 print:border-slate-300 print:shadow-none">
                <h4 className="text-[10px] font-black text-orange-500 mb-1 uppercase tracking-widest print:text-slate-800">
                  Aktivitas (ROM / Toilet)
                </h4>
                <p className="font-medium text-slate-600 text-sm mb-5 leading-relaxed print:text-black">
                  {rmData.instruksiAktivitas}
                </p>

                <h4 className="text-[10px] font-black text-rose-500 mb-1 uppercase tracking-widest print:text-slate-800">
                  Perawatan & Tanda Bahaya
                </h4>
                <p className="font-medium text-slate-600 text-sm leading-relaxed print:text-black">
                  {rmData.perawatanRumah}
                </p>
              </div>

              {/* BAGIAN 3: Diet & Kontrol */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 print:border-slate-300 print:shadow-none">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2 print:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">
                    Halaman 2
                  </span>
                  <Utensils size={16} className="text-teal-600 print:hidden" />
                </div>

                <h4 className="text-[10px] font-black text-blue-500 mb-1 uppercase tracking-widest print:text-slate-800">
                  Anjuran & Batasan Diet
                </h4>
                <p className="font-medium text-slate-600 text-sm mb-5 leading-relaxed print:text-black">
                  {rmData.aturanDiet}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-slate-300">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1 print:text-slate-800">
                      <CalendarDays size={12} className="print:hidden" /> Tgl
                      Pulang
                    </h4>
                    <p className="font-extrabold text-slate-800 text-xs">
                      {rmData.tanggalPulang
                        ? new Date(rmData.tanggalPulang).toLocaleDateString(
                            "id-ID",
                          )
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 print:bg-white print:border-slate-300">
                    <h4 className="text-[9px] font-black text-teal-600 uppercase tracking-widest mb-1 flex items-center gap-1 print:text-slate-800">
                      <CalendarCheck size={12} className="print:hidden" /> Tgl
                      Kontrol
                    </h4>
                    <p className="font-extrabold text-teal-800 text-xs print:text-black">
                      {rmData.jadwalKontrol
                        ? new Date(rmData.jadwalKontrol).toLocaleDateString(
                            "id-ID",
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-white print:border-slate-300">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1 print:text-slate-800">
                    <MapPin size={12} className="print:hidden" /> Tempat Kontrol
                  </h4>
                  <p className="font-bold text-slate-700 text-sm print:text-black">
                    {rmData.tempatKontrol || "-"}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/obat"
                className="block bg-slate-800 rounded-2xl p-5 text-center shadow-md border border-slate-700 hover:bg-slate-900 transition-colors active:scale-95 print:hidden"
              >
                <Pill size={28} className="text-teal-400 mx-auto mb-3" />
                <p className="text-xs text-slate-300 font-medium">
                  Daftar obat-obatan pulang dan instruksi minum obat tersedia di
                  menu <strong className="text-white">Obat</strong>.
                </p>
                <p className="text-[10px] text-teal-400 font-bold mt-2 uppercase tracking-widest">
                  Klik untuk lihat obat ➔
                </p>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center px-6 mt-10 print:hidden">
              <FileText size={48} className="mb-4 text-slate-300" />
              <p className="font-bold text-base text-slate-600">
                Dokumen Belum Tersedia
              </p>
              <p className="text-sm mt-2">
                Sistem belum menerima dokumen RM 14 dari Admin/Perawat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

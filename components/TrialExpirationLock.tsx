"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";

export function TrialExpirationLock({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();

  // Kunci scroll halaman saat komponen aktif
  useEffect(() => {
    const isLocked =
      user?.primaryEmailAddress?.emailAddress === "ardigunardi67@gmail.com" ||
      user?.primaryEmailAddress?.emailAddress === "komunikasiefektif45@gmail.com";

    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [user]);

  if (!isLoaded || !user) {
    return <>{children}</>;
  }

  const email = user?.primaryEmailAddress?.emailAddress;
  const isLocked =
    email === "ardigunardi67@gmail.com" ||
    email === "komunikasiefektif45@gmail.com";

  if (isLocked) {
    return (
      <>
        {/* Render children in background, but the lock is on top */}
        {children}
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white ring-8 ring-rose-50">
              <MessageCircle size={40} className="text-rose-600 animate-pulse" />
            </div>
            <h3 className="font-black text-2xl text-slate-900 mb-3 tracking-tight">
              Akses Masa Evaluasi Berakhir
            </h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium px-2">
              Masa uji coba gratis (Trial) selama 30 hari untuk sistem Sadulur-Care telah selesai. Sistem saat ini dibekukan sementara. Untuk memperpanjang lisensi dan mendapatkan akses penuh ke seluruh fitur medis dan database, silakan hubungi tim Developer.
            </p>
            <a
              href="https://wa.me/6281234567890" // TODO: Use real developer WhatsApp link
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-4 rounded-2xl shadow-lg active:scale-95 transition-all transform flex items-center justify-center gap-2"
            >
              Hubungi Developer (WhatsApp)
            </a>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}

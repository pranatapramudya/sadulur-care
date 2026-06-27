"use client";

import { Activity, ArrowRight } from "lucide-react";
// 🚀 Tambahin useUser dari Clerk buat ngecek email yang login
import { useAuth, useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser(); // 🚀 Nangkep data user yang barusan login

  // LOGIKA PINTAR: Lempar otomatis ke "kamar" masing-masing kalau udah login
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const emailAkun = user.primaryEmailAddress?.emailAddress || "";
      const role = user.publicMetadata?.role;

      // Perawat/Admin yang valid masuk ke /admin
      if (role === "NURSE") {
        router.push("/admin");
      } else {
        // Pasien dan role lainnya masuk ke /dashboard
        router.push("/dashboard");
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Layar loading tipis pas Clerk lagi ngecek sesi (biar gak nge-blink)
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Activity className="text-blue-600 w-12 h-12 animate-pulse" />
      </div>
    );
  }

  // TAMPILAN INI HANYA MUNCUL BUAT YANG BELUM LOGIN / SUDAH LOGOUT
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans items-center justify-center p-6 relative">
      {/* Bagian Tengah: Logo & Branding */}
      <div className="flex flex-col items-center mb-12">
        <div className="bg-blue-600 p-5 rounded-3xl shadow-lg mb-6 animate-fade-in-down">
          <Activity className="text-white w-14 h-14" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3 text-center">
          Sadulur
        </h1>
        <p className="text-center text-slate-500 font-medium max-w-xs leading-relaxed">
          Rekam Medis Digital & Pemantauan Pasien Terpadu
        </p>
      </div>

      {/* Bagian Bawah: Tombol Masuk khusus user (Perawat/Dokter) */}
      <div className="w-full max-w-sm space-y-4 z-10">
        {!isSignedIn && (
          <SignInButton
            mode="modal"
            forceRedirectUrl="/"
            appearance={{
              elements: {
                footerAction: "hidden", // Mantra rahasia buat ngumpetin link 'Sign Up'
                footer: "hidden", // Biar makin bersih total bagian bawahnya
              },
            }}
          >
            <button className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-3 group hover:bg-black">
              Login
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignInButton>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-slate-400 text-xs font-medium text-center w-full">
        © 2026 Sadulur-App v1
      </div>
    </div>
  );
}

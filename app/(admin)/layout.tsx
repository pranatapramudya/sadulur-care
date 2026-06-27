"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser(); // <-- Tambahan untuk narik data user Clerk
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      // 1. Kalau belum login, tendang ke depan secara halus
      if (!userId) {
        router.push("/");
        return;
      }

      // 2. KUNCI UTAMA: Cek metadata role dari Clerk
      // Kalau bukan NURSE, tendang ke dashboard pasien!
      const userRole = user?.publicMetadata?.role;

      if (userRole !== "NURSE") {
        router.push("/dashboard");
      } else {
        // Kalau role-nya beneran NURSE, buka gerbangnya
        setIsAuthorized(true);
      }
    }
  }, [isLoaded, userId, user, router]);

  // Selama loading atau belum diotorisasi, tampilin layar loading aja (jangan kasih bocor UI)
  if (!isLoaded || !userId || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
        <p className="text-teal-700 font-bold animate-pulse text-sm uppercase tracking-widest">
          Memverifikasi Otoritas Medis...
        </p>
      </div>
    );
  }

  // Kalau lolos, silakan masuk ke ruangan Admin!
  return <>{children}</>;
}

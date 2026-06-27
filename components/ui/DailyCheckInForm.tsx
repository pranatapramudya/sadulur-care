"use client";

import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function DailyCheckInForm() {
  const { getToken } = useAuth(); // Hook untuk narik token JWT Clerk
  const [painScale, setPainScale] = useState<number>(0);
  const [hasFever, setHasFever] = useState<boolean>(false);
  const [tookMedicine, setTookMedicine] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // URL ini nanti diganti dengan domain Vercel lu setelah deploy
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://sadulur-api.vercel.app/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Dapatkan token aktif dari Clerk
      const token = await getToken();

      // 2. Tembak API Vercel dengan Bearer Token
      const res = await fetch(`${API_URL}/api/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Wajib disertakan agar API tau ini user siapa
        },
        body: JSON.stringify({
          painScale,
          hasFever,
          tookMedicine,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Data kesehatan harian berhasil dikirim ke perawat!");
        // Reset state form di sini...
      } else {
        alert(`Gagal mengirim data: ${result.error}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      {/* --- UI Form Tailwind lu ditaruh di sini --- */}
      <div>
        <label>Skala Nyeri (0-10): {painScale}</label>
        <input
          type="range"
          min="0"
          max="10"
          value={painScale}
          onChange={(e) => setPainScale(Number(e.target.value))}
          className="w-full"
        />
      </div>
      {/* Tambahkan checkbox untuk fever dan medicine */}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white w-full py-3 rounded-lg"
      >
        {loading ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </form>
  );
}

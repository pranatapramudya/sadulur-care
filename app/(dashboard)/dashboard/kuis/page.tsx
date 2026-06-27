"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  BrainCircuit,
  HeartPulse,
  Activity,
  Droplets,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Trophy,
  Loader2,
  AlertCircle,
  Home,
  X,
  Clock, // 🚀 TAMBAHAN: Icon Jam buat Timer
} from "lucide-react";

// === DATA BANK SOAL KUIS ===
const QUIZ_DATA = {
  RING_JANTUNG: {
    title: "Kuis Post-PCI (Ring Jantung)",
    icon: HeartPulse,
    color: "text-rose-500",
    bg: "bg-rose-50",
    questions: [
      {
        question:
          "Makanan apa yang paling harus dibatasi setelah pasang ring jantung?",
        options: ["Sayuran rebus", "Gorengan dan jeroan", "Buah-buahan segar"],
        answer: 1,
      },
      {
        question:
          "Berapa target waktu olahraga ringan (seperti jalan kaki) yang ideal setiap harinya?",
        options: ["5-10 menit", "30 menit (bertahap)", "2 jam nonstop"],
        answer: 1,
      },
      {
        question:
          "Jika tiba-teman merasakan nyeri dada yang menjalar ke lengan kiri, apa yang harus dilakukan?",
        options: [
          "Tidur tengkurap",
          "Minum air es",
          "Segera ke IGD / hubungi perawat",
        ],
        answer: 2,
      },
      {
        question:
          "Obat pengencer darah (seperti Aspilet/CPG) harus diminum secara...",
        options: [
          "Rutin setiap hari sesuai resep",
          "Saat dada terasa sakit saja",
          "Dua hari sekali",
        ],
        answer: 0,
      },
      {
        question:
          "Apakah pasien post-PCI boleh mengonsumsi makanan yang terlalu asin (tinggi natrium)?",
        options: [
          "Sangat dianjurkan",
          "Boleh sesuka hati",
          "Tidak, harus dibatasi",
        ],
        answer: 2,
      },
    ],
  },
  GULA_DIABETES: {
    title: "Kuis Manajemen Diabetes",
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-50",
    questions: [
      {
        question:
          "Ciri-ciri jika gula darah tiba-tiba turun drastis (Hipoglikemia) adalah...",
        options: [
          "Keringat dingin, gemetar, dan pusing",
          "Sering kencing di malam hari",
          "Nafsu makan meningkat tajam",
        ],
        answer: 0,
      },
      {
        question:
          "Sumber karbohidrat mana yang lebih disarankan untuk menjaga stabilnya gula darah?",
        options: [
          "Nasi putih panas porsi besar",
          "Nasi merah / Gandum utuh",
          "Roti tawar putih dan selai manis",
        ],
        answer: 1,
      },
      {
        question:
          "Bagaimana cara perawatan kaki yang benar bagi penderita diabetes?",
        options: [
          "Sering berjalan tanpa alas kaki",
          "Gunakan alas kaki yang nyaman dan rajin cek luka",
          "Rendam kaki di air panas setiap malam",
        ],
        answer: 1,
      },
      {
        question:
          "Jika terdapat luka kecil di kaki yang tidak kunjung kering, tindakan yang tepat adalah?",
        options: [
          "Segera periksakan ke dokter/perawat",
          "Dibiarkan saja nanti sembuh sendiri",
          "Diolesi kecap/kopi",
        ],
        answer: 0,
      },
      {
        question: "Jadwal makan yang baik untuk penderita diabetes adalah...",
        options: [
          "Makan sehari 1x tapi porsi super besar",
          "Tepat waktu dengan porsi yang ditakar (3J)",
          "Bebas makan apa saja asal minum obat",
        ],
        answer: 1,
      },
    ],
  },
  GINJAL: {
    title: "Kuis Perawatan Ginjal",
    icon: Droplets,
    color: "text-amber-500",
    bg: "bg-amber-50",
    questions: [
      {
        question:
          "Bagaimana aturan minum air putih bagi pasien dengan gangguan ginjal / cuci darah?",
        options: [
          "Minum sebanyak-banyaknya",
          "Dibatasi ketat sesuai anjuran dokter",
          "Hanya minum air teh manis",
        ],
        answer: 1,
      },
      {
        question:
          "Tanda utama jika tubuh terlalu banyak menumpuk cairan adalah...",
        options: [
          "Bengkak di kaki, wajah, atau sesak napas",
          "Rambut sering rontok",
          "Sering merasa haus",
        ],
        answer: 0,
      },
      {
        question: "Buah apa yang sebaiknya diwaspadai karena tinggi Kalium?",
        options: ["Apel dan Pir", "Pisang dan Tomat", "Semangka"],
        answer: 1,
      },
      {
        question:
          "Aturan konsumsi protein (daging/telur) untuk penderita ginjal yang belum cuci darah adalah...",
        options: [
          "Harus dikurangi / dibatasi",
          "Harus diperbanyak",
          "Sama seperti orang normal",
        ],
        answer: 0,
      },
      {
        question:
          "Makanan kaleng dan mi instan sangat berbahaya bagi ginjal karena tinggi kandungan...",
        options: ["Vitamin C", "Serat", "Natrium / Garam / Pengawet"],
        answer: 2,
      },
    ],
  },
};

export default function KuisPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof QUIZ_DATA | null
  >(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // 🚀 LOGIKA TIMER & COOLDOWN (ANTI-SPAM)
  // ==========================================
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Efek berjalan setiap 1 detik buat ngerender ulang timer
  useEffect(() => {
    const storedCooldowns = localStorage.getItem("sadulur_quiz_cooldowns");
    if (storedCooldowns) {
      setCooldowns(JSON.parse(storedCooldowns));
    }
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi menyimpan waktu kapan kuis bisa diakses lagi (UBAH PARAMETER JADI MENIT)
  const setCooldownForCategory = (cat: string, minutes: number) => {
    const unlockTime = Date.now() + minutes * 60 * 1000; // 👈 Rumus dikali menit (bukan jam lagi)
    setCooldowns((prev) => {
      const next = { ...prev, [cat]: unlockTime };
      localStorage.setItem("sadulur_quiz_cooldowns", JSON.stringify(next));
      return next;
    });
  };

  // Kalkulator sisa waktu (UBAH FORMAT JADI: 4m 59d)
  const getTimeLeft = (unlockTime: number) => {
    const diff = unlockTime - currentTime;
    if (diff <= 0) return null; // Kalo habis, timernya hilang
    const m = Math.floor(diff / (1000 * 60)); // 👈 Hitung menit
    const s = Math.floor((diff % (1000 * 60)) / 1000); // 👈 Hitung detik
    return `${m}m ${s}d`;
  };

  // ==========================================
  // LOGIKA KUIS
  // ==========================================
  const handleStart = (category: keyof typeof QUIZ_DATA) => {
    setSelectedCategory(category);
    setCurrentQuestion(0);
    setScore(0);
    setIsFinished(false);
  };

  const handleAnswer = async (selectedIndex: number) => {
    if (!selectedCategory) return;

    const quiz = QUIZ_DATA[selectedCategory];
    const isCorrect = selectedIndex === quiz.questions[currentQuestion].answer;
    const newScore = isCorrect ? score + 20 : score;
    setScore(newScore);

    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsFinished(true);
      submitScore(selectedCategory, newScore);
    }
  };

  const submitScore = async (category: string, finalScore: number) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const patientId = user?.lastName;

      const res = await fetch("https://sadulur-api.vercel.app/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patientId,
          category: category,
          score: finalScore,
        }),
      });

      if (res.status === 429) {
        // Nangkep pesan penolakan dari Backend
        const errorMessage = await res.text();
        const match = errorMessage.match(/\d+/);
        const minutesFromBackend = match ? parseInt(match[0]) : 5; // 👈 Default 5 menit

        // Kunci UI selama X menit ke depan
        setCooldownForCategory(category, minutesFromBackend);

        // Lempar balik ke halaman utama kuis
        setIsFinished(false);
        setSelectedCategory(null);
        alert(
          `⏳ Oops! Anda terlalu cepat mengisi kuis.\n\nSistem mengunci fitur ini untuk menghindari spam. Tunggu ${minutesFromBackend} menit lagi.`, // 👈 Teks jam diganti menit
        );
        return;
      }

      if (!res.ok) throw new Error("Gagal menyimpan skor");

      // KALO BERHASIL, TETEP KASIH COOLDOWN 5 MENIT BIAR GAK SPAM
      setCooldownForCategory(category, 5); // 👈 Angka 24 diubah jadi 5
    } catch (error) {
      console.error("Gagal mengirim skor kuis", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const namaPanggilan = user?.firstName || "Sobat Sehat";

  // ==========================================
  // UI 1: HALAMAN PEMILIHAN KATEGORI (DENGAN TIMER)
  // ==========================================
  if (!selectedCategory) {
    return (
      <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans text-slate-900">
        <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen relative pb-28 shadow-2xl overflow-x-hidden">
          <header className="bg-teal-600 px-6 pt-10 pb-6 rounded-b-[2rem] shadow-md z-10 shrink-0">
            <div className="flex items-center gap-3 text-white mb-2">
              <Link
                href="/dashboard"
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition active:scale-95"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-black tracking-tight">
                Evaluasi Quiz
              </h1>
            </div>
            <p className="text-teal-50 text-sm font-medium ml-11">
              Uji pemahamanmu tentang perawatan di rumah!
            </p>
          </header>

          <div className="flex-1 p-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BrainCircuit size={32} />
              </div>
              <h2 className="font-black text-slate-800 text-lg mb-2">
                Pilih Topik Kuis
              </h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Hasil kuis akan dipantau oleh perawat. Kuis yang sudah
                dikerjakan dapat diulang esok hari.
              </p>
            </div>

            <div className="space-y-4">
              {(Object.keys(QUIZ_DATA) as Array<keyof typeof QUIZ_DATA>).map(
                (key) => {
                  const quiz = QUIZ_DATA[key];
                  const Icon = quiz.icon;

                  // 🚀 Cek Status Timer Kategori Ini
                  const unlockTime = cooldowns[key];
                  const timeLeft = unlockTime ? getTimeLeft(unlockTime) : null;
                  const isOnCooldown = timeLeft !== null;

                  return (
                    <button
                      key={key}
                      disabled={isOnCooldown}
                      onClick={() => handleStart(key)}
                      className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all text-left ${
                        isOnCooldown
                          ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-80"
                          : "bg-white border-slate-100 shadow-sm hover:shadow-md active:scale-95"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${isOnCooldown ? "bg-slate-200 text-slate-400" : `${quiz.bg} ${quiz.color}`}`}
                        >
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3
                            className={`font-black text-base ${isOnCooldown ? "text-slate-500" : "text-slate-800"}`}
                          >
                            {quiz.title}
                          </h3>
                          {isOnCooldown ? (
                            <div className="text-xs text-rose-500 font-extrabold flex items-center gap-1 mt-1 animate-pulse">
                              <Clock size={14} /> Tersedia lagi: {timeLeft}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 font-bold mt-1">
                              5 Pertanyaan
                            </p>
                          )}
                        </div>
                      </div>
                      {!isOnCooldown && (
                        <ChevronRight className="text-slate-300" />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeQuiz = QUIZ_DATA[selectedCategory];
  const questionData = activeQuiz.questions[currentQuestion];
  const progressPercentage =
    ((currentQuestion + 1) / activeQuiz.questions.length) * 100;

  // ==========================================
  // UI 2: HALAMAN HASIL (SELESAI)
  // ==========================================
  if (isFinished) {
    const isGood = score >= 80;
    const isWarning = score < 80 && score >= 60;

    return (
      <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans text-slate-900">
        <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen shadow-2xl relative flex flex-col justify-center p-6 text-center">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100 relative overflow-hidden">
            <div
              className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 blur-2xl ${isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"}`}
            ></div>

            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-widest text-center">
                HASIL KUIS
              </h2>

              <div className="flex justify-center mb-6">
                <div
                  className={`relative w-40 h-40 rounded-full flex items-center justify-center border-[8px] shadow-inner ${isGood ? "border-emerald-100 bg-emerald-50 text-emerald-600" : isWarning ? "border-amber-100 bg-amber-50 text-amber-600" : "border-rose-100 bg-rose-50 text-rose-600"}`}
                >
                  {isSubmitting ? (
                    <Loader2 size={40} className="animate-spin opacity-50" />
                  ) : (
                    <div>
                      <span className="text-5xl font-black">{score}</span>
                      <span className="text-sm font-bold block opacity-70 uppercase tracking-widest mt-1">
                        POIN
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isSubmitting ? (
                <p className="text-sm font-bold text-slate-500 animate-pulse">
                  Menyimpan nilai ke sistem Rumah Sakit...
                </p>
              ) : (
                <>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs font-black uppercase tracking-widest ${isGood ? "bg-emerald-100 text-emerald-700" : isWarning ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {isGood ? (
                      <Trophy size={16} />
                    ) : isWarning ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {isGood
                      ? "Sangat Baik!"
                      : isWarning
                        ? "Cukup Baik"
                        : "Perlu Belajar Lagi"}
                  </div>

                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-8">
                    {isGood
                      ? `Hebat ${namaPanggilan}! Pemahamanmu tentang perawatan di rumah sudah sangat mantap. Lanjutkan terus gaya hidup sehatmu!`
                      : `Halo ${namaPanggilan}, sepertinya masih ada beberapa hal yang keliru. Yuk tonton ulang video edukasi di menu beranda biar lebih paham!`}
                  </p>

                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                  >
                    <Home size={18} /> Kembali ke Beranda
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI 3: HALAMAN PERTANYAAN AKTIF
  // ==========================================
  return (
    <div className="flex justify-center min-h-screen bg-slate-200/50 font-sans text-slate-900">
      <div className="w-full max-w-md md:max-w-lg mx-auto bg-slate-50 min-h-screen shadow-2xl relative flex flex-col">
        <header className="bg-white px-6 pt-10 pb-6 shadow-sm z-10 shrink-0 flex items-center gap-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition active:scale-95 text-slate-500"
          >
            <X size={20} />
          </button>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Pertanyaan {currentQuestion + 1} dari{" "}
                {activeQuiz.questions.length}
              </span>
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">
                {score} Poin
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${activeQuiz.bg} ${activeQuiz.color}`}
            >
              <activeQuiz.icon size={24} />
            </div>
            <h2 className="text-lg font-black text-slate-800 leading-relaxed">
              {questionData.question}
            </h2>
          </div>

          <div className="space-y-3">
            {questionData.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="w-full bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100 text-left hover:border-teal-400 hover:bg-teal-50 transition-all active:scale-95 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-sm group-hover:bg-teal-500 group-hover:text-white transition-colors shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-bold text-slate-700 text-sm leading-snug group-hover:text-teal-900 transition-colors">
                    {opt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

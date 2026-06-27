"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Thermometer,
  AlertTriangle,
  Bell,
  Menu,
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  FileText,
  FileHeart,
  Video,
  UploadCloud,
  ArrowLeft,
  Save,
  Pill,
  CalendarCheck,
  Trash2,
  Plus,
  PlayCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Award,
  Smartphone,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function AdminDashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const [laporan, setLaporan] = useState<any[]>([]);
  const [daftarPasien, setDaftarPasien] = useState<any[]>([]);
  const [edukasiList, setEdukasiList] = useState<any[]>([]);
  const [dataKuis, setDataKuis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // === STATE AUTO REFRESH GAYA 2 ===
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  // === STATE BARU BUAT FITUR SEARCH PASIEN ===
  const [selectedPatient, setSelectedPatient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationAlert, setValidationAlert] = useState({
    isOpen: false,
    message: "",
  });
  const [successAlert, setSuccessAlert] = useState(false);
  const [generatedLogin, setGeneratedLogin] = useState<{
    email: string;
    password: string;
  } | null>(null);

  // === STATE FORM RM 14 ===
  const [formData, setFormData] = useState({
    namaPasien: "",
    ruangan: "",
    namaDokter: "",
    namaPerawat: "",
    diagnosaMedis: "",
    tindakanDiberikan: "",
    jenisAktifitas: "",
    perubahanPosisi: "",
    eliminasi: "",
    alatBantu: "",
    tandaGejala: "",
    pengobatanDiRumah: "",
    nomorDarurat: "",
    jadwalKontrolEdukasi: "",
    labLanjutan: "",
    pemahamanObat: "",
    obatAlternatif: "",
    pencegahanKekambuhan: "",
    edukasiLainnya: "",
    anjuranMakan: "",
    batasanMakanan: "",
    kebutuhanSpiritual: "",
    tanggalPulang: "",
    pendamping: "",
    transportasi: "",
    keadaanUmum: "",
    jadwalKontrol: "",
    tempatKontrol: "",
  });

  const [medications, setMedications] = useState([
    { name: "", dosage: "", rules: "", timeToTake: "" },
  ]);

  // === SYNC NAMA DI SEARCH BAR KALAU KLIK DARI TABEL ===
  useEffect(() => {
    if (selectedPatient) {
      const p = daftarPasien.find((x) => x.qrCodeData === selectedPatient);
      if (p) setSearchTerm(`${p.user?.name || "Pasien"} - ${p.qrCodeData}`);
      else if (selectedPatient.startsWith("MED-"))
        setSearchTerm(`ID Baru: ${selectedPatient}`);
    } else {
      setSearchTerm("");
    }
  }, [selectedPatient, daftarPasien]);

  // LOGIKA NARIK HISTORY SAAT ID PASIEN DIKLIK
  useEffect(() => {
    const fetchPatientHistory = async () => {
      if (!selectedPatient) return;

      const isNew = !daftarPasien.find((p) => p.qrCodeData === selectedPatient);
      if (isNew) {
        setFormData({
          namaPasien: "",
          ruangan: "",
          namaDokter: "",
          namaPerawat: "",
          diagnosaMedis: "",
          tindakanDiberikan: "",
          jenisAktifitas: "",
          perubahanPosisi: "",
          eliminasi: "",
          alatBantu: "",
          tandaGejala: "",
          pengobatanDiRumah: "",
          nomorDarurat: "",
          jadwalKontrolEdukasi: "",
          labLanjutan: "",
          pemahamanObat: "",
          obatAlternatif: "",
          pencegahanKekambuhan: "",
          edukasiLainnya: "",
          anjuranMakan: "",
          batasanMakanan: "",
          kebutuhanSpiritual: "",
          tanggalPulang: "",
          pendamping: "",
          transportasi: "",
          keadaanUmum: "",
          jadwalKontrol: "",
          tempatKontrol: "",
        });
        setMedications([{ name: "", dosage: "", rules: "", timeToTake: "" }]);
        return;
      }

      try {
        const token = await getToken();
        const res = await fetch(
          `https://sadulur-api.vercel.app/api/admin/rm14?patientId=${selectedPatient}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.dischargeSummary) {
            const ds = data.dischargeSummary;
            setFormData({
              namaPasien: data.user?.name || "",
              diagnosaMedis: ds.diagnosaMedis || "",
              tindakanDiberikan: ds.tindakanDiberikan || "",
              ruangan: ds.ruangan || "",
              namaDokter: ds.namaDokter || "",
              namaPerawat: ds.namaPerawat || "",
              jenisAktifitas: ds.instruksiAktivitas || "",
              pengobatanDiRumah: ds.perawatanRumah || "",
              anjuranMakan: ds.aturanDiet || "",
              perubahanPosisi: "",
              eliminasi: "",
              alatBantu: "",
              tandaGejala: "",
              nomorDarurat: "",
              jadwalKontrolEdukasi: "",
              labLanjutan: "",
              pemahamanObat: "",
              obatAlternatif: "",
              pencegahanKekambuhan: "",
              edukasiLainnya: "",
              batasanMakanan: "",
              kebutuhanSpiritual: "",
              tanggalPulang: ds.tanggalPulang
                ? ds.tanggalPulang.split("T")[0]
                : "",
              pendamping: "",
              transportasi: "",
              keadaanUmum: "",
              jadwalKontrol: ds.jadwalKontrol
                ? ds.jadwalKontrol.split("T")[0]
                : "",
              tempatKontrol: ds.tempatKontrol || "",
            });

            if (ds.medications?.length > 0) setMedications(ds.medications);
            else
              setMedications([
                { name: "", dosage: "", rules: "", timeToTake: "" },
              ]);
          } else if (data) {
            setFormData((prev) => ({
              ...prev,
              namaPasien: data.user?.name || "",
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPatientHistory();
  }, [selectedPatient, daftarPasien]);

  const [isEdukasiModalOpen, setIsEdukasiModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [edukasiForm, setEdukasiForm] = useState({
    title: "",
    mediaUrl: "",
    category: "RING_JANTUNG",
  });
  const [isUploading, setIsUploading] = useState(false);

  // === STATE FINAL BOSS: FITUR BALAS CHAT ===
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isReplySuccessOpen, setIsReplySuccessOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyForm, setReplyForm] = useState({
    checkinId: "",
    message: "",
    emergencyNumber: "",
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReplying(true);
    try {
      const token = await getToken();
      // Nanti kita bikin API route khusus buat ini
      const res = await fetch(
        "https://sadulur-api.vercel.app/api/admin/checkin/reply",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(replyForm),
        },
      );

      if (res.ok) {
        setIsReplyModalOpen(false);
        setReplyForm({ checkinId: "", message: "", emergencyNumber: "" });
        fetchData();

        // 🚀 BUKA MODAL SUKSES MODERN
        setIsReplySuccessOpen(true);
      }
    } catch (err) {
      alert("Gagal mengirim balasan");
    } finally {
      setIsReplying(false);
    }
  };

  const [pageMonitoring, setPageMonitoring] = useState(1);
  const [pagePasien, setPagePasien] = useState(1);
  const [pageEdukasi, setPageEdukasi] = useState(1);
  const [pageKuis, setPageKuis] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setIsSidebarOpen(false);
  }, []);

  const changeMenu = (menu: string) => {
    setActiveMenu(menu);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setIsSidebarOpen(false);
  };

  // Fungsi dipoles biar bisa narik diem-diem tanpa bikin layar loading penuh
  const fetchData = async (isAuto = false) => {
    if (!isLoaded || !isSignedIn) return;

    // Kalau narik awal, pake loading gede. Kalau auto, pake loading kecil
    if (!isAuto) setIsLoading(true);
    else setIsAutoRefreshing(true);

    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = "https://sadulur-api.vercel.app/api";

      const [resCheckin, resPasien, resEdukasi, resKuis] = await Promise.all([
        fetch(`${baseUrl}/admin/checkin`, { headers }),
        fetch(`${baseUrl}/admin/pasien`, { headers }),
        fetch(`${baseUrl}/admin/edukasi`),
        fetch(`${baseUrl}/quiz`, { headers }),
      ]);

      if (resCheckin.ok) setLaporan(await resCheckin.json());
      if (resPasien.ok) setDaftarPasien(await resPasien.json());
      if (resEdukasi.ok) setEdukasiList(await resEdukasi.json());
      if (resKuis.ok) setDataKuis(await resKuis.json());

      // Catat waktu kapan data berhasil ditarik
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
      setIsAutoRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoaded, isSignedIn]);

  // === EFEK AUTO REFRESH (Jalan tiap 30 detik) ===
  useEffect(() => {
    // Mesin cuma nyala di 3 menu ini aja biar Form RM 14 aman dari kedip
    const allowedMenus = ["dashboard", "pasien", "evaluasi"];
    if (!allowedMenus.includes(activeMenu)) return;

    const interval = setInterval(() => {
      fetchData(true); // true = mode auto (narik diem-diem)
    }, 30000); // 30000 ms = 30 Detik

    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, activeMenu]);

  // === FUNGSI BARU: UPDATE STATUS KELUHAN (TANDAI SELESAI) ===
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // 1. Optimistic Update (Biar UI langsung berubah tanpa nunggu loading)
    setLaporan(
      laporan.map((item) =>
        item.id === id ? { ...item, isHandled: !currentStatus } : item,
      ),
    );

    // 2. Tembak ke Backend buat simpan permanen
    try {
      const token = await getToken();
      await fetch("https://sadulur-api.vercel.app/api/admin/checkin", {
        method: "PUT", // Endpoint PUT update status
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, isHandled: !currentStatus }),
      });
    } catch (e) {
      console.error("Gagal update status penanganan");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const addMedication = () =>
    setMedications([
      ...medications,
      { name: "", dosage: "", rules: "", timeToTake: "" },
    ]);
  const removeMedication = (index: number) => {
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };
  const handleMedChange = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedications(newMeds);
  };

  const handleSaveRm14 = async () => {
    if (!selectedPatient)
      return setValidationAlert({
        isOpen: true,
        message: "Pilih pasien terlebih dahulu!",
      });

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch("https://sadulur-api.vercel.app/api/admin/rm14", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          ...formData,
          medications,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // 🚀 Simpan ID pasien ke variabel lokal dulu sebelum formnya di-reset
        const currentPatientId = selectedPatient;

        if (data.generatedAccount) setGeneratedLogin(data.generatedAccount);
        setSuccessAlert(true);
        fetchData();
        setFormData({
          namaPasien: "",
          ruangan: "",
          namaDokter: "",
          namaPerawat: "",
          diagnosaMedis: "",
          tindakanDiberikan: "",
          jenisAktifitas: "",
          perubahanPosisi: "",
          eliminasi: "",
          alatBantu: "",
          tandaGejala: "",
          pengobatanDiRumah: "",
          nomorDarurat: "",
          jadwalKontrolEdukasi: "",
          labLanjutan: "",
          pemahamanObat: "",
          obatAlternatif: "",
          pencegahanKekambuhan: "",
          edukasiLainnya: "",
          anjuranMakan: "",
          batasanMakanan: "",
          kebutuhanSpiritual: "",
          tanggalPulang: "",
          pendamping: "",
          transportasi: "",
          keadaanUmum: "",
          jadwalKontrol: "",
          tempatKontrol: "",
        });
        setMedications([{ name: "", dosage: "", rules: "", timeToTake: "" }]);
        setSearchTerm("");
        setSelectedPatient("");

        if (data.generatedAccount) {
          window.open(
            `/rekam-medis/${currentPatientId}?email=${data.generatedAccount.email}&pass=${data.generatedAccount.password}`, // <--- Ganti ke rekam-medis
            "_blank",
          );
        } else {
          window.open(`/rekam-medis/${currentPatientId}`, "_blank"); // <--- Ganti ke rekam-medis
        }
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (error) {
      alert("Kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdukasi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const token = await getToken();
      const res = await fetch(
        "https://sadulur-api.vercel.app/api/admin/edukasi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(edukasiForm),
        },
      );
      if (res.ok) {
        setIsEdukasiModalOpen(false);
        setEdukasiForm({ title: "", mediaUrl: "", category: "RING_JANTUNG" });
        fetchData();
      }
    } catch (err) {
      alert("Gagal nyimpen video.");
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDeleteEdukasi = async () => {
    if (!videoToDelete) return;
    try {
      const token = await getToken();
      const res = await fetch(
        `https://sadulur-api.vercel.app/api/admin/edukasi?id=${videoToDelete}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        fetchData();
        setIsDeleteModalOpen(false);
        setVideoToDelete(null);
      }
    } catch (err) {
      alert("Gagal hapus video.");
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
      ", " +
      date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
      " WIB"
    );
  };

  const pasienDemam = laporan.filter((l) => l.hasFever).length;
  const rataNyeri =
    laporan.length > 0
      ? (
          laporan.reduce((acc, curr) => acc + curr.painScale, 0) /
          laporan.length
        ).toFixed(1)
      : "0";
  // Kritis dihitung jika nyeri tinggi ATAU belum ditangani
  const perluPerhatian = laporan.filter(
    (l) => (l.painScale > 7 || l.hasFever) && !l.isHandled,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-teal-800 text-white flex flex-col transition-all duration-300 md:relative shadow-xl ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"}`}
      >
        <div className="h-16 md:h-20 flex items-center justify-between md:justify-center px-4 border-b border-teal-700/50">
          <div className="flex items-center">
            <Activity size={32} className="text-teal-400 shrink-0" />
            <span
              className={`font-black text-xl ml-3 transition-opacity ${isSidebarOpen ? "opacity-100" : "opacity-0 invisible"}`}
            >
              SADULUR<span className="text-teal-400">CARE</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-teal-300"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "dashboard", label: "Monitoring Perawat", icon: Activity },
            { id: "pasien", label: "Database Pasien", icon: Users },
            { id: "form-rm14", label: "Dokumen RM 14", icon: FileText },
            { id: "edukasi", label: "Database Pusat Edukasi", icon: Video },
            { id: "evaluasi", label: "Hasil Skor Quis", icon: ClipboardCheck },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => changeMenu(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${activeMenu === item.id || (activeMenu === "form-rm14" && item.id === "form-rm14") ? "bg-teal-700 text-white shadow-md" : "text-teal-300 hover:bg-teal-700/50"} ${isSidebarOpen ? "justify-start" : "justify-center"}`}
            >
              <item.icon size={20} className="shrink-0" />
              <span
                className={`font-bold text-sm ml-4 whitespace-nowrap transition-opacity ${isSidebarOpen ? "opacity-100" : "opacity-0 invisible w-0"}`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-sm md:text-xl font-black text-slate-800 uppercase tracking-tight">
              MANAJEMEN REKAM MEDIS
            </h1>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative p-2 text-slate-400">
              <Bell size={20} />
              {perluPerhatian > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
          {/* MENU 1: DASHBOARD MONITORING */}
          {activeMenu === "dashboard" && (
            <div className="w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">
                      Total Laporan
                    </p>
                    <h3 className="text-2xl font-black">{laporan.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">
                      Rerata Nyeri
                    </p>
                    <h3 className="text-2xl font-black">{rataNyeri}/10</h3>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                    <Thermometer size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">
                      Pasien Demam
                    </p>
                    <h3 className="text-2xl font-black">{pasienDemam}</h3>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">
                      Kritis (Belum Ditangani)
                    </p>
                    <h3 className="text-2xl font-black">{perluPerhatian}</h3>
                  </div>
                </div>
              </div>

              {/* TABEL LIVE MONITORING YANG SUDAH DI-UPGRADE */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-slate-50 flex justify-between items-center">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>{" "}
                    Live Monitoring & Keluhan
                  </h2>
                  {lastUpdated && (
                    <span className="text-[10px] bg-teal-50 text-teal-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-teal-100 shadow-inner">
                      {isAutoRefreshing ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Clock size={12} />
                      )}
                      <span className="hidden sm:inline">Update:</span>{" "}
                      {lastUpdated.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto p-6 pt-0">
                  <table className="w-full text-left min-w-[950px]">
                    <thead>
                      <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                        <th className="pb-3 w-1/4">Nama & ID Pasien</th>
                        <th className="pb-3 text-center">Level Nyeri 1-10</th>
                        <th className="pb-3 w-1/3">Keluhan Pasien</th>
                        <th className="pb-3 text-center">Status Penanganan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center">
                            <Loader2 className="animate-spin inline text-teal-600" />
                          </td>
                        </tr>
                      ) : laporan.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-10 text-center text-sm text-slate-400 font-bold"
                          >
                            Belum ada laporan masuk.
                          </td>
                        </tr>
                      ) : (
                        laporan
                          .slice(
                            (pageMonitoring - 1) * ITEMS_PER_PAGE,
                            pageMonitoring * ITEMS_PER_PAGE,
                          )
                          .map((item) => {
                            const qrCode =
                              item.patient?.qrCodeData ||
                              `MED-${item.patientId?.slice(-5).toUpperCase()}`;
                            // Nama Pasien Cerdas: Prioritaskan nama, kalau kosong jadi Pasien Aplikasi
                            const patientName =
                              item.patient?.user?.name &&
                              item.patient.user.name !== "User"
                                ? item.patient.user.name
                                : item.patient?.user?.email?.split("@")[0] ||
                                  "Pasien Aplikasi";

                            return (
                              <tr
                                key={item.id}
                                className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                              >
                                {/* KOLOM 1: IDENTITAS */}
                                <td className="py-4">
                                  {/* 🚀 BUNGKUS NAMA PAKE LINK BIAR BISA DIKLIK */}
                                  <Link
                                    href={`/rekam-medis/${qrCode}`} // <--- Arahin ke halaman PDF A4 Publik yang baru!
                                    target="_blank"
                                    className="font-black text-slate-800 text-sm capitalize hover:text-teal-600 hover:underline transition-all cursor-pointer"
                                  >
                                    {patientName}
                                  </Link>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider">
                                    {qrCode}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                                    <Clock size={10} className="inline" />{" "}
                                    {formatDateTime(item.date)}
                                  </p>
                                </td>
                                {/* KOLOM 2: KONDISI FISIK (GABUNGAN) */}
                                <td className="py-4 text-center">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-black text-white w-max ${item.painScale > 7 ? "bg-red-500" : item.painScale > 3 ? "bg-amber-400" : "bg-teal-500"}`}
                                    >
                                      Nyeri: {item.painScale} / 10
                                    </span>
                                    {item.hasFever && (
                                      <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-0.5 rounded border border-red-100">
                                        DEMAM TINGGI
                                      </span>
                                    )}
                                    {item.tookMedicine ? (
                                      <span className="bg-teal-50 text-teal-600 text-[9px] font-black px-2 py-0.5 rounded border border-teal-100">
                                        OBAT DIMINUM
                                      </span>
                                    ) : (
                                      <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded border border-orange-100">
                                        BELUM OBAT
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* KOLOM 3: KELUHAN */}
                                <td className="py-4 pr-4">
                                  {item.symptoms ? (
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 relative">
                                      <MessageSquare
                                        size={14}
                                        className="text-slate-300 absolute top-3 left-3"
                                      />
                                      <p className="text-xs font-bold text-slate-600 italic pl-6">
                                        "{item.symptoms}"
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-300 italic text-center">
                                      - Tidak ada keluhan -
                                    </p>
                                  )}
                                </td>

                                {/* KOLOM 4: STATUS PENANGANAN & AKSI CHAT */}
                                <td className="py-4 text-center">
                                  {item.isHandled ? (
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-200">
                                      <CheckCircle size={16} /> Selesai
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-black border border-rose-200">
                                        <AlertTriangle size={16} /> Belum
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setReplyForm({
                                              checkinId: item.id,
                                              message: "",
                                              // Otomatis tarik no darurat dari RM14 kalau ada
                                              emergencyNumber:
                                                item.patient?.dischargeSummary
                                                  ?.nomorDarurat || "",
                                            });
                                            setIsReplyModalOpen(true);
                                          }}
                                          className="text-[10px] bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-all shadow-md font-bold flex items-center gap-1"
                                        >
                                          <MessageSquare size={12} /> Balas
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleToggleStatus(
                                              item.id,
                                              !!item.isHandled,
                                            )
                                          }
                                          className="text-[10px] bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-all shadow-md font-bold"
                                        >
                                          Beres
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
                {Math.ceil(laporan.length / ITEMS_PER_PAGE) > 1 && (
                  <div className="flex justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() =>
                        setPageMonitoring((p) => Math.max(1, p - 1))
                      }
                      disabled={pageMonitoring === 1}
                      className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-black text-slate-500">
                      Hal {pageMonitoring}/
                      {Math.ceil(laporan.length / ITEMS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() =>
                        setPageMonitoring((p) =>
                          Math.min(
                            Math.ceil(laporan.length / ITEMS_PER_PAGE),
                            p + 1,
                          ),
                        )
                      }
                      disabled={
                        pageMonitoring ===
                        Math.ceil(laporan.length / ITEMS_PER_PAGE)
                      }
                      className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MENU 2: DATABASE PASIEN */}
          {activeMenu === "pasien" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <FileHeart size={24} className="text-teal-600" /> Database
                  Pasien
                </h2>
                {lastUpdated && (
                  <span className="text-[10px] bg-teal-50 text-teal-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-teal-100 shadow-inner">
                    {isAutoRefreshing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Clock size={12} />
                    )}
                    <span className="hidden sm:inline">Update:</span>{" "}
                    {lastUpdated.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto p-6 pt-0">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase font-black bg-slate-50">
                      <th className="p-4">ID & Nama</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4">Diagnosa Akhir</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daftarPasien.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-10 font-bold text-slate-400"
                        >
                          Belum ada pasien.
                        </td>
                      </tr>
                    ) : (
                      daftarPasien
                        .slice(
                          (pagePasien - 1) * ITEMS_PER_PAGE,
                          pagePasien * ITEMS_PER_PAGE,
                        )
                        .map((p) => {
                          const patientName =
                            p.user?.name && p.user.name !== "User"
                              ? p.user.name
                              : p.user?.email?.split("@")[0] ||
                                "Pasien Aplikasi";
                          return (
                            <tr
                              key={p.id}
                              className="border-b border-slate-50 hover:bg-slate-50"
                            >
                              <td className="p-4">
                                <p className="font-black text-slate-800 text-sm capitalize">
                                  {patientName}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5 tracking-wider">
                                  {p.qrCodeData}
                                </p>
                              </td>
                              <td className="p-4 text-center">
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-emerald-200">
                                  TERDAFTAR
                                </span>
                              </td>
                              <td className="p-4">
                                {p.dischargeSummary ? (
                                  <span className="text-emerald-600 font-black text-xs flex items-center gap-1">
                                    <CheckCircle size={14} /> Selesai Diagnosa
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-xs">
                                    Menunggu Tindakan
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {p.dischargeSummary ? (
                                  <button
                                    onClick={() =>
                                      window.open(
                                        `/rekam-medis/${p.qrCodeData}`, // <--- Ganti ke rekam-medis
                                        "_blank",
                                      )
                                    }
                                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto"
                                  >
                                    <FileText size={14} /> Lihat PDF RM 14
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedPatient(p.qrCodeData);
                                      changeMenu("form-rm14");
                                    }}
                                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto"
                                  >
                                    <Plus size={14} /> Isi RM 14 (Baru)
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
              {Math.ceil(daftarPasien.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => setPagePasien((p) => Math.max(1, p - 1))}
                    disabled={pagePasien === 1}
                    className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black text-slate-500">
                    Hal {pagePasien}/
                    {Math.ceil(daftarPasien.length / ITEMS_PER_PAGE)}
                  </span>
                  <button
                    onClick={() =>
                      setPagePasien((p) =>
                        Math.min(
                          Math.ceil(daftarPasien.length / ITEMS_PER_PAGE),
                          p + 1,
                        ),
                      )
                    }
                    disabled={
                      pagePasien ===
                      Math.ceil(daftarPasien.length / ITEMS_PER_PAGE)
                    }
                    className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeMenu === "form-rm14" && (
            <div className="max-w-5xl mx-auto pb-10">
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-black text-teal-600 uppercase tracking-widest">
                    Pilih / Cari Pasien
                  </label>
                  <button
                    onClick={() => {
                      const newId = `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                      setSelectedPatient(newId);
                      setSearchTerm("");
                    }}
                    className="bg-teal-100 text-teal-800 hover:bg-teal-200 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Plus size={16} /> DAFTARKAN PASIEN BARU DAN AKUN
                  </button>
                </div>

                {selectedPatient &&
                !daftarPasien.find((p) => p.qrCodeData === selectedPatient) ? (
                  <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-base font-black text-slate-800 flex justify-between items-center shadow-inner mb-6">
                    <span className="flex items-center gap-2">
                      <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-[10px] uppercase">
                        Pasien Baru
                      </span>{" "}
                      ID Medis:{" "}
                      <span className="text-teal-700">{selectedPatient}</span>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPatient("");
                        setSearchTerm("");
                      }}
                      className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="relative mb-6">
                    <div className="w-full bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100 rounded-2xl p-4 text-base font-black text-slate-800 flex items-center gap-3 transition-all cursor-text shadow-inner">
                      <Search size={20} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Ketik Nama atau ID Pasien untuk mencari..."
                        className="bg-transparent w-full outline-none"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                          if (selectedPatient) setSelectedPatient("");
                        }}
                        onClick={() => {
                          if (selectedPatient) {
                            setSelectedPatient("");
                            setSearchTerm("");
                          }
                        }}
                      />
                      {selectedPatient && !isDropdownOpen ? (
                        <CheckCircle
                          size={20}
                          className="text-emerald-500 shrink-0"
                        />
                      ) : (
                        <ChevronRight
                          size={20}
                          className={`text-slate-400 shrink-0 transition-transform ${isDropdownOpen && searchTerm.trim().length > 0 ? "rotate-90" : ""}`}
                        />
                      )}
                    </div>

                    {isDropdownOpen && searchTerm.trim().length > 0 && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        ></div>
                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                          {daftarPasien
                            .filter((p) =>
                              `${p.user?.name || "Pasien"} ${p.qrCodeData}`
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()),
                            )
                            .map((p) => (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setSelectedPatient(p.qrCodeData);
                                  setSearchTerm(
                                    `${p.user?.name || "Pasien"} - ${p.qrCodeData}`,
                                  );
                                  setIsDropdownOpen(false);
                                }}
                                className="p-4 hover:bg-teal-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex justify-between items-center group"
                              >
                                <div>
                                  <p className="font-black text-slate-800 text-sm group-hover:text-teal-700">
                                    {p.user?.name || "Pasien"}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1 group-hover:text-teal-600">
                                    {p.qrCodeData}
                                  </p>
                                </div>
                                <Plus
                                  size={18}
                                  className="text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                            ))}
                          {daftarPasien.filter((p) =>
                            `${p.user?.name || "Pasien"} ${p.qrCodeData}`
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          ).length === 0 && (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                              <AlertTriangle
                                size={32}
                                className="text-amber-400 mb-3"
                              />
                              <p className="text-sm font-black text-slate-700">
                                Pasien Tidak Ditemukan
                              </p>
                              <p className="text-xs text-slate-500 font-medium mt-1">
                                Coba ketik nama atau ID yang lain.
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {selectedPatient && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                  <div className="bg-white rounded-[2rem] shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                        1. Identitas & Tindakan
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Nama Lengkap Pasien
                        </label>
                        <input
                          name="namaPasien"
                          value={formData.namaPasien}
                          onChange={handleFormChange}
                          placeholder="Masukkan Nama Lengkap..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none ring-2 ring-transparent focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Ruangan
                        </label>
                        <input
                          name="ruangan"
                          value={formData.ruangan}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Diagnosa Medis Akhir
                        </label>
                        <input
                          name="diagnosaMedis"
                          value={formData.diagnosaMedis}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Tindakan Diberikan
                        </label>
                        <textarea
                          name="tindakanDiberikan"
                          value={formData.tindakanDiberikan}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none resize-none"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Nama Dokter
                        </label>
                        <input
                          name="namaDokter"
                          value={formData.namaDokter}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Nama Perawat
                        </label>
                        <input
                          name="namaPerawat"
                          value={formData.namaPerawat}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                        2. Aktifitas & Perawatan
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Jenis Aktifitas (Diizinkan)
                        </label>
                        <textarea
                          name="jenisAktifitas"
                          value={formData.jenisAktifitas}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Perubahan Posisi (ROM)
                        </label>
                        <textarea
                          name="perubahanPosisi"
                          value={formData.perubahanPosisi}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Eliminasi (Toilet Training)
                        </label>
                        <textarea
                          name="eliminasi"
                          value={formData.eliminasi}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Alat Bantu yang Digunakan
                        </label>
                        <textarea
                          name="alatBantu"
                          value={formData.alatBantu}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                        3. Edukasi Kesehatan
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Tanda Gejala Perlu Lapor
                        </label>
                        <textarea
                          name="tandaGejala"
                          value={formData.tandaGejala}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Pengobatan di Rumah
                        </label>
                        <textarea
                          name="pengobatanDiRumah"
                          value={formData.pengobatanDiRumah}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Pemahaman Efek Samping Obat
                        </label>
                        <textarea
                          name="pemahamanObat"
                          value={formData.pemahamanObat}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Pencegahan Kekambuhan
                        </label>
                        <textarea
                          name="pencegahanKekambuhan"
                          value={formData.pencegahanKekambuhan}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] shadow-md border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">
                        4. Diet, Pemulangan & Obat
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Anjuran Pola Makan
                        </label>
                        <textarea
                          name="anjuranMakan"
                          value={formData.anjuranMakan}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                          Batasan Makanan
                        </label>
                        <textarea
                          name="batasanMakanan"
                          value={formData.batasanMakanan}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                        ></textarea>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                            Tgl Pulang
                          </label>
                          <input
                            type="date"
                            name="tanggalPulang"
                            value={formData.tanggalPulang}
                            onChange={handleFormChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                            Tgl Kontrol
                          </label>
                          <input
                            type="date"
                            name="jadwalKontrol"
                            value={formData.jadwalKontrol}
                            onChange={handleFormChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-slate-500 uppercase mb-2 block">
                            Pendamping
                          </label>
                          <input
                            type="text"
                            name="pendamping"
                            value={formData.pendamping}
                            onChange={handleFormChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-black text-red-500 uppercase mb-2 block">
                            No Darurat
                          </label>
                          <input
                            type="text"
                            name="nomorDarurat"
                            value={formData.nomorDarurat}
                            onChange={handleFormChange}
                            className="w-full bg-red-50 border border-red-200 rounded-xl p-3 text-sm"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-xs font-black uppercase text-slate-800">
                            <Pill size={14} className="inline text-teal-600" />{" "}
                            Daftar Obat Pulang
                          </label>
                          <button
                            onClick={addMedication}
                            className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-black"
                          >
                            <Plus size={14} className="inline" /> Tambah Obat
                          </button>
                        </div>
                        <div className="space-y-3">
                          {medications.map((med, index) => (
                            <div
                              key={index}
                              className="flex flex-col md:flex-row gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                            >
                              <input
                                type="text"
                                placeholder="Nama Obat"
                                value={med.name}
                                onChange={(e) =>
                                  handleMedChange(index, "name", e.target.value)
                                }
                                className="w-full md:flex-1 p-2 text-sm rounded-lg border border-slate-200 outline-none"
                              />
                              <div className="flex gap-2 w-full md:w-auto">
                                <input
                                  type="text"
                                  placeholder="Dosis"
                                  value={med.dosage}
                                  onChange={(e) =>
                                    handleMedChange(
                                      index,
                                      "dosage",
                                      e.target.value,
                                    )
                                  }
                                  className="w-1/2 md:w-24 p-2 text-sm rounded-lg border border-slate-200 outline-none"
                                />
                                <input
                                  type="text"
                                  placeholder="Jam Minum"
                                  value={med.timeToTake}
                                  onChange={(e) =>
                                    handleMedChange(
                                      index,
                                      "timeToTake",
                                      e.target.value,
                                    )
                                  }
                                  className="w-1/2 md:w-24 p-2 text-sm rounded-lg border border-slate-200 outline-none"
                                />
                              </div>
                              <input
                                type="text"
                                placeholder="Aturan"
                                value={med.rules}
                                onChange={(e) =>
                                  handleMedChange(
                                    index,
                                    "rules",
                                    e.target.value,
                                  )
                                }
                                className="w-full md:w-48 p-2 text-sm rounded-lg border border-slate-200 outline-none"
                              />
                              <button
                                onClick={() => removeMedication(index)}
                                className="w-full md:w-auto p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 pb-10">
                    <button
                      onClick={handleSaveRm14}
                      disabled={isSubmitting}
                      className="flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-white bg-teal-600 hover:bg-teal-700 shadow-xl transition-all disabled:bg-slate-400"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Save />
                      )}{" "}
                      SIMPAN & AUTO-CREATE AKUN
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMenu === "edukasi" && (
            <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800">
                  <Video size={24} className="inline text-teal-600 mr-2" />{" "}
                  Database Edukasi
                </h2>
                <button
                  onClick={() => setIsEdukasiModalOpen(true)}
                  className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-teal-700"
                >
                  <UploadCloud size={16} /> Upload Video
                </button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto p-6">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-slate-50 text-[10px] text-slate-400 font-black uppercase">
                        <th className="pb-3">Judul Konten</th>
                        <th className="pb-3">Kategori</th>
                        <th className="pb-3 text-center">Tautan</th>
                        <th className="pb-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {edukasiList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-10 text-center font-bold text-slate-400"
                          >
                            Belum ada video edukasi.
                          </td>
                        </tr>
                      ) : (
                        edukasiList
                          .slice(
                            (pageEdukasi - 1) * ITEMS_PER_PAGE,
                            pageEdukasi * ITEMS_PER_PAGE,
                          )
                          .map((edu) => (
                            <tr
                              key={edu.id}
                              className="border-b border-slate-50"
                            >
                              <td className="py-4 text-sm font-bold text-slate-700">
                                {edu.title}
                              </td>
                              <td className="py-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                                  {edu.category.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-4 text-center">
                                <a
                                  href={edu.mediaUrl}
                                  target="_blank"
                                  className="text-teal-600 hover:underline text-xs font-bold"
                                >
                                  <PlayCircle size={14} className="inline" />{" "}
                                  Cek Video
                                </a>
                              </td>
                              <td className="py-4 text-center">
                                <button
                                  onClick={() => {
                                    setVideoToDelete(edu.id);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="text-rose-500 p-2 bg-rose-50 rounded-lg"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "evaluasi" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden w-full animate-in fade-in duration-500">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Award size={24} className="text-teal-600" /> Hasil Quis
                </h2>
                {lastUpdated && (
                  <span className="text-[10px] bg-teal-50 text-teal-600 px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-teal-100 shadow-inner">
                    {isAutoRefreshing ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Clock size={12} />
                    )}
                    <span className="hidden sm:inline">Update:</span>{" "}
                    {lastUpdated.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto p-6 pt-0">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase font-black">
                      <th className="p-4">Tanggal Selesai</th>
                      <th className="p-4">Nama Pasien</th>
                      <th className="p-4 text-center">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataKuis.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-10 font-bold text-slate-400"
                        >
                          Belum ada hasil kuis.
                        </td>
                      </tr>
                    ) : (
                      dataKuis
                        // 🚀 BATASIN MAKSIMAL 6 PASIEN PER HALAMAN
                        .slice((pageKuis - 1) * 6, pageKuis * 6)
                        .map((kuis) => {
                          // 🚀 TARIK NAMA PALING AKURAT & BERSIHKAN NAMA HASIL GENERATE
                          let patientName =
                            kuis.patient?.user?.name &&
                            kuis.patient.user.name !== "User"
                              ? kuis.patient.user.name
                              : kuis.patient?.user?.firstName
                                ? kuis.patient.user.firstName
                                : kuis.patient?.user?.email?.split("@")[0] ||
                                  "Pasien Aplikasi";

                          // Hilangkan underscore biar rapi (Misal: Pasien_medvq -> Pasien medvq)
                          patientName = patientName.replace(/_/g, " ");

                          const qrCode =
                            kuis.patient?.qrCodeData || "ID Tidak Diketahui";

                          return (
                            <tr
                              key={kuis.id}
                              className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                            >
                              <td className="p-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                                {new Date(kuis.createdAt).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="p-4">
                                {/* 🚀 NAMA DI ATAS, KODE DI BAWAH */}
                                <p className="font-black text-slate-800 text-sm capitalize">
                                  {patientName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-wider uppercase">
                                  {qrCode}
                                </p>
                              </td>
                              <td className="p-4 text-center">
                                <span
                                  className={`px-3 py-2 rounded-full font-black text-sm ${
                                    kuis.score >= 80
                                      ? "bg-emerald-100 text-emerald-700"
                                      : kuis.score >= 60
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  {kuis.score}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {/* 🚀 TOMBOL NEXT PAGE (MUNCUL OTOMATIS KALAU DATA LEBIH DARI 6) */}
              {Math.ceil(dataKuis.length / 6) > 1 && (
                <div className="flex justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => setPageKuis((p) => Math.max(1, p - 1))}
                    disabled={pageKuis === 1}
                    className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50 hover:bg-slate-100 transition-all"
                  >
                    <ChevronLeft size={16} className="text-slate-600" />
                  </button>
                  <span className="text-xs font-black text-slate-500 flex items-center">
                    Halaman {pageKuis} dari {Math.ceil(dataKuis.length / 6)}
                  </span>
                  <button
                    onClick={() =>
                      setPageKuis((p) =>
                        Math.min(Math.ceil(dataKuis.length / 6), p + 1),
                      )
                    }
                    disabled={pageKuis === Math.ceil(dataKuis.length / 6)}
                    className="p-2 bg-white rounded-lg shadow-sm disabled:opacity-50 hover:bg-slate-100 transition-all"
                  >
                    <ChevronRight size={16} className="text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}

      {/* 🚀 MODAL UPLOAD VIDEO EDUKASI */}
      {isEdukasiModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 animate-in zoom-in-95 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Video size={24} className="text-teal-600" /> Upload Edukasi
              </h3>
              <button
                onClick={() => setIsEdukasiModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdukasi} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Judul Konten Video
                </label>
                <input
                  type="text"
                  required
                  value={edukasiForm.title}
                  onChange={(e) =>
                    setEdukasiForm({ ...edukasiForm, title: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-teal-500 focus:bg-white outline-none transition-all"
                  placeholder="Contoh: Senam Jantung Sehat"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Link Video (YouTube)
                </label>
                <input
                  type="url"
                  required
                  value={edukasiForm.mediaUrl}
                  onChange={(e) =>
                    setEdukasiForm({ ...edukasiForm, mediaUrl: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-teal-500 focus:bg-white outline-none transition-all"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Kategori Penyakit
                </label>
                <select
                  value={edukasiForm.category}
                  onChange={(e) =>
                    setEdukasiForm({ ...edukasiForm, category: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-teal-500 focus:bg-white outline-none cursor-pointer transition-all font-bold text-slate-700"
                >
                  <option value="RING_JANTUNG">
                    Kuis Post-PCI (Ring Jantung)
                  </option>
                  <option value="GULA_DIABETES">
                    Manajemen Gula / Diabetes
                  </option>
                  <option value="GINJAL">Perawatan Ginjal / Cuci Darah</option>
                  {/* 7 Kategori Baru (Sesuai Request Dokter) */}
                  <option value="HIPERTENSI">Hipertensi (Darah Tinggi)</option>
                  <option value="HIV">Edukasi HIV</option>
                  <option value="STROKE">Pemulihan Stroke</option>
                  <option value="KANKER">Perawatan Kanker</option>
                  <option value="JANTUNG_KORONER">Jantung Koroner</option>
                  <option value="GASTRITIS">Gastritis (Asam Lambung)</option>
                  <option value="PPOK">Penyakit Paru Obstruksi Kronis</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEdukasiModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3.5 rounded-xl font-black text-white bg-teal-600 hover:bg-teal-700 transition-all disabled:bg-slate-400 active:scale-95 flex justify-center items-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {isUploading ? "Menyimpan..." : "Simpan Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL HAPUS VIDEO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 md:p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              Hapus Edukasi?
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Video ini akan dihapus dari database dan tidak bisa dilihat pasien
              lagi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteEdukasi}
                className="flex-1 py-3 rounded-xl font-black text-white bg-rose-500 hover:bg-rose-600 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🚀 MODAL FINAL BOSS: BALAS CHAT & NO DARURAT */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 animate-in zoom-in-95 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <MessageSquare size={24} className="text-teal-600" /> Balas
                Keluhan
              </h3>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Pesan Dokter / Perawat
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyForm.message}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, message: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-teal-500 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Contoh: Silakan minum obat pereda nyeri Anda, jika masih sakit segera hubungi nomor di bawah..."
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Smartphone size={14} /> Nomor Darurat (WA/Telp)
                </label>
                <input
                  type="text"
                  required
                  value={replyForm.emergencyNumber}
                  onChange={(e) =>
                    setReplyForm({
                      ...replyForm,
                      emergencyNumber: e.target.value,
                    })
                  }
                  className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm focus:ring-rose-500 focus:bg-white outline-none transition-all font-bold text-rose-700"
                  placeholder="Contoh: 0812-3456-7890"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                  *Nomor ini akan muncul dengan tombol 'Hubungi Sekarang' di HP
                  pasien.
                </p>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsReplyModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isReplying}
                  className="flex-1 py-3.5 rounded-xl font-black text-white bg-teal-600 hover:bg-teal-700 transition-all disabled:bg-slate-400 active:scale-95 flex justify-center items-center gap-2"
                >
                  {isReplying ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <MessageSquare size={18} />
                  )}
                  {isReplying ? "Mengirim..." : "Kirim Pesan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 🚀 MODAL SUKSES BALAS CHAT MODERN */}
      {isReplySuccessOpen && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner border-4 border-white ring-8 ring-emerald-50">
              <CheckCircle size={56} className="text-emerald-500" />
            </div>
            <h3 className="font-black text-2xl text-slate-900 mb-2 tracking-tight">
              Pesan Terkirim!
            </h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium px-2">
              Balasan dan kontak darurat telah berhasil dikirim ke aplikasi HP
              pasien.
            </p>
            <button
              onClick={() => setIsReplySuccessOpen(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"
            >
              OKE, MANTAP!
            </button>
          </div>
        </div>
      )}
      {successAlert && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center animate-in zoom-in-95">
            <CheckCircle size={50} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              Berhasil!
            </h3>
            {generatedLogin ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left mt-4 mb-6">
                <p className="text-[10px] font-black text-amber-700 uppercase mb-2 flex items-center gap-1">
                  <Smartphone size={12} /> Akses Login Pasien
                </p>
                <p className="text-sm font-bold text-slate-700">
                  Email:{" "}
                  <span className="text-teal-700">{generatedLogin.email}</span>
                </p>
                <p className="text-sm font-bold text-slate-700">
                  Pass:{" "}
                  <span className="text-teal-700">
                    {generatedLogin.password}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 font-medium mb-6">
                Data RM 14 berhasil diamankan.
              </p>
            )}
            <button
              onClick={() => {
                setSuccessAlert(false);
                setActiveMenu("pasien");
                setGeneratedLogin(null);
              }}
              className="w-full py-4 rounded-2xl font-black text-white bg-slate-800 hover:bg-black transition-all"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

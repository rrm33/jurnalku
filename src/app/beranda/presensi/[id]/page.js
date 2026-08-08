"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, UserX, UserMinus, AlertCircle, Save } from "lucide-react";
import Swal from "sweetalert2";

export default function PresensiPage({ params }) {
  const router = useRouter();
  
  // Nanti rppId bisa diambil untuk fetch data
  const rppId = params?.id || "1";

  // Data Siswa Dummy
  const [siswaList, setSiswaList] = useState([
    { id: 1, nama: "Ahmad Dahlan", status: null, keterangan: "" },
    { id: 2, nama: "Budi Santoso", status: null, keterangan: "" },
    { id: 3, nama: "Siti Aminah", status: null, keterangan: "" },
    { id: 4, nama: "Dewi Lestari", status: null, keterangan: "" },
    { id: 5, nama: "Raden Saleh", status: null, keterangan: "" },
  ]);

  const updateStatus = (id, status) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const updateKeterangan = (id, text) => {
    setSiswaList(prev => prev.map(s => s.id === id ? { ...s, keterangan: text } : s));
  };

  const setAllStatus = (status) => {
    setSiswaList(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSimpan = () => {
    const belumDiabsen = siswaList.filter(s => s.status === null);
    if (belumDiabsen.length > 0) {
      return Swal.fire("Peringatan", `Ada ${belumDiabsen.length} siswa yang belum diabsen!`, "warning");
    }

    Swal.fire({
      title: "Menyimpan...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    setTimeout(() => {
      Swal.fire("Berhasil", "Data presensi berhasil disimpan!", "success").then(() => {
        router.push("/beranda");
      });
    }, 1000);
  };

  // Konfigurasi style untuk setiap status
  const statusConfig = {
    Hadir: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    Izin: { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
    Sakit: { icon: UserMinus, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    Alpha: { icon: UserX, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push("/beranda")}
          className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Presensi Kelas</h1>
          <p className="text-slate-500 text-sm">Pertemuan ke-1 • Pengenalan Aljabar Linear</p>
        </div>
      </div>

      {/* Toolbar Mass Action */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-600">
          Aksi Massal:
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setAllStatus("Hadir")}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Set Hadir Semua
          </button>
          <button 
            onClick={() => setAllStatus("Alpha")}
            className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
          >
            <UserX size={16} /> Set Alpha Semua
          </button>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Tabel (Desktop saja) */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-1 text-center">No</div>
          <div className="col-span-4">Nama Siswa</div>
          <div className="col-span-4 text-center">Status Kehadiran</div>
          <div className="col-span-3">Keterangan</div>
        </div>

        {/* List Siswa */}
        <div className="divide-y divide-slate-100">
          {siswaList.map((siswa, index) => (
            <div key={siswa.id} className="p-4 md:grid md:grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition-colors">
              
              {/* No & Nama */}
              <div className="md:col-span-1 text-slate-400 font-medium text-center hidden md:block">
                {index + 1}
              </div>
              <div className="md:col-span-4 font-bold text-slate-800 mb-3 md:mb-0">
                {siswa.nama}
              </div>

              {/* Status Options */}
              <div className="md:col-span-4 flex flex-wrap justify-center gap-2 mb-3 md:mb-0">
                {Object.keys(statusConfig).map(statusKey => {
                  const isSelected = siswa.status === statusKey;
                  const config = statusConfig[statusKey];
                  return (
                    <button
                      key={statusKey}
                      onClick={() => updateStatus(siswa.id, statusKey)}
                      className={`flex-1 md:flex-none min-w-[70px] py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 flex flex-col items-center gap-1
                        ${isSelected 
                          ? `${config.bg} ${config.color} ${config.border} ring-1 ring-${config.color.split('-')[1]}-500 shadow-sm scale-105` 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      {statusKey}
                    </button>
                  )
                })}
              </div>

              {/* Keterangan */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  placeholder="Alasan / Ket..."
                  value={siswa.keterangan}
                  onChange={(e) => updateKeterangan(siswa.id, e.target.value)}
                  disabled={siswa.status === "Hadir"}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSimpan}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5"
        >
          <Save size={20} />
          Simpan Absensi
        </button>
      </div>

    </div>
  );
}

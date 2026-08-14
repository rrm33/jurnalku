"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDaftarPenilaian } from "@/actions/penilaian";
import { CheckSquare, Clock, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Countdown from "@/components/Countdown";

export default function DaftarPenilaianPage() {
  const router = useRouter();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilterKelas, setSelectedFilterKelas] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await getDaftarPenilaian();
    if (res.success) {
      setDataList(res.data);
    }
    setLoading(false);
  };

  const getKelasColor = (nama) => {
    if (!nama) return "bg-slate-100 text-slate-600 border-slate-200";
    const colors = [
      "bg-blue-50 text-blue-700 border-blue-200",
      "bg-indigo-50 text-indigo-700 border-indigo-200",
      "bg-violet-50 text-violet-700 border-violet-200",
      "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      "bg-rose-50 text-rose-700 border-rose-200",
      "bg-orange-50 text-orange-700 border-orange-200",
      "bg-amber-50 text-amber-700 border-amber-200",
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      "bg-teal-50 text-teal-700 border-teal-200",
      "bg-cyan-50 text-cyan-700 border-cyan-200"
    ];
    let hash = 0;
    for (let i = 0; i < nama.length; i++) {
      hash = nama.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Penilaian Tugas</h2>
          <p className="text-slate-500 mt-1">Pilih tugas KBM yang ingin Anda nilai.</p>
        </div>
        
        {/* Filter Kelas */}
        {!loading && dataList.length > 0 && (
          <div className="w-full md:w-auto">
            <select 
              value={selectedFilterKelas}
              onChange={(e) => setSelectedFilterKelas(e.target.value)}
              className="w-full md:w-64 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
            >
              <option value="">Semua Kelas</option>
              {Array.from(new Set(dataList.map(item => item.kelas_nama))).sort().map(kelasNama => (
                <option key={kelasNama} value={kelasNama}>{kelasNama}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : dataList.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <CheckSquare size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Tugas</h1>
          <p className="text-slate-500 max-w-md mb-6">Anda belum memberikan tugas apa pun di dalam KBM (RPP) yang Anda buat.</p>
          <Link href="/beranda/rpp" className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors shadow-md shadow-pink-200">
            Buat KBM & Tugas Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {dataList
            .filter(item => selectedFilterKelas === "" || item.kelas_nama === selectedFilterKelas)
            .map((item) => {
              const isComplete = item.totalDinilai >= item.totalMengerjakan && item.totalMengerjakan > 0;
              const progressPercent = item.totalMengerjakan > 0 ? Math.round((item.totalDinilai / item.totalMengerjakan) * 100) : 0;
              
              return (
              <div 
                key={item.id} 
                onClick={() => router.push(`/beranda/penilaian/${item.id}?source=penilaian`)}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-pink-300 hover:shadow-md cursor-pointer transition-all group flex flex-col md:flex-row gap-6 md:items-center relative overflow-hidden"
              >
                {/* Decoration */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isComplete ? 'bg-emerald-500' : 'bg-pink-500'}`}></div>

                <div className="flex-1 min-w-0 pl-2 flex items-start gap-4">
                  
                  <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner mt-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pert</span>
                    <span className="text-lg font-bold leading-none">{item.pertemuan_ke}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md uppercase tracking-wider">{item.mapel_nama}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border ${getKelasColor(item.kelas_nama)}`}>{item.kelas_nama}</span>
                    {isComplete && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-emerald-100">
                        <CheckCircle2 size={12} /> Selesai Dinilai
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-pink-600 transition-colors truncate">{item.tugas_judul}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
                    <Clock size={14} className="text-slate-400" /> 
                    Tenggat: {formatDate(item.deadline)}
                  </div>
                  {item.deadline && (
                    <div className="mt-3">
                      <Countdown deadline={item.deadline} size="normal" />
                    </div>
                  )}
                </div>
                </div>

                <div className="shrink-0 flex gap-6 items-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 pl-0 md:pl-6 w-full md:w-auto">
                  
                  <div className="flex flex-col gap-1 w-24">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terkumpul</span>
                     <span className="text-sm font-black text-slate-700">{item.totalMengerjakan} / {item.totalSiswa}</span>
                  </div>

                  <div className="flex flex-col gap-1 w-24">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dinilai</span>
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-slate-700">{item.totalDinilai}</span>
                       <div className="w-full bg-slate-100 rounded-full h-1.5 flex-1">
                         <div className={`h-1.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-pink-500'}`} style={{ width: `${progressPercent}%` }}></div>
                       </div>
                     </div>
                  </div>
                  
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-pink-50 group-hover:text-pink-600 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>

              </div>
             );
          })}
        </div>
      )}

    </div>
  );
}

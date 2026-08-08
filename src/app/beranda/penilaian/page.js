"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDaftarPenilaian } from "@/actions/penilaian";
import { CheckSquare, Clock, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DaftarPenilaianPage() {
  const router = useRouter();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateString) => {
    if (!dateString) return "Tanpa tenggat waktu";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(date);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Penilaian Tugas</h2>
          <p className="text-slate-500 mt-1">Pilih tugas KBM yang ingin Anda nilai.</p>
        </div>
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
        <div className="grid grid-cols-1 gap-4">
          {dataList.map((item) => {
             const progressPercent = item.totalSiswa === 0 ? 0 : (item.totalDinilai / item.totalSiswa) * 100;
             const isComplete = item.totalSiswa > 0 && item.totalDinilai === item.totalSiswa;

             return (
              <div 
                key={item.id} 
                onClick={() => router.push(`/beranda/penilaian/${item.id}`)}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-pink-300 hover:shadow-md cursor-pointer transition-all group flex flex-col md:flex-row gap-6 md:items-center relative overflow-hidden"
              >
                {/* Decoration */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isComplete ? 'bg-emerald-500' : 'bg-pink-500'}`}></div>

                <div className="flex-1 min-w-0 pl-2">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md uppercase tracking-wider">{item.mapel_nama}</span>
                    <span className="px-2.5 py-0.5 bg-pink-50 text-pink-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-pink-100">{item.kelas_nama}</span>
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

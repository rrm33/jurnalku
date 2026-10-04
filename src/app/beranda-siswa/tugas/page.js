"use client";

import { useState, useEffect } from "react";
import { getKbmSiswa } from "@/actions/tugas-siswa";
import { BookOpen, Layers, ClipboardList, CheckCircle2, Clock, AlertCircle, ChevronRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function KbmSiswaPage() {
  const router = useRouter();
  const [kbmList, setKbmList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getKbmSiswa();
    setKbmList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isDeadlinePassed = (dateString) => {
    if (!dateString) return false;
    return new Date() > new Date(dateString);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6 px-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ClipboardList size={28} className="text-emerald-500" /> Jurnal KBM
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Lihat materi terbaru dan kerjakan tugas yang diberikan guru.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : kbmList.length > 0 && kbmList[0].isError ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-600 max-w-2xl mx-auto">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan Server</h2>
          <p className="text-sm font-medium whitespace-pre-wrap">{kbmList[0].message}</p>
        </div>
      ) : kbmList.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-center p-10 hover:shadow-md transition-all duration-300 mx-2">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <BookOpen size={36} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Belum Ada KBM</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Wah, sepertinya belum ada tugas atau materi baru untukmu. Istirahat sejenak!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-1 md:px-0">
          {kbmList.map((kbm) => {
            const currentTugas = kbm.tugas && kbm.tugas.length > 0 ? kbm.tugas[0] : null;
            const hasTugas = !!currentTugas;
            const hasSubmitted = hasTugas && currentTugas.pengumpulan && currentTugas.pengumpulan.length > 0;
            const pastDeadline = hasTugas && isDeadlinePassed(currentTugas.deadline);

            return (
              <div key={kbm.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4">
                {/* Big PERT Box */}
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-inner border border-blue-100/50">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Pert</span>
                  <span className="text-xl font-black leading-none">{kbm.pertemuan_ke}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-white rounded-md flex items-center gap-1">
                      <Layers size={10}/> {kbm.mapel?.nama || "Mata Pelajaran"}
                    </span>
                    {hasTugas && (
                      <>
                        {hasSubmitted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 size={10}/> Selesai
                          </span>
                        ) : pastDeadline ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-md flex items-center gap-1 border border-red-200">
                            <AlertCircle size={10}/> Terlambat
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md flex items-center gap-1 border border-rose-200 animate-pulse">
                            <AlertCircle size={10}/> Belum Dikerjakan
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-0.5 truncate">{kbm.judul}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(kbm.tanggal)}</span>
                    {hasTugas && <span className="flex items-center gap-1 text-pink-600"><FileText size={12}/> Ada Tugas</span>}
                  </div>
                </div>

                <div className="shrink-0 md:ml-auto">
                  <button 
                    onClick={() => router.push(`/beranda-siswa/tugas/${kbm.id}`)}
                    className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-xl transition-colors border border-emerald-200"
                  >
                    Lihat <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

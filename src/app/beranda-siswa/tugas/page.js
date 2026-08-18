"use client";

import { useState, useEffect, useRef } from "react";
import { getKbmSiswa, submitTugas } from "@/actions/tugas-siswa";
import { BookOpen, Layers, ClipboardList, CheckCircle2, Clock, X, FileText, AlertCircle, Calendar } from "lucide-react";
import Swal from "sweetalert2";
import FileViewerModal from "@/components/FileViewerModal";
import Linkify from "@/components/Linkify";
import Countdown from "@/components/Countdown";

export default function KbmSiswaPage() {
  const [kbmList, setKbmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileToView, setFileToView] = useState(null);
  
  // Modal State (now acting as Bottom Sheet on mobile)
  const [selectedKbm, setSelectedKbm] = useState(null);
  const [jawabanText, setJawabanText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await getKbmSiswa();
    setKbmList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenKbm = (kbm) => {
    setSelectedKbm(kbm);
    setJawabanText("");
    setIsEditing(false);
    // Prevent background scrolling on mobile
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const handleCloseModal = () => {
    setSelectedKbm(null);
    setJawabanText("");
    setIsEditing(false);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  };

  const handleEdit = (submission) => {
    setJawabanText(submission.input_jawaban || "");
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKbm.tugas || selectedKbm.tugas.length === 0) return;
    
    if (!jawabanText && (!fileInputRef.current || !fileInputRef.current.files[0])) {
      return Swal.fire("Peringatan", "Anda harus mengisi teks jawaban atau melampirkan file!", "warning");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('tugas_id', selectedKbm.tugas[0].id);
    formData.append('input_jawaban', jawabanText);
    
    if (fileInputRef.current && fileInputRef.current.files[0]) {
      formData.append('upload_file', fileInputRef.current.files[0]);
    }

    const res = await submitTugas(formData);
    setIsSubmitting(false);

    if (res.success) {
      Swal.fire("Berhasil", "Jawaban tugas Anda telah dikumpulkan!", "success");
      handleCloseModal();
      fetchData(); // Refresh data
    } else {
      Swal.fire("Gagal", res.message || "Terjadi kesalahan saat mengirim jawaban.", "error");
    }
  };

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
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in zoom-in-95 duration-500">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-1 md:px-0">
          {kbmList.map((kbm) => {
            const currentTugas = kbm.tugas && kbm.tugas.length > 0 ? kbm.tugas[0] : null;
            const hasTugas = !!currentTugas;
            const hasSubmitted = hasTugas && currentTugas.pengumpulan && currentTugas.pengumpulan.length > 0;
            const pastDeadline = hasTugas && isDeadlinePassed(currentTugas.deadline);

            return (
              <div key={kbm.id} onClick={() => handleOpenKbm(kbm)} className="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden group">
                
                {/* Visual Status Indicator Background */}
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full blur-3xl opacity-20 ${
                  hasSubmitted ? 'bg-emerald-500' : (pastDeadline ? 'bg-red-500' : 'bg-rose-500')
                }`}></div>

                {/* Content Wrapper */}
                <div className="flex items-start gap-4 z-10 relative">
                  
                  {/* Big PERT Box */}
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner mt-1 border border-blue-100/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pert</span>
                    <span className="text-lg font-black leading-none">{kbm.pertemuan_ke}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-800 text-white rounded-full flex items-center gap-1 shadow-sm">
                        <Layers size={10}/> {kbm.mapel?.nama || "Mata Pelajaran"}
                      </span>
                      
                      {hasTugas && (
                        <>
                          {hasSubmitted ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 size={10}/> Selesai
                            </span>
                          ) : pastDeadline ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1 border border-red-200">
                              <AlertCircle size={10}/> Terlambat
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full flex items-center gap-1 border border-rose-200 animate-pulse">
                              <AlertCircle size={10}/> Belum Dikerjakan
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <h3 className="font-extrabold text-slate-800 text-lg mb-1 line-clamp-2">{kbm.tujuan_pembelajaran}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed z-10">{kbm.aktivitas_pembelajaran}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100/50 flex flex-wrap items-center justify-between gap-2 z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {formatDate(kbm.tanggal_pelaksanaan)}
                    </span>
                    {hasTugas && !hasSubmitted && !pastDeadline && currentTugas.deadline && (
                       <div className="scale-75 origin-left -ml-1">
                         <Countdown deadline={currentTugas.deadline} size="small" />
                       </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold ring-2 ring-white shadow-sm" title={kbm.guru?.nama}>
                    {kbm.guru?.nama?.charAt(0) || "G"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Sheet / Modal Pengerjaan KBM */}
      {selectedKbm && (
        <div className="fixed inset-0 z-[60] flex md:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={handleCloseModal}>
          
          <div 
            onClick={e => e.stopPropagation()} 
            className="absolute md:relative bottom-0 md:bottom-auto w-full md:w-[90vw] md:max-w-4xl bg-white rounded-t-[2rem] md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in slide-in-from-bottom-full md:slide-in-from-bottom-10 duration-300 ease-out"
          >
            
            {/* Handle for mobile swipe down feel */}
            <div className="w-full flex justify-center pt-3 pb-2 md:hidden" onClick={handleCloseModal}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-6 md:px-8 py-3 md:py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 md:rounded-t-3xl">
              <div>
                <h2 className="font-black text-xl md:text-2xl text-slate-800 tracking-tight">{selectedKbm.mapel?.nama}</h2>
                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar size={12} /> {formatDate(selectedKbm.tanggal_pelaksanaan)}
                </p>
              </div>
              <button onClick={handleCloseModal} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors bg-slate-50">
                <X size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50 pb-safe">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
                
                {/* Kolom Kiri: RPP & Materi */}
                <div className="md:col-span-2 space-y-5">
                  <div className="bg-white p-5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100/80">
                    <h3 className="text-sm md:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><BookOpen size={14}/></div> 
                      Tujuan Pembelajaran
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">{selectedKbm.tujuan_pembelajaran}</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100/80">
                    <h3 className="text-sm md:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Layers size={14}/></div> 
                      Kegiatan Inti KBM
                    </h3>
                    <div className="prose prose-slate prose-sm max-w-none">
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{selectedKbm.aktivitas_pembelajaran}</p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Evaluasi / Tugas */}
                <div className="md:col-span-1">
                  
                  <div className="bg-white p-5 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100/80 sticky top-0">
                    <h3 className="text-sm md:text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><ClipboardList size={14}/></div> 
                      Tugas & Evaluasi
                    </h3>

                    {(!selectedKbm.tugas || selectedKbm.tugas.length === 0) ? (
                       <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                           <CheckCircle2 size={20} />
                         </div>
                         <p className="font-bold text-slate-700 text-sm">Tidak ada tugas</p>
                         <p className="text-[11px] text-slate-500 mt-1">Guru tidak memberikan evaluasi pada KBM ini.</p>
                       </div>
                    ) : (
                       <div>
                         {/* Info Tugas */}
                         {(() => {
                           const currentTugas = selectedKbm.tugas[0];
                           const isDeadlinePast = isDeadlinePassed(currentTugas.deadline);
                           const submission = currentTugas.pengumpulan && currentTugas.pengumpulan.length > 0 ? currentTugas.pengumpulan[0] : null;

                           return (
                             <div className="space-y-5">
                               <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-100/60 shadow-inner">
                                  <h4 className="font-bold text-rose-900 mb-2 text-sm">{currentTugas.judul}</h4>
                                  <p className="text-xs text-rose-800/80 whitespace-pre-line">{currentTugas.deskripsi}</p>
                                  
                                  {currentTugas.file && (
                                    <div className="mt-4 pt-3 border-t border-rose-200/50">
                                      <button onClick={() => setFileToView(currentTugas.file)} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-rose-600 rounded-xl shadow-sm border border-rose-100 text-xs font-bold hover:bg-rose-50 transition-colors">
                                        <FileText size={14} /> Lihat File Lampiran Guru
                                      </button>
                                    </div>
                                  )}
                               </div>

                               <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                                 <Clock size={14} className={isDeadlinePast && !submission ? "text-rose-500" : "text-emerald-500"} />
                                 <span className={isDeadlinePast && !submission ? "text-rose-600" : ""}>
                                   Deadline: {new Date(currentTugas.deadline).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                 </span>
                               </div>

                               {/* Form / Status */}
                               {submission && !isEditing ? (
                                 <div className="space-y-4">
                                   <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500 text-white rounded-xl shadow-md font-bold text-sm">
                                     <CheckCircle2 size={18} /> Selesai Dikerjakan!
                                   </div>
                                   
                                   <div className="text-sm p-4 bg-slate-50 border border-slate-200/60 rounded-2xl shadow-inner">
                                     <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                       <p className="font-bold text-slate-700 text-xs">Jawaban Kamu</p>
                                     </div>
                                     <p className="text-slate-600 text-xs whitespace-pre-line leading-relaxed"><Linkify>{submission.input_jawaban || "-"}</Linkify></p>
                                   </div>

                                   {submission.upload_file && (
                                      <div className="mt-2">
                                        <button onClick={() => setFileToView(submission.upload_file)} className="w-full flex items-center justify-center gap-2 p-3 bg-white text-slate-700 rounded-xl border border-slate-200 shadow-sm font-bold text-xs hover:bg-slate-50">
                                          <FileText size={14} /> Buka File Jawabanmu
                                        </button>
                                     </div>
                                   )}

                                   {submission.nilai !== null ? (
                                      <div className="mt-4 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                                        <span className="font-bold text-amber-800 text-[10px] uppercase tracking-wider mb-1">Nilai Akhir</span>
                                        <span className="text-4xl font-black text-amber-600 drop-shadow-sm">{submission.nilai}</span>
                                      </div>
                                   ) : !isDeadlinePast && (
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(submission)}
                                        className="w-full py-3 mt-4 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm flex justify-center items-center gap-2 text-sm"
                                      >
                                        Edit Jawaban
                                      </button>
                                   )}
                                 </div>
                               ) : (
                                 <form id="submitTugasForm" onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-2">Jawaban (Teks)</label>
                                      <textarea 
                                        rows="3" 
                                        value={jawabanText} 
                                        onChange={e => setJawabanText(e.target.value)} 
                                        placeholder="Ketik jawabanmu di sini..." 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none text-xs shadow-inner"
                                      ></textarea>
                                    </div>
                
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-2">Upload File (Jika ada)</label>
                                      <div className="flex gap-2">
                                        <input 
                                          type="file" 
                                          ref={fileInputRef} 
                                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 shadow-inner" 
                                        />
                                      </div>
                                    </div>

                                    <button 
                                      type="submit" 
                                      disabled={isSubmitting || isDeadlinePast}
                                      className="w-full py-3.5 mt-2 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 text-sm"
                                    >
                                      {isSubmitting ? 'Mengirim Tugas...' : 'Kumpulkan Tugas'}
                                    </button>
                                 </form>
                               )}
                             </div>
                           );
                         })()}
                       </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      <FileViewerModal url={fileToView} onClose={() => setFileToView(null)} />
    </div>
  );
}

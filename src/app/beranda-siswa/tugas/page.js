"use client";

import { useState, useEffect, useRef } from "react";
import { getKbmSiswa, submitTugas } from "@/actions/tugas-siswa";
import { BookOpen, Layers, ClipboardList, CheckCircle2, Clock, X, Upload, FileText, Download, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import FileViewerModal from "@/components/FileViewerModal";
import Linkify from "@/components/Linkify";
import Countdown from "@/components/Countdown";

export default function KbmSiswaPage() {
  const [kbmList, setKbmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileToView, setFileToView] = useState(null);
  
  // Modal State
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
  };

  const handleCloseModal = () => {
    setSelectedKbm(null);
    setJawabanText("");
    setIsEditing(false);
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  };

  const isDeadlinePassed = (dateString) => {
    if (!dateString) return false;
    return new Date() > new Date(dateString);
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 border-l-4 border-pink-500 pl-4 py-1">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Kegiatan KBM</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">Jurnal kegiatan mengajar harian. Baca materi dan kerjakan evaluasi/tugas yang diberikan.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : kbmList.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-center p-12 hover:shadow-md transition-shadow duration-300">
          <div className="w-24 h-24 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Belum Ada KBM</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Saat ini tidak ada jurnal mengajar atau materi yang dibagikan guru untuk kelasmu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {kbmList.map((kbm) => {
            const currentTugas = kbm.tugas && kbm.tugas.length > 0 ? kbm.tugas[0] : null;
            const hasTugas = !!currentTugas;
            const hasSubmitted = hasTugas && currentTugas.pengumpulan && currentTugas.pengumpulan.length > 0;
            const pastDeadline = hasTugas && isDeadlinePassed(currentTugas.deadline);

            return (
              <div key={kbm.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:shadow-lg transition-all group duration-300">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-xs font-bold px-3 py-1 bg-pink-100 text-pink-700 rounded-full flex items-center gap-1">
                       <Layers size={12}/> {kbm.mapel?.nama || "Mata Pelajaran"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full" title="Tanggal Pelaksanaan">
                      {formatDate(kbm.tanggal_pelaksanaan)}
                    </span>
                    {kbm.pertemuan_ke && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full" title="Pertemuan Ke">
                        Pertemuan ke-{kbm.pertemuan_ke}
                      </span>
                    )}
                    
                    {hasTugas && (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-200 shadow-sm flex items-center gap-1">
                            ⏱️ Deadline: {formatDate(currentTugas.deadline)}
                          </span>
                          {!hasSubmitted && !pastDeadline && currentTugas.deadline && (
                            <div className="scale-75 origin-left -my-2">
                              <Countdown deadline={currentTugas.deadline} size="normal" />
                            </div>
                          )}
                        </div>
                        {hasSubmitted ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 size={12} /> TUGAS SELESAI
                            {currentTugas.pengumpulan[0].updated_at && (
                              <span className="ml-1 border-l border-emerald-200 pl-2">
                                {new Date(currentTugas.pengumpulan[0].updated_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                              </span>
                            )}
                          </span>
                        ) : pastDeadline ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                            <AlertCircle size={12} /> MELEWATI DEADLINE
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-200 shadow-sm animate-pulse">
                            <AlertCircle size={12} /> TUGAS BELUM DIKERJAKAN
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  <h3 className="font-extrabold text-slate-800 text-xl mb-2 group-hover:text-pink-600 transition-colors">{kbm.tujuan_pembelajaran}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{kbm.aktivitas_pembelajaran}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                      {kbm.guru?.nama?.charAt(0) || "G"}
                    </div>
                    Guru: <span className="text-slate-700">{kbm.guru?.nama || "-"}</span>
                  </div>
                </div>
                
                <div className="w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <button 
                    onClick={() => handleOpenKbm(kbm)}
                    className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                      hasTugas && !hasSubmitted && !pastDeadline 
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-rose-500/30' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen size={18} />
                    {hasTugas && !hasSubmitted 
                       ? 'Mulai KBM & Kerjakan' 
                       : hasTugas && hasSubmitted && !pastDeadline && (!currentTugas.pengumpulan[0]?.nilai) 
                         ? 'Lihat / Edit Jawaban' 
                         : 'Lihat Materi KBM'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Pengerjaan KBM */}
      {selectedKbm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="font-black text-2xl text-slate-800">{selectedKbm.mapel?.nama}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">{formatDate(selectedKbm.tanggal_pelaksanaan)} • Oleh {selectedKbm.guru?.nama}</p>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Kolom Kiri: RPP & Materi */}
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><BookOpen size={16}/></div> 
                      Tujuan Pembelajaran
                    </h3>
                    <p className="text-slate-700 leading-relaxed font-medium">{selectedKbm.tujuan_pembelajaran}</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Layers size={16}/></div> 
                      Kegiatan Inti KBM
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{selectedKbm.aktivitas_pembelajaran}</p>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Evaluasi / Tugas */}
                <div className="md:col-span-1">
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><ClipboardList size={16}/></div> 
                      Evaluasi & Tugas
                    </h3>

                    {(!selectedKbm.tugas || selectedKbm.tugas.length === 0) ? (
                       <div className="text-center py-8">
                         <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                           <CheckCircle2 size={24} />
                         </div>
                         <p className="font-bold text-slate-700">Tidak ada tugas</p>
                         <p className="text-xs text-slate-500 mt-1">Guru tidak memberikan tugas pada KBM ini.</p>
                       </div>
                    ) : (
                       <div>
                         {/* Info Tugas */}
                         {(() => {
                           const currentTugas = selectedKbm.tugas[0];
                           const isDeadlinePast = isDeadlinePassed(currentTugas.deadline);
                           const submission = currentTugas.pengumpulan && currentTugas.pengumpulan.length > 0 ? currentTugas.pengumpulan[0] : null;

                           return (
                             <div className="space-y-6">
                               <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                                  <h4 className="font-bold text-rose-900 mb-2 text-sm">{currentTugas.judul}</h4>
                                  <p className="text-xs text-rose-800 whitespace-pre-line">{currentTugas.deskripsi}</p>
                                  
                                  {currentTugas.file && (
                                    <div className="mt-4">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Lampiran dari Guru:</span>
                                      <button onClick={() => setFileToView(currentTugas.file)} className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-white text-rose-700 rounded-lg shadow-sm border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors">
                                        <FileText size={14} /> Lihat File Lampiran
                                      </button>
                                    </div>
                                  )}
                               </div>

                               <div className="flex flex-col gap-4 mb-4">
                                 {/* Removed countdown from here, moved to list tile */}
                                 
                                 <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 p-2 rounded-lg justify-center border border-slate-200">
                                   <Clock size={14} className={isDeadlinePast && !submission ? "text-rose-500" : "text-slate-400"} />
                                   <span className={isDeadlinePast && !submission ? "text-rose-600" : ""}>
                                     Deadline: {formatDate(currentTugas.deadline)}
                                   </span>
                                 </div>
                               </div>

                               {/* Form / Status */}
                               {submission && !isEditing ? (
                                 <div className="space-y-4">
                                   <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold text-sm">
                                     <CheckCircle2 size={18} /> Selesai Dikerjakan!
                                   </div>
                                   
                                   <div className="text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                     <div className="flex justify-between items-center mb-2">
                                       <p className="font-bold text-slate-500 text-xs uppercase tracking-wider">Jawaban Kamu:</p>
                                       {submission.updated_at && (
                                         <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1"><Clock size={10} /> Dikumpulkan: {new Date(submission.updated_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                                       )}
                                     </div>
                                     <p className="text-slate-700 whitespace-pre-line"><Linkify>{submission.input_jawaban || "-"}</Linkify></p>
                                   </div>

                                   {submission.upload_file && (
                                      <div className="mt-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">File yang dikumpulkan:</span>
                                        <button onClick={() => setFileToView(submission.upload_file)} className="flex items-center justify-center w-max gap-2 p-3 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-bold text-sm hover:bg-slate-200">
                                          <FileText size={16} /> Buka File Anda
                                        </button>
                                     </div>
                                   )}

                                   {submission.nilai !== null ? (
                                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between shadow-sm">
                                        <span className="font-bold text-amber-800">Nilai dari Guru:</span>
                                        <span className="text-3xl font-black text-amber-600">{submission.nilai}</span>
                                      </div>
                                   ) : !isDeadlinePast && (
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(submission)}
                                        className="w-full py-3 mt-4 rounded-xl font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-all shadow-sm flex justify-center items-center gap-2"
                                      >
                                        Edit Jawaban
                                      </button>
                                   )}
                                 </div>
                               ) : (
                                 <form id="submitTugasForm" onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-200">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-2">Teks Jawaban</label>
                                      <textarea 
                                        rows="4" 
                                        value={jawabanText} 
                                        onChange={e => setJawabanText(e.target.value)} 
                                        placeholder="Ketik jawabanmu..." 
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all font-medium resize-none text-sm shadow-sm"
                                      ></textarea>
                                    </div>
                
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-2">Lampirkan File (Opsional)</label>
                                      <div className="flex gap-2">
                                        <input 
                                          type="file" 
                                          ref={fileInputRef} 
                                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all font-medium text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 shadow-sm" 
                                        />
                                      </div>
                                    </div>

                                    <button 
                                      type="submit" 
                                      disabled={isSubmitting || isDeadlinePast}
                                      className="w-full py-3 mt-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                      {isSubmitting ? 'Mengirim...' : 'Kumpulkan Tugas'}
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

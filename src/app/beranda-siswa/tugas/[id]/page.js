"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getKbmDetailSiswa, submitTugas } from "@/actions/tugas-siswa";
import { ArrowLeft, CheckCircle2, Clock, FileText, AlertCircle, Play } from "lucide-react";
import Swal from "sweetalert2";
import FileViewerModal from "@/components/FileViewerModal";
import Linkify from "@/components/Linkify";

export default function TugasDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [kbm, setKbm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileToView, setFileToView] = useState(null);
  
  const [jawabanText, setJawabanText] = useState("");
  const [kodeText, setKodeText] = useState("");
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // DartPad Embed Logic
  const iframeRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await getKbmDetailSiswa(params.id);
    setKbm(data);
    if (data && data.tugas && data.tugas.length > 0) {
      const submission = data.tugas[0].pengumpulan && data.tugas[0].pengumpulan.length > 0 
        ? data.tugas[0].pengumpulan[0] 
        : null;
      if (submission) {
        setJawabanText(submission.input_jawaban || "");
        setKodeText(submission.kode_jawaban || "");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kbm.tugas || kbm.tugas.length === 0) return;
    
    if (!jawabanText && !kodeText && (!fileInputRef.current || !fileInputRef.current.files[0])) {
      return Swal.fire("Peringatan", "Anda harus mengisi teks jawaban/kode atau melampirkan file!", "warning");
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('tugas_id', kbm.tugas[0].id);
    formData.append('input_jawaban', jawabanText);
    formData.append('kode_jawaban', kodeText);
    
    if (fileInputRef.current && fileInputRef.current.files[0]) {
      formData.append('upload_file', fileInputRef.current.files[0]);
    }

    const res = await submitTugas(formData);
    setIsSubmitting(false);

    if (res.success) {
      Swal.fire("Berhasil", "Jawaban tugas Anda telah dikumpulkan!", "success");
      setIsEditing(false);
      fetchData(); // Refresh data
    } else {
      Swal.fire("Gagal", res.message || "Terjadi kesalahan saat mengirim jawaban.", "error");
    }
  };

  const handleRunCode = () => {
    if (!iframeRef.current) return;
    // Post message to DartPad iframe to execute code
    iframeRef.current.contentWindow.postMessage({
      sourceCode: kodeText,
      type: 'sourceCode'
    }, '*');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!kbm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-600">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Data Tidak Ditemukan</h2>
          <p className="text-sm font-medium">KBM ini mungkin sudah dihapus atau Anda tidak memiliki akses.</p>
          <button onClick={() => router.back()} className="mt-6 px-6 py-2 bg-white rounded-lg shadow-sm font-bold border border-red-200">Kembali</button>
        </div>
      </div>
    );
  }

  const currentTugas = kbm.tugas && kbm.tugas.length > 0 ? kbm.tugas[0] : null;
  const hasTugas = !!currentTugas;
  const submission = hasTugas && currentTugas.pengumpulan && currentTugas.pengumpulan.length > 0 ? currentTugas.pengumpulan[0] : null;
  const isDeadlinePast = hasTugas && currentTugas.deadline && new Date() > new Date(currentTugas.deadline);
  
  // Disable editor if deadline is passed or if it's already graded, unless they are currently editing and no grade yet
  const hasGrade = submission && submission.nilai !== null;
  const editorDisabled = Boolean(isDeadlinePast || hasGrade || (submission && !isEditing));

  return (
    <div className="max-w-6xl mx-auto pb-24 px-2 md:px-4 animate-in fade-in zoom-in-95 duration-500">
      
      <button 
        onClick={() => router.push('/beranda-siswa/tugas')}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Kembali ke Daftar KBM
      </button>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100">
           <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">{kbm.judul}</h1>
           <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">Pertemuan {kbm.pertemuan_ke}</span>
             <span>{kbm.mapel?.nama}</span>
           </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{kbm.tujuan_pembelajaran}</p>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas Pembelajaran</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{kbm.aktivitas_pembelajaran}</p>
              
              {kbm.upload_file && (
                <div className="mt-4">
                   <button onClick={() => setFileToView(kbm.upload_file)} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition-colors">
                     <FileText size={16} /> Buka Lampiran Materi
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasTugas && (
        <div className="mt-8">
          <div className="bg-rose-50 rounded-t-[2rem] p-6 md:p-8 border-x border-t border-rose-100 relative overflow-hidden">
            <h2 className="text-xl font-black text-rose-900 mb-2">Tugas Pertemuan</h2>
            <p className="text-sm font-medium text-rose-800/80 mb-2">{currentTugas.judul}</p>
            <p className="text-sm text-rose-800/80 whitespace-pre-line leading-relaxed">{currentTugas.deskripsi}</p>
            
            {currentTugas.file && (
              <div className="mt-4">
                <button onClick={() => setFileToView(currentTugas.file)} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-600 text-xs font-bold rounded-xl shadow-sm border border-rose-100 hover:bg-rose-50 transition-colors">
                  <FileText size={16} /> Lampiran Soal / Tugas
                </button>
              </div>
            )}
            
            <div className="absolute top-6 right-6 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 bg-white/60 p-2.5 rounded-xl border border-white shadow-sm backdrop-blur-sm">
               <Clock size={14} className={isDeadlinePast && !submission ? "text-rose-500" : "text-emerald-500"} />
               <span className={isDeadlinePast && !submission ? "text-rose-600" : ""}>
                 Deadline: {currentTugas.deadline ? new Date(currentTugas.deadline).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'}) : "-"}
               </span>
            </div>
          </div>

          <div className="bg-white rounded-b-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
             <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Jawaban Teks selalu muncul */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Isian Jawaban Siswa (Teks)</label>
                  <textarea 
                    rows="3" 
                    value={jawabanText} 
                    onChange={e => setJawabanText(e.target.value)} 
                    disabled={editorDisabled}
                    placeholder="Ketik penjelasan/jawaban teksmu di sini..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium resize-none text-sm shadow-inner disabled:opacity-60"
                  ></textarea>
                </div>

                {/* Code Editor Section (jika tugas koding diaktifkan) */}
                {currentTugas.gunakan_code_editor && (
                  <div className="flex flex-col lg:flex-row gap-6 mt-6 pt-6 border-t border-slate-100">
                     <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-lg relative min-h-[400px]">
                        <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                           <span className="text-xs font-bold text-slate-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> Code Editor (Hanya Ketik Manual)</span>
                           <button type="button" onClick={handleRunCode} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition-colors">
                             <Play size={12} /> Jalankan
                           </button>
                        </div>
                        <div className="relative flex-1 flex flex-col">
                          {editorDisabled && submission && !isEditing && !hasGrade && (
                            <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                               <span className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-slate-600">Scroll ke bawah dan klik "Edit Jawaban" untuk membuka editor</span>
                            </div>
                          )}
                          <textarea
                            value={kodeText}
                            onChange={(e) => setKodeText(e.target.value)}
                            onPaste={(e) => {
                               e.preventDefault();
                               Swal.fire("Oops!", "Paste dimatikan. Kamu harus mengetik kode secara manual untuk belajar!", "info");
                            }}
                            disabled={editorDisabled}
                            spellCheck="false"
                            placeholder="// Ketik kode Dart/Flutter kamu di sini..."
                            className="flex-1 w-full p-4 bg-[#1e1e1e] text-emerald-400 font-mono text-sm leading-relaxed outline-none resize-none disabled:opacity-70"
                            style={{ tabSize: 2 }}
                          />
                        </div>
                     </div>
                     
                     <div className="flex-1 bg-slate-50 rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-inner min-h-[400px] relative">
                        <div className="bg-white px-4 py-3 flex justify-between items-center border-b border-slate-200">
                           <span className="text-xs font-bold text-slate-500 flex flex-col">
                              Live Output (Khusus Menampilkan Hasil)
                              <span className="text-[9px] text-slate-400 font-normal">Abaikan tab code jika muncul, khusus lihat hasil di tab UI</span>
                           </span>
                        </div>
                        <iframe 
                          ref={iframeRef}
                          src="https://dartpad.dev/embed-flutter.html?theme=light&run=true&split=100"
                          className="flex-1 w-full h-full border-0 min-h-[400px]"
                          title="DartPad Engine"
                        />
                     </div>
                  </div>
                )}

                {/* Upload File & Status */}
                <div className="flex flex-col md:flex-row gap-6 items-start mt-6">
                   <div className="flex-1 w-full space-y-4">
                      {submission && submission.upload_file && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-700">File Terkumpul</span>
                          </div>
                          <button type="button" onClick={() => setFileToView(submission.upload_file)} className="text-xs font-bold bg-white text-emerald-600 px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50">Buka</button>
                        </div>
                      )}

                      {!editorDisabled && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">Upload File Jawaban (Bila diperlukan)</label>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-medium text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 shadow-sm" 
                          />
                        </div>
                      )}
                   </div>

                   <div className="flex-1 w-full bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      {hasGrade ? (
                        <div className={`p-4 ${submission.nilai === 0 ? 'bg-gradient-to-r from-red-100 to-rose-100 border-red-200' : 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-200'} border rounded-2xl flex flex-col items-center justify-center shadow-sm`}>
                          <span className={`font-bold ${submission.nilai === 0 ? 'text-red-800' : 'text-amber-800'} text-xs uppercase tracking-wider mb-1`}>Nilai Akhir</span>
                          <span className={`text-5xl font-black ${submission.nilai === 0 ? 'text-red-600' : 'text-amber-600'} drop-shadow-sm`}>{submission.nilai}</span>
                        </div>
                      ) : submission ? (
                         <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-center gap-2 p-4 bg-emerald-500 text-white rounded-xl shadow-md font-bold text-sm">
                             <CheckCircle2 size={20} /> Selesai Dikerjakan!
                           </div>
                           {!editorDisabled ? (
                              <button 
                                type="submit" 
                                disabled={isSubmitting || isDeadlinePast}
                                className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                              >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                           ) : (
                              !isDeadlinePast && (
                                <button
                                  type="button"
                                  onClick={() => setIsEditing(true)}
                                  className="w-full py-3.5 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm flex justify-center items-center gap-2 text-sm"
                                >
                                  Edit Jawaban
                                </button>
                              )
                           )}
                         </div>
                      ) : (
                        <button 
                          type="submit" 
                          disabled={isSubmitting || isDeadlinePast}
                          className="w-full h-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none flex flex-col justify-center items-center gap-2 text-base"
                        >
                          <CheckCircle2 size={28} className="mb-1" />
                          {isSubmitting ? 'Mengirim Tugas...' : 'Kumpulkan Tugas'}
                        </button>
                      )}
                   </div>
                </div>

             </form>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      <FileViewerModal url={fileToView} onClose={() => setFileToView(null)} />
    </div>
  );
}

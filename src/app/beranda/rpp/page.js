"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckSquare, ChevronDown, ChevronUp, Trash2, Edit2, Link as LinkIcon, CheckCircle2, Upload, FileText, Copy } from "lucide-react";
import { getRpps, deleteRpp, toggleStatusRpp, toggleActiveRpp, saveCatatanRpp } from "@/actions/rpp";
import { getKelas, getMapel } from "@/actions/master";
import FileViewerModal from "@/components/FileViewerModal";
import Swal from "sweetalert2";

export default function BerandaPage() {
  const router = useRouter();
  const [rppList, setRppList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedFilterKelas, setSelectedFilterKelas] = useState("");
  const [fileToView, setFileToView] = useState(null);

  

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

  const fetchData = async () => {
    setLoading(true);
    const [rpp, kelas, mapel] = await Promise.all([
      getRpps(1),
      getKelas(),
      getMapel()
    ]);
    setRppList(rpp);
    setKelasList(kelas);
    setMapelList(mapel);
    setLoading(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('rpp_filter_kelas');
    if (saved) setSelectedFilterKelas(saved);
    fetchData();
  }, []);

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  


  const handleDuplicate = (rpp) => {
    const tugas = rpp.tugas && rpp.tugas.length > 0 ? rpp.tugas[0] : null;
    setFormData({
      id: null,
      pertemuan_ke: rpp.pertemuan_ke,
      tanggal: rpp.tanggal ? new Date(rpp.tanggal).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      mapel_id: rpp.mapel_id,
      kelas_ids: [], // Kosongkan agar guru memilih kelas tujuan
      judul: rpp.judul + " (Salinan)",
      tujuan_pembelajaran: rpp.tujuan_pembelajaran,
      aktivitas_pembelajaran: rpp.aktivitas_pembelajaran,
      existing_file: rpp.upload_file || "",
      ada_tugas: !!tugas,
      judul_tugas: tugas ? tugas.judul : "",
      deskripsi_tugas: tugas ? tugas.deskripsi : "",
      deadline_tugas: tugas && tugas.deadline ? new Date(new Date(tugas.deadline).getTime() + (7 * 60 * 60 * 1000)).toISOString().slice(0, 16) : "",
      existing_file_tugas: tugas ? (tugas.file || "") : "",
      gunakan_code_editor: tugas ? (tugas.gunakan_code_editor || false) : false,
    });
    setIsOpen(true);
  };

  const toggleKelasSelection = (id) => {
    setFormData(prev => {
      const isSelected = prev.kelas_ids.includes(String(id));
      if (isSelected) {
        return { ...prev, kelas_ids: prev.kelas_ids.filter(kId => kId !== String(id)) };
      } else {
        return { ...prev, kelas_ids: [...prev.kelas_ids, String(id)] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.kelas_ids.length === 0 || !formData.mapel_id) {
      return Swal.fire("Peringatan", "Pilih minimal satu Kelas dan Mata Pelajaran!", "warning");
    }
    
    // Siapkan FormData
    const submission = new FormData();
    submission.append('id', formData.id);
    submission.append('pertemuan_ke', formData.pertemuan_ke);
    submission.append('tanggal', formData.tanggal);
    submission.append('judul', formData.judul);
    submission.append('tujuan_pembelajaran', formData.tujuan_pembelajaran);
    submission.append('aktivitas_pembelajaran', formData.aktivitas_pembelajaran);
    submission.append('mapel_id', formData.mapel_id);
    submission.append('existing_file', formData.existing_file);
    
    submission.append('ada_tugas', formData.ada_tugas);
    submission.append('judul_tugas', formData.judul_tugas);
    submission.append('deskripsi_tugas', formData.deskripsi_tugas);
    submission.append('deadline_tugas', formData.deadline_tugas);
    submission.append('existing_file_tugas', formData.existing_file_tugas);
    submission.append('gunakan_code_editor', formData.gunakan_code_editor);
    const fileTugasInput = document.getElementById("file_tugas_input");
    if (fileTugasInput && fileTugasInput.files[0]) {
      submission.append('file_tugas', fileTugasInput.files[0]);
    }
    
    formData.kelas_ids.forEach(id => {
      submission.append('kelas_ids[]', id);
    });

    if (fileInputRef.current && fileInputRef.current.files[0]) {
      submission.append('upload_file', fileInputRef.current.files[0]);
    }
    
    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    const res = await saveRpp(submission, 1);
    
    if (res.success) {
      Swal.fire("Berhasil", "Jurnal Mengajar disimpan!", "success");
      setIsOpen(false);
      fetchData();
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus RPP?",
      text: "Seluruh presensi dan tugas yang tertaut akan ikut terhapus atau menyebabkan error!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48"
    });

    if (confirm.isConfirmed) {
      const res = await deleteRpp(id);
      if (res.success) {
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        fetchData();
      } else {
        Swal.fire("Gagal", res.message, "error");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const res = await toggleStatusRpp(id, currentStatus);
    if (res.success) fetchData();
  };

  const handleToggleActive = async (id, currentActiveStatus) => {
    const res = await toggleActiveRpp(id, currentActiveStatus);
    if (res.success) fetchData();
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rencana Pelaksanaan Pembelajaran</h2>
          <p className="text-slate-500 mt-1">Kelola jurnal mengajar, absensi, dan penilaian harian.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedFilterKelas}
            onChange={(e) => {
               setSelectedFilterKelas(e.target.value);
               sessionStorage.setItem('rpp_filter_kelas', e.target.value);
            }}
            className="hidden md:block bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <button 
            onClick={() => router.push('/beranda/rpp/form')}
            className="hidden md:flex bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-rose-200 transition-colors items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Buat RPP Baru
          </button>
        </div>
      </header>
      
      {/* Filter Mobile */}
      <div className="mb-6 md:hidden">
        <select 
          value={selectedFilterKelas}
          onChange={(e) => {
             setSelectedFilterKelas(e.target.value);
             sessionStorage.setItem('rpp_filter_kelas', e.target.value);
          }}
          className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
        >
          <option value="">Semua Kelas</option>
          {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
      </div>

      {/* Daftar RPP / Accordion */}
      <div className="space-y-4 max-w-5xl pb-24">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Memuat data jurnal...</div>
        ) : rppList.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Belum ada RPP</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">Anda belum membuat rencana pembelajaran untuk tahun akademik ini.</p>
            <button 
              onClick={() => router.push('/beranda/rpp/form')}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-colors"
            >
              Mulai Buat RPP Pertama
            </button>
          </div>
        ) : rppList.filter(r => selectedFilterKelas === "" || r.kelas_id === parseInt(selectedFilterKelas)).map((rpp) => (
          <div key={rpp.id} className={`bg-white border ${rpp.is_active ? 'border-slate-200' : 'border-red-200 opacity-60 bg-slate-50/50'} rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:opacity-100`}>
            
            {/* Header ListTile */}
            <div 
              className="p-5 md:p-6 cursor-pointer flex items-start gap-4 select-none"
              onClick={() => toggleAccordion(rpp.id)}
            >
              <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className="text-xs font-semibold uppercase tracking-wider">Pert</span>
                <span className="text-lg font-bold leading-none">{rpp.pertemuan_ke}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getKelasColor(rpp.kelas?.nama)}`}>{rpp.kelas?.nama}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[11px] font-bold border border-rose-100">{rpp.mapel?.nama}</span>
                  {rpp.tanggal && <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[11px] font-bold">{new Date(rpp.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</span>}
                  
                  {rpp.status_terlaksana ? (
                    <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(rpp.id, rpp.status_terlaksana); }} className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 text-[11px] font-bold border border-emerald-100 flex items-center gap-1 transition-colors">
                      <CheckCircle2 size={12} /> Terlaksana
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(rpp.id, rpp.status_terlaksana); }} className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-[11px] font-bold border border-slate-200 transition-colors">
                      Tandai Selesai
                    </button>
                  )}

                  {rpp.is_active ? (
                    <button onClick={(e) => { e.stopPropagation(); handleToggleActive(rpp.id, rpp.is_active); }} className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 text-[11px] font-bold border border-blue-100 transition-colors">
                      Aktif (Terlihat)
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handleToggleActive(rpp.id, rpp.is_active); }} className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-[11px] font-bold border border-red-100 flex items-center gap-1 transition-colors">
                      Nonaktif (Sembunyi)
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 truncate">{rpp.judul}</h3>
              </div>

              <div className="shrink-0 text-slate-400 mt-2">
                {expandedId === rpp.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
            </div>

            {/* Body Accordion (Expanded) */}
            {expandedId === rpp.id && (
              <div className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-6 mb-6 mt-4">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{rpp.tujuan_pembelajaran}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{rpp.aktivitas_pembelajaran}</p>
                    
                    {rpp.upload_file && (
                      <div className="mt-4">
                         <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lampiran File</h4>
                         <button onClick={(e) => { e.stopPropagation(); setFileToView(rpp.upload_file); }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">
                           <FileText size={14} /> Buka Lampiran
                         </button>
                      </div>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                      Catatan Pertemuan
                      <span className="text-[9px] text-emerald-500 font-medium normal-case">*otomatis tersimpan</span>
                    </h4>
                    <textarea 
                      defaultValue={rpp.catatan || ""}
                      onBlur={async (e) => {
                        const val = e.target.value;
                        if (val !== (rpp.catatan || "")) {
                           const res = await saveCatatanRpp(rpp.id, val);
                           if (res.success) {
                             const newRppList = [...rppList];
                             const rppIndex = newRppList.findIndex(r => r.id === rpp.id);
                             if (rppIndex !== -1) {
                               newRppList[rppIndex].catatan = val;
                               setRppList(newRppList);
                             }
                           }
                        }
                      }}
                      placeholder="Tulis catatan, evaluasi, atau kendala di sini..."
                      className="w-full h-full min-h-[100px] px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium resize-none shadow-inner"
                    />
                  </div>
                </div>
                
                {/* Tombol Aksi */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 border-dashed">
                  <button 
                    onClick={() => router.push(`/beranda/presensi/${rpp.id}?source=rpp`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-200 transition-colors"
                  >
                    <Users size={16} />
                    Presensi
                  </button>
                  <button 
                    onClick={() => router.push(`/beranda/penilaian/${rpp.id}?source=rpp`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-amber-200 transition-colors"
                  >
                    <CheckSquare size={16} />
                    Penilaian
                  </button>
                  
                  <div className="flex ml-auto gap-2">
                    <button onClick={() => handleDuplicate(rpp)} title="Salin RPP (Duplikat)" className="p-2.5 text-blue-600 hover:bg-blue-50 bg-white border border-slate-200 rounded-xl transition-colors">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => router.push(`/beranda/rpp/form?id=${rpp.id}`)} className="p-2.5 text-rose-600 hover:bg-rose-50 bg-white border border-slate-200 rounded-xl transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(rpp.id)} className="p-2.5 text-rose-600 hover:bg-rose-50 bg-white border border-slate-200 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tombol Buat RPP Mobile */}
      <button onClick={() => router.push('/beranda/rpp/form')} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-300 transition-colors z-40">
        <span className="text-3xl font-light mb-1">+</span>
      </button>

      {/* Modal Form Tambah/Edit RPP */}
      {/* File Viewer Modal */}
      <FileViewerModal url={fileToView} onClose={() => setFileToView(null)} />
    </>
  );
}

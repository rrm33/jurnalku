"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckSquare, ChevronDown, ChevronUp, Trash2, Edit2, Link as LinkIcon, CheckCircle2, Upload, FileText } from "lucide-react";
import { getRpps, saveRpp, deleteRpp, toggleStatusRpp } from "@/actions/rpp";
import { getKelas, getMapel } from "@/actions/master";
import Swal from "sweetalert2";

export default function BerandaPage() {
  const router = useRouter();
  const [rppList, setRppList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Modal Form State
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    id: null,
    pertemuan_ke: 1,
    mapel_id: "",
    kelas_ids: [], // Array of class IDs
    judul: "",
    tujuan_pembelajaran: "",
    aktivitas_pembelajaran: "",
    existing_file: "", // Untuk mode edit jika sudah ada file
    ada_tugas: false,
    judul_tugas: "",
    deskripsi_tugas: "",
    deadline_tugas: "",
    existing_file_tugas: "",
  });

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
    fetchData();
  }, []);

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCreateNew = () => {
    setFormData({
      id: null,
      pertemuan_ke: rppList.length > 0 ? (rppList[0].pertemuan_ke + 1) : 1, 
      mapel_id: "",
      kelas_ids: [],
      judul: "",
      tujuan_pembelajaran: "",
      aktivitas_pembelajaran: "",
      existing_file: "",
      ada_tugas: false,
      judul_tugas: "",
      deskripsi_tugas: "",
      deadline_tugas: "",
      existing_file_tugas: "",
    });
    setIsOpen(true);
  };

  const handleEdit = (rpp) => {
    const tugas = rpp.tugas && rpp.tugas.length > 0 ? rpp.tugas[0] : null;
    setFormData({
      id: rpp.id,
      pertemuan_ke: rpp.pertemuan_ke,
      mapel_id: rpp.mapel_id,
      kelas_ids: [String(rpp.kelas_id)], // Saat edit, paksa isi 1 array
      judul: rpp.judul,
      tujuan_pembelajaran: rpp.tujuan_pembelajaran,
      aktivitas_pembelajaran: rpp.aktivitas_pembelajaran,
      existing_file: rpp.upload_file || "",
      ada_tugas: !!tugas,
      judul_tugas: tugas ? tugas.judul : "",
      deskripsi_tugas: tugas ? tugas.deskripsi : "",
      deadline_tugas: tugas && tugas.deadline ? new Date(tugas.deadline).toISOString().split('T')[0] : "",
      existing_file_tugas: tugas ? (tugas.file || "") : "",
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

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rencana Pelaksanaan Pembelajaran</h2>
          <p className="text-slate-500 mt-1">Kelola jurnal mengajar, absensi, dan penilaian harian.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="hidden md:flex bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-rose-200 transition-colors items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Buat RPP Baru
        </button>
      </header>

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
              onClick={handleCreateNew}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-colors"
            >
              Mulai Buat RPP Pertama
            </button>
          </div>
        ) : rppList.map((rpp) => (
          <div key={rpp.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            
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
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">{rpp.kelas?.nama}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[11px] font-bold">{rpp.mapel?.nama}</span>
                  {rpp.status_terlaksana ? (
                    <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(rpp.id, rpp.status_terlaksana); }} className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 text-[11px] font-bold border border-emerald-100 flex items-center gap-1 transition-colors">
                      <CheckCircle2 size={12} /> Terlaksana
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(rpp.id, rpp.status_terlaksana); }} className="px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-[11px] font-bold border border-slate-200 transition-colors">
                      Tandai Selesai
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-4">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tujuan Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{rpp.tujuan_pembelajaran}</p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Aktivitas Pembelajaran</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">{rpp.aktivitas_pembelajaran}</p>
                    
                    {rpp.upload_file && (
                      <div className="mt-4">
                         <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lampiran File</h4>
                         <a href={rpp.upload_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors">
                           <FileText size={14} /> Buka Lampiran
                         </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tombol Aksi */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 border-dashed">
                  <button 
                    onClick={() => router.push(`/beranda/presensi/${rpp.id}`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-200 transition-colors"
                  >
                    <Users size={16} />
                    Presensi
                  </button>
                  <button 
                    onClick={() => router.push(`/beranda/penilaian/${rpp.id}`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm shadow-amber-200 transition-colors"
                  >
                    <CheckSquare size={16} />
                    Penilaian
                  </button>
                  
                  <div className="flex ml-auto gap-2">
                    <button onClick={() => handleEdit(rpp)} className="p-2.5 text-rose-600 hover:bg-rose-50 bg-white border border-slate-200 rounded-xl transition-colors">
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
      <button onClick={handleCreateNew} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-300 transition-colors z-40">
        <span className="text-3xl font-light mb-1">+</span>
      </button>

      {/* Modal Form Tambah/Edit RPP */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto pt-10 pb-10">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 md:p-8 my-auto animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">{formData.id ? 'Edit' : 'Buat'} Jurnal / RPP Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Pertemuan Ke- *</label>
                  <input type="number" min="1" required value={formData.pertemuan_ke} onChange={e => setFormData({...formData, pertemuan_ke: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Pilih Mapel *</label>
                  <select required value={formData.mapel_id} onChange={e => setFormData({...formData, mapel_id: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold bg-white">
                    <option value="">-- Mapel --</option>
                    {mapelList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-3 flex justify-between items-center">
                  <span>Pilih Kelas Tujuan *</span>
                  {formData.id && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200">Mode Edit (1 Kelas)</span>}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {kelasList.map(kelas => (
                    <label 
                      key={kelas.id} 
                      className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition-all ${formData.kelas_ids.includes(String(kelas.id)) ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.kelas_ids.includes(String(kelas.id))} 
                        onChange={() => {
                          if (formData.id) {
                            // Jika mode Edit, paksa radio button (cuma bisa 1 kelas)
                            setFormData(prev => ({...prev, kelas_ids: [String(kelas.id)]}));
                          } else {
                            toggleKelasSelection(kelas.id);
                          }
                        }} 
                      />
                      <div className={`w-4 h-4 rounded shadow-inner flex items-center justify-center shrink-0 border ${formData.kelas_ids.includes(String(kelas.id)) ? 'bg-rose-600 border-rose-600' : 'bg-slate-100 border-slate-300'}`}>
                        {formData.kelas_ids.includes(String(kelas.id)) && <CheckSquare size={12} className="text-white" />}
                      </div>
                      <span className="text-xs font-bold select-none truncate">{kelas.nama}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Judul Materi Pembelajaran *</label>
                <input type="text" required placeholder="Contoh: Pengenalan Aljabar Linear" value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Tujuan Pembelajaran *</label>
                <textarea required rows="3" placeholder="Siswa diharapkan mampu..." value={formData.tujuan_pembelajaran} onChange={e => setFormData({...formData, tujuan_pembelajaran: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Aktivitas Pembelajaran *</label>
                <textarea required rows="4" placeholder="1. Pembukaan&#10;2. Penjelasan materi&#10;3. Latihan Soal" value={formData.aktivitas_pembelajaran} onChange={e => setFormData({...formData, aktivitas_pembelajaran: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Lampiran Dokumen / Modul (Opsional)</label>
                {formData.existing_file && (
                  <div className="mb-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> File saat ini sudah terunggah. (Pilih file baru untuk mengganti)
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                    <Upload size={18} />
                  </div>
                  <input type="file" ref={fileInputRef} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-pink-50 border border-pink-100 rounded-xl mb-4">
                  <input type="checkbox" checked={formData.ada_tugas} onChange={e => setFormData({...formData, ada_tugas: e.target.checked})} className="w-5 h-5 rounded text-pink-600 focus:ring-pink-500" />
                  <span className="font-bold text-pink-800">Berikan Tugas untuk RPP ini</span>
                </label>

                {formData.ada_tugas && (
                  <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-xl mb-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Judul Tugas</label>
                      <input type="text" required={formData.ada_tugas} value={formData.judul_tugas} onChange={e => setFormData({...formData, judul_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deskripsi / Pertanyaan Tugas</label>
                      <textarea required={formData.ada_tugas} rows="3" value={formData.deskripsi_tugas} onChange={e => setFormData({...formData, deskripsi_tugas: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all font-medium resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Batas Waktu (Deadline)</label>
                      <input type="date" value={formData.deadline_tugas} onChange={e => setFormData({...formData, deadline_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all font-medium bg-white" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lampiran File Tugas (Opsional)</label>
                      {formData.existing_file_tugas && (
                        <div className="mb-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={14} /> File tugas saat ini sudah terunggah.
                        </div>
                      )}
                      <input type="file" id="file_tugas_input" className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all font-medium text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors">Simpan Jurnal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

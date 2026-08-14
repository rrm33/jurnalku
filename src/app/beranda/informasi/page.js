"use client";

import { useState, useEffect, useRef } from "react";
import { getInformasiList, saveInformasi, deleteInformasi } from "@/actions/informasi";
import { Trash2, Edit, Plus, FileText, Download, Play, Megaphone, Image as ImageIcon, Search, ChevronDown, ChevronUp } from "lucide-react";
import FileViewerModal from "@/components/FileViewerModal";
import Swal from "sweetalert2";

export default function InformasiPage() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [formData, setFormData] = useState({ id: "", judul: "", informasi: "", existing_file: "" });
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [fileToView, setFileToView] = useState(null);
  const fileInputRef = useRef(null);

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const fetchData = async () => {
    setLoading(true);
    const res = await getInformasiList();
    if (res.success) {
      setDataList(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    const submission = new FormData();
    if (formData.id) submission.append("id", formData.id);
    submission.append("judul", formData.judul);
    submission.append("informasi", formData.informasi);
    if (formData.existing_file) submission.append("existing_file", formData.existing_file);
    
    if (fileInputRef.current && fileInputRef.current.files[0]) {
      submission.append("file", fileInputRef.current.files[0]);
    }

    const res = await saveInformasi(submission);
    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      setShowModal(false);
      fetchData();
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      judul: item.judul,
      informasi: item.informasi,
      existing_file: item.file || ""
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Informasi?",
      text: "Informasi yang dihapus tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({ title: "Menghapus...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const res = await deleteInformasi(id);
        if (res.success) {
          Swal.fire("Terhapus!", res.message, "success");
          fetchData();
        } else {
          Swal.fire("Gagal!", res.message, "error");
        }
      }
    });
  };

  const renderFileIcon = (filePath) => {
    if (!filePath) return null;
    const ext = filePath.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <ImageIcon size={20} className="text-rose-500" />;
    } else if (['mp4', 'webm'].includes(ext)) {
      return <Play size={20} className="text-purple-500" />;
    }
    return <FileText size={20} className="text-rose-500" />;
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="text-rose-600" /> Informasi & Pengumuman
          </h1>
          <p className="text-slate-500 mt-1">Kelola papan informasi untuk dibaca oleh siswa.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: "", judul: "", informasi: "", existing_file: "" });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all"
        >
          <Plus size={18} /> Tambah Informasi
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari judul atau isi informasi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-700 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Memuat data informasi...</div>
        ) : dataList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            <Megaphone size={48} className="mx-auto mb-4 text-slate-300" />
            Belum ada informasi. Silakan tambahkan informasi baru.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {dataList.filter(i => i.judul.toLowerCase().includes(search.toLowerCase()) || i.informasi.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
               <div className="p-8 text-center text-slate-400 font-medium">Pencarian tidak ditemukan.</div>
            ) : dataList
                .filter(i => i.judul.toLowerCase().includes(search.toLowerCase()) || i.informasi.toLowerCase().includes(search.toLowerCase()))
                .map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div key={item.id} className="transition-colors hover:bg-slate-50">
                      <div 
                        className="p-4 md:p-5 flex items-start md:items-center justify-between gap-4 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-rose-50 flex flex-shrink-0 items-center justify-center text-rose-500">
                            <Megaphone size={18} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-base leading-tight">{item.judul}</h3>
                            <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-500">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                              {item.file && <span className="flex items-center gap-1 text-rose-600"><FileText size={12} /> Ada Lampiran</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-400 shrink-0">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                      
                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-4 md:px-5 pb-4 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                            {item.informasi.split(urlRegex).map((part, index) => {
                              if (urlRegex.test(part)) {
                                return (
                                  <button key={index} onClick={() => setFileToView(part)} className="text-blue-600 hover:underline font-medium">
                                    {part}
                                  </button>
                                );
                              }
                              return part;
                            })}
                          </div>
                          
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              {item.file && (
                                <button onClick={() => setFileToView(item.file)} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-bold transition-colors">
                                  {renderFileIcon(item.file)} Buka Lampiran
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEdit(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-bold transition-colors">
                                <Edit size={14} /> Edit
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-bold transition-colors">
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {formData.id ? "Edit Informasi" : "Tambah Informasi"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-full transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul (Opsional)</label>
                  <input 
                    type="text" 
                    value={formData.judul} 
                    onChange={e => setFormData({...formData, judul: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                    placeholder="Kosongkan agar dibuat otomatis dari isi..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1">*Jika dikosongkan, judul akan diambil 40 karakter pertama dari isi.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Isi Informasi *</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.informasi} 
                    onChange={e => setFormData({...formData, informasi: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800 resize-none"
                    placeholder="Ketikkan pengumuman atau informasi..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lampiran Berkas (Opsional)</label>
                  {formData.existing_file && (
                    <div className="mb-3 p-3 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center text-sm font-medium text-rose-800">
                      <span>File tersimpan saat ini</span>
                      <button type="button" onClick={() => setFileToView(formData.existing_file)} className="text-rose-600 hover:underline flex items-center gap-1">
                        <FileText size={14} /> Preview
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="w-full px-4 py-2.5 border border-dashed border-slate-300 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm text-slate-600 bg-slate-50"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">*Format didukung: JPG, PNG, PDF, DOCX, MP4, dll.</p>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors">
                  Simpan Informasi
                </button>
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

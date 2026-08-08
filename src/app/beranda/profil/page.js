"use client";

import { useState, useEffect, useRef } from "react";
import { getProfilGuru, updateProfilGuru } from "@/actions/profil";
import { User, Save, Lock, Mail, Phone, CreditCard, Hash, Upload, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [modalImage, setModalImage] = useState(null); // Untuk full preview

  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    email: "",
    hp: "",
    nik: "",
    kk: "",
    password: "", 
    existing_foto: ""
  });

  const fetchData = async () => {
    setLoading(true);
    const data = await getProfilGuru(1);
    if (data) {
      setFormData({
        nip: data.nip || "",
        nama: data.nama || "",
        email: data.email || "",
        hp: data.hp || "",
        nik: data.nik || "",
        kk: data.kk || "",
        password: "",
        existing_foto: data.foto || ""
      });
      if (data.foto) setPreviewImage(data.foto);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    const submission = new FormData();
    submission.append("nip", formData.nip);
    submission.append("nama", formData.nama);
    submission.append("email", formData.email);
    submission.append("hp", formData.hp);
    submission.append("nik", formData.nik);
    submission.append("kk", formData.kk);
    submission.append("password", formData.password);
    submission.append("existing_foto", formData.existing_foto);

    if (fileInputRef.current && fileInputRef.current.files[0]) {
      submission.append("foto", fileInputRef.current.files[0]);
    }

    const res = await updateProfilGuru(submission, 1);
    if (res.success) {
      Swal.fire("Berhasil", "Profil Anda berhasil diperbarui!", "success");
      fetchData(); 
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Memuat data profil...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola data diri, foto, dan kredensial akses Anda.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          
          {/* Header Profil (Visual & Foto) */}
          <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            
            {/* Area Foto */}
            <div className="relative group shrink-0">
              <div 
                onClick={() => previewImage && setModalImage(previewImage)}
                className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-white/20 bg-white ${previewImage ? 'cursor-pointer' : ''}`}
              >
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-600 transition-colors border-2 border-white">
                <Upload size={14} />
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              </label>
            </div>

            <div className="text-white">
              <h2 className="text-2xl font-bold">{formData.nama || "Guru Belum Bernama"}</h2>
              <p className="text-rose-100 font-medium mb-2">NIP. {formData.nip || "-"}</p>
              <div className="text-xs text-rose-200 bg-white/10 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                Klik ikon <Upload size={10} className="inline mx-0.5" /> untuk mengganti foto
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><User size={14} /> Nama Lengkap *</label>
                <input 
                  type="text" required
                  value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Hash size={14} /> NIP *</label>
                <input 
                  type="text" required
                  value={formData.nip} onChange={e => setFormData({...formData, nip: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold text-slate-800 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Mail size={14} /> Email</label>
                <input 
                  type="email" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Phone size={14} /> No. HP</label>
                <input 
                  type="text" 
                  value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><CreditCard size={14} /> NIK KTP</label>
                <input 
                  type="text" 
                  value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><CreditCard size={14} /> No. Kartu Keluarga</label>
                <input 
                  type="text" 
                  value={formData.kk} onChange={e => setFormData({...formData, kk: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <hr className="border-slate-100" />
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Lock size={14} /> Ubah Password</label>
              <input 
                type="password" 
                placeholder="Kosongkan jika tidak ingin mengubah password"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-medium text-slate-800"
              />
            </div>

          </div>

          <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition-colors">
              <Save size={18} />
              Simpan Profil
            </button>
          </div>

        </form>
      </div>

      {/* Modal Preview Foto */}
      {modalImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setModalImage(null)}>
          <div className="relative max-w-2xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalImage(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors">✕</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modalImage} alt="Preview Foto" className="w-full h-auto object-contain max-h-[85vh]" />
          </div>
        </div>
      )}
    </div>
  );
}

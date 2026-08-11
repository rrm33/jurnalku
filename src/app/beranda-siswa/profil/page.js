"use client";

import { useState, useEffect, useRef } from "react";
import { getMyProfilSiswa, updateProfilSiswa, getAjuanStatusSiswa } from "@/actions/profil-siswa";
import { User, Save, Lock, Mail, Phone, CreditCard, Upload, MapPin, Calendar, Heart, GraduationCap, ShieldAlert, Map, ExternalLink, Clock } from "lucide-react";
import Swal from "sweetalert2";
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function ProfilSiswaPage() {
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [modalImage, setModalImage] = useState(null); 
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [ajuanStatus, setAjuanStatus] = useState(null);

  const [formData, setFormData] = useState({
    nama: "",
    nisn: "",
    nis: "",
    kelas_nama: "",
    email: "",
    hp: "",
    hp_ortu: "",
    nik: "",
    kk: "",
    tmp_lahir: "",
    tgl_lahir: "",
    akta_lahir: "",
    alamat: "",
    password: "", 
    existing_foto: ""
  });

  const extractCoordinates = (alamatStr) => {
    if (!alamatStr) return null;
    const match = alamatStr.match(/\[Koordinat:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
    return match ? { lat: match[1], lng: match[2] } : null;
  };

  const fetchData = async () => {
    setLoading(true);
    const data = await getMyProfilSiswa();
    const pendingStatus = await getAjuanStatusSiswa();
    
    if (data) {
      setFormData({
        nama: data.nama || "",
        nisn: data.nisn || "",
        nis: data.nis || "",
        kelas_nama: data.kelas?.nama || "-",
        email: data.email || "",
        hp: data.hp || "",
        hp_ortu: data.hp_ortu || "",
        nik: data.nik || "",
        kk: data.kk || "",
        tmp_lahir: data.tmp_lahir || "",
        tgl_lahir: data.tgl_lahir ? new Date(data.tgl_lahir).toISOString().split('T')[0] : "",
        akta_lahir: data.akta_lahir || "",
        alamat: data.alamat || "",
        password: "",
        existing_foto: data.foto || ""
      });
      if (data.foto) setPreviewImage(data.foto);
    } else {
      Swal.fire("Gagal", "Tidak dapat memuat profil. Sesi mungkin telah berakhir.", "error");
    }
    setAjuanStatus(pendingStatus?.status || null);
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
    submission.append("nama", formData.nama);
    submission.append("nis", formData.nis);
    submission.append("nisn", formData.nisn);
    submission.append("email", formData.email);
    submission.append("hp", formData.hp);
    submission.append("hp_ortu", formData.hp_ortu);
    submission.append("nik", formData.nik);
    submission.append("kk", formData.kk);
    submission.append("tmp_lahir", formData.tmp_lahir);
    if (formData.tgl_lahir) submission.append("tgl_lahir", formData.tgl_lahir);
    submission.append("akta_lahir", formData.akta_lahir);
    submission.append("alamat", formData.alamat);
    submission.append("password", formData.password);
    submission.append("existing_foto", formData.existing_foto);

    if (fileInputRef.current && fileInputRef.current.files[0]) {
      submission.append("foto", fileInputRef.current.files[0]);
    }

    const res = await updateProfilSiswa(submission);
    if (res.success) {
      Swal.fire("Berhasil", res.message, "success");
      fetchData(); 
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleGetLocation = () => {
    Swal.fire({
      title: 'Ambil Lokasi Saat Ini?',
      text: "Sistem akan meminta izin untuk mengakses GPS perangkat Anda.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Ya, Ambil Lokasi',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        if (!navigator.geolocation) {
          Swal.fire("Error", "Geolokasi tidak didukung oleh browser Anda.", "error");
          return;
        }

        Swal.fire({ title: "Mencari lokasi...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              
              if (data && data.display_name) {
                setFormData(prev => ({ ...prev, alamat: `${data.display_name}\n[Koordinat: ${latitude}, ${longitude}]` }));
                Swal.fire("Berhasil", "Detail alamat dan koordinat berhasil ditemukan!", "success");
              } else {
                setFormData(prev => ({ ...prev, alamat: `[Koordinat: ${latitude}, ${longitude}]` }));
                Swal.fire("Info", "Lokasi ditemukan, tapi nama jalan gagal dimuat.", "info");
              }
            } catch (error) {
              setFormData(prev => ({ ...prev, alamat: `[Koordinat: ${position.coords.latitude}, ${position.coords.longitude}]` }));
              Swal.fire("Info", "Gagal memuat nama jalan, kordinat tetap disimpan.", "info");
            }
          },
          (error) => {
            Swal.fire("Gagal", "Tidak dapat mengambil lokasi. Pastikan izin lokasi (GPS) diberikan pada browser.", "error");
          }
        );
      }
    });
  };

  const handleMapConfirm = async (pos) => {
    setShowMapPicker(false);
    Swal.fire({ title: "Menerjemahkan lokasi...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
      const data = await res.json();
      const addrName = (data && data.display_name) ? data.display_name : `Lokasi Terpilih`;
      setFormData(prev => ({ ...prev, alamat: `${addrName}\n[Koordinat: ${pos.lat}, ${pos.lng}]` }));
      Swal.fire("Berhasil", "Lokasi manual berhasil diterapkan!", "success");
    } catch (error) {
      setFormData(prev => ({ ...prev, alamat: `Lokasi Terpilih\n[Koordinat: ${pos.lat}, ${pos.lng}]` }));
      Swal.fire("Berhasil", "Koordinat disimpan tanpa nama jalan.", "success");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Memuat data profil...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola data diri, kontak, dan keamanan akun Anda.</p>
      </div>

      {ajuanStatus === 'MENUNGGU' && (
        <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <Clock className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Pengajuan Sedang Diproses</h4>
            <p className="text-xs mt-1 opacity-90">Anda memiliki perubahan profil yang sedang menunggu persetujuan dari Admin/Guru. Anda tetap bisa mengajukan perubahan baru, namun ajuan sebelumnya akan ditimpa.</p>
          </div>
        </div>
      )}
      
      {ajuanStatus === 'DITOLAK' && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Pengajuan Ditolak</h4>
            <p className="text-xs mt-1 opacity-90">Pengajuan perubahan profil terakhir Anda telah ditolak oleh Admin/Guru. Silakan periksa kembali data yang dimasukkan atau hubungi Guru secara langsung.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          
          {/* Header Profil (Visual & Foto) */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden">
            {/* Dekorasi BG */}
            <div className="absolute top-0 right-0 opacity-10">
              <GraduationCap size={200} className="transform rotate-12 -translate-y-10 translate-x-10" />
            </div>

            {/* Area Foto */}
            <div className="relative group shrink-0 z-10">
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
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 transition-colors border-2 border-white">
                <Upload size={14} />
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              </label>
            </div>

            <div className="text-white z-10">
              <h2 className="text-2xl font-bold">{formData.nama}</h2>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2">
                <p className="text-teal-100 font-medium bg-black/10 px-3 py-1 rounded-lg backdrop-blur-sm">NISN: {formData.nisn || "-"}</p>
                <p className="text-teal-100 font-medium bg-black/10 px-3 py-1 rounded-lg backdrop-blur-sm">Kelas: {formData.kelas_nama}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Section: Informasi Akademik */}
            <section>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <GraduationCap size={16} className="text-pink-500" /> 
                Informasi Akademik <span className="text-xs text-slate-400 font-normal ml-2">(Perubahan data ini perlu persetujuan)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Induk Siswa (NIS)</label>
                  <input type="text" value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NISN</label>
                  <input type="text" value={formData.nisn || ""} onChange={e => setFormData({...formData, nisn: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all font-medium text-slate-700" />
                </div>
              </div>
            </section>

            {/* Section: Kontak & Komunikasi */}
            <section>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <Phone size={16} className="text-emerald-500" /> Kontak & Komunikasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor HP / WhatsApp</label>
                  <input 
                    type="text" 
                    value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})}
                    placeholder="Contoh: 0812345678"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@sekolah.id"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">No. HP Orang Tua</label>
                  <input 
                    type="text" 
                    value={formData.hp_ortu} onChange={e => setFormData({...formData, hp_ortu: e.target.value})}
                    placeholder="Untuk kondisi darurat"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-800 bg-orange-50/30"
                  />
                </div>
              </div>
            </section>

            {/* Section: Data Kependudukan */}
            <section>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-500" /> Data Kependudukan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NIK Siswa</label>
                  <input 
                    type="text" 
                    value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor KK</label>
                  <input 
                    type="text" 
                    value={formData.kk} onChange={e => setFormData({...formData, kk: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">No. Akta Kelahiran</label>
                  <input 
                    type="text" 
                    value={formData.akta_lahir} onChange={e => setFormData({...formData, akta_lahir: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800"
                  />
                </div>
              </div>
            </section>

            {/* Section: Alamat & TTL */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-500" /> Tempat, Tanggal Lahir
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Tempat Lahir"
                      value={formData.tmp_lahir} onChange={e => setFormData({...formData, tmp_lahir: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800"
                    />
                    <input 
                      type="date" 
                      value={formData.tgl_lahir} onChange={e => setFormData({...formData, tgl_lahir: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-500" /> Alamat Domisili
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowMapPicker(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Map size={12} /> Pilih Peta
                      </button>
                      <button 
                        type="button" 
                        onClick={handleGetLocation}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 rounded-lg text-xs font-bold transition-colors"
                      >
                        <MapPin size={12} /> Titik GPS
                      </button>
                    </div>
                  </div>
                  <textarea 
                    rows={3}
                    value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})}
                    placeholder="Alamat lengkap atau koordinat lokasi..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-medium text-slate-800 resize-none"
                  ></textarea>
                  
                  {extractCoordinates(formData.alamat) && (
                    <div className="mt-2 text-right">
                      <a 
                        href={`https://www.google.com/maps?q=${extractCoordinates(formData.alamat).lat},${extractCoordinates(formData.alamat).lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <ExternalLink size={12} /> Buka di Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Keamanan */}
            <section className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Lock size={16} className="text-orange-500" /> Ganti Password
              </h3>
              <input 
                type="password" 
                placeholder="Kosongkan jika tidak ingin mengubah password"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full max-w-md px-4 py-2.5 border border-orange-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium text-slate-800"
              />
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <ShieldAlert size={12} /> Gunakan kombinasi huruf dan angka minimal 6 karakter.
              </p>
            </section>

          </div>

          <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-colors">
              <Save size={18} />
              Ajukan Perubahan
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

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker 
          initialPosition={extractCoordinates(formData.alamat)}
          onClose={() => setShowMapPicker(false)}
          onConfirm={handleMapConfirm}
        />
      )}
    </div>
  );
}

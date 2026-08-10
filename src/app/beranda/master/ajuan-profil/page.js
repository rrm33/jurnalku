"use client";

import { useState, useEffect } from "react";
import { getAjuanMenunggu, approveAjuan, rejectAjuan } from "@/actions/ajuan";
import Swal from "sweetalert2";
import { CheckCircle, XCircle, Clock, User, Eye, ArrowRight } from "lucide-react";

export default function AjuanProfilPage() {
  const [ajuanList, setAjuanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAjuan, setSelectedAjuan] = useState(null);

  const fetchAjuan = async () => {
    setLoading(true);
    const data = await getAjuanMenunggu();
    setAjuanList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAjuan();
  }, []);

  const handleApprove = async (id) => {
    const res = await approveAjuan(id);
    if (res.success) {
      Swal.fire("Disetujui!", res.message, "success");
      setSelectedAjuan(null);
      fetchAjuan();
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleReject = async (id) => {
    const confirm = await Swal.fire({
      title: "Tolak Ajuan?",
      text: "Apakah Anda yakin ingin menolak ajuan perubahan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Tolak",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      const res = await rejectAjuan(id);
      if (res.success) {
        Swal.fire("Ditolak", res.message, "success");
        setSelectedAjuan(null);
        fetchAjuan();
      } else {
        Swal.fire("Gagal", res.message, "error");
      }
    }
  };

  const formatKey = (key) => {
    return key.replace(/_/g, " ").toUpperCase();
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Memuat daftar ajuan...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Ajuan Perubahan Profil</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar permintaan perubahan biodata siswa yang menunggu persetujuan Anda.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {ajuanList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">Semua Ajuan Telah Diproses</h3>
            <p className="text-slate-500 text-sm">Tidak ada ajuan perubahan profil yang menunggu persetujuan saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-slate-100">
            {ajuanList.map((ajuan) => (
              <div key={ajuan.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{ajuan.siswa.nama}</h3>
                    <div className="flex flex-wrap gap-2 text-xs font-medium mt-1">
                      <span className="text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">NISN: {ajuan.siswa.nisn}</span>
                      <span className="text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">Kelas: {ajuan.siswa.kelas?.nama}</span>
                      <span className="text-orange-600 px-2 py-0.5 bg-orange-50 rounded-md flex items-center gap-1">
                        <Clock size={12} /> {new Date(ajuan.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAjuan(ajuan)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold transition-colors w-full md:w-auto justify-center"
                >
                  <Eye size={16} /> Lihat Detail
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Ajuan */}
      {selectedAjuan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedAjuan(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Detail Ajuan Perubahan</h2>
                <p className="text-slate-500 text-sm mt-1">Siswa: <span className="font-bold text-indigo-600">{selectedAjuan.siswa.nama}</span></p>
              </div>
              <button onClick={() => setSelectedAjuan(null)} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                Berikut adalah data baru yang diajukan oleh siswa. Harap periksa dengan teliti sebelum menyetujui.
              </p>
              
              <div className="space-y-4">
                {Object.entries(JSON.parse(selectedAjuan.data_perubahan)).map(([key, value]) => {
                  if (value === null || value === "") return null;
                  return (
                    <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                      <div className="md:w-1/3 shrink-0">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatKey(key)}</span>
                      </div>
                      <div className="flex-1 font-medium text-slate-800 break-words w-full">
                        {key === 'foto' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={value} alt="Preview Foto Baru" className="h-20 rounded shadow-sm border border-slate-200" />
                        ) : key === 'tgl_lahir' ? (
                          new Date(value).toLocaleDateString('id-ID')
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex gap-3 justify-end">
              <button 
                onClick={() => handleReject(selectedAjuan.id)}
                className="px-6 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <XCircle size={18} /> Tolak Ajuan
              </button>
              <button 
                onClick={() => handleApprove(selectedAjuan.id)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={18} /> Setujui Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

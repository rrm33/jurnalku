"use client";

import { useState, useEffect } from "react";
import { getAllAjuanSiswa, approveAjuan, rejectAjuan } from "@/actions/ajuan";
import Swal from "sweetalert2";
import { CheckCircle, XCircle, Clock, User, Eye, AlertCircle } from "lucide-react";

export default function AjuanProfilPage() {
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchAjuan = async () => {
    setLoading(true);
    const data = await getAllAjuanSiswa();
    setStudentList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAjuan();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approveAjuan(id);
      if (res.success) {
        Swal.fire("Disetujui!", res.message, "success");
        
        // Update local state without closing modal
        if (selectedStudent) {
          const updatedStudent = { ...selectedStudent };
          updatedStudent.ajuanProfil = updatedStudent.ajuanProfil.map(aj => 
            aj.id === id ? { ...aj, status: "DISETUJUI", updated_at: new Date() } : aj
          );
          setSelectedStudent(updatedStudent);
        }
        window.dispatchEvent(new Event('refreshNotifs'));
        fetchAjuan();
      } else {
        Swal.fire("Gagal", res.message, "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error Server", "Terjadi kesalahan jaringan atau server sedang sibuk (500).", "error");
    }
  };

  const handleReject = async (id) => {
    try {
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
          
          // Update local state without closing modal
          if (selectedStudent) {
            const updatedStudent = { ...selectedStudent };
            updatedStudent.ajuanProfil = updatedStudent.ajuanProfil.map(aj => 
              aj.id === id ? { ...aj, status: "DITOLAK", updated_at: new Date() } : aj
            );
            setSelectedStudent(updatedStudent);
          }
          window.dispatchEvent(new Event('refreshNotifs'));
          fetchAjuan();
        } else {
          Swal.fire("Gagal", res.message, "error");
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error Server", "Terjadi kesalahan jaringan atau server sedang sibuk (500).", "error");
    }
  };

  const formatKey = (key) => {
    return key.replace(/_/g, " ").toUpperCase();
  };

  const getDynamicKeys = (ajuanProfilList) => {
    const keys = new Set();
    ajuanProfilList.forEach(ajuan => {
      try {
        const parsed = JSON.parse(ajuan.data_perubahan);
        Object.keys(parsed).forEach(k => {
          if (parsed[k] !== null && parsed[k] !== "") keys.add(k);
        });
      } catch (e) {}
    });
    return Array.from(keys);
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Memuat daftar siswa...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Riwayat Ajuan Perubahan Profil</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar siswa yang memiliki riwayat pengajuan perubahan biodata.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {studentList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">Belum Ada Ajuan</h3>
            <p className="text-slate-500 text-sm">Belum ada satupun siswa yang mengajukan perubahan profil.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-slate-100">
            {studentList.map((siswa) => {
              const pendingCount = siswa.ajuanProfil.filter(aj => aj.status === "MENUNGGU").length;
              const totalCount = siswa.ajuanProfil.length;
              
              return (
                <div key={siswa.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${pendingCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        {siswa.nama}
                        {pendingCount > 0 && (
                          <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-sm">
                            <AlertCircle size={10} /> {pendingCount} Menunggu
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs font-medium mt-1">
                        <span className="text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">NISN: {siswa.nisn}</span>
                        <span className="text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">Kelas: {siswa.kelas?.nama || '-'}</span>
                        <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md flex items-center gap-1">
                          <Clock size={12} /> {totalCount} Total Riwayat
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedStudent(siswa)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold transition-colors w-full md:w-auto justify-center"
                  >
                    <Eye size={16} /> Lihat Detail
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Riwayat Detail */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Clock className="text-indigo-500"/> Riwayat Ajuan Profil</h2>
                <p className="text-slate-500 text-sm mt-1">Siswa: <span className="font-bold text-indigo-600">{selectedStudent.nama}</span> ({selectedStudent.nisn})</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="w-8 h-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition-colors">✕</button>
            </div>
            
            <div className="p-6 flex-1 overflow-auto custom-scrollbar">
              <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                Tabel di bawah ini menampilkan seluruh riwayat perubahan profil yang pernah diajukan oleh siswa ini. Kolom yang kosong berarti tidak ada perubahan pada atribut tersebut di riwayat itu.
              </p>
              
              <div className="overflow-x-auto pb-4 rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse min-w-max bg-white">
                  <thead>
                    <tr>
                      <th className="p-4 border-b-2 border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-50 whitespace-nowrap">Waktu Pengajuan</th>
                      <th className="p-4 border-b-2 border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-50 whitespace-nowrap">Status</th>
                      
                      {/* Dynamic Columns based on changes */}
                      {getDynamicKeys(selectedStudent.ajuanProfil).map(key => (
                        <th key={key} className="p-4 border-b-2 border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-50 whitespace-nowrap">
                          {formatKey(key)}
                        </th>
                      ))}
                      
                      <th className="p-4 border-b-2 border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider bg-slate-50 whitespace-nowrap text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudent.ajuanProfil.map(ajuan => {
                      let parsed = {};
                      try {
                        parsed = JSON.parse(ajuan.data_perubahan);
                      } catch(e) {}
                      
                      const dynamicKeys = getDynamicKeys(selectedStudent.ajuanProfil);
                      
                      return (
                        <tr key={ajuan.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-sm text-slate-600 whitespace-nowrap font-medium">
                            {new Date(ajuan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {ajuan.status === "MENUNGGU" && (
                              <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 shadow-sm">⏳ MENUNGGU</span>
                            )}
                            {ajuan.status === "DISETUJUI" && (
                              <div className="flex flex-col">
                                <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 shadow-sm self-start">✅ DISETUJUI</span>
                                <span className="text-[10px] text-slate-400 mt-1.5 font-medium ml-1">{new Date(ajuan.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            )}
                            {ajuan.status === "DITOLAK" && (
                              <div className="flex flex-col">
                                <span className="bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 shadow-sm self-start">❌ DITOLAK</span>
                                <span className="text-[10px] text-slate-400 mt-1.5 font-medium ml-1">{new Date(ajuan.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            )}
                          </td>
                          
                          {/* Dynamic Columns Data */}
                          {dynamicKeys.map(key => {
                            const val = parsed[key];
                            return (
                              <td key={key} className="p-4 text-sm text-slate-700 whitespace-nowrap">
                                {val ? (
                                  key === 'foto' ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <div className="relative group w-12 h-12 cursor-pointer">
                                        <img src={val} alt="Foto Baru" className="h-full w-full object-cover rounded shadow-sm border border-slate-200" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded transition-opacity flex items-center justify-center">
                                            <Eye size={16} className="text-white"/>
                                        </div>
                                    </div>
                                  ) : key === 'tgl_lahir' ? (
                                    new Date(val).toLocaleDateString('id-ID')
                                  ) : (
                                    <span className="font-semibold px-2 py-1 bg-white border border-slate-100 rounded text-slate-700">{val}</span>
                                  )
                                ) : (
                                  <span className="text-slate-300 ml-4">-</span>
                                )}
                              </td>
                            );
                          })}
                          
                          <td className="p-4 whitespace-nowrap text-center align-middle">
                            {ajuan.status === "MENUNGGU" ? (
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleReject(ajuan.id)}
                                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 flex items-center justify-center transition-colors shadow-sm font-bold text-xs gap-1"
                                  title="Tolak Ajuan"
                                >
                                  <XCircle size={14} /> Tolak
                                </button>
                                <button 
                                  onClick={() => handleApprove(ajuan.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-sm shadow-emerald-200 font-bold text-xs gap-1"
                                  title="Setujui Ajuan"
                                >
                                  <CheckCircle size={14} /> Setujui
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs italic font-medium px-4">Selesai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

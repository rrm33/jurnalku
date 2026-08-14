"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getTugasDenganPenilaian, simpanNilaiMasal } from "@/actions/penilaian";
import { ArrowLeft, CheckCircle2, Clock, Download, FileText, CheckSquare, FileWarning, Search, Save, AlertCircle, X } from "lucide-react";
import FileViewerModal from "@/components/FileViewerModal";
import Linkify from "@/components/Linkify";
import Countdown from "@/components/Countdown";
import Link from "next/link";
import Swal from "sweetalert2";

export default function PenilaianPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  
  const handleBack = () => {
    if (source === 'penilaian') {
      router.push('/beranda/penilaian');
    } else {
      router.push('/beranda/rpp');
    }
  };
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [fileToView, setFileToView] = useState(null);
  
  // State untuk melacak form input nilai (key = siswa_id, value = nilai string)
  const [nilaiState, setNilaiState] = useState({});

  const fetchData = async () => {
    setLoading(true);
    const res = await getTugasDenganPenilaian(params.id);
    
    if (res.success && res.data.tugas) {
      setData(res.data);
      
      // Initialize nilai state dari data yang ada di database
      const initialNilai = {};
      res.data.siswaList.forEach(siswa => {
        const pengumpulan = siswa.pengumpulanTugas && siswa.pengumpulanTugas.length > 0 ? siswa.pengumpulanTugas[0] : null;
        if (pengumpulan && pengumpulan.nilai !== null) {
          initialNilai[siswa.id] = pengumpulan.nilai.toString();
        } else {
          initialNilai[siswa.id] = "";
        }
      });
      setNilaiState(initialNilai);
    } else {
      // Jika tugas null atau gagal
      setData(res.success ? res.data : null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleNilaiChange = (siswaId, value) => {
    // Validasi angka 0-100
    if (value === "") {
      setNilaiState(prev => ({ ...prev, [siswaId]: "" }));
      return;
    }
    
    const num = parseInt(value);
    if (!isNaN(num)) {
       let val = num;
       if (val < 0) val = 0;
       if (val > 100) val = 100;
       setNilaiState(prev => ({ ...prev, [siswaId]: val.toString() }));
    }
  };

  const handleSaveBulk = async () => {
    if (!data || !data.tugas) return;
    
    setSaving(true);
    
    // Siapkan array data yang akan dikirim ke backend
    const dataToSend = Object.keys(nilaiState).map(siswaId => ({
      siswa_id: parseInt(siswaId),
      nilai: nilaiState[siswaId]
    }));

    const res = await simpanNilaiMasal(data.tugas.id, dataToSend);
    
    setSaving(false);

    if (res.success) {
      Swal.fire({
        title: "Tersimpan!",
        text: "Semua nilai berhasil diperbarui.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
      fetchData(); // Refresh data untuk melihat status terbaru
    } else {
      Swal.fire("Gagal", res.message || "Terjadi kesalahan sistem.", "error");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle Jika RPP tidak ditemukan atau gagal
  if (!data || !data.rpp) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <FileWarning size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">RPP Tidak Ditemukan</h1>
        <p className="text-slate-500 max-w-md">Data KBM tidak valid atau telah dihapus.</p>
        <Link href="/beranda/rpp" className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors">
          Kembali ke Daftar RPP
        </Link>
      </div>
    );
  }

  // Handle Jika KBM/RPP tersebut tidak punya tugas
  if (!data.tugas) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-pink-600 font-semibold mb-6 transition-colors">
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <CheckSquare size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Tidak Ada Tugas</h1>
          <p className="text-slate-500 max-w-md">Anda tidak membuat tugas atau evaluasi pada KBM (RPP) ini sehingga tidak ada yang perlu dinilai.</p>
        </div>
      </div>
    );
  }

  const { rpp, tugas, siswaList } = data;

  // Filter pencarian nama siswa
  const filteredSiswa = siswaList.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()));

  // Menghitung status ringkasan
  const totalSiswa = siswaList.length;
  const totalMengerjakan = siswaList.filter(s => s.pengumpulanTugas && s.pengumpulanTugas.length > 0).length;
  const totalDinilai = siswaList.filter(s => s.pengumpulanTugas && s.pengumpulanTugas.length > 0 && s.pengumpulanTugas[0].nilai !== null).length;

  return (
    <div className="max-w-7xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Tombol Back */}
      <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-pink-600 font-semibold mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali
      </button>

      {/* Header Info KBM */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-8 justify-between relative overflow-hidden">
        {/* Dekorasi BG */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
        
        <div className="flex-1 relative z-10">
          <div className="flex flex-wrap gap-2 mb-3">
             <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-100">{rpp.mapel?.nama}</span>
             <span className="px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-lg border border-pink-100">{rpp.kelas?.nama}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">{tugas.judul}</h1>
          <p className="text-slate-600 font-medium mb-6">{tugas.deskripsi}</p>
          
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 w-fit px-4 py-2 rounded-xl border border-slate-100">
              <Clock size={16} className="text-rose-500" />
              Batas Pengumpulan: <span className="text-rose-600">{formatDate(tugas.deadline)}</span>
            </div>
            {tugas.deadline && <Countdown deadline={tugas.deadline} size="normal" />}
          </div>
        </div>

        {/* Ringkasan */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3 relative z-10">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex justify-between items-center mb-1">
               <span className="text-xs font-bold text-slate-500 uppercase">Terkumpul</span>
               <span className="text-sm font-black text-slate-800">{totalMengerjakan} / {totalSiswa}</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
               <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${totalSiswa === 0 ? 0 : (totalMengerjakan/totalSiswa)*100}%` }}></div>
             </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="flex justify-between items-center mb-1">
               <span className="text-xs font-bold text-slate-500 uppercase">Dinilai</span>
               <span className="text-sm font-black text-slate-800">{totalDinilai} / {totalSiswa}</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
               <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${totalSiswa === 0 ? 0 : (totalDinilai/totalSiswa)*100}%` }}></div>
             </div>
          </div>
        </div>
      </div>

      {/* Area Tabel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar Tabel */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
           <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Cari nama siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-400 transition-all text-sm font-medium"
              />
           </div>
           
           <button 
             onClick={handleSaveBulk}
             disabled={saving}
             className="w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-pink-200 transition-all"
           >
             <Save size={18} />
             {saving ? "Menyimpan..." : "Simpan Semua Penilaian"}
           </button>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-4 border-b border-slate-200 w-12 text-center">No</th>
                <th className="p-4 border-b border-slate-200 min-w-[200px]">Nama Siswa</th>
                <th className="p-4 border-b border-slate-200 w-32">Status</th>
                <th className="p-4 border-b border-slate-200 min-w-[300px]">Pekerjaan Siswa</th>
                <th className="p-4 border-b border-slate-200 w-32 text-center bg-pink-50/50">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Siswa tidak ditemukan.</td>
                </tr>
              ) : filteredSiswa.map((siswa, index) => {
                const submission = siswa.pengumpulanTugas && siswa.pengumpulanTugas.length > 0 ? siswa.pengumpulanTugas[0] : null;
                const isSubmitted = !!submission;
                
                return (
                  <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 text-center text-slate-400 font-semibold">{index + 1}</td>
                    
                    <td className="p-4 font-bold text-slate-700">
                      {siswa.nama}
                      <span className="block text-xs text-slate-400 font-normal mt-0.5">{siswa.nisn || "-"}</span>
                    </td>
                    
                    <td className="p-4">
                      {isSubmitted ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit border border-emerald-100">
                            <CheckCircle2 size={14} /> Selesai
                          </div>
                          {submission.updated_at && (
                            <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock size={10} /> {new Date(submission.updated_at).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                          <Clock size={14} /> Belum
                        </div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      {isSubmitted ? (
                        <div className="space-y-2">
                           {submission.input_jawaban && (
                             <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-24 overflow-y-auto custom-scrollbar whitespace-pre-line">
                               <Linkify>{submission.input_jawaban}</Linkify>
                             </div>
                           )}
                           
                           {submission.upload_file && (
                             <button onClick={() => setFileToView(submission.upload_file)} className="inline-flex items-center gap-2 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors border border-pink-100">
                               <FileText size={14} /> Buka Lampiran Jawaban
                             </button>
                           )}
                           
                           {!submission.input_jawaban && !submission.upload_file && (
                             <span className="text-xs text-slate-400 italic">Mengirim tugas kosong (Hanya menandai selesai).</span>
                           )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <AlertCircle size={14} />
                          Belum ada rekam jejak.
                        </div>
                      )}
                    </td>
                    
                    <td className="p-4 bg-pink-50/20 group-hover:bg-pink-50/50 transition-colors">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="relative w-20">
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={nilaiState[siswa.id] ?? ""}
                            onChange={(e) => handleNilaiChange(siswa.id, e.target.value)}
                            placeholder="-"
                            className="w-full text-center px-2 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 font-bold text-slate-800 transition-all"
                          />
                        </div>
                        {nilaiState[siswa.id] !== "" && (
                          <button 
                            onClick={() => handleNilaiChange(siswa.id, "")}
                            className="text-slate-400 hover:text-rose-500 p-1 bg-white border border-slate-200 rounded hover:bg-rose-50 hover:border-rose-200 transition-colors"
                            title="Hapus Nilai"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal File Viewer */}
      <FileViewerModal url={fileToView} onClose={() => setFileToView(null)} />
    </div>
  );
}

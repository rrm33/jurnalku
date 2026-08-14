"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { getSiswa, saveSiswa, deleteSiswa, getKelas, importSiswaBulk } from "@/actions/master";
import { Trash2, Edit, Plus, Upload, Download, Search, User, MapPin, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { calculateProfileCompletion, getProfileProgressColor } from "@/utils/profile";
import { useSearchParams } from "next/navigation";

const extractCoordinates = (alamatStr) => {
  if (!alamatStr) return null;
  const match = alamatStr.match(/\[Koordinat:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
  return match ? { lat: match[1], lng: match[2] } : null;
};

function SiswaContent() {
  const [dataList, setDataList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filterKelas, setFilterKelas] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterKelas]);

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  
  // Form State
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({ 
    id: null, nisn: "", nis: "", nama: "", gender: "L", kelas_id: "",
    email: "", hp: "", hp_ortu: "", nik: "", kk: "", tmp_lahir: "", tgl_lahir: "", akta_lahir: "", alamat: "", existing_foto: ""
  });
  
  // Import State
  const importFileInputRef = useRef(null);
  const [importKelasId, setImportKelasId] = useState("");

  // Detail Modal State
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const resSiswa = await getSiswa(filterKelas || null);
    setDataList(resSiswa);
    const resKelas = await getKelas();
    setKelasList(resKelas);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKelas]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Helper WA
  const getWaLink = (number) => {
    if (!number) return null;
    let num = number.replace(/\D/g, '');
    if (num.startsWith('0')) num = '62' + num.substring(1);
    return `https://wa.me/${num}`;
  };

  // Handle Form Manual
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kelas_id) return Swal.fire("Peringatan", "Pilih kelas terlebih dahulu!", "warning");
    
    const submission = new FormData();
    Object.keys(formData).forEach(key => {
      submission.append(key, formData[key] === null ? "" : formData[key]);
    });

    if (fileInputRef.current && fileInputRef.current.files[0]) {
      submission.append("foto", fileInputRef.current.files[0]);
    }

    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await saveSiswa(submission);
    
    if (res.success) {
      Swal.fire("Berhasil", "Data siswa berhasil disimpan!", "success");
      setIsOpen(false);
      fetchData();
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Siswa?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      const res = await deleteSiswa(id);
      if (res.success) {
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        fetchData();
      } else {
        Swal.fire("Gagal", res.message, "error");
      }
    }
  };

  // Handle Import Excel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!importKelasId) {
      e.target.value = null;
      return Swal.fire("Peringatan", "Pilih Kelas Tujuan terlebih dahulu sebelum upload file!", "warning");
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const rows = data.slice(1).filter(r => r[0] && r[2]); 
        
        if (rows.length === 0) {
          return Swal.fire("Gagal", "File Excel kosong atau format tidak sesuai (Butuh NISN dan NAMA)", "error");
        }

        const formattedData = rows.map(r => ({
          nisn: String(r[0]).trim(),
          nis: r[1] ? String(r[1]).trim() : null,
          nama: String(r[2]).trim(),
          gender: r[3] ? (String(r[3]).toUpperCase() === 'P' ? 'P' : 'L') : 'L',
          email: r[4] ? String(r[4]).trim() : null,
          nik: r[5] ? String(r[5]).trim() : null,
          kk: r[6] ? String(r[6]).trim() : null,
          tmp_lahir: r[7] ? String(r[7]).trim() : null,
          tgl_lahir: r[8] ? String(r[8]).trim() : null,
          akta_lahir: r[9] ? String(r[9]).trim() : null,
          alamat: r[10] ? String(r[10]).trim() : null,
          hp: r[11] ? String(r[11]).trim() : null,
          hp_ortu: r[12] ? String(r[12]).trim() : null,
          nama_ortu: r[13] ? String(r[13]).trim() : null,
          pekerjaan_ortu: r[14] ? String(r[14]).trim() : null,
          ekskul: r[15] ? String(r[15]).trim() : null,
          catatan: r[16] ? String(r[16]).trim() : null,
          status: r[17] ? String(r[17]).trim() : 'Aktif',
        }));

        const confirm = await Swal.fire({
          title: "Konfirmasi Import",
          text: `Ditemukan ${formattedData.length} data siswa. Apakah Anda yakin ingin mengimpornya? Data dengan NISN yang sudah ada akan diabaikan.`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          confirmButtonText: "Ya, Import",
          cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
          Swal.fire({ title: "Mengimpor Data...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          const res = await importSiswaBulk(formattedData, importKelasId);
          
          if (res.success) {
            Swal.fire("Berhasil", `${res.count} data siswa berhasil diimpor!`, "success");
            setIsImportOpen(false);
            fetchData();
          } else {
            Swal.fire("Gagal", res.message, "error");
          }
        } else {
          // Reset input file jika dibatalkan
          if (importFileInputRef.current) {
            importFileInputRef.current.value = "";
          }
        }

      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Gagal membaca file Excel. Pastikan formatnya benar.", "error");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["NISN", "NIS", "NAMA", "L/P (Gender)", "EMAIL", "NIK", "KK", "TEMPAT LAHIR", "TANGGAL LAHIR (YYYY-MM-DD)", "NO AKTA", "ALAMAT LENGKAP", "NO HP SISWA", "NO HP ORTU", "NAMA ORTU", "PEKERJAAN ORTU", "EKSKUL", "CATATAN", "STATUS (Aktif/Lulus/Pindah)"],
      ["1234567890", "1001", "Ahmad Dahlan", "L", "ahmad@sekolah.com", "3500000000", "3500000001", "Jakarta", "2010-05-20", "AK-12345", "Jl. Merdeka No 1", "0812345678", "0819999999", "Budi Dahlan", "PNS", "Pramuka", "Siswa Teladan", "Aktif"],
      ["0987654321", "1002", "Siti Aminah", "P", "", "", "", "Surabaya", "2010-08-15", "", "Jl. Pahlawan", "", "", "", "", "", "", "Aktif"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
  };

  const filteredData = dataList.filter(s => s.nama.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search));
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Siswa</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola biodata lengkap siswa, atau impor massal dari Excel.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setImportKelasId(""); setIsImportOpen(true); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
          >
            <Upload size={18} /> Impor Excel
          </button>
          <button 
            onClick={() => { 
              setFormData({ id: null, nisn: "", nis: "", nama: "", gender: "L", kelas_id: "", email: "", hp: "", hp_ortu: "", nik: "", kk: "", tmp_lahir: "", tgl_lahir: "", akta_lahir: "", alamat: "", existing_foto: "", password: "" }); 
              setPreviewImage(null);
              setIsOpen(true); 
            }}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
          >
            <Plus size={18} /> Tambah Siswa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar Data */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full md:w-64">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" placeholder="Cari NISN atau Nama..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full text-sm outline-none text-slate-700 font-medium bg-transparent"
            />
          </div>
          <select 
            value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          >
            <option value="">-- Semua Kelas --</option>
            {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4 w-16">Foto</th>
                <th className="p-4 w-40">NISN / NIS</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4 text-center">Kelas</th>
                <th className="p-4 text-center">Kontak WA</th>
                <th className="p-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400 font-medium">Data siswa tidak ditemukan.</td></tr>
              ) : paginatedData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-center text-slate-400 font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="p-4">
                    <div 
                      onClick={() => item.foto && setModalImage(item.foto)}
                      className={`w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center ${item.foto ? 'cursor-pointer hover:ring-2 ring-rose-400' : ''}`}
                    >
                      {item.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.foto} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{item.nisn}</div>
                    <div className="text-[11px] text-slate-500">NIS: {item.nis || "-"}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      {item.nama}
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${item.gender === 'P' ? 'bg-pink-50 text-pink-600' : 'bg-rose-50 text-rose-600'}`}>
                        {item.gender}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-600">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs">{item.kelas?.nama}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.hp ? (
                        <a href={getWaLink(item.hp)} target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg transition-colors title='Chat Siswa'" title="Chat Siswa">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                          </svg>
                        </a>
                      ) : <span className="p-2 text-slate-200 cursor-not-allowed" title="No HP Siswa Kosong"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326z"/></svg></span>}
                      
                      {item.hp_ortu ? (
                        <a href={getWaLink(item.hp_ortu)} target="_blank" rel="noopener noreferrer" className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg transition-colors title='Chat Orang Tua'" title="Chat Orang Tua">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                          </svg>
                        </a>
                      ) : <span className="p-2 text-slate-200 cursor-not-allowed" title="No HP Ortu Kosong"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326z"/></svg></span>}
                    </div>
                  </td>
                  <td className="p-4 flex justify-center gap-1.5">
                    <button 
                      onClick={() => setSelectedDetail(item)}
                      className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors title='Lihat Detail'"
                    >
                      <User size={16} />
                    </button>
                    <button 
                      onClick={() => { 
                        setFormData({ 
                          id: item.id, 
                          nisn: item.nisn, 
                          nis: item.nis || "", 
                          nama: item.nama, 
                          gender: item.gender || "L", 
                          kelas_id: item.kelas_id, 
                          email: item.email || "", 
                          hp: item.hp || "", 
                          hp_ortu: item.hp_ortu || "", 
                          nik: item.nik || "", 
                          kk: item.kk || "", 
                          tmp_lahir: item.tmp_lahir || "", 
                          tgl_lahir: item.tgl_lahir ? new Date(item.tgl_lahir).toISOString().split('T')[0] : "", 
                          akta_lahir: item.akta_lahir || "", 
                          alamat: item.alamat || "",
                          existing_foto: item.foto || "",
                          password: item.password || ""
                        }); 
                        setPreviewImage(item.foto || null);
                        setIsOpen(true); 
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors title='Edit'"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors title='Hapus'"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Menampilkan <span className="font-bold text-slate-700">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-slate-700">{filteredData.length}</span> data siswa
          </div>
          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sebelumnya
            </button>
            <div className="px-3 py-1.5 text-sm font-bold text-slate-800 bg-white rounded-lg border border-slate-200">
              {currentPage} / {totalPages || 1}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Siswa */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto pt-10 pb-10">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 relative">
            <button onClick={() => setSelectedDetail(null)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors">✕</button>
            
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-8 flex flex-col md:flex-row items-center gap-6">
              <div 
                onClick={() => selectedDetail.foto && setModalImage(selectedDetail.foto)}
                className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center shadow-xl border-4 border-white/20 bg-white ${selectedDetail.foto ? 'cursor-pointer' : ''}`}
              >
                {selectedDetail.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedDetail.foto} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              <div className="text-center md:text-left text-white">
                <h2 className="text-2xl font-bold mb-1">{selectedDetail.nama}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm font-medium text-rose-100 mb-3">
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/10">{selectedDetail.nisn}</span>
                  <span>•</span>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/10">Kelas {selectedDetail.kelas?.nama}</span>
                  <span>•</span>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/10">{selectedDetail.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  {selectedDetail.hp && (
                    <a href={getWaLink(selectedDetail.hp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                      Chat Siswa
                    </a>
                  )}
                  {selectedDetail.hp_ortu && (
                    <a href={getWaLink(selectedDetail.hp_ortu)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                      Chat Orang Tua
                    </a>
                  )}
                </div>
                
                {/* Progress Bar Profil */}
                <div className="mt-4 max-w-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-rose-100 uppercase tracking-wider">Kelengkapan Profil</span>
                    <span className="text-xs font-bold text-white">{calculateProfileCompletion(selectedDetail)}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full ${getProfileProgressColor(calculateProfileCompletion(selectedDetail))} transition-all duration-1000`} style={{ width: `${calculateProfileCompletion(selectedDetail)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50">
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                  <div className="text-sm font-bold text-slate-700">{selectedDetail.email || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NIS (Sekolah)</div>
                  <div className="text-sm font-bold text-slate-700">{selectedDetail.nis || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tempat, Tanggal Lahir</div>
                  <div className="text-sm font-bold text-slate-700">
                    {selectedDetail.tmp_lahir || "-"}, {selectedDetail.tgl_lahir ? new Date(selectedDetail.tgl_lahir).toLocaleDateString('id-ID') : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat Lengkap</div>
                  <div className="text-sm font-bold text-slate-700 leading-relaxed whitespace-pre-line">{selectedDetail.alamat || "-"}</div>
                  {extractCoordinates(selectedDetail.alamat) && (
                    <a 
                      href={`https://www.google.com/maps?q=${extractCoordinates(selectedDetail.alamat).lat},${extractCoordinates(selectedDetail.alamat).lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      <MapPin size={14} /> Lihat di Google Maps
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NIK Kependudukan</div>
                  <div className="text-sm font-bold text-slate-700">{selectedDetail.nik || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Kartu Keluarga (KK)</div>
                  <div className="text-sm font-bold text-slate-700">{selectedDetail.kk || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Akta Kelahiran</div>
                  <div className="text-sm font-bold text-slate-700">{selectedDetail.akta_lahir || "-"}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Password Login</div>
                  <div className="text-sm font-bold text-slate-700">{selectedDetail.password ? "Sudah Diatur" : "Belum Pernah Login"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit Manual Lengkap */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto pt-10 pb-10">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 md:p-8 my-auto animate-in zoom-in-95 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors">✕</button>
            <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">{formData.id ? 'Edit' : 'Tambah'} Biodata Siswa</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* Kolom Kiri: Foto & Akses */}
                <div className="w-full md:w-1/3 space-y-6">
                  <div className="flex flex-col items-center">
                    <div 
                      onClick={() => previewImage && setModalImage(previewImage)}
                      className={`w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden mb-4 relative group ${previewImage ? 'cursor-pointer' : ''}`}
                    >
                      {previewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-slate-400">
                          <User size={32} className="mx-auto mb-2 opacity-50" />
                          <span className="text-[10px] font-bold">Pilih Foto</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload size={24} />
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 text-center font-medium">Klik kotak di atas untuk mengunggah Pas Foto siswa (Maks 2MB).</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pilih Kelas *</label>
                      <select required value={formData.kelas_id} onChange={e => setFormData({...formData, kelas_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 font-bold bg-white">
                        <option value="">-- Kelas --</option>
                        {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Aktif</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Kelamin *</label>
                      <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-bold bg-white">
                        <option value="L">Laki-laki (L)</option>
                        <option value="P">Perempuan (P)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Data Diri Lengkap */}
                <div className="w-full md:w-2/3 space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">NISN *</label>
                      <input type="text" required value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-bold bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">NIS (Nomor Induk Sekolah)</label>
                      <input type="text" value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap Siswa *</label>
                    <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">NIK (Nomor Induk Kependudukan)</label>
                      <input type="text" value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">No. KK</label>
                      <input type="text" value={formData.kk} onChange={e => setFormData({...formData, kk: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Password Akses</label>
                      <input type="text" placeholder="Biarkan kosong jika tidak ingin mengubah" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                      <p className="text-[10px] text-slate-400 mt-1">Kosongkan jika ingin mempertahankan password saat ini (jika sedang mengedit).</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tempat Lahir</label>
                      <input type="text" value={formData.tmp_lahir} onChange={e => setFormData({...formData, tmp_lahir: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal Lahir</label>
                      <input type="date" value={formData.tgl_lahir} onChange={e => setFormData({...formData, tgl_lahir: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium bg-white" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">No. Akta Kelahiran</label>
                    <input type="text" value={formData.akta_lahir} onChange={e => setFormData({...formData, akta_lahir: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">No. HP Siswa</label>
                      <input type="text" value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">No. HP Orang Tua</label>
                      <input type="text" value={formData.hp_ortu} onChange={e => setFormData({...formData, hp_ortu: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat Lengkap</label>
                    <textarea rows="2" value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 font-medium resize-none"></textarea>
                  </div>
                </div>

              </div>

              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors">Simpan Biodata Lengkap</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload size={20} className="text-emerald-600" /> Impor Excel Massal</h3>
            
            <div className="mb-5 bg-rose-50 border border-rose-200 p-4 rounded-xl text-sm text-rose-800">
              <p className="font-bold mb-1">Langkah-langkah:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Download template excel di bawah.</li>
                <li>Isi data siswa tanpa mengubah judul kolom.</li>
                <li>Pilih Kelas Tujuan untuk semua siswa ini.</li>
                <li>Upload file Excel yang sudah diisi.</li>
              </ol>
              <button onClick={downloadTemplate} className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-white border border-rose-200 text-rose-700 font-bold rounded-lg shadow-sm hover:bg-rose-100 transition-colors text-xs">
                <Download size={14} /> Download Template Excel
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Kelas Tujuan: *</label>
              <select 
                value={importKelasId} 
                onChange={e => setImportKelasId(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all font-bold bg-white"
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button onClick={() => setIsImportOpen(false)} className="px-5 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
              <label className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-colors cursor-pointer">
                Pilih File & Impor
                <input type="file" accept=".xlsx, .xls" className="hidden" ref={importFileInputRef} onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </div>
      )}

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

export default function SiswaPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SiswaContent />
    </Suspense>
  );
}

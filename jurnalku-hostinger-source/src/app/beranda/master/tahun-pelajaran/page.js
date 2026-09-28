"use client";

import { useState, useEffect } from "react";
import { getTahunPelajaran, saveTahunPelajaran, setTahunPelajaranAktif, deleteTahunPelajaran } from "@/actions/master";
import { CheckCircle2, Trash2, Edit, Plus } from "lucide-react";
import Swal from "sweetalert2";

export default function TahunPelajaranPage() {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama: "" });

  const fetchData = async () => {
    setLoading(true);
    const res = await getTahunPelajaran();
    setDataList(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await saveTahunPelajaran(formData);
    if (res.success) {
      Swal.fire("Berhasil", "Data berhasil disimpan!", "success");
      setIsOpen(false);
      fetchData();
    } else {
      Swal.fire("Gagal", res.message, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Tahun Pelajaran?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      const res = await deleteTahunPelajaran(id);
      if (res.success) {
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        fetchData();
      } else {
        Swal.fire("Gagal", res.message, "error");
      }
    }
  };

  const handleSetAktif = async (id) => {
    const res = await setTahunPelajaranAktif(id);
    if (res.success) {
      fetchData();
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tahun Pelajaran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data master tahun pelajaran & semester yang aktif.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: null, nama: "" }); setIsOpen(true); }}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
        >
          <Plus size={18} /> Tambah Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4 w-16 text-center">No</th>
              <th className="p-4">Nama Tahun Pelajaran</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium">Memuat data...</td></tr>
            ) : dataList.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400 font-medium">Belum ada data.</td></tr>
            ) : dataList.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                <td className="p-4 font-bold text-slate-800">{item.nama}</td>
                <td className="p-4 text-center">
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                      <CheckCircle2 size={14} /> Aktif
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleSetAktif(item.id)}
                      className="inline-flex px-3 py-1 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-slate-200 rounded-full text-xs font-bold transition-colors"
                    >
                      Set Aktif
                    </button>
                  )}
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button 
                    onClick={() => { setFormData({ id: item.id, nama: item.nama }); setIsOpen(true); }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    disabled={item.is_active}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{formData.id ? 'Edit' : 'Tambah'} Tahun Pelajaran</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-600 mb-1">Nama Tahun (contoh: 2024/2025 Ganjil)</label>
                <input 
                  type="text" 
                  required
                  value={formData.nama}
                  onChange={e => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-slate-800"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

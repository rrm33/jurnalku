"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Upload, CheckSquare, Trash2, Code, Eye, X } from "lucide-react";
import { saveRpp, getRppById } from "@/actions/rpp";
import { getKelas, getMapel } from "@/actions/master";
import FormattedContent from "@/components/FormattedContent";
import AktivitasEditor from "@/components/AktivitasEditor";
import Swal from "sweetalert2";

function RppFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const duplicateId = searchParams.get("duplicate_id");
  const isEdit = !!id;
  const isDuplicate = !!duplicateId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileTugas, setSelectedFileTugas] = useState(null);

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLang, setCodeLang] = useState("dart");

  const [formData, setFormData] = useState({
    id: null,
    pertemuan_ke: 1,
    tanggal: "",
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
    gunakan_code_editor: false
  });

  const fetchData = async () => {
    setLoading(true);
    const [kelas, mapel] = await Promise.all([getKelas(), getMapel()]);
    setKelasList(kelas);
    setMapelList(mapel);

    const targetId = id || duplicateId;
    if (targetId) {
      const rpp = await getRppById(targetId);
      if (rpp) {
        const tugas = rpp.tugas && rpp.tugas.length > 0 ? rpp.tugas[0] : null;
        setFormData({
          id: isDuplicate ? null : rpp.id,
          pertemuan_ke: rpp.pertemuan_ke,
          tanggal: isDuplicate
            ? new Date().toISOString().slice(0, 10)
            : (rpp.tanggal ? new Date(rpp.tanggal).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
          mapel_id: rpp.mapel_id,
          kelas_ids: isDuplicate ? [] : [String(rpp.kelas_id)],
          judul: isDuplicate ? `${rpp.judul} (Salinan)` : rpp.judul,
          tujuan_pembelajaran: rpp.tujuan_pembelajaran,
          aktivitas_pembelajaran: rpp.aktivitas_pembelajaran,
          existing_file: rpp.upload_file || rpp.file_rpp || "",
          ada_tugas: !!tugas,
          judul_tugas: tugas ? tugas.judul : "",
          deskripsi_tugas: tugas ? tugas.deskripsi : "",
          deadline_tugas: tugas && tugas.deadline ? new Date(new Date(tugas.deadline).getTime() + (7 * 60 * 60 * 1000)).toISOString().slice(0, 16) : "",
          existing_file_tugas: tugas ? (tugas.file || "") : "",
          gunakan_code_editor: tugas ? (tugas.gunakan_code_editor || false) : false
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        tanggal: new Date().toISOString().slice(0, 10)
      }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, duplicateId]);

  const handleCheckboxKelas = (kelasId) => {
    setFormData(prev => {
      const isChecked = prev.kelas_ids.includes(String(kelasId));
      if (isChecked) {
        return { ...prev, kelas_ids: prev.kelas_ids.filter(id => id !== String(kelasId)) };
      } else {
        return { ...prev, kelas_ids: [...prev.kelas_ids, String(kelasId)] };
      }
    });
  };

  const handleInsertCode = () => {
    if (!codeSnippet.trim()) {
      Swal.fire("Peringatan", "Kode tidak boleh kosong", "warning");
      return;
    }

    const formattedBlock = `\n\`\`\`${codeLang}\n${codeSnippet.trim()}\n\`\`\`\n`;

    setFormData(prev => {
      const current = prev.aktivitas_pembelajaran || "";
      const separator = current && !current.endsWith("\n") ? "\n" : "";
      return {
        ...prev,
        aktivitas_pembelajaran: current + separator + formattedBlock
      };
    });

    setCodeSnippet("");
    setShowCodeModal(false);
    Swal.fire({
      icon: "success",
      title: "Kotak Kode Disisipkan!",
      text: "Kode berhasil disisipkan ke Kegiatan Pembelajaran.",
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.kelas_ids.length === 0) {
      Swal.fire("Error", "Pilih minimal 1 kelas", "error");
      return;
    }

    if (!formData.aktivitas_pembelajaran || !formData.aktivitas_pembelajaran.trim()) {
      Swal.fire("Peringatan", "Kegiatan Pembelajaran wajib diisi.", "warning");
      return;
    }
    
    setSaving(true);
    const payload = new FormData();
    if (formData.id) payload.append('id', formData.id);
    payload.append('pertemuan_ke', formData.pertemuan_ke);
    payload.append('tanggal', formData.tanggal);
    payload.append('mapel_id', formData.mapel_id);
    formData.kelas_ids.forEach(id => payload.append('kelas_ids[]', id));
    payload.append('judul', formData.judul);
    payload.append('tujuan_pembelajaran', formData.tujuan_pembelajaran);
    payload.append('aktivitas_pembelajaran', formData.aktivitas_pembelajaran);
    payload.append('ada_tugas', formData.ada_tugas);
    
    if (formData.ada_tugas) {
      payload.append('judul_tugas', formData.judul_tugas);
      payload.append('deskripsi_tugas', formData.deskripsi_tugas);
      if (formData.deadline_tugas) payload.append('deadline_tugas', formData.deadline_tugas);
      payload.append('gunakan_code_editor', formData.gunakan_code_editor);
      if (formData.existing_file_tugas) payload.append('existing_file_tugas', formData.existing_file_tugas);
      if (selectedFileTugas) payload.append('file_tugas', selectedFileTugas);
    }

    if (selectedFile) {
      payload.append('upload_file', selectedFile);
    } else if (formData.existing_file) {
      payload.append('existing_file', formData.existing_file);
    }

    const res = await saveRpp(payload, 1);
    setSaving(false);
    
    if (res.success) {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data RPP berhasil disimpan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      router.push('/beranda/rpp');
    } else {
      Swal.fire('Gagal', res.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/beranda/rpp')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {isEdit ? "Edit Kegiatan Belajar" : isDuplicate ? "Salin Kegiatan Belajar (Duplikat)" : "Buat Kegiatan Belajar Baru"}
          </h1>
          {isDuplicate && (
            <p className="text-xs text-blue-600 font-semibold mt-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-fit">
              ℹ️ Mode Duplikat: Data materi berhasil disalin. Silakan pilih kelas tujuan baru untuk menyimpan.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pertemuan Ke- *</label>
              <input type="number" min="1" required value={formData.pertemuan_ke} onChange={e => setFormData({...formData, pertemuan_ke: e.target.value})} onWheel={(e) => e.target.blur()} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal *</label>
              <input type="date" required value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Mapel *</label>
              <select required value={formData.mapel_id} onChange={e => setFormData({...formData, mapel_id: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold bg-white">
                <option value="">-- Mapel --</option>
                {mapelList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Terapkan untuk Kelas *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {kelasList.map(kelas => {
                const isChecked = formData.kelas_ids.includes(String(kelas.id));
                return (
                  <label key={kelas.id} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${isChecked ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-slate-200 hover:bg-slate-50'} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isChecked}
                      disabled={isEdit}
                      onChange={() => handleCheckboxKelas(kelas.id)}
                    />
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isChecked ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300'}`}>
                      {isChecked && <CheckSquare size={14} />}
                    </div>
                    <span className="font-bold text-sm">{kelas.nama}</span>
                  </label>
                );
              })}
            </div>
            {isEdit && <p className="text-xs text-slate-500 mt-2 italic">*Pilihan kelas tidak dapat diubah saat mode Edit.</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Judul Materi Singkat *</label>
            <input type="text" required value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} placeholder="Contoh: Pengenalan State di Flutter" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-bold bg-slate-50" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tujuan Pembelajaran *</label>
            <textarea required rows="3" value={formData.tujuan_pembelajaran} onChange={e => setFormData({...formData, tujuan_pembelajaran: e.target.value})} placeholder="Siswa dapat memahami..." className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all bg-slate-50 leading-relaxed"></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Kegiatan Pembelajaran (Teks, Format, Gambar & Kode) *
            </label>
            <AktivitasEditor
              value={formData.aktivitas_pembelajaran}
              onChange={(val) => setFormData(prev => ({ ...prev, aktivitas_pembelajaran: val }))}
              onOpenCodeModal={() => setShowCodeModal(true)}
              placeholder="Tulis kegiatan pembelajaran di sini... Anda bisa memformat teks (tebal, miring, judul, daftar), menempel (paste) atau mengunggah gambar, dan menyisipkan kotak kode program."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">File Lampiran PDF (Opsional)</label>
            <div className="flex items-center gap-3">
              <input type="file" accept=".pdf" className="hidden" id="file_rpp" onChange={(e) => setSelectedFile(e.target.files[0])} />
              <label htmlFor="file_rpp" className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm">
                <Upload size={16} /> Pilih File PDF
              </label>
              <span className="text-xs text-slate-500 font-medium">
                {selectedFile ? selectedFile.name : formData.existing_file ? 'File tersimpan: ' + formData.existing_file.split('/').pop() : 'Belum ada file'}
              </span>
            </div>
            {formData.existing_file && (
              <div className="mt-2 text-xs">
                <label className="flex items-center gap-2 text-rose-600 cursor-pointer w-fit p-1 hover:bg-rose-50 rounded">
                  <input type="checkbox" onChange={(e) => {
                    if (e.target.checked) setFormData({...formData, existing_file: ""});
                  }} />
                  <Trash2 size={14} /> Hapus file saat ini
                </label>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 border border-amber-200 rounded-xl w-fit">
              <input type="checkbox" checked={formData.ada_tugas} onChange={e => setFormData({...formData, ada_tugas: e.target.checked})} className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500" />
              <span className="font-bold text-amber-800 text-sm">Aktifkan Pengumpulan Tugas untuk KBM ini</span>
            </label>
          </div>

          {formData.ada_tugas && (
            <div className="pl-4 border-l-4 border-amber-300 space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Judul Tugas *</label>
                <input type="text" required={formData.ada_tugas} value={formData.judul_tugas} onChange={e => setFormData({...formData, judul_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Tugas *</label>
                <textarea required={formData.ada_tugas} rows="3" value={formData.deskripsi_tugas} onChange={e => setFormData({...formData, deskripsi_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Batas Waktu Pengumpulan (Opsional)</label>
                <input type="datetime-local" value={formData.deadline_tugas} onChange={e => setFormData({...formData, deadline_tugas: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lampiran File Tugas (Opsional)</label>
                <input type="file" accept=".pdf" className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white" onChange={e => setSelectedFileTugas(e.target.files[0])} />
                {formData.existing_file_tugas && !selectedFileTugas && (
                  <p className="text-xs text-slate-500 mt-1">File saat ini: {formData.existing_file_tugas.split('/').pop()}</p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-emerald-50 border border-emerald-200 rounded-xl w-fit">
                  <input type="checkbox" checked={formData.gunakan_code_editor} onChange={e => setFormData({...formData, gunakan_code_editor: e.target.checked})} className="w-4 h-4 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-500" />
                  <span className="font-bold text-emerald-800 text-sm">Gunakan Editor Kode (Flutter/Dart)</span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => router.push('/beranda/rpp')} className="px-6 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-8 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center gap-2">
              <Save size={18} />
              {saving ? 'Menyimpan...' : 'Simpan KBM'}
            </button>
          </div>
        </form>

        {/* Modal Sisipkan Kotak Kode */}
        {showCodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-inner">
                    <Code size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Sisipkan Kotak Kode Program</h3>
                    <p className="text-xs text-slate-500">Akan ditampilkan dalam kotak khusus bergaya code editor untuk siswa.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="py-4 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Bahasa Pemrograman
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "dart", label: "Flutter / Dart" },
                      { id: "html", label: "HTML" },
                      { id: "css", label: "CSS" },
                      { id: "javascript", label: "JavaScript" },
                      { id: "python", label: "Python" },
                      { id: "code", label: "Lainnya" }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCodeLang(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          codeLang === item.id
                            ? "bg-slate-900 text-emerald-400 shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Isi Kode Program
                  </label>
                  <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
                    <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        Editor Kode ({codeLang.toUpperCase()})
                      </span>
                      <span className="text-[10px] text-slate-500">Hanya tampilan, tidak dijalankan</span>
                    </div>
                    <textarea
                      rows={8}
                      value={codeSnippet}
                      onChange={e => setCodeSnippet(e.target.value)}
                      placeholder="// Tempel (paste) atau ketik kode program kamu di sini...&#10;void main() {&#10;  runApp(const MyApp());&#10;}"
                      className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm outline-none resize-none leading-relaxed placeholder:text-slate-600 selection:bg-emerald-900 selection:text-white"
                      spellCheck="false"
                      style={{ tabSize: 2 }}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleInsertCode}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-rose-200"
                >
                  <Code size={14} />
                  Sisipkan ke Kegiatan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RppFormPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <RppFormContent />
    </Suspense>
  );
}

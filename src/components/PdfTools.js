"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Swal from "sweetalert2";
import { Layers, Scissors, Upload, Download, Trash2, FileText, ArrowRight } from "lucide-react";

export default function PdfTools() {
  const [mode, setMode] = useState("merge"); // "merge" | "split"
  
  // State for Merge
  const [mergeFiles, setMergeFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  // State for Split
  const [splitFile, setSplitFile] = useState(null);
  const [pageRange, setPageRange] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);

  // --- MERGE LOGIC ---
  const handleMergeUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === "application/pdf");
      if (newFiles.length === 0) {
        Swal.fire("Gagal", "Pilih minimal 1 file PDF", "error");
        return;
      }
      setMergeFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeMergeFile = (index) => {
    setMergeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDragItemIndex(index);
  };

  const handleDragEnter = (index) => {
    setDragOverItemIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItemIndex !== null && dragOverItemIndex !== null && dragItemIndex !== dragOverItemIndex) {
      const _mergeFiles = [...mergeFiles];
      const draggedItem = _mergeFiles.splice(dragItemIndex, 1)[0];
      _mergeFiles.splice(dragOverItemIndex, 0, draggedItem);
      setMergeFiles(_mergeFiles);
    }
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  };

  const processMerge = async () => {
    if (mergeFiles.length < 2) {
      Swal.fire("Kurang File", "Pilih minimal 2 file PDF untuk digabungkan.", "warning");
      return;
    }
    
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of mergeFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      downloadBlob(pdfBytes, "Gabungan-PDF.pdf", "application/pdf");
      Swal.fire("Berhasil!", "File PDF berhasil digabungkan.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menggabungkan PDF. Pastikan file tidak dipassword.", "error");
    } finally {
      setIsMerging(false);
    }
  };

  // --- SPLIT LOGIC ---
  const handleSplitUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSplitFile(file);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setPdfTotalPages(pdf.getPageCount());
      } catch (err) {
        Swal.fire("Gagal Membaca", "Pastikan PDF valid dan tidak dipassword.", "error");
        setSplitFile(null);
      }
    } else {
      Swal.fire("Gagal", "Harap pilih file PDF", "error");
    }
  };

  const parsePageRange = (rangeStr, maxPages) => {
    const pages = new Set();
    const parts = rangeStr.split(",");
    
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(num => parseInt(num.trim(), 10));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= maxPages) pages.add(i - 1); // 0-indexed
          }
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum > 0 && pageNum <= maxPages) {
          pages.add(pageNum - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const processSplit = async () => {
    if (!splitFile || !pageRange) {
      Swal.fire("Data Kurang", "Pilih file PDF dan isi rentang halaman.", "warning");
      return;
    }

    const pagesToExtract = parsePageRange(pageRange, pdfTotalPages);
    if (pagesToExtract.length === 0) {
      Swal.fire("Halaman Tidak Valid", "Rentang halaman yang dimasukkan salah atau melebihi batas.", "error");
      return;
    }

    setIsSplitting(true);
    try {
      const arrayBuffer = await splitFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const copiedPages = await newPdf.copyPages(pdf, pagesToExtract);
      copiedPages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      downloadBlob(pdfBytes, "Hasil-Pisah.pdf", "application/pdf");
      Swal.fire("Berhasil!", "Halaman PDF berhasil diambil/dipisah.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memproses PDF.", "error");
    } finally {
      setIsSplitting(false);
    }
  };

  // --- UTILS ---
  const downloadBlob = (bytes, filename, type) => {
    const blob = new Blob([bytes], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Manajemen PDF</h1>
        <p className="text-slate-500 mb-6 text-sm">Gabungkan beberapa PDF menjadi satu, atau ambil halaman tertentu dari sebuah PDF. Proses instan tanpa upload ke server.</p>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8 w-fit mx-auto shadow-inner">
          <button 
            onClick={() => setMode('merge')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-lg text-sm font-bold transition-all ${mode === 'merge' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Layers size={18} /> Gabung PDF
          </button>
          <button 
            onClick={() => setMode('split')}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-lg text-sm font-bold transition-all ${mode === 'split' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Scissors size={18} /> Pisah / Ambil Halaman
          </button>
        </div>

        {/* MERGE UI */}
        {mode === "merge" && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 text-center hover:bg-indigo-50 transition-colors">
              <input type="file" accept="application/pdf" multiple onChange={handleMergeUpload} className="hidden" id="merge-upload" />
              <label htmlFor="merge-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block text-lg">Pilih File PDF</span>
                  <span className="text-sm text-slate-500">Bisa pilih lebih dari satu sekaligus</span>
                </div>
              </label>
            </div>

            {mergeFiles.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText size={18}/> File Terpilih ({mergeFiles.length})
                </h3>
                <p className="text-xs text-slate-500 mb-4">Tahan dan geser (drag & drop) item ke atas/bawah untuk mengubah urutan PDF.</p>
                <div className="space-y-2 mb-6">
                  {mergeFiles.map((f, i) => (
                    <div 
                      key={i} 
                      draggable 
                      onDragStart={() => handleDragStart(i)}
                      onDragEnter={() => handleDragEnter(i)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm cursor-move transition-all ${dragItemIndex === i ? 'opacity-50 border-indigo-400' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                        </div>
                        <div className="bg-indigo-100 text-indigo-600 font-black text-xs w-6 h-6 flex items-center justify-center rounded-md shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-sm font-semibold text-slate-600 truncate" title={f.name}>{f.name}</span>
                      </div>
                      <button onClick={() => removeMergeFile(i)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {mergeFiles.length >= 2 ? (
                  <button 
                    onClick={processMerge} 
                    disabled={isMerging}
                    className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {isMerging ? "Memproses..." : <><Layers size={18} /> Gabungkan Semua PDF</>}
                  </button>
                ) : (
                  <div className="text-center p-3 text-sm font-bold text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
                    Pilih minimal 1 file PDF lagi untuk digabung.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SPLIT UI */}
        {mode === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 text-center hover:bg-indigo-50 transition-colors h-full flex flex-col justify-center">
              <input type="file" accept="application/pdf" onChange={handleSplitUpload} className="hidden" id="split-upload" />
              <label htmlFor="split-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="font-bold text-slate-700 block text-lg">Upload PDF</span>
                  <span className="text-sm text-slate-500">{splitFile ? splitFile.name : "Pilih 1 file PDF yang ingin dipisah"}</span>
                </div>
              </label>
            </div>

            {splitFile ? (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Halaman Asli</span>
                  <span className="text-lg font-black text-indigo-600">{pdfTotalPages} Hal</span>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Halaman yang Ingin Diambil:</label>
                  <input 
                    type="text" 
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="Contoh: 1, 3-5, 9"
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Gunakan koma (,) untuk memisahkan halaman, dan strip (-) untuk rentang halaman. <br/>
                    Misal: <strong className="text-slate-500">1, 3-5</strong> akan mengambil halaman 1, 3, 4, dan 5.
                  </p>
                </div>

                <button 
                  onClick={processSplit} 
                  disabled={isSplitting || !pageRange}
                  className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  {isSplitting ? "Memproses..." : <><Scissors size={18} /> Potong & Download</>}
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center opacity-70">
                <Scissors size={32} className="text-slate-400 mb-3" />
                <p className="text-sm font-semibold text-slate-500">Upload file PDF terlebih dahulu untuk mengatur halaman mana yang akan dipisah.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

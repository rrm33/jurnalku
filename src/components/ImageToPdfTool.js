"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Swal from "sweetalert2";
import { FileImage, Download, Upload, Trash2, ArrowUpDown } from "lucide-react";

export default function ImageToPdfTool() {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    
    if (validFiles.length === 0) {
      Swal.fire("Format tidak didukung", "Harap masukkan file gambar (JPG/PNG)", "error");
      return;
    }

    const newImages = validFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index - 1];
    newImages[index - 1] = newImages[index];
    newImages[index] = temp;
    setImages(newImages);
  };

  const moveDown = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index + 1];
    newImages[index + 1] = newImages[index];
    newImages[index] = temp;
    setImages(newImages);
  };

  const generatePdf = async () => {
    if (images.length === 0) return;

    try {
      Swal.fire({ title: 'Membuat PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const pdfDoc = await PDFDocument.create();

      for (const imgData of images) {
        const arrayBuffer = await imgData.file.arrayBuffer();
        let pdfImage;
        
        if (imgData.file.type === "image/jpeg" || imgData.file.type === "image/jpg") {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (imgData.file.type === "image/png") {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          continue; // skip unsupported formats for now
        }

        const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: pdfImage.width,
          height: pdfImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `gabungan-gambar-${new Date().getTime()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal membuat PDF. Pastikan gambar berformat JPG atau PNG.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Gambar ke PDF</h1>
        <p className="text-slate-500 mb-6 text-sm">Gabungkan beberapa gambar (JPG/PNG) menjadi satu file PDF. Urutkan sesuai kebutuhan.</p>

        <div className="space-y-6">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <input type="file" accept="image/png, image/jpeg, image/jpg" multiple onChange={onSelectFile} className="hidden" id="img-to-pdf-upload" />
            <label htmlFor="img-to-pdf-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                <Upload size={20} />
              </div>
              <span className="font-bold text-slate-600">Klik atau Tarik Beberapa Gambar ke sini</span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileImage size={18}/> Daftar Gambar ({images.length})</h3>
                <button onClick={() => setImages([])} className="text-xs font-bold text-rose-500 hover:text-rose-700">Hapus Semua</button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="font-bold text-slate-400 w-6 text-center">{idx + 1}</div>
                    <img src={img.preview} alt="preview" className="w-16 h-16 object-cover rounded-md border border-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{img.file.name}</p>
                      <p className="text-xs text-slate-400">{(img.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-50 rounded">
                        <ArrowUpDown size={14} className="rotate-180" />
                      </button>
                      <button onClick={() => moveDown(idx)} disabled={idx === images.length - 1} className="p-1 text-slate-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-50 rounded">
                        <ArrowUpDown size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeImage(img.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200">
                <button onClick={generatePdf} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                  <Download size={18} /> Jadikan 1 File PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

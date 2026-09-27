"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { PDFDocument } from "pdf-lib";
import { ArrowLeft, Image as ImageIcon, FileText, Download, Upload, Crop, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ResizePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("image"); // 'image' or 'pdf'

  // Image State
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);

  // PDF State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfScale, setPdfScale] = useState(50); // percentage to scale down

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setTargetWidth(width);
    setTargetHeight(height);
  };

  const handleWidthChange = (val) => {
    const newW = parseInt(val) || 0;
    setTargetWidth(newW);
    if (keepAspect && imgRef.current) {
      const aspect = imgRef.current.height / imgRef.current.width;
      setTargetHeight(Math.round(newW * aspect));
    }
  };

  const handleHeightChange = (val) => {
    const newH = parseInt(val) || 0;
    setTargetHeight(newH);
    if (keepAspect && imgRef.current) {
      const aspect = imgRef.current.width / imgRef.current.height;
      setTargetWidth(Math.round(newH * aspect));
    }
  };

  const downloadImage = async () => {
    if (!imgRef.current) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    // Use cropped area if defined, otherwise full image
    const cropX = completedCrop?.width ? completedCrop.x * scaleX : 0;
    const cropY = completedCrop?.height ? completedCrop.y * scaleY : 0;
    const cropW = completedCrop?.width ? completedCrop.width * scaleX : imgRef.current.naturalWidth;
    const cropH = completedCrop?.height ? completedCrop.height * scaleY : imgRef.current.naturalHeight;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw
    ctx.drawImage(
      imgRef.current,
      cropX, cropY, cropW, cropH, // Source
      0, 0, targetWidth, targetHeight // Destination
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resized-image.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png", 1);
  };

  const handlePdfUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const processAndDownloadPdf = async () => {
    if (!pdfFile) return;
    try {
      Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const scaleRatio = pdfScale / 100;

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.scale(scaleRatio, scaleRatio);
        page.setSize(width * scaleRatio, height * scaleRatio);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resized-${pdfFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
      
      Swal.close();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memproses PDF", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-pink-600 font-semibold mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali
      </button>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Alat Resize & Crop</h1>
        <p className="text-slate-500 mb-6 text-sm">Alat ini berjalan sepenuhnya di browser (Frontend). File Anda tidak diunggah ke server mana pun sehingga 100% aman dan cepat.</p>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-sm">
          <button 
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'image' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ImageIcon size={16} /> Gambar
          </button>
          <button 
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'pdf' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText size={16} /> PDF
          </button>
        </div>

        {/* IMAGE TOOL */}
        {activeTab === "image" && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
              <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" id="img-upload" />
              <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <span className="font-bold text-slate-600">Pilih Gambar</span>
              </label>
            </div>

            {imgSrc && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-center overflow-auto max-h-[500px]">
                  <ReactCrop 
                    crop={crop} 
                    onChange={(_, percentCrop) => setCrop(percentCrop)} 
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img 
                      ref={imgRef} 
                      alt="Upload" 
                      src={imgSrc} 
                      onLoad={onImageLoad}
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                    />
                  </ReactCrop>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b pb-2"><Maximize2 size={16}/> Ukuran Target</h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Lebar (px)</label>
                    <input type="number" value={targetWidth} onChange={(e) => handleWidthChange(e.target.value)} className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Tinggi (px)</label>
                    <input type="number" value={targetHeight} onChange={(e) => handleHeightChange(e.target.value)} className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} className="accent-pink-600 rounded" />
                    Pertahankan Rasio (Aspect Ratio)
                  </label>
                  
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <button onClick={downloadImage} className="w-full flex justify-center items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md">
                      <Download size={18} /> Download Hasil
                    </button>
                    <p className="text-xs text-slate-400 mt-2 text-center">*(Jika area di-crop, maka yang di-resize hanya area crop tersebut)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF TOOL */}
        {activeTab === "pdf" && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload" />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="font-bold text-slate-600">{pdfFile ? pdfFile.name : "Pilih File PDF"}</span>
              </label>
            </div>

            {pdfFile && (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl max-w-md mx-auto">
                <h3 className="font-bold text-slate-700 mb-4">Pengaturan Resize PDF</h3>
                <label className="text-sm font-semibold text-slate-600 mb-2 block">Skala Halaman ({pdfScale}%)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="200" 
                  value={pdfScale} 
                  onChange={(e) => setPdfScale(parseInt(e.target.value))}
                  className="w-full accent-pink-600 mb-2"
                />
                <p className="text-xs text-slate-500 mb-6">Mengubah ukuran dimensi halaman (Width & Height) PDF. Berguna jika dokumen terlalu besar untuk di-print.</p>
                
                <button onClick={processAndDownloadPdf} className="w-full flex justify-center items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md">
                  <Download size={18} /> Download PDF Baru
                </button>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}

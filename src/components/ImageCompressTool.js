"use client";

import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { Image as ImageIcon, Download, Upload, Settings2 } from "lucide-react";

export default function ImageCompressTool() {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/jpeg");
  
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState(null);
  
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImgFile(file);
      setOriginalSize(file.size);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImgSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire("Format tidak didukung", "Harap masukkan file gambar", "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Process Compression
  useEffect(() => {
    if (!imgSrc || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    // Draw original image to canvas
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    // Compress
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCompressedSize(blob.size);
          setCompressedBlob(blob);
        }
      },
      format,
      quality / 100
    );

  }, [imgSrc, quality, format]); // trigger when these change

  const handleDownload = () => {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement("a");
    a.href = url;
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    a.download = `compressed-${new Date().getTime()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Kompres Gambar Lanjut</h1>
        <p className="text-slate-500 mb-6 text-sm">Turunkan ukuran MB/KB gambar secara drastis tanpa mengubah resolusi (panjang x lebar).</p>

        {!imgSrc ? (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" id="compress-upload" />
            <label htmlFor="compress-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                <Upload size={28} />
              </div>
              <div>
                <span className="font-bold text-slate-700 block text-lg mb-1">Upload Gambar</span>
                <span className="text-sm text-slate-500">Klik atau Tarik gambar ke sini</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center relative min-h-[250px]">
                <img 
                  ref={imgRef}
                  src={imgSrc} 
                  alt="Original" 
                  className="max-w-full max-h-[250px] object-contain rounded drop-shadow-md"
                  onLoad={(e) => {
                    // Trigger effect by forcing a state update or it's handled by dependency
                    setQuality(prev => prev === 80 ? 79 : 80); // hack to trigger effect after load
                  }}
                />
                {/* Hidden canvas for processing */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100 p-4 rounded-xl text-center">
                  <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Ukuran Asli</p>
                  <p className="text-xl font-black text-slate-700">{formatBytes(originalSize)}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-200">
                  <p className="text-xs text-amber-600 font-bold mb-1 uppercase tracking-wider">Setelah Kompres</p>
                  <p className="text-xl font-black text-amber-700">{formatBytes(compressedSize)}</p>
                  {originalSize > 0 && compressedSize < originalSize && (
                    <p className="text-xs text-amber-600 font-bold mt-1 bg-amber-100 py-0.5 px-2 rounded-full inline-block">
                      Hemat {Math.round((1 - compressedSize / originalSize) * 100)}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 size={20} className="text-slate-500" />
                  <h3 className="font-bold text-slate-700">Pengaturan Kompresi</h3>
                </div>

                <div>
                  <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                    <span>Kualitas Gambar</span>
                    <span className="text-amber-600">{quality}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Geser ke kiri untuk file lebih kecil (kualitas menurun).</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">Format Hasil</label>
                  <select 
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="image/jpeg">JPG / JPEG (Paling Umum)</option>
                    <option value="image/webp">WEBP (Ukuran Paling Kecil)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setImgSrc(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                >
                  Ganti Foto
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!compressedBlob}
                  className="flex-1 flex justify-center items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

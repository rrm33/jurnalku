"use client";

import { useState, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { PDFDocument } from "pdf-lib";
import { ArrowLeft, Image as ImageIcon, FileText, Download, Upload, Crop, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ResizeTool({ hideBack = false }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("image"); // 'image' or 'pdf'
  const [isDragging, setIsDragging] = useState(false);

  // Image State
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageScale, setImageScale] = useState(100); // percentage

  // Final dimension states for display
  const [finalWidth, setFinalWidth] = useState(0);
  const [finalHeight, setFinalHeight] = useState(0);
  const [finalFileSize, setFinalFileSize] = useState(0);
  const [imageQuality, setImageQuality] = useState(80);
  const [imageFormat, setImageFormat] = useState("image/jpeg");

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // PDF State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfScale, setPdfScale] = useState(100); // percentage
  const [pdfOriginalSize, setPdfOriginalSize] = useState(0);
  const [pdfFinalSize, setPdfFinalSize] = useState(0);
  const [isCalculatingPdf, setIsCalculatingPdf] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processImageFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setCrop(undefined);
      setCompletedCrop(null);
      setImageScale(100);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(file);
    } else {
      Swal.fire("Format tidak didukung", "Harap masukkan file gambar", "error");
    }
  };

  const processPdfFile = (file) => {
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfOriginalSize(file.size);
      setPdfFinalSize(file.size);
      setPdfScale(100);
    } else {
      Swal.fire("Format tidak didukung", "Harap masukkan file PDF", "error");
    }
  };

  // PDF Preview Calculation
  useEffect(() => {
    if (!pdfFile || pdfScale === 100) return;
    
    const calculatePdfSize = async () => {
      setIsCalculatingPdf(true);
      try {
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
        setPdfFinalSize(pdfBytes.length);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCalculatingPdf(false);
      }
    };

    const timer = setTimeout(calculatePdfSize, 800);
    return () => clearTimeout(timer);
  }, [pdfScale, pdfFile]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (activeTab === "image") {
        processImageFile(file);
      } else {
        processPdfFile(file);
      }
    }
  };

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    setFinalWidth(naturalWidth);
    setFinalHeight(naturalHeight);
  };

  // Update preview canvas whenever crop or scale changes
  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropW = completedCrop.width * scaleX;
      const cropH = completedCrop.height * scaleY;

      // Apply User Scale
      const targetW = Math.round(cropW * (imageScale / 100));
      const targetH = Math.round(cropH * (imageScale / 100));

      setFinalWidth(targetW);
      setFinalHeight(targetH);

      canvas.width = targetW;
      canvas.height = targetH;

      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        targetW,
        targetH
      );
    } else if (imgRef.current && previewCanvasRef.current && !completedCrop?.width) {
      // No crop active, just scale the whole image
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext("2d");

      const targetW = Math.round(image.naturalWidth * (imageScale / 100));
      const targetH = Math.round(image.naturalHeight * (imageScale / 100));

      setFinalWidth(targetW);
      setFinalHeight(targetH);

      canvas.width = targetW;
      canvas.height = targetH;

      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, targetW, targetH);
    }
  }, [completedCrop, imageScale, imgSrc]);

  // Calculate file size from preview canvas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (previewCanvasRef.current && finalWidth > 0) {
        previewCanvasRef.current.toBlob((blob) => {
          if (blob) setFinalFileSize(blob.size);
        }, imageFormat, imageQuality / 100);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [finalWidth, finalHeight, completedCrop, imageScale, imgSrc, imageFormat, imageQuality]);

  const downloadImage = async () => {
    if (!previewCanvasRef.current) return;
    
    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = imageFormat === "image/jpeg" ? "jpg" : imageFormat === "image/webp" ? "webp" : "png";
      a.download = `resized-image.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }, imageFormat, imageQuality / 100);
  };

  const handlePdfUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processPdfFile(e.target.files[0]);
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
    <div className="max-w-6xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      {!hideBack && (
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-pink-600 font-semibold mb-6 transition-colors">
          <ArrowLeft size={18} /> Kembali
        </button>
      )}

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
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${isDragging ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <input type="file" accept="image/*" onChange={onSelectFile} className="hidden" id="img-upload" />
              <label htmlFor="img-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-600'}`}>
                  <Upload size={20} />
                </div>
                <span className="font-bold text-slate-600">Klik atau Tarik (Drag & Drop) Gambar ke sini</span>
              </label>
            </div>

            {imgSrc && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Kiri: Area Crop */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center overflow-auto">
                  <h3 className="font-bold text-slate-700 w-full mb-3 flex items-center gap-2 border-b border-slate-200 pb-2"><Crop size={16} /> Area Asli & Crop</h3>
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
                      className="max-h-[400px] w-auto mx-auto border border-slate-300 shadow-sm"
                    />
                  </ReactCrop>
                  <p className="text-xs text-slate-500 mt-3 text-center">Seret/Tarik pada area gambar untuk memotong (crop).</p>
                </div>
                
                {/* Kanan: Pengaturan & Live Preview */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4"><Maximize2 size={16}/> Pengaturan Ukuran (Resize)</h3>
                    
                    <label className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                      <span>Skala Gambar:</span>
                      <span className="text-pink-600 bg-pink-50 px-2 rounded-md">{imageScale}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      value={imageScale} 
                      onChange={(e) => setImageScale(parseInt(e.target.value))}
                      className="w-full accent-pink-600 mb-4"
                    />

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>Kualitas:</span>
                          <span className="text-pink-600">{imageQuality}%</span>
                        </label>
                        <input 
                          type="range" min="1" max="100" 
                          value={imageQuality} 
                          onChange={(e) => setImageQuality(parseInt(e.target.value))}
                          className="w-full accent-pink-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Format:</label>
                        <select 
                          value={imageFormat} 
                          onChange={(e) => setImageFormat(e.target.value)}
                          className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium outline-none"
                        >
                          <option value="image/jpeg">JPG / JPEG</option>
                          <option value="image/webp">WEBP (Terkecil)</option>
                          <option value="image/png">PNG</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Ukuran Hasil Akhir:</p>
                      <p className="text-lg font-black text-slate-700">{finalWidth}px <span className="text-slate-400 font-normal">x</span> {finalHeight}px</p>
                      {finalFileSize > 0 && (
                        <p className="text-sm font-bold text-pink-600 mt-1">{formatBytes(finalFileSize)}</p>
                      )}
                    </div>
                    
                    <div className="pt-4 mt-2">
                      <button onClick={downloadImage} className="w-full flex justify-center items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                        <Download size={18} /> Download Hasil
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                      <h3 className="font-bold text-slate-700">Live Preview Hasil</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Gunakan 2 jari / scroll untuk zoom</p>
                    </div>
                    <div className="w-full relative overflow-hidden h-[350px] bg-transparent bg-checkered p-2 rounded-lg border border-slate-200 shadow-inner" style={{ backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQEhD/4nEi8gYjMPEgBQjV4PGAUZAQA2jxgFGBgQjYk+cRBo2BgAAX5745rP8O5AAAAAASUVORK5CYII=')" }}>
                      <TransformWrapper
                        initialScale={1}
                        centerOnInit={true}
                        minScale={0.1}
                        maxScale={8}
                        wheel={{ step: 0.1 }}
                      >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            <div className="absolute top-2 right-2 flex gap-1 z-10 bg-white/90 p-1 rounded-lg backdrop-blur shadow-sm border border-slate-200">
                              <button type="button" onClick={() => zoomOut()} className="p-1.5 text-slate-600 hover:text-pink-600 rounded bg-white shadow-sm border border-slate-100"><ZoomOut size={14}/></button>
                              <button type="button" onClick={() => resetTransform()} className="px-2 py-1.5 text-slate-600 hover:text-pink-600 rounded bg-white shadow-sm border border-slate-100 text-[10px] font-bold">RESET</button>
                              <button type="button" onClick={() => zoomIn()} className="p-1.5 text-slate-600 hover:text-pink-600 rounded bg-white shadow-sm border border-slate-100"><ZoomIn size={14}/></button>
                            </div>
                            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <canvas 
                                ref={previewCanvasRef} 
                                className="shadow-md rounded border border-slate-300 bg-white max-w-full max-h-full object-contain"
                              />
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PDF TOOL */}
        {activeTab === "pdf" && (
          <div className="space-y-6">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${isDragging ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload" />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-600'}`}>
                  <FileText size={20} />
                </div>
                <span className="font-bold text-slate-600">{pdfFile ? pdfFile.name : "Klik atau Tarik (Drag & Drop) PDF ke sini"}</span>
              </label>
            </div>

            {pdfFile && (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl max-w-lg mx-auto">
                <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">Pengaturan Ukuran PDF</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shadow-sm">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Ukuran Asli</p>
                    <p className="text-lg font-black text-slate-600">{formatBytes(pdfOriginalSize)}</p>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-center shadow-sm relative">
                    <p className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">Hasil (Estimasi)</p>
                    <p className="text-lg font-black text-rose-700">
                      {isCalculatingPdf ? "Menghitung..." : formatBytes(pdfFinalSize)}
                    </p>
                  </div>
                </div>

                <label className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
                  <span>Skala Halaman</span>
                  <span className="text-rose-600 bg-rose-100 px-2 rounded">{pdfScale}px / {pdfScale}%</span>
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={pdfScale} 
                  onChange={(e) => setPdfScale(parseInt(e.target.value))}
                  className="w-full accent-rose-600 mb-2"
                />
                <p className="text-xs text-slate-500 mb-6 bg-slate-100 p-2 rounded">
                  Menurunkan skala halaman akan mengecilkan panjang dan lebar konten PDF yang berujung pada turunnya ukuran file (MB).
                </p>
                
                <button 
                  onClick={processAndDownloadPdf} 
                  disabled={isCalculatingPdf}
                  className="w-full flex justify-center items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
                >
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

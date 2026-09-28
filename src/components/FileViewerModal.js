import { X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export default function FileViewerModal({ url, onClose }) {
  const [absoluteUrl, setAbsoluteUrl] = useState("");

  useEffect(() => {
    if (url) {
      if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
        setAbsoluteUrl(url);
      } else {
        setAbsoluteUrl(window.location.origin + (url.startsWith("/") ? url : "/" + url));
      }
    }
  }, [url]);

  if (!url) return null;

  // Clean URL to check extension (remove query params)
  const cleanUrl = url.split("?")[0].toLowerCase();
  
  const isImage = cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i) || url.startsWith("data:image");
  const isVideo = cleanUrl.match(/\.(mp4|webm|ogg|mov)$/i) || url.startsWith("data:video");
  const isAudio = cleanUrl.match(/\.(mp3|wav|ogg|m4a)$/i) || url.startsWith("data:audio");
  const isPdf = cleanUrl.match(/\.pdf$/i) || url.startsWith("data:application/pdf");
  const isDoc = cleanUrl.match(/\.(doc|docx|ppt|pptx|xls|xlsx)$/i);
  
  const isLocalFile = url.startsWith("blob:") || url.startsWith("data:");

  // Jika diakses via HP Android, iframe PDF kadang otomatis terdownload. 
  // Opsi fallback: gunakan Google Docs Viewer untuk dokumen (hanya jika URL publik)
  const viewerUrl = (!isLocalFile && (isDoc || (isPdf && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent))))
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true` 
    : url;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[95vh] md:h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-700 hidden sm:block">Pratinjau File</h3>
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100">
              <ExternalLink size={14} /> Buka Penuh
            </a>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-500 rounded-xl transition-colors">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-2 md:p-4 relative">
          {isImage ? (
            <img src={url} alt="Pratinjau Dokumen" className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white" />
          ) : isVideo ? (
            <video src={url} controls className="max-w-full max-h-full bg-black rounded-lg shadow-sm border border-slate-200" />
          ) : isAudio ? (
            <audio src={url} controls className="w-full max-w-md shadow-sm" />
          ) : (
            <iframe src={viewerUrl} className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200" title="Pratinjau Dokumen" />
          )}
        </div>
      </div>
    </div>
  );
}

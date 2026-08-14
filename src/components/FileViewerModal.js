import { X, ExternalLink } from "lucide-react";

export default function FileViewerModal({ url, onClose }) {
  if (!url) return null;

  // Deteksi ekstensi gambar (untuk iframe pdf/doc vs img img)
  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
  
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
          ) : (
            <iframe src={url} className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-200" title="Pratinjau Dokumen" />
          )}
        </div>
      </div>
    </div>
  );
}

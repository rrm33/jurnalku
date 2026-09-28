"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";

export default function QrGeneratorTool() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");
  const qrRef = useRef();

  const downloadQr = () => {
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${new Date().getTime()}.png`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Pembuat QR Code</h1>
        <p className="text-slate-500 mb-6 text-sm">Ubah Teks, URL Website, atau Nomor HP menjadi kode QR secara instan.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Teks atau URL/Link:</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Contoh: https://google.com"
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Warna QR Code:</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">{color.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6"><QrCode size={18}/> Preview QR Code</h3>
            
            <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
              <QRCodeCanvas 
                value={text || "https://jurnalku.com"} 
                size={200} 
                fgColor={color}
                level="H"
                includeMargin={true}
              />
            </div>

            <button 
              onClick={downloadQr} 
              disabled={!text}
              className="w-full max-w-xs flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} /> Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

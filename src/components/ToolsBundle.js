"use client";

import { useState } from "react";
import { Crop, FileImage, QrCode, Layers } from "lucide-react";
import ResizeTool from "@/components/ResizeTool";
import ImageToPdfTool from "@/components/ImageToPdfTool";
import QrGeneratorTool from "@/components/QrGeneratorTool";
import PdfTools from "@/components/PdfTools";

export default function ToolsBundle() {
  const [activeTab, setActiveTab] = useState("resize");

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 mt-2">
        <button 
          onClick={() => setActiveTab("resize")}
          className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === "resize" ? "bg-rose-600 text-white scale-105" : "bg-white text-slate-600 border border-slate-200 hover:border-rose-200 hover:text-rose-600"}`}
        >
          <Crop size={16} /> Resize & Compress
        </button>
        <button 
          onClick={() => setActiveTab("img2pdf")}
          className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === "img2pdf" ? "bg-blue-600 text-white scale-105" : "bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600"}`}
        >
          <FileImage size={16} /> Gambar ke PDF
        </button>
        <button 
          onClick={() => setActiveTab("pdftools")}
          className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === "pdftools" ? "bg-indigo-600 text-white scale-105" : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600"}`}
        >
          <Layers size={16} /> Gabung/Pisah PDF
        </button>
        <button 
          onClick={() => setActiveTab("qrcode")}
          className={`flex items-center gap-2 py-2 px-5 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === "qrcode" ? "bg-emerald-600 text-white scale-105" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600"}`}
        >
          <QrCode size={16} /> QR Generator
        </button>
      </div>

      {/* Render Tool */}
      <div className="w-full">
        {activeTab === "resize" && <ResizeTool hideBack={true} />}
        {activeTab === "img2pdf" && <ImageToPdfTool />}
        {activeTab === "pdftools" && <PdfTools />}
        {activeTab === "qrcode" && <QrGeneratorTool />}
      </div>
    </div>
  );
}

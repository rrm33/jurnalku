"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  FileCode,
  Eye,
  Edit3,
  Columns,
  Upload,
  X,
  Loader2,
  Check,
  ZoomIn
} from "lucide-react";
import Swal from "sweetalert2";
import FormattedContent from "@/components/FormattedContent";
import { uploadEditorImage } from "@/actions/rpp";

export default function AktivitasEditor({
  value = "",
  onChange,
  onOpenCodeModal,
  placeholder = "Tulis kegiatan pembelajaran di sini...",
  minHeight = "320px",
}) {
  const [activeTab, setActiveTab] = useState("edit"); // "edit" | "preview" | "split"
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTab, setImageModalTab] = useState("upload"); // "upload" | "url"
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const textareaRef = useRef(null);

  // Helper to insert or wrap text at textarea cursor position
  const insertFormatting = (prefix, suffix = "", defaultPlaceholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentVal = value || "";
    const selectedText = currentVal.substring(start, end);

    const textToInsert = selectedText || defaultPlaceholder;
    const replacement = `${prefix}${textToInsert}${suffix}`;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
      }
    }, 10);
  };

  // Helper to insert prefix at start of current line
  const insertLinePrefix = (prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart || 0;
    const currentVal = value || "";

    // Find the beginning of current line
    const lastNewline = currentVal.lastIndexOf("\n", start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const newVal = currentVal.substring(0, lineStart) + prefix + currentVal.substring(lineStart);
    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 10);
  };

  // Handle direct paste from clipboard (e.g. screenshots or copied images)
  const handlePaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        await processAndUploadImage(file, "Gambar Papan Klip");
        break;
      }
    }
  };

  // Helper to upload image and insert into text
  const processAndUploadImage = async (file, defaultAlt = "Gambar") => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await uploadEditorImage(fd);
      if (res && res.success) {
        const altText = imageAlt.trim() || defaultAlt || res.name || "Gambar";
        const markdownImage = `\n\n![${altText}](${res.url})\n\n`;

        insertRawText(markdownImage);

        setShowImageModal(false);
        setImageFile(null);
        setImagePreviewUrl("");
        setImageAlt("");
        setImageUrlInput("");

        Swal.fire({
          icon: "success",
          title: "Gambar Berhasil Disisipkan!",
          text: "Gambar telah diunggah dan ditambahkan ke aktivitas.",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Gagal Mengunggah", res?.message || "Terjadi kesalahan saat mengunggah gambar.", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Kesalahan", "Gagal memproses unggahan gambar.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Insert raw text at cursor
  const insertRawText = (raw) => {
    const textarea = textareaRef.current;
    const currentVal = value || "";

    if (!textarea) {
      onChange(currentVal + raw);
      return;
    }

    const start = textarea.selectionStart || currentVal.length;
    const end = textarea.selectionEnd || currentVal.length;
    const newVal = currentVal.substring(0, start) + raw + currentVal.substring(end);

    onChange(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + raw.length, start + raw.length);
    }, 10);
  };

  // Insert Web URL Image
  const handleInsertImageUrl = () => {
    if (!imageUrlInput.trim()) {
      Swal.fire("Peringatan", "Masukkan URL gambar terlebih dahulu.", "warning");
      return;
    }
    const altText = imageAlt.trim() || "Gambar";
    const markdownImage = `\n\n![${altText}](${imageUrlInput.trim()})\n\n`;
    insertRawText(markdownImage);

    setShowImageModal(false);
    setImageUrlInput("");
    setImageAlt("");
  };

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      Swal.fire("Peringatan", "Masukkan URL tautan.", "warning");
      return;
    }
    const label = linkText.trim() || linkUrl.trim();
    const markdownLink = `[${label}](${linkUrl.trim()})`;
    insertRawText(markdownLink);

    setShowLinkModal(false);
    setLinkText("");
    setLinkUrl("");
  };

  // Clear text with confirmation
  const handleClear = () => {
    if (!value || value.trim() === "") return;
    Swal.fire({
      title: "Bersihkan Isian?",
      text: "Seluruh teks dan gambar pada aktivitas ini akan dikosongkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Kosongkan",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        onChange("");
        if (textareaRef.current) textareaRef.current.focus();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
      {/* Top Toolbar */}
      <div className="bg-slate-50/90 border-b border-slate-200 p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-1.5 select-none">
        {/* Left Toolbar Group (Formatting Tools) */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {/* Headings */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => insertLinePrefix("# ")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              title="Judul Besar (Heading 1)"
            >
              <Heading1 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("## ")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              title="Sub-judul (Heading 2)"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("### ")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              title="Sub-bagian (Heading 3)"
            >
              <Heading3 size={15} />
            </button>
          </div>

          {/* Text Styles */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => insertFormatting("**", "**", "teks tebal")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Tebal (Bold)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("*", "*", "teks miring")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Miring (Italic)"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("<u>", "</u>", "teks garis bawah")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Garis Bawah (Underline)"
            >
              <Underline size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("~~", "~~", "teks coret")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Coret (Strikethrough)"
            >
              <Strikethrough size={15} />
            </button>
          </div>

          {/* Lists & Quotes */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => insertLinePrefix("- ")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Daftar Poin (Bullet List)"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("1. ")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Daftar Angka (Numbered List)"
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix("> ")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Kutipan / Catatan Penting (Quote)"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertRawText("\n\n---\n\n")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Garis Pemisah (Divider)"
            >
              <Minus size={15} />
            </button>
          </div>

          {/* Links, Media & Code */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Sisipkan Tautan / Link"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="px-2 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5"
              title="Sisipkan Gambar (Upload atau URL Web)"
            >
              <ImageIcon size={15} />
              <span className="hidden sm:inline">+ Gambar</span>
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("`", "`", "kode")}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Kode Inline (`kode`)"
            >
              <Code size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenCodeModal) {
                  onOpenCodeModal();
                } else {
                  insertRawText("\n```dart\n// Tulis kode program kamu di sini\nvoid main() {\n  print('Halo');\n}\n```\n");
                }
              }}
              className="px-2 py-1.5 bg-slate-900 hover:bg-black text-emerald-400 rounded-lg transition-all font-mono text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95"
              title="Kotak Kode Program Sintaks Gelap"
            >
              <FileCode size={14} />
              <span className="hidden sm:inline">Kotak Kode</span>
            </button>
          </div>
        </div>

        {/* Right Toolbar Group: Views & Clear */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
          {/* Clear Button */}
          {value && value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Bersihkan Isian Teks"
            >
              <X size={15} />
            </button>
          )}

          {/* View Modes */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === "edit"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilan Tulis"
            >
              <Edit3 size={13} />
              <span className="hidden sm:inline">Tulis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("split")}
              className={`hidden md:flex px-2.5 py-1 rounded-lg transition-all items-center gap-1 ${
                activeTab === "split"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilan Berdampingan (Split View)"
            >
              <Columns size={13} />
              <span>Split</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === "preview"
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilan Pratinjau Bersih"
            >
              <Eye size={13} />
              <span>Pratinjau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        {/* EDIT ONLY MODE */}
        {activeTab === "edit" && (
          <div className="p-3">
            <textarea
              ref={textareaRef}
              rows={8}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full p-2 outline-none text-slate-800 text-sm leading-relaxed resize-y font-sans selection:bg-rose-100 selection:text-rose-900"
            />
          </div>
        )}

        {/* PREVIEW ONLY MODE */}
        {activeTab === "preview" && (
          <div className="p-5 overflow-y-auto bg-slate-50/50" style={{ minHeight }}>
            {value && value.trim() ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-rose-100 pb-2">
                  <Eye size={13} /> Pratinjau Tampilan untuk Siswa:
                </div>
                <FormattedContent content={value} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                <Edit3 size={32} className="mb-2 opacity-40 text-rose-400" />
                <p className="text-sm font-semibold">Belum ada konten kegiatan pembelajaran.</p>
                <p className="text-xs text-slate-400 mt-1">Pindah ke tab <b>Tulis</b> untuk mulai mengetik.</p>
              </div>
            )}
          </div>
        )}

        {/* SPLIT SCREEN MODE (Side-by-Side) */}
        {activeTab === "split" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200" style={{ minHeight }}>
            {/* Left: Input Textarea */}
            <div className="p-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1 px-1">
                <Edit3 size={12} /> Tulis Markdown / Teks:
              </div>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handlePaste}
                placeholder={placeholder}
                style={{ minHeight: "280px" }}
                className="w-full h-full p-2 outline-none text-slate-800 text-sm leading-relaxed resize-none font-sans selection:bg-rose-100 selection:text-rose-900"
              />
            </div>

            {/* Right: Live Formatted Preview */}
            <div className="p-4 bg-slate-50/70 overflow-y-auto max-h-[500px]">
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Eye size={12} /> Hasil Pratinjau Langsung:
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
                <FormattedContent content={value || "*Belum ada teks yang ditulis.*"} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Helper Bar */}
      <div className="bg-slate-50/70 border-t border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600">
            {value ? value.trim().length : 0} karakter
          </span>
          <span className="text-slate-300">•</span>
          <span className="hidden sm:inline text-slate-500">
            💡 <b>Tips Cepat:</b> Kamu bisa langsung <i>paste</i> (Ctrl+V / Cmd+V) screenshot gambar ke teks!
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Format: Markdown & Gambar</span>
        </div>
      </div>

      {/* MODAL SISIPKAN GAMBAR */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Sisipkan Gambar</h3>
                  <p className="text-xs text-slate-500">Tambahkan gambar ke aktivitas pembelajaran</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageFile(null);
                  setImagePreviewUrl("");
                  setImageAlt("");
                  setImageUrlInput("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs Upload vs URL */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setImageModalTab("upload")}
                className={`py-2 rounded-lg transition-all ${
                  imageModalTab === "upload"
                    ? "bg-white text-rose-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload dari Komputer / HP
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab("url")}
                className={`py-2 rounded-lg transition-all ${
                  imageModalTab === "url"
                    ? "bg-white text-rose-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Gunakan URL Gambar Web
              </button>
            </div>

            {/* TAB 1: UPLOAD */}
            {imageModalTab === "upload" && (
              <div className="space-y-4">
                <label className="block border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-rose-50/30">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreviewUrl(URL.createObjectURL(file));
                        if (!imageAlt) {
                          setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                  />
                  {imagePreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-contain shadow-xs border border-slate-200"
                      />
                      <p className="text-xs text-rose-600 font-bold">Klik untuk mengganti gambar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                        <Upload size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Pilih berkas gambar</p>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, GIF, WEBP (Maksimal 5 MB)</p>
                      </div>
                    </div>
                  )}
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Keterangan Gambar / Teks Alternatif (Opsional)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Contoh: Diagram Alur Pembelajaran State"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!imageFile || isUploading}
                    onClick={() => processAndUploadImage(imageFile, imageAlt)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md shadow-rose-200"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Unggah & Sisipkan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: WEB URL */}
            {imageModalTab === "url" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    URL Gambar Web *
                  </label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/gambar.png"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Keterangan Gambar / Teks Alternatif (Opsional)
                  </label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Contoh: Ilustrasi Arsitektur"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs font-medium"
                  />
                </div>

                {imageUrlInput && (
                  <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-center">
                    <p className="text-[11px] font-bold text-slate-400 mb-1">Pratinjau Gambar:</p>
                    <img
                      src={imageUrlInput}
                      alt="Preview"
                      className="max-h-36 mx-auto rounded-lg object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!imageUrlInput.trim()}
                    onClick={handleInsertImageUrl}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md shadow-rose-200"
                  >
                    <Check size={14} />
                    Sisipkan Gambar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SISIPKAN TAUTAN (LINK) */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <LinkIcon size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Sisipkan Tautan (Link)</h3>
                  <p className="text-xs text-slate-500">Tautkan alamat website ke dalam teks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Teks Tampilan Tautan
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Contoh: Baca Dokumentasi Flutter"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Alamat URL Web *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://flutter.dev"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!linkUrl.trim()}
                onClick={handleInsertLink}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md shadow-rose-200"
              >
                <Check size={14} />
                Sisipkan Tautan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

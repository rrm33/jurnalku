"use client";

import { useState, useRef, useEffect } from "react";
import { Code, Copy, Check, ChevronDown, ChevronUp, X, ExternalLink, ZoomIn } from "lucide-react";

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguageLabel = (l) => {
    if (!l) return "KODE";
    const clean = l.toLowerCase();
    if (clean === "dart" || clean === "flutter") return "DART / FLUTTER";
    if (clean === "js" || clean === "javascript") return "JAVASCRIPT";
    if (clean === "ts" || clean === "typescript") return "TYPESCRIPT";
    if (clean === "html") return "HTML";
    if (clean === "css") return "CSS";
    if (clean === "python" || clean === "py") return "PYTHON";
    if (clean === "php") return "PHP";
    if (clean === "sql") return "SQL";
    if (clean === "code") return "KODE";
    return l.toUpperCase();
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-md select-text">
      {/* Top Header Bar */}
      <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between border-b border-slate-700/80 select-none">
        <div className="flex items-center gap-2">
          {/* macOS window controls style */}
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Code size={13} className="text-emerald-400" />
            {getLanguageLabel(lang)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white"
          title="Salin kode ke papan klip"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content Area */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed whitespace-pre selection:bg-emerald-900 selection:text-white">
        <code>{code}</code>
      </div>
    </div>
  );
}

// Helper to render inline formatting: bold, italic, underline, strike, inline code, links
function renderInlineFormatting(text, onImageClick) {
  if (!text) return null;

  // Tokenize by inline patterns:
  // 1. Image: ![alt](url)
  // 2. Link: [text](url)
  // 3. Raw URL: https?://...
  // 4. Bold: **text** or <b>text</b> or <strong>text</strong>
  // 5. Italic: *text* or <i>text</i> or <em>text</em>
  // 6. Underline: <u>text</u> or __text__
  // 7. Strikethrough: ~~text~~ or <del>text</del>
  // 8. Inline code: `code`
  const regex = /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<]+)|\*\*([^*]+)\*\*|<b>(.*?)<\/b>|<strong>(.*?)<\/strong>|\*([^*]+)\*|<i>(.*?)<\/i>|<em>(.*?)<\/em>|<u>(.*?)<\/u>|__([^_]+)__|~~([^~]+)~~|<del>(.*?)<\/del>|`([^`]+)`)/g;

  const elements = [];
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      elements.push(text.substring(lastIdx, match.index));
    }

    const fullMatch = match[0];
    const key = `inline_${match.index}_${fullMatch.slice(0, 10)}`;

    if (match[1]?.startsWith("![")) {
      // Image: ![alt](url)
      const alt = match[2];
      const url = match[3];
      elements.push(
        <span key={key} className="block my-3">
          <span 
            onClick={(e) => {
              e.stopPropagation();
              if (onImageClick) onImageClick(url, alt);
            }}
            className="inline-block relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm cursor-zoom-in hover:shadow-md transition-all group max-w-full"
          >
            <img 
              src={url} 
              alt={alt || "Gambar"} 
              className="max-h-80 w-auto object-contain mx-auto group-hover:scale-[1.01] transition-transform"
              loading="lazy"
            />
            <span className="absolute bottom-2 right-2 bg-black/60 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={14} />
            </span>
          </span>
        </span>
      );
    } else if (match[4] && match[5]) {
      // Markdown link: [text](url)
      elements.push(
        <a
          key={key}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-rose-600 font-bold hover:underline inline-flex items-center gap-0.5 break-all"
        >
          {match[4]}
          <ExternalLink size={12} className="inline opacity-70 shrink-0" />
        </a>
      );
    } else if (match[6]) {
      // Raw URL: https://...
      elements.push(
        <a
          key={key}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-rose-600 font-bold hover:underline break-all"
        >
          {match[6]}
        </a>
      );
    } else if (match[7] || match[8] || match[9]) {
      // Bold
      elements.push(
        <strong key={key} className="font-extrabold text-slate-900">
          {match[7] || match[8] || match[9]}
        </strong>
      );
    } else if (match[10] || match[11] || match[12]) {
      // Italic
      elements.push(
        <em key={key} className="italic text-slate-800">
          {match[10] || match[11] || match[12]}
        </em>
      );
    } else if (match[13] || match[14]) {
      // Underline
      elements.push(
        <span key={key} className="underline decoration-slate-400 decoration-1 underline-offset-2">
          {match[13] || match[14]}
        </span>
      );
    } else if (match[15] || match[16]) {
      // Strike
      elements.push(
        <del key={key} className="line-through text-slate-400">
          {match[15] || match[16]}
        </del>
      );
    } else if (match[17]) {
      // Inline code
      elements.push(
        <code key={key} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 text-rose-600 font-mono text-xs font-bold border border-slate-200">
          {match[17]}
        </code>
      );
    } else {
      elements.push(fullMatch);
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    elements.push(text.substring(lastIdx));
  }

  return elements;
}

// Render markdown blocks: Headings, Blockquotes, Lists, Images, Paragraphs
function RichTextBlock({ text, onImageClick }) {
  if (!text) return null;

  const lines = text.split("\n");
  const nodes = [];
  let currentList = null; // { type: 'ul' | 'ol', items: [] }

  const flushList = (keyPrefix) => {
    if (!currentList) return;
    if (currentList.type === "ul") {
      nodes.push(
        <ul key={`${keyPrefix}_ul`} className="list-disc list-outside pl-5 my-2 space-y-1 text-sm text-slate-700 font-medium">
          {currentList.items.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item, onImageClick)}</li>
          ))}
        </ul>
      );
    } else {
      nodes.push(
        <ol key={`${keyPrefix}_ol`} className="list-decimal list-outside pl-5 my-2 space-y-1 text-sm text-slate-700 font-medium">
          {currentList.items.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item, onImageClick)}</li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check if line is empty
    if (!trimmed) {
      flushList(`flush_${index}`);
      nodes.push(<div key={`empty_${index}`} className="h-2" />);
      return;
    }

    // Divider: --- or ***
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      flushList(`flush_${index}`);
      nodes.push(<hr key={`hr_${index}`} className="my-3 border-slate-200" />);
      return;
    }

    // Heading 1: # Title
    if (trimmed.startsWith("# ")) {
      flushList(`flush_${index}`);
      nodes.push(
        <h2 key={`h1_${index}`} className="text-xl sm:text-2xl font-black text-slate-800 mt-4 mb-2 tracking-tight">
          {renderInlineFormatting(trimmed.substring(2), onImageClick)}
        </h2>
      );
      return;
    }

    // Heading 2: ## Title
    if (trimmed.startsWith("## ")) {
      flushList(`flush_${index}`);
      nodes.push(
        <h3 key={`h2_${index}`} className="text-lg sm:text-xl font-bold text-slate-800 mt-3 mb-1.5">
          {renderInlineFormatting(trimmed.substring(3), onImageClick)}
        </h3>
      );
      return;
    }

    // Heading 3: ### Title
    if (trimmed.startsWith("### ")) {
      flushList(`flush_${index}`);
      nodes.push(
        <h4 key={`h3_${index}`} className="text-base sm:text-lg font-bold text-slate-800 mt-2.5 mb-1">
          {renderInlineFormatting(trimmed.substring(4), onImageClick)}
        </h4>
      );
      return;
    }

    // Blockquote: > Text
    if (trimmed.startsWith("> ")) {
      flushList(`flush_${index}`);
      nodes.push(
        <blockquote key={`quote_${index}`} className="border-l-4 border-rose-400 bg-rose-50/70 text-slate-700 px-4 py-2.5 my-2 rounded-r-xl italic text-sm font-medium shadow-sm">
          {renderInlineFormatting(trimmed.substring(2), onImageClick)}
        </blockquote>
      );
      return;
    }

    // Unordered List: - item or * item
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList(`flush_${index}`);
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[1]);
      return;
    }

    // Ordered List: 1. item or 2) item
    const olMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList(`flush_${index}`);
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[2]);
      return;
    }

    // Raw Standalone Image line: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushList(`flush_${index}`);
      const alt = imgMatch[1];
      const url = imgMatch[2];
      nodes.push(
        <div key={`img_standalone_${index}`} className="my-3">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (onImageClick) onImageClick(url, alt);
            }}
            className="inline-block relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm cursor-zoom-in hover:shadow-md transition-all group max-w-full"
          >
            <img 
              src={url} 
              alt={alt || "Gambar Aktivitas"} 
              className="max-h-96 w-auto object-contain mx-auto group-hover:scale-[1.01] transition-transform bg-white"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-lg">
                <ZoomIn size={14} /> Perbesar
              </span>
            </div>
          </div>
        </div>
      );
      return;
    }

    // Standard paragraph line
    flushList(`flush_${index}`);
    nodes.push(
      <p key={`p_${index}`} className="text-sm text-slate-700 leading-relaxed font-medium">
        {renderInlineFormatting(line, onImageClick)}
      </p>
    );
  });

  flushList("flush_end");
  return <div className="space-y-1">{nodes}</div>;
}

export default function FormattedContent({ content, className = "", collapsible = false }) {
  const contentRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (collapsible && contentRef.current) {
      if (contentRef.current.scrollHeight > 190) {
        setIsOverflowing(true);
      }
    }
  }, [content, collapsible]);

  if (!content || typeof content !== "string") {
    return <span className="text-slate-400 italic">Tidak ada konten</span>;
  }

  // Regex matches ```lang\ncode``` or [code]code[/code] or <kode>code</kode>
  const codeRegex = /(?:```([a-zA-Z0-9_#-]+)?\n?([\s\S]*?)```|\[code(?::([a-zA-Z0-9_#-]+))?\]([\s\S]*?)\[\/code\]|<kode(?: lang="([^"]*)")?>([\s\S]*?)<\/kode>)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }
    const lang = match[1] || match[3] || match[5] || "code";
    const code = match[2] || match[4] || match[6] || "";
    parts.push({
      type: "code",
      lang: lang.trim(),
      content: code.replace(/^\n+|\n+$/g, ""),
    });
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  const needsCollapse = collapsible && isOverflowing && !isExpanded;

  return (
    <>
      <div className="relative">
        <div
          ref={contentRef}
          className={`space-y-2 transition-all duration-300 ${
            needsCollapse ? "max-h-48 overflow-hidden relative" : ""
          } ${className}`}
        >
          {parts.map((part, index) => {
            if (part.type === "code") {
              return <CodeBlock key={index} code={part.content} lang={part.lang} />;
            }
            return (
              <RichTextBlock 
                key={index} 
                text={part.content} 
                onImageClick={(url, alt) => setModalImage({ url, alt })}
              />
            );
          })}

          {/* Gradient fade when collapsed */}
          {needsCollapse && (
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Button Tampilkan Semua / Tampilkan Lebih Sedikit */}
        {collapsible && isOverflowing && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors shadow-sm active:scale-95"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} className="text-rose-500" />
                  <span>Tampilkan Lebih Sedikit</span>
                </>
              ) : (
                <>
                  <ChevronDown size={14} className="text-rose-500" />
                  <span>Tampilkan Semua</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full Image Zoom */}
      {modalImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Tutup (Esc)"
            >
              <X size={22} />
            </button>
            <img 
              src={modalImage.url} 
              alt={modalImage.alt || "Gambar Diperbesar"} 
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}

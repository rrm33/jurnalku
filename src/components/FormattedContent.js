"use client";

import { useState, useRef, useEffect } from "react";
import { Code, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-md">
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

function renderTextWithLinks(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const tokens = text.split(urlRegex);

  return tokens.map((token, idx) => {
    if (token.match(urlRegex)) {
      return (
        <a
          key={idx}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-600 font-bold hover:underline break-all"
        >
          {token}
        </a>
      );
    }
    return token;
  });
}

export default function FormattedContent({ content, className = "", collapsible = false }) {
  const contentRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

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
    <div className="relative">
      <div
        ref={contentRef}
        className={`space-y-1 transition-all duration-300 ${
          needsCollapse ? "max-h-48 overflow-hidden relative" : ""
        } ${className}`}
      >
        {parts.map((part, index) => {
          if (part.type === "code") {
            return <CodeBlock key={index} code={part.content} lang={part.lang} />;
          }
          return (
            <p
              key={index}
              className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line"
            >
              {renderTextWithLinks(part.content)}
            </p>
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
  );
}

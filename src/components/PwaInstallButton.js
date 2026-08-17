"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <button onClick={handleInstallClick} className="w-full flex items-center gap-4 px-4 py-3 bg-sky-50 hover:bg-sky-100 rounded-2xl transition-colors text-left mb-2">
      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-sky-500">
        <Download size={18} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sky-700 text-sm">Install Aplikasi</h3>
        <p className="text-xs text-sky-600/80">Tambahkan ke layar utama</p>
      </div>
    </button>
  );
}

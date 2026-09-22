"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import Swal from "sweetalert2";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    if (isIOSDevice) {
      setIsIOS(true);
      setIsInstallable(true); // Always installable on iOS (via manual share)
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      Swal.fire({
        title: 'Install di iPhone/iPad',
        html: `Untuk menginstall aplikasi ini:<br><br>1. Tap tombol <b>Share</b> (ikon kotak dengan panah ke atas) di menu Safari bawah.<br>2. Scroll ke bawah dan pilih <b>"Add to Home Screen"</b> (Tambahkan ke Layar Utama).`,
        icon: 'info',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Mengerti'
      });
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !isInstallable) return null;

  return (
    <button 
      onClick={handleInstallClick} 
      className="fixed bottom-24 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl hover:shadow-red-500/50 hover:-translate-y-1 transition-all duration-300 animate-bounce"
    >
      <Download size={20} className="animate-pulse" />
      <span className="font-bold text-sm tracking-wide">Install App</span>
    </button>
  );
}

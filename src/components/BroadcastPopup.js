"use client";

import { useState, useEffect } from "react";
import { getUnreadBroadcastsForSiswa, markBroadcastAsRead } from "@/actions/broadcast";
import { Megaphone, X, BellRing } from "lucide-react";
import Linkify from "@/components/Linkify";

export default function BroadcastPopup() {
  const [unread, setUnread] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      const res = await getUnreadBroadcastsForSiswa();
      if (res.success && res.data && res.data.length > 0) {
        setUnread(res.data);
        
        // Trigger browser notification if supported and allowed
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification(res.data[0].judul, {
              body: "Ada pengumuman baru dari guru.",
              icon: "/icon.png"
            });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission();
          }
        }
      }
    }
    fetchUnread();
  }, []);

  if (unread.length === 0) return null;

  const currentMsg = unread[currentIndex];

  const handleNextOrClose = async () => {
    // Mark current as read
    await markBroadcastAsRead(currentMsg.id);

    if (currentIndex < unread.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setUnread([]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 p-6 flex items-center gap-4 text-white relative">
          <div className="absolute -right-6 -top-6 opacity-10">
            <Megaphone size={100} />
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
            <BellRing size={24} className="animate-bounce" />
          </div>
          <div className="flex-1 relative z-10">
            <h2 className="text-xl font-black">{currentMsg.judul}</h2>
            <p className="text-indigo-100 text-sm font-medium">Dari: {currentMsg.guru?.nama || "Guru"}</p>
          </div>
          <button 
            onClick={handleNextOrClose} 
            className="w-8 h-8 flex items-center justify-center bg-black/10 hover:bg-black/20 rounded-full transition-colors relative z-10"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            <Linkify text={currentMsg.pesan} />
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400">
            {currentIndex + 1} dari {unread.length} Pesan
          </div>
          <button 
            onClick={handleNextOrClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            {currentIndex < unread.length - 1 ? "Pesan Selanjutnya" : "Tutup & Mengerti"}
          </button>
        </div>
      </div>
    </div>
  );
}

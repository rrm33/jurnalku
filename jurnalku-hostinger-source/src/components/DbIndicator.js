"use client";

import { useState, useEffect } from "react";
import { checkDbConnection } from "@/actions/master";

export default function DbIndicator() {
  const [dbStatus, setDbStatus] = useState("checking");

  useEffect(() => {
    const check = async () => {
      try {
        const isConnected = await checkDbConnection();
        setDbStatus(isConnected ? "connected" : "disconnected");
      } catch (error) {
        setDbStatus("disconnected");
      }
    };
    
    check();
    
    // Auto check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 text-xs font-bold">
      <div className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : dbStatus === 'disconnected' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-slate-300 animate-pulse'}`}></div>
      <span className={dbStatus === 'connected' ? 'text-emerald-700' : dbStatus === 'disconnected' ? 'text-rose-700' : 'text-slate-500'}>
        {dbStatus === 'connected' ? 'Database Terhubung' : dbStatus === 'disconnected' ? 'Database Terputus' : 'Memeriksa DB...'}
      </span>
    </div>
  );
}

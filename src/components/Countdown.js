"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function Countdown({ deadline, size = "normal" }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) return null;
  if (!timeLeft) return null; // Hydration fix

  const isLarge = size === "large";

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 font-bold ${isLarge ? 'text-red-500 text-lg bg-red-50 p-4 rounded-xl border border-red-100 justify-center' : 'text-red-500 text-sm'}`}>
        <Clock size={isLarge ? 24 : 16} /> Waktu Tenggat Telah Berakhir
      </div>
    );
  }

  if (isLarge) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-amber-800 shadow-sm w-full">
        <div className="flex items-center gap-2 text-amber-700 font-bold mb-3 uppercase tracking-wider text-sm">
          <Clock size={18} /> Sisa Waktu Pengerjaan
        </div>
        <div className="flex items-center justify-center gap-3 md:gap-4 w-full">
          <div className="flex flex-col items-center bg-white border border-amber-100 p-2 md:p-4 rounded-xl flex-1 max-w-[100px] shadow-sm">
            <span className="text-3xl md:text-5xl font-black text-amber-600">{timeLeft.days}</span>
            <span className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Hari</span>
          </div>
          <span className="text-2xl font-black text-amber-300">:</span>
          <div className="flex flex-col items-center bg-white border border-amber-100 p-2 md:p-4 rounded-xl flex-1 max-w-[100px] shadow-sm">
            <span className="text-3xl md:text-5xl font-black text-amber-600">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Jam</span>
          </div>
          <span className="text-2xl font-black text-amber-300">:</span>
          <div className="flex flex-col items-center bg-white border border-amber-100 p-2 md:p-4 rounded-xl flex-1 max-w-[100px] shadow-sm">
            <span className="text-3xl md:text-5xl font-black text-amber-600">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Menit</span>
          </div>
          <span className="text-2xl font-black text-amber-300">:</span>
          <div className="flex flex-col items-center bg-white border border-amber-100 p-2 md:p-4 rounded-xl flex-1 max-w-[100px] shadow-sm">
            <span className="text-3xl md:text-5xl font-black text-amber-600">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Detik</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
      <Clock size={14} /> 
      {timeLeft.days > 0 ? `${timeLeft.days}h ` : ''}
      {timeLeft.hours.toString().padStart(2, '0')}:
      {timeLeft.minutes.toString().padStart(2, '0')}:
      {timeLeft.seconds.toString().padStart(2, '0')}
    </div>
  );
}

import React from 'react';
import { Wifi, Battery } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  return (
    <div className="h-11 px-7 pt-2 flex items-center justify-between text-slate-900 select-none bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100/50">
      {/* Left Time */}
      <span className="text-[14px] font-bold tracking-tight">9:41</span>

      {/* Center Dynamic Island pill */}
      <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto hidden sm:block"></div>

      {/* Right Icons: Cellular, Wifi, Battery */}
      <div className="flex items-center gap-1.5 text-slate-800">
        {/* Cellular Signal (4 bars) */}
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-0.5 h-1 bg-slate-800 rounded-xs"></div>
          <div className="w-0.5 h-1.5 bg-slate-800 rounded-xs"></div>
          <div className="w-0.5 h-2.5 bg-slate-800 rounded-xs"></div>
          <div className="w-0.5 h-3 bg-slate-800 rounded-xs"></div>
        </div>

        {/* Wifi */}
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />

        {/* Battery Icon with inner level */}
        <div className="w-5 h-2.5 border border-slate-800 rounded-xs p-0.5 flex items-center">
          <div className="w-3 h-1.5 bg-slate-800 rounded-2xs"></div>
        </div>
      </div>
    </div>
  );
};


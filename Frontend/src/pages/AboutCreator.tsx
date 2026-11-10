import React from 'react';
import { Dumbbell, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export const AboutCreator: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto pb-16 space-y-6 animate-in fade-in duration-200">
      {/* 1. Meet the Creator Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Meet the Creator
        </h2>

        <div className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-xs">
          {/* Circular Creator Profile Image */}
          <div className="relative shrink-0">
            <img
              src="/creator-pic.png"
              alt="Sri Harsha Juttu"
              className="w-24 h-24 rounded-full object-cover shadow-sm border-2 border-emerald-500/20"
              onError={(e) => {
                // Fallback avatar if local image load fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-2xs border-2 border-white">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          {/* Creator Credentials & Bio */}
          <div className="flex-1 space-y-1">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Sri Harsha Juttu
            </h3>
            <p className="text-xs font-semibold text-emerald-600">
              Machine Learning Engineer
            </p>
            <p className="text-xs text-slate-600 leading-relaxed pt-1.5 font-normal">
              A Machine Learning Engineer driven by a vision to automate the important, everyday tasks in daily life through secure, local AI.
            </p>
          </div>
        </div>
      </section>

      {/* 2. About BiteLog Section */}
      <section className="space-y-3.5">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          About BiteLog
        </h2>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-3.5">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Dumbbell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              BiteLog
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            Track every bite securely offline. Achieve goals with complete privacy.
          </h3>

          {/* Privacy Guarantee Card matching design specification */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% On-Device Privacy</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              BiteLog is built with privacy-first principles. Your data stays 100% offline on your device, giving you complete control over your nutritional journey without any cloud syncing or trackers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> by Sri Harsha Juttu
        </p>
      </div>
    </div>
  );
};


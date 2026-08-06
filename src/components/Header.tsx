import React from 'react';
import { Settings, Download, RefreshCw, PlayCircle, ShieldCheck, Eraser } from 'lucide-react';

interface HeaderProps {
  siteName: string;
  clickCount: number;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onResetDefaults: () => void;
  onClearScratch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  siteName,
  clickCount,
  onOpenSettings,
  onOpenExport,
  onResetDefaults,
  onClearScratch,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#161916]/95 backdrop-blur-md border-b-2 border-[#2ecc71] px-4 md:px-10 py-4 shadow-lg transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2ecc71]/10 border border-[#2ecc71]/30 flex items-center justify-center text-[#2ecc71]">
            <PlayCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#2ecc71] tracking-wide">
              {siteName || 'اسم موقعك'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#a0a8a0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2ecc71]" />
              <span>مولد صفحة الهبوط والتوجيه المزدوج</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Clicks counter pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d0f0d] border border-[#2a2e2a] text-xs font-semibold text-[#eaeaea]">
            <span className="w-2 h-2 rounded-full bg-[#2ecc71] animate-ping" />
            <span>النقرات:</span>
            <span className="text-[#2ecc71] font-mono text-sm px-1">{clickCount}</span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#2a2e2a] hover:bg-[#2ecc71]/20 hover:border-[#2ecc71] border border-[#2a2e2a] text-[#eaeaea] text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer"
            title="تعديل الصور والروابط"
          >
            <Settings className="w-4 h-4 text-[#2ecc71]" />
            <span className="hidden sm:inline">إعدادات الروابط</span>
          </button>

          {/* Export HTML Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2ecc71] hover:bg-[#1e9e57] text-[#0d0f0d] text-xs md:text-sm font-bold shadow-md shadow-[#2ecc71]/20 transition-all duration-200 cursor-pointer"
            title="تصدير وتنزيل ملف HTML الجاهز"
          >
            <Download className="w-4 h-4" />
            <span>تصدير HTML</span>
          </button>

          {/* Clear scratch button */}
          <button
            onClick={onClearScratch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all cursor-pointer"
            title="تفريغ كافة البيانات والبدء من الصفر (Scratch)"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">مسح للبدء من الصفر</span>
          </button>

          {/* Reset defaults button */}
          <button
            onClick={onResetDefaults}
            className="p-2 rounded-lg bg-[#2a2e2a]/60 hover:bg-[#2a2e2a] border border-[#2a2e2a] text-[#a0a8a0] hover:text-[#eaeaea] transition-all cursor-pointer"
            title="استعادة الإعدادات الافتراضية"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Loader2, ExternalLink, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

interface RedirectNoticeProps {
  isVisible: boolean;
  videoUrl: string;
  redirectUrl: string;
  onCancel: () => void;
}

export const RedirectNotice: React.FC<RedirectNoticeProps> = ({
  isVisible,
  videoUrl,
  redirectUrl,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0f0d]/90 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-md bg-[#161916] border-2 border-[#2ecc71] rounded-2xl p-6 text-center space-y-5 shadow-2xl shadow-[#2ecc71]/20">
        {/* Animated Loader */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#2ecc71]/20 border-t-[#2ecc71] animate-spin" />
          <ArrowRightLeft className="w-7 h-7 text-[#2ecc71] animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-[#eaeaea]">جاري تشغيل المقطع وإعادة التوجيه...</h3>
          <p className="text-xs text-[#a0a8a0]">
            تم إرسال طلب فتح الفيديو في تبويب جديد وجاري تحويل هذه الصفحة الآن.
          </p>
        </div>

        {/* Status badges */}
        <div className="bg-[#0d0f0d] p-3 rounded-xl border border-[#2a2e2a] text-xs space-y-2 text-right">
          <div className="flex items-center gap-2 text-[#2ecc71]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">1. فتح المقطع: {videoUrl}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="truncate">2. الانتقال إلى: {redirectUrl}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#2ecc71] hover:bg-[#1e9e57] text-[#0d0f0d] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح المقطع يدوياً</span>
          </a>

          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#a0a8a0] text-xs font-bold rounded-lg transition-all cursor-pointer"
          >
            إلغاء التوجيه
          </button>
        </div>
      </div>
    </div>
  );
};

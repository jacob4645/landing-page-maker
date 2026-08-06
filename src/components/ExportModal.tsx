import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, ExternalLink, Code2, Sparkles, Layers } from 'lucide-react';
import { VideoConfig } from '../types';
import { generateStandaloneHtml } from '../utils/generateHtml';

interface ExportModalProps {
  isOpen: boolean;
  config: VideoConfig;
  onClose: () => void;
  onUpdateConfig: (updated: VideoConfig) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  config,
  onClose,
  onUpdateConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'code'>('download');

  if (!isOpen) return null;

  const htmlCode = generateStandaloneHtml(config);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy code:', e);
    }
  };

  const handleDownloadFile = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0f0d]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#161916] border-2 border-[#2ecc71]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e2a] bg-[#0d0f0d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2ecc71]/10 text-[#2ecc71]">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#eaeaea]">تصدير صفحة الهبوط (Export HTML)</h3>
              <p className="text-xs text-[#a0a8a0]">
                تنزيل أو نسخ ملف HTML الجاهز المشتمل على سكريبت التوجيه ورابط المقطع
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#a0a8a0] hover:text-[#eaeaea] hover:bg-[#2a2e2a] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switching */}
        <div className="flex border-b border-[#2a2e2a] bg-[#0d0f0d]/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'download'
                ? 'border-[#2ecc71] text-[#2ecc71] bg-[#161916]'
                : 'border-transparent text-[#a0a8a0] hover:text-[#eaeaea]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>تخصيص وتنزيل الملف</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'code'
                ? 'border-[#2ecc71] text-[#2ecc71] bg-[#161916]'
                : 'border-transparent text-[#a0a8a0] hover:text-[#eaeaea]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>معاينة كود HTML المصدر</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'download' ? (
            <div className="space-y-6">
              {/* Export Parameters Summary Card */}
              <div className="bg-[#0d0f0d] border border-[#2a2e2a] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#2a2e2a] pb-2">
                  <span className="text-xs font-bold text-[#2ecc71] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>المعلمات الضمنية المضمنة في الملف المصدر:</span>
                  </span>
                  <span className="text-[10px] bg-[#2ecc71]/10 text-[#2ecc71] px-2 py-0.5 rounded font-mono">
                    index.html
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#a0a8a0] block text-[11px]">اسم الموقع (Header):</span>
                    <input
                      type="text"
                      value={config.siteName}
                      onChange={(e) => onUpdateConfig({ ...config, siteName: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-[#161916] border border-[#2a2e2a] rounded-lg text-xs text-[#eaeaea] focus:border-[#2ecc71] focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[#a0a8a0] block text-[11px]">عنوان الفيديو (Title):</span>
                    <input
                      type="text"
                      value={config.videoTitle}
                      onChange={(e) => onUpdateConfig({ ...config, videoTitle: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-[#161916] border border-[#2a2e2a] rounded-lg text-xs text-[#eaeaea] focus:border-[#2ecc71] focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[#a0a8a0] block text-[11px]">رابط الصورة المصغرة (Image URL):</span>
                    <input
                      type="text"
                      value={config.thumbnailUrl}
                      onChange={(e) => onUpdateConfig({ ...config, thumbnailUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-[#161916] border border-[#2a2e2a] rounded-lg text-xs text-[#eaeaea] focus:border-[#2ecc71] focus:outline-none dir-ltr text-right font-mono"
                    />
                  </div>

                  <div>
                    <span className="text-[#a0a8a0] block text-[11px]">رابط الفيديو (Button Link - New Tab):</span>
                    <input
                      type="text"
                      value={config.videoUrl}
                      onChange={(e) => onUpdateConfig({ ...config, videoUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-[#161916] border border-[#2a2e2a] rounded-lg text-xs text-[#eaeaea] focus:border-[#2ecc71] focus:outline-none dir-ltr text-right font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-[#a0a8a0] block text-[11px]">رابط إعادة التوجيه (Redirect Link):</span>
                    <input
                      type="text"
                      value={config.redirectUrl}
                      onChange={(e) => onUpdateConfig({ ...config, redirectUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 bg-[#161916] border border-[#2a2e2a] rounded-lg text-xs text-[#eaeaea] focus:border-[#2ecc71] focus:outline-none dir-ltr text-right font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="p-4 bg-[#2ecc71]/5 border border-[#2ecc71]/20 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-[#2ecc71] flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>مميزات ملف HTML المصدَّر:</span>
                </h4>
                <ul className="text-xs text-[#a0a8a0] space-y-1 list-disc list-inside leading-relaxed">
                  <li>ملف قائم بذاته (Single Standalone File) لا يحتاج سيرفر أو مكتبات خارجية.</li>
                  <li>يحتوي على سكريبت تلقائي ينفذ فتح الفيديو للمستخدم ثم توجيه الصفحة للرابط المحدد.</li>
                  <li>تصميم متجاوب وسريع متوافق مع كافة الهواتف والحواسيب.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#a0a8a0]">الكود البرمجي الشامل للملف:</span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 bg-[#2a2e2a] hover:bg-[#2ecc71]/20 text-[#2ecc71] text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم نسخ الكود!' : 'نسخ الكود الكامل'}</span>
                </button>
              </div>
              <pre className="p-4 bg-[#0d0f0d] border border-[#2a2e2a] rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[340px] dir-ltr text-left selection:bg-[#2ecc71] selection:text-[#0d0f0d]">
                {htmlCode}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#2a2e2a] bg-[#0d0f0d] flex items-center justify-between gap-3">
          <button
            onClick={handleCopyCode}
            className="px-4 py-2.5 bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#eaeaea] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-[#2ecc71]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ الكود'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-[#2a2e2a]/60 hover:bg-[#2a2e2a] text-[#a0a8a0] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleDownloadFile}
              className="px-6 py-2.5 bg-[#2ecc71] hover:bg-[#1e9e57] text-[#0d0f0d] text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#2ecc71]/20 cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تحميل index.html</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

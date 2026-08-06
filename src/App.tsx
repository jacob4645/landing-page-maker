import React, { useState } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { ConfigModal } from './components/ConfigModal';
import { ExportModal } from './components/ExportModal';
import { RedirectNotice } from './components/RedirectNotice';
import { VideoConfig } from './types';
import { DEFAULT_CONFIG } from './data/presets';
import { ArrowRightLeft, Sparkles, Download, Settings, FileCode } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<VideoConfig>(() => {
    try {
      const saved = localStorage.getItem('suggested_video_config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load saved config:', e);
    }
    return DEFAULT_CONFIG;
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: VideoConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('suggested_video_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  // Reset to default configuration
  const handleResetDefaults = () => {
    if (window.confirm('هل أنت تأكد من استعادة الإعدادات الافتراضية للرابط والتوجيه؟')) {
      setConfig(DEFAULT_CONFIG);
      try {
        localStorage.removeItem('suggested_video_config');
      } catch (e) {}
    }
  };

  // The primary Watch Button click handler
  const handleWatchClick = () => {
    if (!config.videoUrl) return;

    // Increment click counter
    const updatedCount = (config.clickCount || 0) + 1;
    const updated = { ...config, clickCount: updatedCount };
    setConfig(updated);
    try {
      localStorage.setItem('suggested_video_config', JSON.stringify(updated));
    } catch {}

    // Show visual redirect modal feedback
    setIsRedirecting(true);

    // 1. Open the target video link for the user in a new window/tab
    try {
      window.open(config.videoUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Popup opened error:', e);
    }

    // 2. Redirect the current page to the target destination link
    if (config.redirectUrl) {
      const delay = config.delayRedirectMs ?? 150;
      setTimeout(() => {
        window.location.href = config.redirectUrl;
      }, delay);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f0d] text-[#eaeaea] flex flex-col font-sans selection:bg-[#2ecc71] selection:text-[#0d0f0d]">
      {/* Top Navigation Header */}
      <Header
        siteName={config.siteName}
        clickCount={config.clickCount || 0}
        onOpenSettings={() => setIsConfigOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onResetDefaults={handleResetDefaults}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Export & Quick Control Banner */}
        <div className="bg-[#161916] border border-[#2a2e2a] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#2ecc71]/10 text-[#2ecc71] shrink-0 border border-[#2ecc71]/20">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#eaeaea] flex items-center gap-2">
                <span>توليد وتصدير صفحة الهبوط والتوجيه</span>
                <span className="px-2 py-0.5 rounded-md bg-[#2ecc71]/10 text-[#2ecc71] text-[10px] font-mono">
                  index.html
                </span>
              </p>
              <p className="text-[#a0a8a0] text-xs mt-0.5">
                يمكنك تخصيص العنوان، الصورة، رابط المقطع، ورابط التوجيه ثم تحميل الملف مباشرة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-4 py-2.5 bg-[#2a2e2a] hover:bg-[#2ecc71]/20 border border-[#2a2e2a] hover:border-[#2ecc71] text-[#eaeaea] font-bold rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-[#2ecc71]" />
              <span>تعديل الإعدادات</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="px-5 py-2.5 bg-[#2ecc71] hover:bg-[#1e9e57] text-[#0d0f0d] font-extrabold rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-2 shadow-lg shadow-[#2ecc71]/20"
            >
              <Download className="w-4 h-4" />
              <span>تصدير وتنزيل index.html</span>
            </button>
          </div>
        </div>

        {/* Video Player & Watch Button Section */}
        <VideoPlayer
          config={config}
          onWatchClick={handleWatchClick}
          onOpenSettings={() => setIsConfigOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2e2a] bg-[#161916]/50 py-6 text-center text-xs text-[#a0a8a0] mt-12 space-y-2">
        <p>&copy; 2026 {config.siteName || 'اسم موقعك'}. جميع الحقوق محفوظة.</p>
        <p className="text-[11px] text-[#a0a8a0]/60">
          وظيفة زر المشاهدة: فتح رابط المقطع للمستخدم وتوجيه النافذة الحالية لرابط محدد.
        </p>
      </footer>

      {/* Configuration Settings Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        config={config}
        onSave={handleSaveConfig}
        onClose={() => setIsConfigOpen(false)}
        onTestWatch={handleWatchClick}
      />

      {/* Export HTML Modal */}
      <ExportModal
        isOpen={isExportOpen}
        config={config}
        onClose={() => setIsExportOpen(false)}
        onUpdateConfig={handleSaveConfig}
      />

      {/* Redirect Notification Overlay */}
      <RedirectNotice
        isVisible={isRedirecting}
        videoUrl={config.videoUrl}
        redirectUrl={config.redirectUrl}
        onCancel={() => setIsRedirecting(false)}
      />
    </div>
  );
}

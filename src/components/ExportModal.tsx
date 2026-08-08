import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Code2, Sparkles, Folder, FolderPlus, Link as LinkIcon, Film, Image as ImageIcon, Zap, Info, Layers, Server, Globe, FileArchive } from 'lucide-react';
import { VideoConfig } from '../types';
import { generateStandaloneHtml } from '../utils/generateHtml';
import { downloadDataUrlAsFile, exportProjectAsZip } from '../utils/mediaFolder';
import { uploadMediaToServer } from '../utils/uploadService';

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
  const [isHosting, setIsHosting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

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

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const rawData = config.rawMediaDataUrl || (config.thumbnailUrl.startsWith('data:') ? config.thumbnailUrl : '');
      const cleanFileName = config.mediaFileName || (config.mediaType === 'video' ? 'video.mp4' : config.mediaType === 'gif' ? 'animation.gif' : 'thumbnail.jpg');
      
      await exportProjectAsZip(htmlCode, rawData, cleanFileName, 'media');
    } catch (err) {
      console.error('Failed to create ZIP export:', err);
      alert('حدث خطأ أثناء حزم الملفات في ZIP. يمكنك تنزيل ملف index.html والملف بشكل منفصل.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadMediaAsset = () => {
    const rawData = config.rawMediaDataUrl || (config.thumbnailUrl.startsWith('data:') ? config.thumbnailUrl : '');
    if (!rawData) {
      alert('لا يوجد ملف وسائط محلي للتحميل. استخدم رابط مباشر أو ارفع ملف من جهازك.');
      return;
    }

    let defaultName = config.mediaFileName || 'video.mp4';
    if (config.thumbnailUrl.startsWith('media/')) {
      defaultName = config.thumbnailUrl.replace('media/', '');
    }

    downloadDataUrlAsFile(rawData, defaultName);
  };

  const handleSetHostedMode = async () => {
    const origin = window.location.origin;
    const cleanName = config.mediaFileName || (config.mediaType === 'video' ? 'video.mp4' : config.mediaType === 'gif' ? 'animation.gif' : 'thumbnail.jpg');

    // If it's already an upload URL hosted on the server
    if (config.thumbnailUrl.includes('/uploads/')) {
      if (!config.thumbnailUrl.startsWith('http')) {
        onUpdateConfig({
          ...config,
          thumbnailUrl: `${origin}${config.thumbnailUrl.startsWith('/') ? '' : '/'}${config.thumbnailUrl}`,
        });
      }
      return;
    }

    const rawData = config.rawMediaDataUrl || (config.thumbnailUrl.startsWith('data:') ? config.thumbnailUrl : '');

    if (rawData) {
      setIsHosting(true);
      try {
        const mimeType = config.mediaType === 'video' ? 'video/mp4' : config.mediaType === 'gif' ? 'image/gif' : 'image/jpeg';
        const res = await uploadMediaToServer(rawData, cleanName, mimeType);
        if (res && res.hostedUrl) {
          onUpdateConfig({
            ...config,
            thumbnailUrl: res.hostedUrl,
          });
        }
      } catch (err) {
        // Fallback to absolute URL
        onUpdateConfig({
          ...config,
          thumbnailUrl: `${origin}/uploads/${cleanName}`,
        });
      } finally {
        setIsHosting(false);
      }
    } else if (config.thumbnailUrl.startsWith('http://') || config.thumbnailUrl.startsWith('https://')) {
      // External link, keep as is
      return;
    } else {
      // Short path like media/video.mp4
      onUpdateConfig({
        ...config,
        thumbnailUrl: `${origin}/uploads/${cleanName}`,
      });
    }
  };

  const handleSetShortPathMode = () => {
    let fileName = config.mediaFileName || (config.mediaType === 'video' ? 'video.mp4' : config.mediaType === 'gif' ? 'animation.gif' : 'thumbnail.jpg');
    if (!fileName.includes('.')) {
      fileName += config.mediaType === 'video' ? '.mp4' : config.mediaType === 'gif' ? '.gif' : '.jpg';
    }
    const shortPath = `media/${fileName}`;
    onUpdateConfig({
      ...config,
      thumbnailUrl: shortPath,
      mediaFolder: 'media',
      mediaFileName: fileName,
    });
  };

  const handleSetBase64Mode = () => {
    if (config.rawMediaDataUrl) {
      onUpdateConfig({
        ...config,
        thumbnailUrl: config.rawMediaDataUrl,
      });
    }
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
              {/* Short Relative Media Link & Folder Setup Card */}
              <div className="bg-[#0d0f0d] border border-[#2ecc71]/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#2a2e2a] pb-2">
                  <span className="text-xs font-bold text-[#2ecc71] flex items-center gap-1.5">
                    <Folder className="w-4 h-4" />
                    <span>طريقة رابط وسائط السكريبت المصدَّر (Short Media Link):</span>
                  </span>
                  <span className="text-[10px] bg-[#2ecc71]/10 text-[#2ecc71] px-2 py-0.5 rounded font-mono font-bold">
                    {config.thumbnailUrl.startsWith('media/') ? 'مسار مجلد نسبي قصير' : config.thumbnailUrl.startsWith('data:') ? 'تدميج Base64' : 'رابط URL مباشر'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={handleSetHostedMode}
                    disabled={isHosting}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer space-y-1 ${
                      config.thumbnailUrl.includes('/uploads/') || config.thumbnailUrl.startsWith('http')
                        ? 'bg-[#2ecc71]/15 border-[#2ecc71] text-[#eaeaea]'
                        : 'bg-[#161916] border-[#2a2e2a] text-[#a0a8a0] hover:border-[#2ecc71]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2ecc71]">
                      <Server className="w-4 h-4" />
                      <span>{isHosting ? 'جاري الرفع والاستضافة...' : 'رابط استضافة الموقع المباشر'}</span>
                    </div>
                    <p className="text-[11px] text-[#a0a8a0] leading-relaxed">
                      رابط مباشر مستضاف على سيرفر الموقع جاهز للاستخدام الفوري
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleSetShortPathMode}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer space-y-1 ${
                      config.thumbnailUrl.startsWith('media/')
                        ? 'bg-[#2ecc71]/15 border-[#2ecc71] text-[#eaeaea]'
                        : 'bg-[#161916] border-[#2a2e2a] text-[#a0a8a0] hover:border-[#2ecc71]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2ecc71]">
                      <FolderPlus className="w-4 h-4" />
                      <span>مسار مجلد نسبي قصير</span>
                    </div>
                    <p className="text-[11px] text-[#a0a8a0] leading-relaxed">
                      مسار نظيف وقصير مثل: <code className="text-emerald-300 font-mono">media/{config.mediaFileName || 'video.mp4'}</code>
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleSetBase64Mode}
                    disabled={!config.rawMediaDataUrl && !config.thumbnailUrl.startsWith('data:')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer space-y-1 ${
                      config.thumbnailUrl.startsWith('data:')
                        ? 'bg-[#2ecc71]/15 border-[#2ecc71] text-[#eaeaea]'
                        : 'bg-[#161916] border-[#2a2e2a] text-[#a0a8a0] hover:border-[#2ecc71]/50 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2ecc71]">
                      <Zap className="w-4 h-4" />
                      <span>تضمين ملف واحد (Base64)</span>
                    </div>
                    <p className="text-[11px] text-[#a0a8a0] leading-relaxed">
                      دمج الوسائط داخل كود HTML بدون ملفات إضافية
                    </p>
                  </button>
                </div>

                {/* Folder Structure Preview Box */}
                {config.thumbnailUrl.startsWith('media/') && (
                  <div className="p-3 bg-[#161916] border border-[#2a2e2a] rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#2ecc71]">
                      <span className="font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>هيكلية مجلد المشروع المطلوب وضعها في الاستضافة:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleDownloadZip}
                          disabled={isZipping}
                          className="px-2.5 py-1 bg-[#2ecc71] hover:bg-[#1e9e57] text-[#0d0f0d] text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1"
                        >
                          <FileArchive className="w-3.5 h-3.5" />
                          <span>تحميل حزمة ZIP كاملة</span>
                        </button>
                        {config.rawMediaDataUrl && (
                          <button
                            type="button"
                            onClick={handleDownloadMediaAsset}
                            className="px-2 py-1 bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#eaeaea] text-[11px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5 text-[#2ecc71]" />
                            <span>الملف المرفق</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <pre className="p-2.5 bg-[#0d0f0d] rounded text-[11px] font-mono text-emerald-300 dir-ltr text-left">
{`📁 project/
├── 📄 index.html
└── 📁 media/
    └── 🎬 ${config.mediaFileName || 'video.mp4'}`}
                    </pre>
                  </div>
                )}
              </div>

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
                    <span className="text-[#a0a8a0] block text-[11px]">رابط الوسائط المصدَّر (Image / Video Path):</span>
                    <input
                      type="text"
                      value={config.thumbnailUrl}
                      onChange={(e) => onUpdateConfig({ ...config, thumbnailUrl: e.target.value })}
                      placeholder="media/video.mp4"
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-[#2a2e2a]/60 hover:bg-[#2a2e2a] text-[#a0a8a0] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              إغلاق
            </button>

            <button
              onClick={handleDownloadFile}
              className="px-4 py-2.5 bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#eaeaea] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-[#2a2e2a]"
              title="تحميل ملف index.html فقط"
            >
              <FileCode className="w-4 h-4 text-[#2ecc71]" />
              <span>index.html فقط</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-5 py-2.5 bg-[#2ecc71] hover:bg-[#1e9e57] text-[#0d0f0d] text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#2ecc71]/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
              title="تنزيل حزمة مضغوطة تحتوي على index.html ومجلد media مع كافة الوسائط"
            >
              <FileArchive className="w-4 h-4" />
              <span>{isZipping ? 'جاري تجهيز الـ ZIP...' : 'تحميل حزمة المشروع (ZIP مع مجلد media)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

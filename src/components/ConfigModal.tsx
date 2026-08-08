import React, { useState, useRef, useEffect } from 'react';
import { X, Save, RefreshCw, Sparkles, Link2, ExternalLink, ArrowRightLeft, Image as ImageIcon, Type, FileText, Upload, Film, FileImage, Check, Trash2, Eraser, RotateCcw, Zap, Info, Globe, Server, Copy, HardDrive, Eye } from 'lucide-react';
import { VideoConfig, Preset } from '../types';
import { PRESETS, BLANK_CONFIG, DEFAULT_CONFIG } from '../data/presets';
import { compressImageFile } from '../utils/imageCompressor';
import { uploadMediaToServer, fetchStoredMediaList, deleteStoredMediaFile, StoredMediaFile } from '../utils/uploadService';

interface ConfigModalProps {
  isOpen: boolean;
  config: VideoConfig;
  onSave: (newConfig: VideoConfig) => void;
  onClose: () => void;
  onTestWatch: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  config,
  onSave,
  onClose,
  onTestWatch,
}) => {
  const [formData, setFormData] = useState<VideoConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'urls' | 'meta' | 'server_media' | 'presets'>('urls');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStats, setUploadStats] = useState<{
    size: string;
    originalSize: string;
    savedRatio: string;
  } | null>(null);

  // Server Media Manager state
  const [storedMediaList, setStoredMediaList] = useState<StoredMediaFile[]>([]);
  const [isLoadingMediaList, setIsLoadingMediaList] = useState<boolean>(false);
  const [selectedFileSuccess, setSelectedFileSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadServerMediaList = async () => {
    setIsLoadingMediaList(true);
    try {
      const list = await fetchStoredMediaList();
      // Combine uploads and media avoiding duplicates
      const map = new Map<string, StoredMediaFile>();
      (list.uploads || []).forEach(f => map.set(f.fileName, f));
      (list.media || []).forEach(f => {
        if (!map.has(f.fileName)) map.set(f.fileName, f);
      });
      setStoredMediaList(Array.from(map.values()));
    } catch (err) {
      console.error('Error fetching server media list:', err);
    } finally {
      setIsLoadingMediaList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadServerMediaList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof VideoConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (preset: Preset) => {
    setFormData((prev) => ({
      ...prev,
      siteName: preset.siteName,
      videoTitle: preset.videoTitle,
      videoUrl: preset.videoUrl,
      redirectUrl: preset.redirectUrl,
      thumbnailUrl: preset.thumbnailUrl,
      mediaType: preset.mediaType || 'image',
      description: preset.description,
    }));
    setUploadStats(null);
  };

  const handleClearScratch = () => {
    setFormData(BLANK_CONFIG);
    setFileName('');
    setUploadStats(null);
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_CONFIG);
    setFileName('');
    setUploadStats(null);
  };

  // Handle local File Upload (Image, GIF, MP4/WebM Video)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      const res = await compressImageFile(file, 1000, 0.75);

      let detectedType: 'image' | 'gif' | 'video' = 'image';
      if (file.type.startsWith('video/')) {
        detectedType = 'video';
      } else if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
        detectedType = 'gif';
      } else {
        detectedType = 'image';
      }

      const cleanName = file.name.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');

      // Attempt uploading to server host storage (/api/upload -> /uploads/filename)
      let finalUrl = `media/${cleanName}`;
      try {
        const uploadRes = await uploadMediaToServer(res.dataUrl, cleanName, file.type);
        if (uploadRes && (uploadRes.hostedUrl || uploadRes.mediaUrl)) {
          finalUrl = uploadRes.hostedUrl || uploadRes.mediaUrl || `/uploads/${uploadRes.fileName}`;
        }
      } catch (uploadErr) {
        console.warn('Server upload fallback to local preview buffer', uploadErr);
      }

      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: finalUrl, // Direct Relative Hosted URL on server
        rawMediaDataUrl: res.dataUrl, // Buffer for offline/local fallback
        mediaFolder: 'media',
        mediaFileName: cleanName,
        mediaType: detectedType,
      }));

      setUploadStats({
        size: res.sizeFormatted,
        originalSize: res.originalSizeFormatted,
        savedRatio: res.compressionRatio,
      });

      // Refresh server media list
      await loadServerMediaList();
    } catch (err) {
      alert('حدث خطأ أثناء رفع وتحليل الملف. يرجى محاولة ملف آخر.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectServerFile = (file: StoredMediaFile) => {
    let detectedType: 'image' | 'gif' | 'video' = 'image';
    const lowerName = file.fileName.toLowerCase();
    if (lowerName.endsWith('.mp4') || lowerName.endsWith('.webm')) {
      detectedType = 'video';
    } else if (lowerName.endsWith('.gif')) {
      detectedType = 'gif';
    } else {
      detectedType = 'image';
    }

    setFormData((prev) => ({
      ...prev,
      thumbnailUrl: file.path, // relative path e.g. /uploads/123_foxy.png
      rawMediaDataUrl: '',
      mediaFileName: file.fileName,
      mediaType: detectedType,
    }));

    setSelectedFileSuccess(file.fileName);
    setTimeout(() => setSelectedFileSuccess(null), 3000);
  };

  const handleDeleteServerFile = async (fileNameToDelete: string) => {
    if (!confirm(`هل أنت تأكد من حذف الملف (${fileNameToDelete}) من سيرفر الموقع؟`)) return;

    const ok = await deleteStoredMediaFile(fileNameToDelete);
    if (ok) {
      await loadServerMediaList();
    } else {
      alert('تعذر حذف الملف من السيرفر.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0f0d]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#161916] border-2 border-[#2ecc71]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e2a] bg-[#0d0f0d]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#2ecc71]/10 text-[#2ecc71]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#eaeaea]">إعدادات رابط المشاهدة الوسائط والروابط</h3>
              <p className="text-xs text-[#a0a8a0]">تخصيص المقطع، الصورة/GIF، ورابط التوجيه المنبثق</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a0a8a0] hover:text-[#eaeaea] hover:bg-[#2a2e2a] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-[#2a2e2a] bg-[#0d0f0d]/50 px-6 pt-2 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('urls')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'urls'
                ? 'border-[#2ecc71] text-[#2ecc71] bg-[#161916]'
                : 'border-transparent text-[#a0a8a0] hover:text-[#eaeaea]'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>الروابط والتوجيه</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('meta')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'meta'
                ? 'border-[#2ecc71] text-[#2ecc71] bg-[#161916]'
                : 'border-transparent text-[#a0a8a0] hover:text-[#eaeaea]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>رفع ملف جديد</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('server_media');
              loadServerMediaList();
            }}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'server_media'
                ? 'border-[#2ecc71] text-[#2ecc71] bg-[#161916]'
                : 'border-transparent text-[#a0a8a0] hover:text-[#eaeaea]'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>مكتبة السيرفر ({storedMediaList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
              activeTab === 'presets'
                ? 'border-[#2ecc71] text-[#2ecc71] bg-[#161916]'
                : 'border-transparent text-[#a0a8a0] hover:text-[#eaeaea]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>نماذج جاهزة</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'urls' && (
            <div className="space-y-5">
              {/* Target Video URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#eaeaea] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#2ecc71]">
                    <ExternalLink className="w-4 h-4" />
                    <span>رابط الفيديو المراد تشغيله للمستخدم (تبويب جديد):</span>
                  </span>
                  <span className="text-[10px] text-[#a0a8a0] font-normal">window.open</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => handleChange('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] dir-ltr text-right focus:outline-none transition-all font-mono"
                />
                <p className="text-[11px] text-[#a0a8a0]">
                  هذا هو المقطع أو الموقع الذي سيفتحه زر المشاهدة للمستخدم فوراً في نافذة جديدة.
                </p>
              </div>

              {/* Redirect URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#eaeaea] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>رابط إعادة توجيه الصفحة الحالية (Redirect URL):</span>
                  </span>
                  <span className="text-[10px] text-[#a0a8a0] font-normal">window.location.href</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.redirectUrl}
                  onChange={(e) => handleChange('redirectUrl', e.target.value)}
                  placeholder="https://www.google.com"
                  className="w-full px-3.5 py-2.5 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] dir-ltr text-right focus:outline-none transition-all font-mono"
                />
                <p className="text-[11px] text-[#a0a8a0]">
                  هذا هو الرابط الذي سيتم توجيه الصفحة الحالية إليه عند نقر الزر.
                </p>
              </div>

              {/* Button text customization */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#eaeaea]">نص زر المشاهدة (Button Label):</label>
                <input
                  type="text"
                  value={formData.buttonText || '▶ مشاهدة الفيديو'}
                  onChange={(e) => handleChange('buttonText', e.target.value)}
                  placeholder="▶ مشاهدة الفيديو"
                  className="w-full px-3.5 py-2.5 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] focus:outline-none transition-all"
                />
              </div>

              {/* Delay & Timing Options */}
              <div className="p-4 bg-[#0d0f0d] border border-[#2a2e2a] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#eaeaea]">تأخير التوجيه (بالملي ثانية):</span>
                  <span className="text-xs font-mono text-[#2ecc71]">{formData.delayRedirectMs}ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={formData.delayRedirectMs}
                  onChange={(e) => handleChange('delayRedirectMs', Number(e.target.value))}
                  className="w-full accent-[#2ecc71] cursor-pointer"
                />
                <p className="text-[10px] text-[#a0a8a0]">
                  تأخير طفيف (100-200ms) يضمن فتح النافذة المنبثقة أولاً بسلاسة قبل التحويل.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-5">
              {/* Media Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#eaeaea] block">نوع الوسائط المقترحة:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange('mediaType', 'image')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.mediaType === 'image'
                        ? 'bg-[#2ecc71]/15 border-[#2ecc71] text-[#2ecc71]'
                        : 'bg-[#0d0f0d] border-[#2a2e2a] text-[#a0a8a0] hover:text-[#eaeaea]'
                    }`}
                  >
                    <FileImage className="w-4 h-4" />
                    <span>صورة (Image)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('mediaType', 'gif')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.mediaType === 'gif'
                        ? 'bg-[#2ecc71]/15 border-[#2ecc71] text-[#2ecc71]'
                        : 'bg-[#0d0f0d] border-[#2a2e2a] text-[#a0a8a0] hover:text-[#eaeaea]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>متحركة (GIF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChange('mediaType', 'video')}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.mediaType === 'video'
                        ? 'bg-[#2ecc71]/15 border-[#2ecc71] text-[#2ecc71]'
                        : 'bg-[#0d0f0d] border-[#2a2e2a] text-[#a0a8a0] hover:text-[#eaeaea]'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>فيديو (Video)</span>
                  </button>
                </div>
              </div>

              {/* Upload Mode Selector: Local File vs URL */}
              <div className="space-y-3 p-4 bg-[#0d0f0d] border border-[#2a2e2a] rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#eaeaea]">طريقة إضافة الوسائط:</span>
                  <div className="flex bg-[#161916] border border-[#2a2e2a] p-1 rounded-lg gap-1">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        uploadMode === 'file'
                          ? 'bg-[#2ecc71] text-[#0d0f0d]'
                          : 'text-[#a0a8a0] hover:text-[#eaeaea]'
                      }`}
                    >
                      تحميل ملف من الجهاز
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        uploadMode === 'url'
                          ? 'bg-[#2ecc71] text-[#0d0f0d]'
                          : 'text-[#a0a8a0] hover:text-[#eaeaea]'
                      }`}
                    >
                      إدخال رابط URL
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,video/*,.gif"
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#2a2e2a] hover:border-[#2ecc71] rounded-xl p-6 text-center cursor-pointer transition-all bg-[#161916]/50 hover:bg-[#2ecc71]/5 group space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#2ecc71]/10 border border-[#2ecc71]/30 mx-auto flex items-center justify-center text-[#2ecc71] group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#eaeaea]">
                          {isUploading ? 'جاري رفع الملف وحفظه في السيرفر...' : 'اضغط هنا لاختيار صورة، GIF، أو ملف فيديو من جهازك'}
                        </p>
                        <p className="text-[11px] text-[#a0a8a0] mt-1">
                          يتم رفع الملف مباشرة إلى مجلدات السيرفر (/uploads & /media) ليكون متاحاً ومستضافاً فوراً
                        </p>
                      </div>
                    </div>

                    {fileName && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-[#161916] border border-[#2ecc71]/30 rounded-lg text-xs">
                          <span className="text-[#2ecc71] font-bold flex items-center gap-1.5 truncate">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>الملف المحمل: {fileName}</span>
                          </span>
                          <span className="text-[10px] text-[#a0a8a0] bg-[#0d0f0d] px-2 py-0.5 rounded uppercase font-semibold">
                            {formData.mediaType}
                          </span>
                        </div>

                        {formData.thumbnailUrl && (
                          <div className="p-3 bg-[#2ecc71]/10 border border-[#2ecc71]/40 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs text-[#2ecc71]">
                              <span className="font-bold flex items-center gap-1.5">
                                <Server className="w-4 h-4 shrink-0" />
                                <span>تم رفع الملف ومستضاف بنجاح على سيرفر الموقع</span>
                              </span>
                              <span className="text-[10px] bg-[#2ecc71] text-[#0d0f0d] font-bold px-2 py-0.5 rounded">
                                مباشر LIVE
                              </span>
                            </div>
                            <div className="p-2 bg-[#0d0f0d] border border-[#2a2e2a] rounded-lg flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono text-emerald-300 truncate dir-ltr text-left flex-1">
                                {formData.thumbnailUrl}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(formData.thumbnailUrl);
                                  alert('تم نسخ رابط الاستضافة المباشر إلى الحافظة!');
                                }}
                                className="p-1.5 bg-[#2ecc71]/20 hover:bg-[#2ecc71]/30 text-[#2ecc71] rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                title="نسخ رابط الاستضافة المباشر"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">نسخ الرابط</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {uploadStats && (
                          <div className="p-2.5 bg-[#161916] border border-[#2a2e2a] rounded-lg text-xs text-[#a0a8a0] flex items-center gap-2">
                            <Zap className="w-4 h-4 shrink-0 text-[#2ecc71]" />
                            <div className="flex-1 text-[11px] leading-relaxed">
                              <span className="font-bold text-[#2ecc71]">حجم الملف: </span>
                              <span><b>{uploadStats.size}</b></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-[#a0a8a0] font-bold">رابط الوسائط (Image / Video URL / Short Path):</label>
                      {formData.thumbnailUrl.startsWith('media/') && (
                        <span className="text-[10px] text-[#2ecc71] font-semibold bg-[#2ecc71]/10 px-2 py-0.5 rounded">
                          مسار مجلد نسبي قصير
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                      placeholder="/uploads/file.png أو media/video.mp4"
                      className="w-full px-3.5 py-2.5 bg-[#161916] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] dir-ltr text-right focus:outline-none transition-all font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Link to Server Media Gallery */}
              <div className="p-3 bg-[#0d0f0d] border border-[#2a2e2a] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#a0a8a0]">
                  <HardDrive className="w-4 h-4 text-[#2ecc71]" />
                  <span>تصفح وتحديد من ملفات السيرفر المرفوعة سابقاً ({storedMediaList.length} ملف)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('server_media');
                    loadServerMediaList();
                  }}
                  className="px-3 py-1.5 bg-[#2ecc71]/10 hover:bg-[#2ecc71]/20 border border-[#2ecc71]/30 text-[#2ecc71] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>فتح المكتبة</span>
                </button>
              </div>

              {/* Site Name & Video Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#eaeaea]">اسم الموقع:</label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    placeholder="مثال: موقعي المميز"
                    className="w-full px-3.5 py-2 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#eaeaea]">عنوان الفيديو المقترح:</label>
                  <input
                    type="text"
                    value={formData.videoTitle}
                    onChange={(e) => handleChange('videoTitle', e.target.value)}
                    placeholder="عنوان الفيديو..."
                    className="w-full px-3.5 py-2 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#eaeaea]">الوصف:</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="الوصف..."
                  className="w-full px-3.5 py-2 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* SERVER MEDIA GALLERY TAB */}
          {activeTab === 'server_media' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0d0f0d] border border-[#2a2e2a] rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2ecc71]">
                  <HardDrive className="w-4 h-4" />
                  <span>ملفات الوسائط المرفوعة والمستضافة بالسيرفر ({storedMediaList.length})</span>
                </div>
                <button
                  type="button"
                  onClick={loadServerMediaList}
                  disabled={isLoadingMediaList}
                  className="px-2.5 py-1 bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#eaeaea] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#2ecc71] ${isLoadingMediaList ? 'animate-spin' : ''}`} />
                  <span>تحديث القائمة</span>
                </button>
              </div>

              {selectedFileSuccess && (
                <div className="p-3 bg-[#2ecc71]/20 border border-[#2ecc71] text-[#2ecc71] text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>تم تحديد وتطبيق الملف ({selectedFileSuccess}) بنجاح للمعاينة!</span>
                </div>
              )}

              {isLoadingMediaList ? (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#2ecc71] mx-auto" />
                  <p className="text-xs text-[#a0a8a0]">جاري تحميل ملفات السيرفر...</p>
                </div>
              ) : storedMediaList.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-[#2a2e2a] rounded-xl text-center space-y-3 bg-[#0d0f0d]/50">
                  <Server className="w-10 h-10 text-[#a0a8a0] mx-auto opacity-50" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#eaeaea]">لا توجد ملفات مرفوعة بالسيرفر حالياً</p>
                    <p className="text-[11px] text-[#a0a8a0]">
                      يمكنك رفع الصور، الصور المتحركة، أو الفيديوهات من تبويب (رفع ملف جديد) وتظهر هنا مباشرة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('meta')}
                    className="px-4 py-2 bg-[#2ecc71] text-[#0d0f0d] text-xs font-bold rounded-xl hover:bg-[#1e9e57] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>رفع ملف الآن</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {storedMediaList.map((file) => {
                    const isVideo = file.fileName.toLowerCase().endsWith('.mp4') || file.fileName.toLowerCase().endsWith('.webm');
                    const isSelected = formData.thumbnailUrl === file.path || formData.thumbnailUrl === file.url;

                    return (
                      <div
                        key={file.fileName}
                        className={`bg-[#0d0f0d] border rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                          isSelected ? 'border-[#2ecc71] shadow-lg shadow-[#2ecc71]/20' : 'border-[#2a2e2a] hover:border-[#2ecc71]/50'
                        }`}
                      >
                        {/* Preview */}
                        <div className="relative w-full h-28 bg-black flex items-center justify-center overflow-hidden">
                          {isVideo ? (
                            <video
                              src={file.path}
                              controls
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={file.path}
                              alt={file.fileName}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#2ecc71] text-[#0d0f0d] text-[10px] font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>محدد حالياً</span>
                            </div>
                          )}
                        </div>

                        {/* File details */}
                        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-[#eaeaea] truncate dir-ltr text-right" title={file.fileName}>
                              {file.fileName}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-[#a0a8a0]">
                              <code className="text-[#2ecc71] font-mono">{file.path}</code>
                              <span>{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSelectServerFile(file)}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isSelected
                                  ? 'bg-[#2ecc71] text-[#0d0f0d]'
                                  : 'bg-[#2ecc71]/15 hover:bg-[#2ecc71]/30 text-[#2ecc71]'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isSelected ? 'محدد' : 'تحديد'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}${file.path}`);
                                alert('تم نسخ رابط الملف إلى الحافظة!');
                              }}
                              className="p-1.5 bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#eaeaea] rounded-lg text-xs transition-all cursor-pointer"
                              title="نسخ الرابط"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteServerFile(file.fileName)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-all cursor-pointer"
                              title="حذف الملف من السيرفر"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Quick Reset & Clear Scratch controls */}
              <div className="p-3.5 bg-[#0d0f0d] border border-[#2a2e2a] rounded-xl flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#eaeaea]">إعادة التهيئة والسجلات:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearScratch}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="مسح كافة البيانات للبدء من الصفر"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>مسح للبدء من الصفر (Scratch)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-3 py-1.5 rounded-lg bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#eaeaea] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    title="استعادة البيانات الافتراضية"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#2ecc71]" />
                    <span>استعادة الافتراضي</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#a0a8a0]">
                أو اختر نموذجاً جاهزاً لتجربة التوجيه المزدوج فوراً:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3.5 bg-[#0d0f0d] border border-[#2a2e2a] hover:border-[#2ecc71] rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#2ecc71]/5 space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2ecc71] group-hover:underline flex items-center gap-1">
                        <span>{preset.label}</span>
                      </span>
                      <span className="text-[10px] bg-[#2a2e2a] text-[#a0a8a0] px-2 py-0.5 rounded">
                        تطبيق
                      </span>
                    </div>
                    <p className="text-xs text-[#eaeaea] font-medium">{preset.videoTitle}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#a0a8a0] font-mono dir-ltr justify-end">
                      <span>➔ {preset.redirectUrl}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer controls inside modal */}
          <div className="pt-4 border-t border-[#2a2e2a] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onSave(formData);
                onClose();
                onTestWatch();
              }}
              className="px-4 py-2 bg-[#2a2e2a] hover:bg-[#2ecc71]/20 hover:border-[#2ecc71] border border-[#2a2e2a] text-[#2ecc71] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>حفظ وتجربة التشغيل فوراً</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#2a2e2a] hover:bg-[#2a2e2a]/80 text-[#a0a8a0] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2ecc71] hover:bg-[#1e9e57] text-[#0d0f0d] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#2ecc71]/20"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التغيرات</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


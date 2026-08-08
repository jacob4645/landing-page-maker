import React, { useState, useRef } from 'react';
import { X, Save, RefreshCw, Sparkles, Link2, ExternalLink, ArrowRightLeft, Image as ImageIcon, Type, FileText, Upload, Film, FileImage, Check, Trash2, Eraser, RotateCcw, Zap, Info } from 'lucide-react';
import { VideoConfig, Preset } from '../types';
import { PRESETS, BLANK_CONFIG, DEFAULT_CONFIG } from '../data/presets';
import { compressImageFile } from '../utils/imageCompressor';

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
  const [activeTab, setActiveTab] = useState<'urls' | 'meta' | 'presets'>('urls');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStats, setUploadStats] = useState<{
    size: string;
    originalSize: string;
    savedRatio: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const relativePath = `media/${cleanName}`;

      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: relativePath, // Short clean path for the script!
        rawMediaDataUrl: res.dataUrl, // Buffer for live web app preview
        mediaFolder: 'media',
        mediaFileName: cleanName,
        mediaType: detectedType,
      }));

      setUploadStats({
        size: res.sizeFormatted,
        originalSize: res.originalSizeFormatted,
        savedRatio: res.compressionRatio,
      });
    } catch (err) {
      alert('حدث خطأ أثناء رفع وتحليل الملف. يرجى محاولة ملف آخر.');
    } finally {
      setIsUploading(false);
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
        <div className="flex border-b border-[#2a2e2a] bg-[#0d0f0d]/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('urls')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
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
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'meta'
                ? 'border-[#2ecc71] text-[#2ecc71] bg-[#161916]'
                : 'border-transparent text-[#a0a8a0] hover:text-[#eaeaea]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>رفع الصورة / الفيديو / GIF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
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
                          اضغط هنا لاختيار صورة، GIF، أو ملف فيديو من جهازك
                        </p>
                        <p className="text-[11px] text-[#a0a8a0] mt-1">
                          يدعم صيغ MP4, WEBM, GIF, PNG, JPG, WEBP (يتم تحويل الملف تلقائياً ليكون مدمجاً جاهزاً للتصدير)
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

                        {uploadStats && (
                          <div className="p-2.5 bg-[#2ecc71]/10 border border-[#2ecc71]/30 rounded-lg text-xs text-[#2ecc71] flex items-center gap-2">
                            <Zap className="w-4 h-4 shrink-0 text-[#2ecc71]" />
                            <div className="flex-1 text-[11px] leading-relaxed">
                              <span className="font-bold">تم ضغط الصورة ذكياً: </span>
                              <span>من {uploadStats.originalSize} إلى <b>{uploadStats.size}</b> (وفرت {uploadStats.savedRatio} من الحجم!)</span>
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
                      {formData.thumbnailUrl.startsWith('data:') && (
                        <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded">
                          ملف مدمج (Base64)
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                      placeholder="media/video.mp4 أو https://..."
                      className="w-full px-3.5 py-2.5 bg-[#161916] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] dir-ltr text-right focus:outline-none transition-all font-mono"
                    />

                    {/* Quick Short Relative Path Shortcuts */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-[#a0a8a0] block font-bold">اختصارات الروابط القصيرة (Short Media Paths):</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('thumbnailUrl', 'media/video.mp4');
                            handleChange('mediaType', 'video');
                          }}
                          className="px-2.5 py-1 bg-[#161916] hover:bg-[#2ecc71]/15 border border-[#2a2e2a] hover:border-[#2ecc71] text-[11px] text-[#eaeaea] rounded-lg font-mono transition-all cursor-pointer dir-ltr"
                        >
                          media/video.mp4
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('thumbnailUrl', 'media/thumbnail.jpg');
                            handleChange('mediaType', 'image');
                          }}
                          className="px-2.5 py-1 bg-[#161916] hover:bg-[#2ecc71]/15 border border-[#2a2e2a] hover:border-[#2ecc71] text-[11px] text-[#eaeaea] rounded-lg font-mono transition-all cursor-pointer dir-ltr"
                        >
                          media/thumbnail.jpg
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleChange('thumbnailUrl', 'media/animation.gif');
                            handleChange('mediaType', 'gif');
                          }}
                          className="px-2.5 py-1 bg-[#161916] hover:bg-[#2ecc71]/15 border border-[#2a2e2a] hover:border-[#2ecc71] text-[11px] text-[#eaeaea] rounded-lg font-mono transition-all cursor-pointer dir-ltr"
                        >
                          media/animation.gif
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

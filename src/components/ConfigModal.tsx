import React, { useState } from 'react';
import { X, Save, RefreshCw, Sparkles, Link2, ExternalLink, ArrowRightLeft, Image, Type, FileText } from 'lucide-react';
import { VideoConfig, Preset } from '../types';
import { PRESETS } from '../data/presets';

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
      description: preset.description,
    }));
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
              <h3 className="text-lg font-bold text-[#eaeaea]">إعدادات رابط المشاهدة والتوجيه</h3>
              <p className="text-xs text-[#a0a8a0]">تخصيص رابط المقطع المنبثق ورابط إعادة التوجيه</p>
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
            <span>الروابط والأداء</span>
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
            <Type className="w-4 h-4" />
            <span>العنوان والوصف والصورة</span>
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
                    <span>رابط الفيديو (يفتح للمستخدم في تبويب جديد):</span>
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
                  هذا هو المقطع الذي يفتحه زر "مشاهدة الفيديو" للمستخدم في نافذة جديدة.
                </p>
              </div>

              {/* Redirect URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#eaeaea] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>رابط إعادة توجيه الصفحة الحالية:</span>
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
                  هذا هو الرابط الذي سيتم توجيه النافذة الحالية إليه عند نقر زر المشاهدة.
                </p>
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
                  تأخير طفيف (100-200ms) يضمن فتح النافذة المنبثقة أولاً بسلاسة قبل الانتقال بالصفحة الحالية.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-4">
              {/* Site Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#eaeaea]">اسم الموقع:</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  placeholder="مثال: موقعي المميز"
                  className="w-full px-3.5 py-2.5 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] focus:outline-none transition-all"
                />
              </div>

              {/* Video Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#eaeaea]">عنوان الفيديو المقترح:</label>
                <input
                  type="text"
                  value={formData.videoTitle}
                  onChange={(e) => handleChange('videoTitle', e.target.value)}
                  placeholder="عنوان الفيديو..."
                  className="w-full px-3.5 py-2.5 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] focus:outline-none transition-all"
                />
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#eaeaea]">رابط الصورة المصغرة (Thumbnail):</label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] dir-ltr text-right focus:outline-none transition-all font-mono"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#eaeaea]">وصف الفيديو:</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="الوصف..."
                  className="w-full px-3.5 py-2.5 bg-[#0d0f0d] border border-[#2a2e2a] focus:border-[#2ecc71] rounded-xl text-xs text-[#eaeaea] focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-[#a0a8a0]">
                اختر نموذجاً جاهزاً لتجربة التوجيه المزدوج فوراً:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3.5 bg-[#0d0f0d] border border-[#2a2e2a] hover:border-[#2ecc71] rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#2ecc71]/5 space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2ecc71] group-hover:underline">
                        {preset.label}
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

import React, { useState } from 'react';
import { Play, ExternalLink, ArrowRightLeft, ShieldAlert, Sparkles, Film, Info, Image as ImageIcon } from 'lucide-react';
import { VideoConfig } from '../types';

interface VideoPlayerProps {
  config: VideoConfig;
  onWatchClick: () => void;
  onOpenSettings: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  config,
  onWatchClick,
  onOpenSettings,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [imgError, setImgError] = useState(false);

  const mediaType = config.mediaType || 'image';
  const buttonLabel = config.buttonText || '▶ مشاهدة الفيديو';

  // Helper to extract YouTube or Vimeo embed URL if applicable
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
        }
      } else if (url.includes('vimeo.com/')) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        if (match && match[1]) {
          return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(config.videoUrl);

  const isDataVideo = config.thumbnailUrl.startsWith('data:video/') || config.thumbnailUrl.endsWith('.mp4') || config.thumbnailUrl.endsWith('.webm');

  return (
    <div className="w-full space-y-8">
      {/* Video Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#eaeaea] leading-relaxed tracking-tight">
          {config.videoTitle || 'عنوان الفيديو هنا'}
        </h1>
        <p className="text-sm text-[#a0a8a0] max-w-xl mx-auto flex items-center justify-center gap-2">
          <span>اضغط على زر "{buttonLabel}" لفتح الفيديو وإعادة توجيه هذه الصفحة</span>
        </p>
      </div>

      {/* Media Wrapper */}
      <div className="relative w-full aspect-video bg-[#000] border border-[#2a2e2a] rounded-xl overflow-hidden shadow-2xl group transition-all duration-300 hover:border-[#2ecc71]/50">
        {isPlayingPreview && embedUrl ? (
          <iframe
            src={embedUrl}
            title={config.videoTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : mediaType === 'video' || isDataVideo ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              src={config.thumbnailUrl}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Top Right Tag */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-md bg-[#0d0f0d]/80 backdrop-blur-sm border border-[#2a2e2a] text-xs font-semibold text-[#2ecc71] flex items-center gap-1.5 pointer-events-none">
              <Film className="w-3.5 h-3.5" />
              <span>فيديو محمل</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-t from-[#0d0f0d] to-[#161916]">
            {/* Thumbnail Image or GIF */}
            <img
              src={imgError || !config.thumbnailUrl ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' : config.thumbnailUrl}
              alt={config.videoTitle}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f0d] via-transparent to-[#0d0f0d]/40" />

            {/* Overlay Play Icon Badge */}
            <button
              onClick={() => {
                if (embedUrl) {
                  setIsPlayingPreview(true);
                } else {
                  onWatchClick();
                }
              }}
              className="absolute z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#2ecc71]/90 hover:bg-[#2ecc71] text-[#0d0f0d] flex items-center justify-center shadow-xl shadow-[#2ecc71]/20 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer group-hover:shadow-[#2ecc71]/40"
              aria-label="معاينة الفيديو"
            >
              <Play className="w-10 h-10 md:w-12 md:h-12 fill-current translate-x-0.5" />
            </button>

            {/* Top Right Tag */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-md bg-[#0d0f0d]/80 backdrop-blur-sm border border-[#2a2e2a] text-xs font-semibold text-[#2ecc71] flex items-center gap-1.5">
              {mediaType === 'gif' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>صورة متحركة GIF</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>وسائط مقترحة</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Primary Watch Button Container */}
      <div className="flex flex-col items-center justify-center gap-4 py-2">
        <button
          onClick={onWatchClick}
          className="w-full sm:w-auto min-w-[280px] sm:min-w-[340px] px-8 py-4 bg-[#2ecc71] hover:bg-[#1e9e57] active:bg-[#188548] text-[#0d0f0d] text-lg md:text-xl font-bold rounded-xl shadow-lg shadow-[#2ecc71]/20 hover:shadow-xl hover:shadow-[#2ecc71]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 group"
        >
          <Play className="w-6 h-6 fill-current text-[#0d0f0d] group-hover:scale-110 transition-transform" />
          <span>{buttonLabel}</span>
          <ExternalLink className="w-5 h-5 text-[#0d0f0d]/80 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-xs text-[#a0a8a0] text-center max-w-md flex items-center justify-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-[#2ecc71] shrink-0" />
          <span>عند النقر، يفتح الفيديو في تبويب جديد ويتم توجيه هذه الصفحة تلقائياً</span>
        </p>
      </div>

      {/* Target Links Debug / Verification Card */}
      <div className="bg-[#161916] border border-[#2a2e2a] rounded-xl p-4 md:p-5 text-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#2a2e2a] pb-2.5">
          <div className="flex items-center gap-2 text-[#2ecc71] font-semibold">
            <Info className="w-4 h-4" />
            <span>مسارات الروابط النشطة</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs text-[#2ecc71] hover:underline flex items-center gap-1 cursor-pointer"
          >
            تغيير الروابط والوسائط
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Target Video Link */}
          <div className="bg-[#0d0f0d] p-3 rounded-lg border border-[#2a2e2a]">
            <div className="text-xs text-[#a0a8a0] mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>1. رابط الفيديو (فتح في تبويب جديد):</span>
            </div>
            <a
              href={config.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#2ecc71] hover:underline truncate block dir-ltr text-right"
              title={config.videoUrl}
            >
              {config.videoUrl || 'لم يتم تحديد رابط'}
            </a>
          </div>

          {/* Redirect Destination Link */}
          <div className="bg-[#0d0f0d] p-3 rounded-lg border border-[#2a2e2a]">
            <div className="text-xs text-[#a0a8a0] mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2ecc71]" />
              <span>2. رابط إعادة التوجيه (الصفحة الحالية):</span>
            </div>
            <a
              href={config.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-emerald-300 hover:underline truncate block dir-ltr text-right"
              title={config.redirectUrl}
            >
              {config.redirectUrl || 'لم يتم تحديد رابط'}
            </a>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-[#161916] border border-[#2a2e2a] rounded-xl p-6 space-y-3 shadow-md">
        <h2 className="text-lg font-bold text-[#2ecc71] border-b border-[#2a2e2a] pb-2">
          الوصف
        </h2>
        <p className="text-[#a0a8a0] text-sm leading-relaxed whitespace-pre-line">
          {config.description || 'اكتب هنا وصف الفيديو أو تفاصيل عن المحتوى.'}
        </p>
      </div>
    </div>
  );
};

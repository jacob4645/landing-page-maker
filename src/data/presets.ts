import { Preset, VideoConfig } from '../types';

export const BLANK_CONFIG: VideoConfig = {
  siteName: '',
  videoTitle: '',
  videoUrl: '',
  redirectUrl: '',
  thumbnailUrl: '',
  mediaType: 'image',
  buttonText: '▶ مشاهدة الفيديو',
  description: '',
  openInNewTab: true,
  delayRedirectMs: 150,
  clickCount: 0,
};

export const DEFAULT_CONFIG: VideoConfig = {
  siteName: 'منصة الفيديو المقترح',
  videoTitle: 'شاهد أقوى مقطع تحليلي للتقنية والذكاء الاصطناعي',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  redirectUrl: 'https://www.google.com',
  thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  mediaType: 'image',
  buttonText: '▶ مشاهدة الفيديو',
  description: 'هذا الفيديو يحتوي على شرح وتغطية شاملة لأحدث التقنيات وأفضل النصائح. اضغط على زر "مشاهدة الفيديو" للبدء بالتشغيل مباشرة.',
  openInNewTab: true,
  delayRedirectMs: 150,
  clickCount: 0,
};

export const PRESETS: Preset[] = [
  {
    id: 'tech-demo',
    label: 'مقطع تقني (يوتيوب ➔ جوجل)',
    siteName: 'عالم التقنية',
    videoTitle: 'مراجعة أحدث مستجدات الذكاء الاصطناعي والتصميم',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    redirectUrl: 'https://www.google.com',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    description: 'شاهد أحدث فيديو تعليمي وتقني مع توجيه تلقائي للصفحة الرئيسية للمزيد من المصادر والمعلومات.',
  },
  {
    id: 'gif-demo',
    label: 'صورة متحركة GIF (جيف ➔ موقع عام)',
    siteName: 'عالم الحركة',
    videoTitle: 'استعرض اللقطة المتحركة المميزة بدقة عالية',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    redirectUrl: 'https://www.google.com',
    thumbnailUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hxdDFiaDV5am9lZnRybTF0eXl0OTJpdG9oODg4Z29tODVvazA2biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPnAiaMCws8nOsE/giphy.gif',
    mediaType: 'gif',
    description: 'عرض متحرك بأسلوب GIF مباشر لجذب الانتباه ومتابعة التشغيل.',
  },
  {
    id: 'nature-documentary',
    label: 'وثائقي طبيعة (فيميو ➔ ويكيبيديا)',
    siteName: 'سينما الطبيعة',
    videoTitle: 'استكشاف أسرار أعماق المحيطات والغابات',
    videoUrl: 'https://vimeo.com/76979871',
    redirectUrl: 'https://ar.wikipedia.org',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    description: 'رحلة بصرية مذهلة في أعماق الطبيعة. اضغط زر المشاهدة لمتابعة الفيديو والاستكشاف.',
  },
  {
    id: 'gaming-trailer',
    label: 'عروض الألعاب (يوتيوب ➔ متجر الألعاب)',
    siteName: 'جيمرز زون',
    videoTitle: 'العرض التشويقي الأول لأحدث ألعاب الجيل الجديد',
    videoUrl: 'https://www.youtube.com/watch?v=2Gg61ptwx2e',
    redirectUrl: 'https://store.steampowered.com',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    mediaType: 'image',
    description: 'استعرض العرض التشويقي لأهم إصدارات الألعاب القادمة هذا العام.',
  }
];

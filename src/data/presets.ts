import { Preset, VideoConfig } from '../types';

export const DEFAULT_CONFIG: VideoConfig = {
  siteName: 'منصة الفيديو المقترح',
  videoTitle: 'شاهد أقوى مقطع تحليلي للتقنية والذكاء الاصطناعي',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  redirectUrl: 'https://www.google.com',
  thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
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
    description: 'شاهد أحدث فيديو تعليمي وتقني مع توجيه تلقائي للصفحة الرئيسية للمزيد من المصادر والمعلومات.',
  },
  {
    id: 'nature-documentary',
    label: 'وثائقي طبيعة (فيميو ➔ ويكيبيديا)',
    siteName: 'سينما الطبيعة',
    videoTitle: 'استكشاف أسرار أعماق المحيطات والغابات',
    videoUrl: 'https://vimeo.com/76979871',
    redirectUrl: 'https://ar.wikipedia.org',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
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
    description: 'استعرض العرض التشويقي لأهم إصدارات الألعاب القادمة هذا العام.',
  }
];

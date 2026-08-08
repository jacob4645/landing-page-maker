export interface VideoConfig {
  siteName: string;
  videoTitle: string;
  videoUrl: string; // The URL opened for the user in a new tab when clicking watch button
  redirectUrl: string; // The URL current page redirects to after clicking watch button
  thumbnailUrl: string; // Short relative path (e.g., media/video.mp4) or web URL or base64 data string
  mediaType: 'image' | 'gif' | 'video';
  mediaFolder?: string; // e.g. "media" or "assets"
  mediaFileName?: string; // e.g. "video.mp4" or "preview.jpg"
  rawMediaDataUrl?: string; // Local preview buffer when using short relative paths
  buttonText?: string;
  description: string;
  openInNewTab: boolean;
  delayRedirectMs: number;
  clickCount: number;
}

export interface Preset {
  id: string;
  label: string;
  siteName: string;
  videoTitle: string;
  videoUrl: string;
  redirectUrl: string;
  thumbnailUrl: string;
  mediaType: 'image' | 'gif' | 'video';
  description: string;
}

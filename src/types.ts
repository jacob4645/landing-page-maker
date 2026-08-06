export interface VideoConfig {
  siteName: string;
  videoTitle: string;
  videoUrl: string; // The URL opened for the user in a new tab when clicking watch button
  redirectUrl: string; // The URL current page redirects to after clicking watch button
  thumbnailUrl: string;
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
  description: string;
}

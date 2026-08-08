import JSZip from 'jszip';

/**
 * Utility for handling relative media folder storage (e.g. media/video.mp4, media/thumb.jpg)
 */

export function getCleanMediaFilename(fileName: string, mediaType: 'image' | 'gif' | 'video'): string {
  if (!fileName) {
    if (mediaType === 'video') return 'video.mp4';
    if (mediaType === 'gif') return 'animation.gif';
    return 'thumbnail.jpg';
  }

  const sanitizeName = fileName.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  if (sanitizeName.includes('.')) {
    return sanitizeName;
  }

  let ext = 'jpg';
  if (mediaType === 'video') ext = 'mp4';
  if (mediaType === 'gif') ext = 'gif';

  return `${sanitizeName}.${ext}`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadDataUrlAsFile(dataUrl: string, fileName: string) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return;

  try {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    downloadBlob(blob, fileName);
  } catch (e) {
    console.error('Failed to convert base64 to blob for download', e);
  }
}

/**
 * Creates a structured ZIP archive containing index.html and media/ folder with uploaded assets
 */
export async function exportProjectAsZip(
  htmlContent: string,
  mediaDataUrl?: string,
  mediaFileName: string = 'video.mp4',
  mediaFolderName: string = 'media'
): Promise<void> {
  const zip = new JSZip();

  // 1. Add index.html at root
  zip.file('index.html', htmlContent);

  // 2. Add media/ folder file if dataUrl is available
  if (mediaDataUrl && mediaDataUrl.startsWith('data:')) {
    try {
      const arr = mediaDataUrl.split(',');
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      const mediaFolder = zip.folder(mediaFolderName);
      if (mediaFolder) {
        mediaFolder.file(mediaFileName, u8arr);
      }
    } catch (err) {
      console.error('Error adding media file to ZIP:', err);
    }
  }

  // 3. Generate ZIP blob and download
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, 'redirect-landing-page.zip');
}

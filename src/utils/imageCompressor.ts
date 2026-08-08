/**
 * Utility to compress images uploaded locally to prevent long Data URLs (Base64)
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getDataUrlSize(dataUrl: string): number {
  if (!dataUrl || !dataUrl.startsWith('data:')) return 0;
  const base64Length = dataUrl.split(',')[1]?.length || 0;
  return Math.round((base64Length * 3) / 4);
}

/**
 * Compress image using Canvas
 */
export function compressImageFile(
  file: File,
  maxWidth = 1000,
  quality = 0.75
): Promise<{ dataUrl: string; sizeFormatted: string; originalSizeFormatted: string; compressionRatio: string }> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    // If it's a video or gif, canvas compression doesn't apply cleanly, so return dataUrl directly
    if (file.type.startsWith('video/') || file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = (e.target?.result as string) || '';
        resolve({
          dataUrl: result,
          sizeFormatted: formatFileSize(originalSize),
          originalSizeFormatted: formatFileSize(originalSize),
          compressionRatio: '0%',
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          const compressedSize = getDataUrlSize(compressedDataUrl);
          const savedRatio = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

          resolve({
            dataUrl: compressedDataUrl,
            sizeFormatted: formatFileSize(compressedSize),
            originalSizeFormatted: formatFileSize(originalSize),
            compressionRatio: `${savedRatio}%`,
          });
        } else {
          resolve({
            dataUrl: (e.target?.result as string) || '',
            sizeFormatted: formatFileSize(originalSize),
            originalSizeFormatted: formatFileSize(originalSize),
            compressionRatio: '0%',
          });
        }
      };
      img.onerror = () => {
        resolve({
          dataUrl: (e.target?.result as string) || '',
          sizeFormatted: formatFileSize(originalSize),
          originalSizeFormatted: formatFileSize(originalSize),
          compressionRatio: '0%',
        });
      };
      img.src = (e.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload Service to host images, GIFs, and videos directly on this server's storage (/uploads)
 */

export interface ServerUploadResult {
  success: boolean;
  fileName: string;
  hostedUrl: string;
  mediaUrl?: string;
  relativePath?: string;
  size: number;
  mimeType: string;
}

export interface StoredMediaFile {
  fileName: string;
  path: string;
  url: string;
  size: number;
  createdAt: string;
}

export async function fetchStoredMediaList(): Promise<{ uploads: StoredMediaFile[]; media: StoredMediaFile[] }> {
  try {
    const res = await fetch('/api/media');
    if (!res.ok) throw new Error('Failed to fetch stored media list');
    const data = await res.json();
    return {
      uploads: data.uploads || [],
      media: data.media || [],
    };
  } catch (err) {
    console.warn('Error fetching stored media list:', err);
    return { uploads: [], media: [] };
  }
}

export async function deleteStoredMediaFile(fileName: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/media/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete media file:', err);
    return false;
  }
}

export async function uploadMediaToServer(
  fileDataUrl: string,
  fileName: string,
  mimeType: string
): Promise<ServerUploadResult> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileData: fileDataUrl,
        mimeType,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server respond with status ${res.status}`);
    }

    const data: ServerUploadResult = await res.json();
    return data;
  } catch (error: any) {
    console.error('Failed to upload media to server storage:', error);
    throw error;
  }
}

/**
 * Upload Service to host images, GIFs, and videos directly on this server's storage (/uploads)
 */

export interface ServerUploadResult {
  success: boolean;
  fileName: string;
  hostedUrl: string;
  size: number;
  mimeType: string;
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

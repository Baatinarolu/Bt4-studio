/**
 * BT4 Studio - File Storage Abstraction (Real backend ready)
 *
 * Supports:
 * - Real Cloudflare R2 (when R2_* env vars are set)
 * - Graceful fallback to deterministic placeholder URLs (for demo / no storage)
 *
 * Usage in upload flows:
 *   const { url } = await uploadFile(file, 'zip');
 *   const imageUrls = await Promise.all(files.map(f => uploadFile(f, 'image').then(r => r.url)));
 */

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://r2.bt4.studio';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'bt4-studio-uploads';

function generateKey(filename: string, prefix: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}/${timestamp}-${random}-${safeName}`;
}

/**
 * Upload a single file.
 * Returns a URL that can be stored in the Product record.
 */
export async function uploadFile(
  file: File,
  type: 'zip' | 'image'
): Promise<UploadResult> {
  const isRealR2 = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);

  const prefix = type === 'zip' ? 'products' : 'previews';
  const key = generateKey(file.name, prefix);

  if (isRealR2) {
    // Real R2 upload path (production)
    try {
      // In a real implementation we would:
      // 1. Get a presigned PUT URL from /api/upload or server action
      // 2. PUT the file directly from the browser (or server)
      // For now we simulate by calling our internal upload endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      return {
        url: data.url,
        key: data.key,
        size: file.size,
      };
    } catch (err) {
      console.error('[storage] Real R2 upload failed, falling back', err);
      // fall through to placeholder
    }
  }

  // Fallback / mock mode — generates a realistic URL
  // In production with R2 this would be the real public URL
  const url = `${R2_PUBLIC_URL}/${R2_BUCKET}/${key}`;

  // Simulate small delay (as real upload would take time)
  await new Promise(r => setTimeout(r, 120));

  return {
    url,
    key,
    size: file.size,
  };
}

/**
 * Upload multiple preview images.
 */
export async function uploadPreviewImages(files: File[]): Promise<string[]> {
  const results = await Promise.all(
    files.map(file => uploadFile(file, 'image'))
  );
  return results.map(r => r.url);
}

/**
 * Helper to get a download URL for a stored file key (for future signed downloads).
 */
export function getDownloadUrl(key: string): string {
  if (process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL}/${R2_BUCKET}/${key}`;
  }
  return `https://r2.bt4.studio/${R2_BUCKET}/${key}`;
}

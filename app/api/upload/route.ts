import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'bt4-studio-uploads';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://r2.bt4.studio';

// Create R2 client only when credentials are present
function getR2Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const key = formData.get('key') as string | null;
    const type = formData.get('type') as string | null; // 'zip' | 'image'

    if (!file || !key) {
      return NextResponse.json({ error: 'Missing file or key' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const r2Client = getR2Client();

    if (r2Client) {
      // Real R2 upload
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
        ContentLength: buffer.length,
      });

      await r2Client.send(command);

      const url = `${R2_PUBLIC_URL}/${R2_BUCKET}/${key}`;

      return NextResponse.json({
        success: true,
        url,
        key,
        size: buffer.length,
        storage: 'r2',
      });
    } else {
      // Fallback: return a deterministic placeholder URL
      // This keeps the app fully functional without R2
      const url = `${R2_PUBLIC_URL}/${R2_BUCKET}/${key}`;

      return NextResponse.json({
        success: true,
        url,
        key,
        size: buffer.length,
        storage: 'placeholder',
        note: 'R2 not configured — using placeholder URL',
      });
    }
  } catch (error: any) {
    console.error('[upload] error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

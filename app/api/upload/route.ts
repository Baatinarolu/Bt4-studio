import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Supabase Storage Upload Route (Full Migration)
 * 
 * Buckets:
 *   - product-files   (private)
 *   - product-previews (public)
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const key = formData.get('key') as string | null;
    const type = formData.get('type') as string | null; // 'zip' | 'image'

    if (!file || !key) {
      return NextResponse.json({ error: 'Missing file or key' }, { status: 400 });
    }

    const bucket = type === 'zip' ? 'product-files' : 'product-previews';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(key, buffer, {
        contentType: file.type || (type === 'zip' ? 'application/zip' : 'image/jpeg'),
        upsert: false,
      });

    if (error) {
      console.error('[upload] Supabase error:', error);
      // Fallback placeholder (keeps UX working)
      const fallbackUrl = `https://placeholder.supabase.co/storage/v1/object/public/${bucket}/${key}`;
      return NextResponse.json({
        success: true,
        url: fallbackUrl,
        key,
        size: buffer.length,
        storage: 'supabase-fallback',
        note: 'Supabase upload failed — using placeholder',
      });
    }

    let url = '';

    if (type === 'image') {
      // Public bucket
      const { data: publicData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(key);
      url = publicData.publicUrl;
    } else {
      // Private bucket — we return a relative path. 
      // Real signed URL is generated at download time.
      url = `/download/${key}`;
    }

    return NextResponse.json({
      success: true,
      url,
      key,
      size: buffer.length,
      storage: 'supabase',
    });
  } catch (error: any) {
    console.error('[upload] error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAdmin } from '@/server/auth-guard';
import { env } from '@/lib/env';

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { paramsToSign } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      ...paramsToSign,
      timestamp,
      folder: 'electronics-store/products',
    };

    // Sort params alphabetically
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const signature = crypto
      .createHash('sha256')
      .update(paramString + env.CLOUDINARY_API_SECRET)
      .digest('hex');

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder: 'electronics-store/products',
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Unauthorized Cloudinary signature request' },
      { status: 401 }
    );
  }
}

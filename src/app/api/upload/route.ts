import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// Get a pre-signed URL for uploading a file
export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Upload is disabled' }, { status: 403 });
  }

  try {
    const { name, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Missing name or type' }, { status: 400 });
    }

    const r2Path = `source/${name}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: r2Path,
      ContentType: type,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return NextResponse.json({ success: true, url, path: `/${r2Path}` });
  } catch (e) {
    console.error('Presigned URL error:', e);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update the music-info.json file
export async function PATCH(request: NextRequest) {
    if (process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'true') {
        return NextResponse.json({ success: false, message: 'Upload is disabled' }, { status: 403 });
    }

    try {
        const { title, artist, category, path: songPath } = await request.json();

        if (!title || !artist || !category || !songPath) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const jsonPath = path.join(process.cwd(), 'public', 'music-info.json');
        const newMusicInfo = {
            title,
            artist,
            category,
            path: songPath,
        };

        let musicData = [];
        try {
            const jsonContent = await fs.readFile(jsonPath, 'utf-8');
            if (jsonContent) {
                musicData = JSON.parse(jsonContent);
            }
        } catch (error) {
            console.log('music-info.json not found or empty, will create a new one.');
        }

        if (!Array.isArray(musicData)) {
            musicData = [];
        }

        musicData.push(newMusicInfo);

        await fs.writeFile(jsonPath, JSON.stringify(musicData, null, 2));

        return NextResponse.json({ success: true, message: 'Metadata updated successfully' });
    } catch (e) {
        console.error('Metadata update error:', e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Helper to ensure directory exists
async function ensureDirExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (e) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'true') {
    return NextResponse.json({ success: false, message: 'Upload is disabled' }, { status: 403 });
  }

  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const title: string = data.get('title') as string;
    const artist: string = data.get('artist') as string;
    const category: string = data.get('category') as string;

    if (!file || !title || !artist || !category) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Save the file
    const sourceDir = path.join(process.cwd(), 'public', 'source');
    await ensureDirExists(sourceDir);
    const filePath = path.join(sourceDir, file.name);
    await fs.writeFile(filePath, buffer);

    // 2. Update the JSON file
    const jsonPath = path.join(process.cwd(), 'public', 'music-info.json');
    const newMusicInfo = {
      title,
      artist,
      category,
      path: `/source/${file.name}`,
    };

    let musicData = [];
    try {
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      // Handle empty file case
      if (jsonContent) {
        musicData = JSON.parse(jsonContent);
      }
    } catch (error) {
      // If file doesn't exist, it's fine, we'll create it.
      console.log('music-info.json not found or empty, will create a new one.');
    }

    // Ensure musicData is an array
    if (!Array.isArray(musicData)) {
        musicData = [];
    }

    musicData.push(newMusicInfo);

    await fs.writeFile(jsonPath, JSON.stringify(musicData, null, 2));

    return NextResponse.json({ success: true, message: 'Upload successful' });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

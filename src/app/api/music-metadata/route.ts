import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Define the MusicInfo interface here for server-side use
interface MusicInfo {
    title: string;
    artist: string;
    category: string;
    path: string;
}

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined;

const s3Client = new S3Client({
  region: "auto", // R2 doesn't use regions in the traditional sense, "auto" is common for Cloudflare
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

const MUSIC_INFO_KEY = "config/music-info.json"; // Key for the JSON file in R2

export async function PATCH(request: NextRequest) {
    if (process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'true') {
        return NextResponse.json({ success: false, message: 'Upload is disabled' }, { status: 403 });
    }

    if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_ENDPOINT) {
        return NextResponse.json({ success: false, message: 'Server configuration error: R2 credentials missing.' }, { status: 500 });
    }

    try {
        const { title, artist, category, path: songPath } = await request.json();

        if (!title || !artist || !category || !songPath) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        let musicData: MusicInfo[] = [];

        // 1. Download music-info.json from R2
        try {
            const getObjectCommand = new GetObjectCommand({ // Declare getObjectCommand here
                Bucket: R2_BUCKET_NAME,
                Key: MUSIC_INFO_KEY,
            });
            const { Body } = await s3Client.send(getObjectCommand) as GetObjectCommandOutput;

            if (Body) {
                const jsonContent = await Body.transformToString();
                const parsedData = JSON.parse(jsonContent);
                // Basic runtime type check for parsed data
                if (Array.isArray(parsedData) && parsedData.every(item =>
                    typeof item === 'object' && item !== null &&
                    'title' in item && typeof item.title === 'string' &&
                    'artist' in item && typeof item.artist === 'string' &&
                    'category' in item && typeof item.category === 'string' &&
                    'path' in item && typeof item.path === 'string'
                )) {
                    musicData = parsedData as MusicInfo[];
                } else {
                    musicData = [];
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'NoSuchKey') {
                musicData = [];
            } else {
                return NextResponse.json({ success: false, message: 'Failed to retrieve existing music data.' }, { status: 500 });
            }
        }

        if (!Array.isArray(musicData)) {
            musicData = [];
        }

        const newMusicInfo: MusicInfo = {
            title,
            artist,
            category,
            path: songPath,
        };

        musicData.push(newMusicInfo);
        const updatedJsonContent = JSON.stringify(musicData, null, 2);

        // 2. Upload updated music-info.json to R2 using a presigned URL
        const putObjectCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: MUSIC_INFO_KEY,
            ContentType: 'application/json',
            Body: updatedJsonContent,
        });

        // Generate a presigned URL for the PUT operation
        const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });

        // Perform the upload to the presigned URL
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: updatedJsonContent,
        });

        if (!uploadResponse.ok) {
            return NextResponse.json({ success: false, message: 'Failed to save updated music data to cloud storage.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Metadata updated successfully in cloud storage.' });
    } catch (e: unknown) {
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

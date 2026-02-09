import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined;

const s3Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

const MUSIC_COUNT_KEY = "config/music-count.json";

export async function POST(request: NextRequest) {
    if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_ENDPOINT) {
        return NextResponse.json({ success: false, message: 'Server configuration error: R2 credentials missing.' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Missing required field: id' }, { status: 400 });
        }

        let countData: Record<string, number> = {};

        // 1. Download music-count.json
        try {
            const getObjectCommand = new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: MUSIC_COUNT_KEY,
            });
            const { Body } = await s3Client.send(getObjectCommand) as GetObjectCommandOutput;

            if (Body) {
                const jsonContent = await Body.transformToString();
                countData = JSON.parse(jsonContent);
            }
        } catch (error: unknown) {
            // If file doesn't exist, start with empty object
            if (!(error instanceof Error && error.name === 'NoSuchKey')) {
                console.error("Failed to fetch count data:", error);
            }
        }

        // 2. Increment count
        countData[id] = (countData[id] || 0) + 1;

        // 3. Upload updated music-count.json
        const updatedJsonContent = JSON.stringify(countData, null, 2);

        const putObjectCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: MUSIC_COUNT_KEY,
            ContentType: 'application/json',
            Body: updatedJsonContent,
        });

        // Use presigned URL for upload (consistent with existing pattern)
        const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: updatedJsonContent,
        });

        if (!uploadResponse.ok) {
            return NextResponse.json({ success: false, message: 'Failed to update play count in storage.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: countData[id] });

    } catch (e) {
        console.error("Error updating play count:", e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

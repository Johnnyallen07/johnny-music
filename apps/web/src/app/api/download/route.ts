import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
        }

        // Decode the key in case it was encoded
        const decodedKey = decodeURIComponent(key);

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: decodedKey,
            ResponseContentDisposition: 'attachment', // Forces download
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Redirect the user to the signed URL
        return NextResponse.redirect(url);
    } catch (e) {
        console.error('Download error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

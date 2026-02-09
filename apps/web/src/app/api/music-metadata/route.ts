import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MusicInfo } from '@johnny/api';

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
const MUSIC_SERIES_KEY = "config/music-series.json"; // Key for the Series JSON file in R2

export async function PATCH(request: NextRequest) {
    if (process.env.NEXT_PUBLIC_UPLOAD_ENABLED !== 'true') {
        return NextResponse.json({ success: false, message: 'Upload is disabled' }, { status: 403 });
    }

    if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_ENDPOINT) {
        return NextResponse.json({ success: false, message: 'Server configuration error: R2 credentials missing.' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { title, artist, category, path: songPath, id } = body;

        // We accept other optional fields too
        const { title_zh, artist_zh, category_zh, series, series_zh, performer } = body;

        if (!title || !artist || !category || !songPath) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // --- 1. Handle music-info.json ---
        let musicData: MusicInfo[] = [];

        try {
            const getObjectCommand = new GetObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: MUSIC_INFO_KEY,
            });
            const { Body } = await s3Client.send(getObjectCommand) as GetObjectCommandOutput;

            if (Body) {
                const jsonContent = await Body.transformToString();
                const parsedData = JSON.parse(jsonContent);
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
                console.error("Error fetching music-info.json:", error);
                return NextResponse.json({ success: false, message: 'Failed to retrieve existing music data.' }, { status: 500 });
            }
        }

        const newMusicInfo: MusicInfo = {
            title,
            artist,
            category,
            path: songPath,
            title_zh,
            artist_zh,
            category_zh,
            series,
            series_zh,
            performer,
            id
        };

        // Remove undefined keys
        Object.keys(newMusicInfo).forEach(key => {
            if (newMusicInfo[key as keyof MusicInfo] === undefined) {
                delete newMusicInfo[key as keyof MusicInfo];
            }
        });

        // Ensure ID exists
        if (!newMusicInfo.id) {
            const crypto = require('crypto');
            newMusicInfo.id = crypto.randomUUID();
        }

        const existingIndex = musicData.findIndex(item => item.path === songPath);

        if (existingIndex !== -1) {
            musicData[existingIndex] = {
                ...musicData[existingIndex],
                ...newMusicInfo,
                id: newMusicInfo.id || musicData[existingIndex].id
            };
        } else {
            musicData.push(newMusicInfo);
        }

        const updatedJsonContent = JSON.stringify(musicData, null, 2);

        // Upload updated music-info.json
        const putObjectCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: MUSIC_INFO_KEY,
            ContentType: 'application/json',
            Body: updatedJsonContent,
        });

        const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 });

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: updatedJsonContent,
        });

        if (!uploadResponse.ok) {
            console.error("Error uploading music-info.json:", uploadResponse.statusText);
            return NextResponse.json({ success: false, message: 'Failed to save updated music data.' }, { status: 500 });
        }


        // --- 2. Handle music-series.json (if series is provided) ---
        if (series) {
            type SeriesData = Record<string, string[]>; // Series Name -> Array of Music IDs
            let seriesData: SeriesData = {};

            try {
                const getSeriesCommand = new GetObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: MUSIC_SERIES_KEY,
                });
                const { Body } = await s3Client.send(getSeriesCommand) as GetObjectCommandOutput;

                if (Body) {
                    const jsonContent = await Body.transformToString();
                    seriesData = JSON.parse(jsonContent);
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name === 'NoSuchKey') {
                    seriesData = {}; // Create new if not exists
                } else {
                    console.error("Error fetching music-series.json (non-fatal):", error);
                    // We can choose to fail or continue. Let's log and try to continue or just init empty?
                    // If we can't read it, we might overwrite, so maybe better to init empty if it's a read error?
                    // Actually, if it's not a NoSuchKey error, it might be a permissions or network error. 
                    // Let's assume empty for now to be safe, or maybe we should return error? 
                    // For now, let's treat it as empty to proceed.
                    seriesData = {};
                }
            }

            // Update series data
            if (!seriesData[series]) {
                seriesData[series] = [];
            }

            // Add ID if not already present
            if (!seriesData[series].includes(newMusicInfo.id)) {
                seriesData[series].push(newMusicInfo.id);
            }

            // Upload updated music-series.json
            const updatedSeriesContent = JSON.stringify(seriesData, null, 2);
            const putSeriesCommand = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: MUSIC_SERIES_KEY,
                ContentType: 'application/json',
                Body: updatedSeriesContent,
            });

            const uploadSeriesUrl = await getSignedUrl(s3Client, putSeriesCommand, { expiresIn: 3600 });
            await fetch(uploadSeriesUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: updatedSeriesContent,
            });
        }

        return NextResponse.json({ success: true, message: 'Metadata updated successfully.' });
    } catch (e: unknown) {
        console.error("Internal Server Error:", e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

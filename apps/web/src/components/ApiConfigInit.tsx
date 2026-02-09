'use client';

import { useEffect } from 'react';
import { setApiConfig } from '@johnny/api';

export function ApiConfigInit() {
    useEffect(() => {
        setApiConfig({
            bucketUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL || '',
            apiBaseUrl: '', // Relative path for same-origin API calls
        });
    }, []);

    return null;
}

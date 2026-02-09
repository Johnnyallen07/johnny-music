import axios from "axios";
import { PresignedUrlPayload, PresignedUrlResponse } from "../types";

import { API_CONFIG } from "../config";

// Function to get a presigned URL from our API
export const getPresignedUrl = async (payload: PresignedUrlPayload) => {
    const { data } = await axios.post<PresignedUrlResponse>(`${API_CONFIG.apiBaseUrl}/api/presigned-url`, payload);
    return data;
};

// Function to upload file directly to R2 using the presigned URL
export const uploadFileToR2 = async (url: string, file: File, contentType: string) => {
    await axios.put(url, file, {
        headers: {
            "Content-Type": contentType,
        },
    });
};

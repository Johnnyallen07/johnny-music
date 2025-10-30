import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface PresignedUrlPayload {
  name: string;
  type: string;
}

interface PresignedUrlResponse {
  success: boolean;
  url: string;
  path: string;
}

interface MusicInfo {
  title: string;
  artist: string;
  category: string;
  path: string;
}

// Function to get a presigned URL from our API
const getPresignedUrl = async (payload: PresignedUrlPayload) => {
  const { data } = await axios.post<PresignedUrlResponse>("/api/presigned-url", payload);
  return data;
};

// Function to upload file directly to R2 using the presigned URL
const uploadFileToR2 = async (url: string, file: File, contentType: string) => {
  await axios.put(url, file, {
    headers: {
      "Content-Type": contentType,
    },
  });
};

// Function to update music metadata on our API
const updateMetadata = async (payload: MusicInfo) => {
  const { data } = await axios.patch("/api/music-metadata", payload);
  return data;
};

export const useUploadMusic = () => {
  return useMutation({
    mutationFn: async ({ file, musicInfo }: { file: File; musicInfo: Omit<MusicInfo, 'path'> }) => {
      // 1. Get presigned URL
      const presignedUrlResponse = await getPresignedUrl({
        name: file.name,
        type: file.type,
      });

      if (!presignedUrlResponse.success) {
        throw new Error("Failed to get presigned URL");
      }

      const { url, path: r2Path } = presignedUrlResponse;

      // 2. Upload file to R2
      await uploadFileToR2(url, file, file.type);

      // 3. Update music metadata
      await updateMetadata({
        ...musicInfo,
        path: r2Path, // Use the path returned from the presigned URL API
      });

      return { success: true, message: "Music uploaded successfully" };
    },
  });
};

// Removed individual mutations as useUploadMusic now encapsulates the full flow.

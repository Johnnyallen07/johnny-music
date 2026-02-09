import { useMutation } from "@tanstack/react-query";
import { getPresignedUrl, uploadFileToR2 } from "../api/upload";
import { updateMetadata } from "../api/music";
import { MusicInfo } from "../types";

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
      // We need to cast since updateMetadata expects full MusicInfo including path, 
      // but here we are constructing it.
      await updateMetadata({
        ...musicInfo,
        path: r2Path,
      });

      return { success: true, message: "Music uploaded successfully" };
    },
  });
};

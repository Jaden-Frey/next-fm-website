import cloudinary from './cloudinary'; 
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export const UploadImage = async (file: File, folder: string) => {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: folder
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return reject(error.message);
        }
        return resolve(result as UploadApiResponse);
      }
    ).end(bytes);
  });
};
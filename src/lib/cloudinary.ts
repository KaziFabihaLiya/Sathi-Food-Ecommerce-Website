import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Uploads a file Buffer to Cloudinary under a specific folder
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary by its public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed for publicId:", publicId, err);
  }
}

export default cloudinary;


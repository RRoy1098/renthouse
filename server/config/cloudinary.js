import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a raw file buffer directly to a specified Cloudinary folder.
 * @param {Buffer} fileBuffer - The file buffer (e.g., req.file.buffer)
 * @param {string} folder - The destination folder name in Cloudinary (e.g., 'renthouse/listings')
 * @returns {Promise<Object>} - { url, public_id }
 */
export const uploadImageToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error('No file buffer provided for upload.'));
    }

    // Stream upload directly to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder || 'renthouse',
        resource_type: 'auto', // Automatically detects image vs PDF/documents
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }] // Prevents giant files
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    // End stream and write the raw buffer
    uploadStream.end(fileBuffer);
  });
};

/**
 * Helper to delete images from Cloudinary using their public_id
 * @param {string} publicId 
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

export default cloudinary;
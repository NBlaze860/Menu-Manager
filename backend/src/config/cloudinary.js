import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary with credentials from environment variables
 * This setup allows us to upload, manage, and serve images through Cloudinary's CDN
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

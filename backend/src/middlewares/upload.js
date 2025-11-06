import multer from 'multer';

/**
 * Configure multer to use memory storage
 * This allows us to upload directly to Cloudinary without saving files locally
 * Memory storage is suitable for moderate file sizes and eliminates cleanup needs
 */
const storage = multer.memoryStorage();

/**
 * File filter to accept only image files
 * This prevents users from uploading non-image files
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed'), false);
  }
};

// Configure multer with size limit of 5MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit to prevent abuse and keep uploads fast
  },
});

export default upload;

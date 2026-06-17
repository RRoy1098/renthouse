import multer from 'multer';

// Multer memory storage configuration
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

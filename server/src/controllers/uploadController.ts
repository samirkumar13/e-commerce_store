import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Configure multer to use memory storage (we'll process the image before saving)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

// Get the uploads directory path
const getUploadsDir = (subfolder: string = 'products') => {
  const uploadsDir = path.join(__dirname, '../../uploads', subfolder);
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

// Generate a unique filename
const generateFilename = (originalName: string) => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = 'webp'; // We'll convert all images to WebP
  return `${timestamp}-${randomSuffix}.${extension}`;
};

/**
 * Upload a single image
 * @route POST /api/admin/upload
 * @access Private/Admin
 */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    (res as any).status(400);
    throw new Error('No image file provided');
  }

  // Determine subfolder based on query param or default to 'products'
  const subfolder = (req.query.type as string) || 'products';
  const uploadsDir = getUploadsDir(subfolder);
  const filename = generateFilename(req.file.originalname);
  const filepath = path.join(uploadsDir, filename);

  try {
    // Process and optimize the image using sharp
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true, // Don't upscale smaller images
      })
      .webp({
        quality: 80, // Good balance between quality and file size
      })
      .toFile(filepath);

    // Return the URL path to the uploaded image
    const imageUrl = `/uploads/${subfolder}/${filename}`;

    (res as any).status(201).json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.error('Image processing error:', error);
    (res as any).status(500);
    throw new Error('Failed to process and save image');
  }
});

/**
 * Upload multiple images
 * @route POST /api/admin/upload/multiple
 * @access Private/Admin
 */
export const uploadMultipleImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    (res as any).status(400);
    throw new Error('No image files provided');
  }

  const subfolder = (req.query.type as string) || 'products';
  const uploadsDir = getUploadsDir(subfolder);
  const uploadedUrls: string[] = [];

  try {
    for (const file of files) {
      const filename = generateFilename(file.originalname);
      const filepath = path.join(uploadsDir, filename);

      await sharp(file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
        })
        .toFile(filepath);

      uploadedUrls.push(`/uploads/${subfolder}/${filename}`);
    }

    (res as any).status(201).json({
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} images uploaded successfully`,
    });
  } catch (error) {
    console.error('Image processing error:', error);
    (res as any).status(500);
    throw new Error('Failed to process and save images');
  }
});

/**
 * Delete an uploaded image
 * @route DELETE /api/admin/upload
 * @access Private/Admin
 */
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    (res as any).status(400);
    throw new Error('Image URL is required');
  }

  // Extract the file path from the URL
  // URL format: /uploads/products/filename.webp
  const relativePath = url.replace(/^\/uploads\//, '');
  const filepath = path.join(__dirname, '../../uploads', relativePath);

  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      (res as any).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      (res as any).status(404);
      throw new Error('Image not found');
    }
  } catch (error: any) {
    if (error.message === 'Image not found') {
      throw error;
    }
    console.error('Image deletion error:', error);
    (res as any).status(500);
    throw new Error('Failed to delete image');
  }
});

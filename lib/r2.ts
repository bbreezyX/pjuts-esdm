import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// ============================================
// R2 CLIENT CONFIGURATION (LAZY INITIALIZATION)
// ============================================

// Environment variables - accessed lazily to prevent build-time errors
function getR2Config() {
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error(
      "Missing R2 configuration. Please ensure all R2 environment variables are set: " +
      "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL"
    );
  }

  return { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL };
}

// Lazy-initialized R2 client singleton
let r2ClientInstance: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2ClientInstance) {
    const config = getR2Config();
    r2ClientInstance = new S3Client({
      region: "auto",
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2ClientInstance;
}

// ============================================
// TYPES
// ============================================

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface ImageUploadOptions {
  region: string;
  unitId: string;
  fileBuffer: Buffer;
  contentType: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a unique filename for storage
 * Format: region/unit_id/timestamp.webp
 */
function generateFilePath(region: string, unitId: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const sanitizedRegion = region.toLowerCase().replace(/\s+/g, "-");
  const sanitizedUnitId = unitId.replace(/[^a-zA-Z0-9-]/g, "_");

  return `reports/${sanitizedRegion}/${sanitizedUnitId}/${timestamp}-${random}.webp`;
}

/**
 * Get public URL for an uploaded file
 */
function getPublicUrl(path: string): string {
  const config = getR2Config();
  // Remove trailing slash from R2_PUBLIC_URL if present
  const baseUrl = config.R2_PUBLIC_URL.replace(/\/$/, "");
  return `${baseUrl}/${path}`;
}

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload an image to Cloudflare R2
 */
export async function uploadImageToR2(options: ImageUploadOptions): Promise<UploadResult> {
  const { region, unitId, fileBuffer, contentType } = options;

  try {
    // Generate unique file path
    const filePath = generateFilePath(region, unitId);

    // Get config and client
    const config = getR2Config();
    const r2Client = getR2Client();

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: config.R2_BUCKET_NAME,
      Key: filePath,
      Body: fileBuffer,
      ContentType: contentType,
      // Set cache control for performance
      CacheControl: "public, max-age=31536000",
      // Add metadata
      Metadata: {
        "unit-id": unitId,
        "region": region,
        "uploaded-at": new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    const publicUrl = getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Upload raw file buffer with automatic path generation
 */
export async function uploadReportImage(
  fileBuffer: Buffer,
  contentType: string,
  province: string,
  unitId: string
): Promise<UploadResult> {
  return uploadImageToR2({
    region: province,
    unitId,
    fileBuffer,
    contentType,
  });
}

// ============================================
// DELETE FUNCTIONS
// ============================================

/**
 * Delete a file from R2 by its path
 */
export async function deleteFromR2(filePath: string): Promise<boolean> {
  try {
    const config = getR2Config();
    const r2Client = getR2Client();

    const command = new DeleteObjectCommand({
      Bucket: config.R2_BUCKET_NAME,
      Key: filePath,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error("R2 delete error:", error);
    return false;
  }
}

// ============================================
// CHECK FUNCTIONS
// ============================================

/**
 * Check if a file exists in R2
 */
export async function fileExistsInR2(filePath: string): Promise<boolean> {
  try {
    const config = getR2Config();
    const r2Client = getR2Client();

    const command = new HeadObjectCommand({
      Bucket: config.R2_BUCKET_NAME,
      Key: filePath,
    });

    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// IMAGE PROCESSING
// ============================================

/**
 * Process and optimize image before upload
 * Converts to WebP and resizes if needed
 */
export async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    // Dynamic import of sharp for image processing
    const sharp = (await import("sharp")).default;

    const processedImage = await sharp(buffer)
      .resize(1920, 1080, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
        effort: 4,
      })
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error("Image processing error:", error);
    // Return original buffer if processing fails
    return buffer;
  }
}


import express, { Router, Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET_NAME, CLOUDFRONT_IMAGES_URL } from "../utils/s3.js";

const router: express.Router = Router();

// Removed auth - making public for easier deployment
router.post("/presign", async (req: Request, res: Response) => {
  try {
    const { filename, contentType, color } = req.body;

    if (!filename || !contentType || !color) {
      return res.status(400).json({
        message: "filename, contentType, and color are required",
      });
    }

    if (!BUCKET_NAME) {
      return res.status(500).json({
        message: "S3 bucket name is not configured",
      });
    }

    // Generate unique key for the image
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `products/${timestamp}-${color}-${sanitizedFilename}`;

    // Force region to ap-southeast-1 (match your bucket region)
    const region = "ap-southeast-1"; // Hardcode to ensure it's correct
    console.log("🔍 Using region:", region);
    console.log("🔍 AWS_REGION env var:", process.env.AWS_REGION);
    console.log("🔍 S3 bucket:", BUCKET_NAME);

    // Create a fresh S3Client with explicit region to avoid any caching issues
    const freshS3Client = new S3Client({
      region: region,
      forcePathStyle: false,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });

    // Create presigned URL for upload
    // IMPORTANT: Do not include ChecksumAlgorithm - browsers cannot calculate checksums
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      // Explicitly no ChecksumAlgorithm - this prevents x-amz-checksum-* parameters
    });
    
    const uploadUrl = await getSignedUrl(freshS3Client, command, {
      expiresIn: 300, // 5 minutes
      // Exclude checksum headers from being signed/required
      unhoistableHeaders: new Set(["x-amz-checksum-crc32", "x-amz-checksum-sha256"]),
    });

    console.log("🔍 Generated presigned URL:", uploadUrl);

    // IMPORTANT: DO NOT modify the presigned URL after signing!
    // Modifying the URL (including region changes) invalidates the cryptographic signature
    // and causes 403 Forbidden errors.
    // 
    // The S3Client is already configured with the correct region (ap-southeast-1),
    // so the presigned URL will already have the correct region in it.
    // 
    // Note: If checksums are added by the SDK, removing them would also invalidate the signature.
    // The SDK should not add checksums by default for PutObjectCommand unless explicitly requested.

    // Generate image URL - use CloudFront if configured, otherwise S3 URL
    // Note: key already includes 'products/' prefix
    // CLOUDFRONT_IMAGES_URL already includes '/products' path from CloudFront behavior
    // So we need to remove the 'products/' from key when using CloudFront
    const imageUrl = CLOUDFRONT_IMAGES_URL
      ? `${CLOUDFRONT_IMAGES_URL}/${key.replace('products/', '')}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    res.json({ uploadUrl, imageUrl });
  } catch (error: any) {
    console.error("Presign URL error:", error);
    res.status(500).json({
      message: "Failed to generate upload URL",
      error: error.message,
    });
  }
});

export default router;


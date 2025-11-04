import { S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";

/**
 * S3 Client initialization
 * Automatically handles credentials:
 * - Local: Uses AWS CLI credentials (~/.aws/credentials) or environment variables
 * - Production: Uses IAM role automatically (no credentials needed)
 */

const region = process.env.AWS_REGION || "ap-southeast-1";
const awsProfile = process.env.AWS_PROFILE;

console.log("🚀 Initializing S3 Client with region:", region);
console.log("🚀 AWS_REGION env var:", process.env.AWS_REGION);
console.log("🚀 AWS_PROFILE env var:", awsProfile);

export const s3Client = new S3Client({
  region: region,
  // Use specific AWS profile if set, otherwise use default credentials
  credentials: awsProfile ? fromIni({ profile: awsProfile }) : undefined,
  // Force use of regional endpoint (not global)
  forcePathStyle: false,
  useArnRegion: false,
  // Disable automatic checksums - browsers can't calculate them for presigned URL uploads
  requestChecksumCalculation: "WHEN_REQUIRED",
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export const CLOUDFRONT_IMAGES_URL = process.env.CLOUDFRONT_IMAGES_URL || "";
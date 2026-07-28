import { S3Client } from "@aws-sdk/client-s3"

// R2 is S3-compatible — we use the AWS SDK pointed at your R2 endpoint
export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  // Required for R2 — disables the AWS path-style URL rewrite
  forcePathStyle: false,
})

export const BUCKET = process.env.S3_BUCKET!
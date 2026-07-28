import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2, BUCKET } from "./r2"
import { randomUUID } from "crypto"

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]
const MAX_BYTES = 10 * 1024 * 1024  // 10 MB

// ─── Direct upload (small files, server-side) ─────────────────────────────

export async function uploadToR2({
  file,
  folder = "uploads",
  tenantId,
}: {
  file:     Buffer
  fileName: string
  mimeType: string
  folder?:  string
  tenantId: string
}): Promise<{ key: string; url: string }> {

  if (file.byteLength > MAX_BYTES) {
    throw new Error(`File exceeds 10 MB limit`)
  }

  const key = `${tenantId}/${folder}/${randomUUID()}`

  await r2.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        file,
    ContentType: mimeType,
    Metadata: {
      tenantId,
      uploadedAt: new Date().toISOString(),
    },
  }))

  return {
    key,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/files/${key}`,
  }
}

// ─── Presigned URL (large files, browser uploads directly to R2) ──────────

export async function getPresignedUploadUrl({
  fileName,
  mimeType,
  tenantId,
  folder = "uploads",
}: {
  fileName: string
  mimeType: string
  tenantId: string
  folder?:  string
}): Promise<{ uploadUrl: string; key: string }> {

  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`File type ${mimeType} not allowed`)
  }

  const ext = fileName.split(".").pop()
  const key = `${tenantId}/${folder}/${randomUUID()}.${ext}`

  const cmd = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    ContentType: mimeType,
  })

  const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 3600 })

  return { uploadUrl, key }
}

// ─── Delete ───────────────────────────────────────────────────────────────

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
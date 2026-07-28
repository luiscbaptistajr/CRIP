/**
 * CRIP — R2 connection and token tester
 * Run: npx tsx scripts/test-r2.ts
 *
 * Tests in order:
 *  1. Env vars present
 *  2. S3Client initializes
 *  3. Credentials are valid (HeadBucket)
 *  4. Bucket exists and is accessible
 *  5. Upload a test file (PutObject)
 *  6. Download the test file (GetObject)
 *  7. Generate a presigned URL (getSignedUrl)
 *  8. Delete the test file (DeleteObject)
 */

import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { config } from "dotenv"

config({ path: ".env.local" })

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GREEN  = "\x1b[32m✓\x1b[0m"
const RED    = "\x1b[31m✗\x1b[0m"
const YELLOW = "\x1b[33m~\x1b[0m"
const BOLD   = (s: string) => `\x1b[1m${s}\x1b[0m`
const DIM    = (s: string) => `\x1b[2m${s}\x1b[0m`
const CYAN   = (s: string) => `\x1b[36m${s}\x1b[0m`

function pass(label: string, detail = "") {
  console.log(`  ${GREEN} ${label} ${DIM(detail)}`)
}

function fail(label: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  console.log(`  ${RED} ${label}`)
  console.log(`    ${DIM("→ " + msg)}`)
  console.log()
}

function info(label: string, value: string) {
  console.log(`  ${YELLOW} ${label}: ${CYAN(value)}`)
}

function section(title: string) {
  console.log(`\n${BOLD(title)}`)
  console.log("─".repeat(44))
}

// ─── Step 1 — env vars ────────────────────────────────────────────────────────

function checkEnvVars(): boolean {
  section("Step 1 — R2 environment variables")

  const vars = {
    S3_BUCKET:     process.env.S3_BUCKET,
    S3_REGION:     process.env.S3_REGION,
    S3_ENDPOINT:   process.env.S3_ENDPOINT,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  }

  let allPresent = true

  for (const [key, val] of Object.entries(vars)) {
    if (val) {
      // Mask the secret key — show first 6 chars only
      const display = key === "S3_SECRET_KEY"
        ? val.slice(0, 6) + "••••••••••••••••"
        : key === "S3_ACCESS_KEY"
        ? val.slice(0, 8) + "••••••••"
        : val
      pass(key, display)
    } else {
      fail(key, "Missing from .env.local")
      allPresent = false
    }
  }

  // Validate endpoint format
  if (vars.S3_ENDPOINT) {
    const url = vars.S3_ENDPOINT
    if (!url.startsWith("https://")) {
      fail("S3_ENDPOINT format", "must start with https://")
      allPresent = false
    } else if (!url.includes("r2.cloudflarestorage.com")) {
      info("S3_ENDPOINT", `${url} — looks custom (not R2 standard)`)
    } else {
      const accountId = url.replace("https://", "").split(".")[0]
      pass("Account ID parsed", accountId)
    }
  }

  return allPresent
}

// ─── Step 2 — build the S3Client (mirrors server/lib/r2.ts exactly) ──────────

function buildClient(): S3Client | null {
  section("Step 2 — initialise S3Client (same as server/lib/r2.ts)")

  try {
    const client = new S3Client({
      region:   process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT!,
      credentials: {
        accessKeyId:     process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: false,
    })

    pass("S3Client created", "endpoint → " + process.env.S3_ENDPOINT)
    return client
  } catch (err) {
    fail("S3Client init", err)
    return null
  }
}

// ─── Step 3 — verify credentials + bucket ─────────────────────────────────────

async function checkBucket(client: S3Client): Promise<boolean> {
  section("Step 3 — verify credentials and bucket access")

  const bucket = process.env.S3_BUCKET!

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }))
    pass("Credentials valid",  "access key accepted by R2")
    pass("Bucket exists",      `"${bucket}" found and accessible`)
    return true
  } catch (err: any) {
    if (err?.name === "NotFound" || err?.$metadata?.httpStatusCode === 404) {
      fail("Bucket check", `Bucket "${bucket}" does not exist — create it in the R2 dashboard`)
    } else if (err?.$metadata?.httpStatusCode === 403) {
      fail("Credentials", "Access denied — check your S3_ACCESS_KEY and S3_SECRET_KEY")
    } else {
      fail("Bucket check", err)
    }
    return false
  }
}

// ─── Step 4 — list existing objects ───────────────────────────────────────────

async function listObjects(client: S3Client) {
  section("Step 4 — list objects in bucket (first 5)")

  try {
    const res = await client.send(new ListObjectsV2Command({
      Bucket:  process.env.S3_BUCKET!,
      MaxKeys: 5,
    }))

    const count   = res.KeyCount ?? 0
    const objects = res.Contents ?? []

    pass("ListObjectsV2", `${count} objects returned`)

    if (objects.length === 0) {
      info("Objects", "bucket is empty (expected on a fresh setup)")
    } else {
      objects.forEach(obj => {
        info("  object", `${obj.Key}  (${((obj.Size ?? 0) / 1024).toFixed(1)} KB)`)
      })
    }
  } catch (err) {
    fail("List objects", err)
  }
}

// ─── Step 5 — upload a test file ──────────────────────────────────────────────

async function uploadTestFile(client: S3Client): Promise<string | null> {
  section("Step 5 — upload test file (PutObject)")

  const key     = `crip-health-check/test-${Date.now()}.txt`
  const content = `CRIP R2 health check\nTimestamp: ${new Date().toISOString()}\nBucket: ${process.env.S3_BUCKET}\n`

  try {
    const res = await client.send(new PutObjectCommand({
      Bucket:      process.env.S3_BUCKET!,
      Key:         key,
      Body:        content,
      ContentType: "text/plain",
      Metadata: {
        source:    "crip-health-check",
        timestamp: new Date().toISOString(),
      },
    }))

    pass("PutObject",     `key: ${key}`)
    pass("HTTP status",   String(res.$metadata.httpStatusCode))
    pass("ETag returned", res.ETag ?? "(none)")
    return key
  } catch (err) {
    fail("PutObject", err)
    return null
  }
}

// ─── Step 6 — download the test file ─────────────────────────────────────────

async function downloadTestFile(client: S3Client, key: string) {
  section("Step 6 — download test file (GetObject)")

  try {
    const res = await client.send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key:    key,
    }))

    const body = await res.Body?.transformToString()
    pass("GetObject",      `key: ${key}`)
    pass("Content-Type",   res.ContentType ?? "(none)")
    pass("Content-Length", `${res.ContentLength} bytes`)
    pass("Body matches",   body?.includes("CRIP R2 health check") ? "yes" : "NO — content mismatch")
  } catch (err) {
    fail("GetObject", err)
  }
}

// ─── Step 7 — presigned URL ───────────────────────────────────────────────────

async function testPresignedUrl(client: S3Client, key: string) {
  section("Step 7 — generate presigned upload URL (getSignedUrl)")

  try {
    // Generate a presigned PUT URL — same as getPresignedUploadUrl() in upload.ts
    const command = new PutObjectCommand({
      Bucket:      process.env.S3_BUCKET!,
      Key:         `crip-health-check/presigned-test-${Date.now()}.txt`,
      ContentType: "text/plain",
    })

    const url = await getSignedUrl(client, command, { expiresIn: 3600 })

    pass("getSignedUrl",  "URL generated successfully")
    pass("Expires in",    "1 hour")
    pass("URL prefix",    url.split("?")[0])

    // Verify the URL is actually usable — do a real upload via fetch
    const uploadRes = await fetch(url, {
      method:  "PUT",
      body:    "presigned url test content",
      headers: { "Content-Type": "text/plain" },
    })

    if (uploadRes.ok) {
      pass("Presigned PUT", `HTTP ${uploadRes.status} — browser upload works`)
    } else {
      fail("Presigned PUT", `HTTP ${uploadRes.status} — ${uploadRes.statusText}`)
    }
  } catch (err) {
    fail("getSignedUrl", err)
  }
}

// ─── Step 8 — delete the test file ───────────────────────────────────────────

async function deleteTestFile(client: S3Client, key: string) {
  section("Step 8 — delete test file (DeleteObject)")

  try {
    const res = await client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key:    key,
    }))

    pass("DeleteObject", `HTTP ${res.$metadata.httpStatusCode}`)
    pass("Cleanup",      "test file removed from bucket")
  } catch (err) {
    fail("DeleteObject", err)
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function printNextSteps(allPassed: boolean) {
  console.log("\n" + "═".repeat(44))

  if (allPassed) {
    console.log(`\x1b[32m${BOLD("R2 is fully operational.")}\x1b[0m`)
    console.log(DIM("\nYour server/lib/r2.ts will work correctly."))
    console.log(DIM("Next step: run the Drizzle schema migration."))
    console.log(DIM("  npx drizzle-kit push:pg"))
  } else {
    console.log(`\x1b[33m${BOLD("Some checks failed — see errors above.")}\x1b[0m`)
    console.log(DIM("\nCommon fixes:"))
    console.log(DIM("  • 403 error   → Wrong S3_ACCESS_KEY or S3_SECRET_KEY"))
    console.log(DIM("  • 404 error   → Bucket name wrong or not created yet"))
    console.log(DIM("  • ENOTFOUND   → S3_ENDPOINT URL is incorrect"))
    console.log(DIM("  • Missing var → Add the key to .env.local and rerun"))
  }

  console.log()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(BOLD("\nCRIP — R2 storage connection tester"))
  console.log(DIM("Mirrors server/lib/r2.ts exactly\n"))

  let allPassed = true

  // Step 1 — env vars
  const envOk = checkEnvVars()
  if (!envOk) {
    console.log(`\n${RED} Cannot continue — fix missing env vars first.`)
    printNextSteps(false)
    process.exit(1)
  }

  // Step 2 — build client
  const client = buildClient()
  if (!client) {
    printNextSteps(false)
    process.exit(1)
  }

  // Step 3 — verify bucket
  const bucketOk = await checkBucket(client)
  if (!bucketOk) {
    allPassed = false
    printNextSteps(false)
    process.exit(1)
  }

  // Step 4 — list objects
  await listObjects(client)

  // Step 5 — upload
  const testKey = await uploadTestFile(client)
  if (!testKey) {
    allPassed = false
  } else {
    // Step 6 — download
    await downloadTestFile(client, testKey)

    // Step 7 — presigned URL
    await testPresignedUrl(client, testKey)

    // Step 8 — delete
    await deleteTestFile(client, testKey)
  }

  printNextSteps(allPassed)
}

main().catch((err) => {
  console.error("\nFatal:", err)
  process.exit(1)
})

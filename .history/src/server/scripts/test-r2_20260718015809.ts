function buildClient(): S3Client | null {
  try {
    const client = new S3Client({
      region:   process.env.S3_REGION ?? "auto",   // same
      endpoint: process.env.S3_ENDPOINT!,           // same
      credentials: {
        accessKeyId:     process.env.S3_ACCESS_KEY!,     // same
        secretAccessKey: process.env.S3_SECRET_KEY!,     // same
      },
      forcePathStyle: false,                        // same
    })

    pass("S3Client created", "endpoint → " + process.env.S3_ENDPOINT)
    return client

  } catch (err) {
    fail("S3Client init", err)
    return null   // script stops here if this fails
  }
}
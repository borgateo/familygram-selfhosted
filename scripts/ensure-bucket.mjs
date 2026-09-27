import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'

for (const name of ['S3_ENDPOINT', 'S3_REGION', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET']) {
  if (!process.env[name]) throw new Error(`${name} is required`)
}

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
})

const Bucket = process.env.S3_BUCKET

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    await client.send(new HeadBucketCommand({ Bucket }))
    break
  } catch {
    try {
      await client.send(new CreateBucketCommand({ Bucket }))
      console.log(`Created bucket ${Bucket}`)
      break
    } catch (error) {
      if (attempt === 30) throw error
      await delay(2000)
    }
  }
}

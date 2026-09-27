import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getConfig } from '@/lib/config'

const config = getConfig().s3
const credentials = {
  accessKeyId: config.accessKey,
  secretAccessKey: config.secretKey,
}

const storage = new S3Client({
  region: config.region,
  endpoint: config.endpoint,
  forcePathStyle: true,
  credentials,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

const publicStorage = new S3Client({
  region: config.region,
  endpoint: config.publicEndpoint,
  forcePathStyle: true,
  credentials,
})

export function getPresignedGetUrl(key: string): Promise<string> {
  return getSignedUrl(publicStorage, new GetObjectCommand({ Bucket: config.bucket, Key: key }), { expiresIn: 3600 })
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await storage.send(new PutObjectCommand({ Bucket: config.bucket, Key: key, Body: body, ContentType: contentType }))
}

export async function deleteObject(key: string): Promise<void> {
  await storage.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }))
}

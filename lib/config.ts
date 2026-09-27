type Config = {
  databaseUrl: string
  appUrl: string
  s3: {
    endpoint: string
    publicEndpoint: string
    region: string
    accessKey: string
    secretKey: string
    bucket: string
  }
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function validUrl(name: string, value: string): string {
  try {
    return new URL(value).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${name} must be a valid URL`)
  }
}

let cached: Config | undefined

export function getConfig(): Config {
  if (cached) return cached

  cached = {
    databaseUrl: required('DATABASE_URL'),
    appUrl: validUrl('APP_URL', required('APP_URL')),
    s3: {
      endpoint: validUrl('S3_ENDPOINT', required('S3_ENDPOINT')),
      publicEndpoint: validUrl('S3_PUBLIC_ENDPOINT', required('S3_PUBLIC_ENDPOINT')),
      region: process.env.S3_REGION?.trim() || 'us-east-1',
      accessKey: required('S3_ACCESS_KEY'),
      secretKey: required('S3_SECRET_KEY'),
      bucket: required('S3_BUCKET'),
    },
  }
  return cached
}

export function resetConfigForTests(): void {
  cached = undefined
}

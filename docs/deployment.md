# Deployment

The supplied `compose.yaml` is the reference deployment. It starts the application, PostgreSQL and MinIO with persistent named volumes.

## Private-network deployment

For a trusted private network such as Tailscale, bind the application and MinIO API to the private interface and set URLs that clients can reach:

```dotenv
APP_BIND_HOST=0.0.0.0
MINIO_BIND_HOST=0.0.0.0
APP_URL=http://your-private-host:3000
S3_PUBLIC_ENDPOINT=http://your-private-host:9000
```

Keep PostgreSQL and the MinIO console bound to localhost.

## Internet-facing deployment

Use an HTTPS reverse proxy such as Caddy, Traefik or nginx. Set `APP_URL` and `S3_PUBLIC_ENDPOINT` to their HTTPS origins so session cookies are marked secure and signed media URLs work in browsers.

Before exposing an instance to the internet:

- verify backups and a restore;
- use long random passwords;
- keep the host and containers updated;
- restrict PostgreSQL and the MinIO console to localhost;
- review proxy upload-size and request-rate limits;
- enable HTTPS only.

This repository does not prescribe a public DNS or certificate provider.

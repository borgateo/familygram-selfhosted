# FamilyGram

FamilyGram is a private, self-hosted photo and video feed for a single family or small trusted group. It provides an Instagram-like mobile experience without turning family media into a public social network.

The project is intentionally small: one Next.js application, one PostgreSQL database and one S3-compatible object store.

## Features

- Private feed with photos, videos, comments and per-user likes
- Invite-only registration and admin controls
- Profiles and family relationships
- English, Italian and Brazilian Portuguese
- Mobile-first interface and web app manifest
- Password authentication with bcrypt and revocable database sessions
- MinIO by default; compatible with S3-style object storage

## Quick start

Requirements: Docker Engine with Docker Compose v2.

```bash
git clone https://github.com/borgateo/familygram-selfhosted.git
cd familygram-selfhosted
cp .env.example .env
```

Edit `.env` and replace both example passwords. Hexadecimal secrets avoid URL-encoding problems and can be generated with `openssl rand -hex 24`.

```bash
docker compose up -d --build
docker compose exec app node scripts/admin.mjs create
```

Open <http://localhost:3000> and sign in with the administrator account you created. Database migrations and the MinIO bucket are created automatically when the app starts.

By default, all published ports bind to `127.0.0.1`. To reach FamilyGram from another device, set `APP_BIND_HOST`, `MINIO_BIND_HOST`, `APP_URL` and `S3_PUBLIC_ENDPOINT` in `.env`. Use a private network such as Tailscale or an HTTPS reverse proxy; do not expose PostgreSQL or the MinIO console publicly.

## Development

```bash
cp .env.example .env
cp .env.local.example .env.local
docker compose up -d postgres minio
npm ci
npm run db:migrate
npm run dev
```

The passwords in `.env.local` must match the PostgreSQL and MinIO passwords in `.env`.

Run the complete local quality gate with:

```bash
npm run check
npm run build
```

## Administration

Inside Docker:

```bash
docker compose exec app node scripts/admin.mjs create
docker compose exec app node scripts/admin.mjs reset-password
```

Locally, the equivalent commands are `npm run admin:create` and `npm run admin:reset-password`. Resetting a password also revokes all existing sessions for that user.

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Backup and restore](docs/backup-and-restore.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Project scope

FamilyGram is a single-family application, not a multi-tenant social platform. Microservices, public discovery, advertising, analytics and algorithmic feeds are deliberately out of scope.

## License

[MIT](LICENSE)

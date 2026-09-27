# Architecture

FamilyGram is a modular monolith. Next.js owns the web UI, HTTP routes and application use cases. PostgreSQL stores users, sessions and feed data. MinIO stores media.

```text
Browser
  │
  ▼
Next.js application
  ├── features/       business rules and use cases
  ├── lib/db.ts       PostgreSQL adapter
  └── lib/storage.ts  S3-compatible storage adapter
        │                    │
        ▼                    ▼
   PostgreSQL              MinIO
```

Route handlers should remain thin: authenticate, parse input, call a feature module and translate the result to HTTP. Business rules should not be duplicated in React components or route handlers.

The project uses small modules at external boundaries instead of a dependency-injection framework. It deliberately avoids microservices, CQRS, an event bus and a generic repository abstraction.

## Data ownership

- The server generates every post ID and object-storage key.
- Media keys are namespaced by user and post.
- Passwords use bcrypt and are never stored in plaintext.
- Session cookies contain opaque random tokens; PostgreSQL stores only their SHA-256 hashes.
- Likes belong to authenticated users, not IP or browser fingerprints.

## Migrations

Ordered SQL files live in `db/migrations`. `scripts/migrate.mjs` applies each migration once and records it in `schema_migrations`. Migrations execute under a PostgreSQL advisory lock so concurrent app starts do not race.

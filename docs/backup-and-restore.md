# Backup and restore

A FamilyGram backup is complete only when it contains both PostgreSQL and MinIO data.

## PostgreSQL

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U familygram -d familygram -Fc > backups/familygram.dump
```

Restore into an empty installation with:

```bash
docker compose exec -T postgres pg_restore -U familygram -d familygram --clean --if-exists < backups/familygram.dump
```

## Media

Use the MinIO client (`mc mirror`) to copy the configured FamilyGram bucket to encrypted storage outside the server. Mirror that directory back into an empty bucket during restoration.

Always test the complete database-and-media restoration on a separate instance before relying on a backup process.

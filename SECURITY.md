# Security policy

FamilyGram stores private family media. Treat configuration, backups and database dumps as sensitive.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not open a public issue containing exploit details, credentials or private media.

## Deployment expectations

- Use HTTPS or a trusted private network.
- Never expose PostgreSQL or the MinIO console to the internet.
- Use unique random secrets and keep `.env` files out of version control.
- Keep the host, container images and Node dependencies updated.
- Maintain encrypted, tested backups of PostgreSQL and object storage.

Security fixes are provided for the latest release only while the project is below version 1.0.

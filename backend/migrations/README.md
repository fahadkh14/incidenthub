# Database Migrations

This project uses **Flask-Migrate** (Alembic) for schema migrations.

On first run, the backend container automatically creates all tables via
`db.create_all()` and seeds demo data (see `app/seed.py`), so the app works
out of the box with no manual migration step.

For ongoing schema changes in development, use the standard Flask-Migrate workflow
from inside the backend container:

```bash
docker compose exec backend flask db init      # first time only, creates this folder's contents
docker compose exec backend flask db migrate -m "describe your change"
docker compose exec backend flask db upgrade
```

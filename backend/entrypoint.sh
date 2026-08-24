#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."
python - <<'PYEOF'
import os
import sys
import time
import pymysql

host = os.getenv("DB_HOST", "mysql")
port = int(os.getenv("DB_PORT", "3306"))
user = os.getenv("MYSQL_USER", "incidenthub")
password = os.getenv("MYSQL_PASSWORD", "")
database = os.getenv("MYSQL_DATABASE", "incidenthub")

for attempt in range(60):
    try:
        conn = pymysql.connect(host=host, port=port, user=user, password=password, database=database)
        conn.close()
        print("MySQL is ready.")
        sys.exit(0)
    except Exception as exc:
        print(f"MySQL not ready yet (attempt {attempt + 1}/60): {exc}")
        time.sleep(2)

print("MySQL did not become ready in time.")
sys.exit(1)
PYEOF

echo "Initializing database schema and demo data..."
python - <<'PYEOF'
from app import create_app
from app.seed import run_seed

app = create_app()
with app.app_context():
    result = run_seed()
    print(f"Seed result: {result}")
PYEOF

echo "Starting Gunicorn..."
exec gunicorn -c gunicorn.conf.py "run:app"

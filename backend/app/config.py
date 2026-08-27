import os
from datetime import timedelta
from typing import ClassVar


def _parse_expires(value: str) -> timedelta:
    """Parse strings like '1d', '12h', '30m' into a timedelta. Defaults to 1 day."""
    if not value:
        return timedelta(days=1)

    value = value.strip().lower()

    try:
        if value.endswith("d"):
            return timedelta(days=int(value[:-1]))
        if value.endswith("h"):
            return timedelta(hours=int(value[:-1]))
        if value.endswith("m"):
            return timedelta(minutes=int(value[:-1]))

        return timedelta(seconds=int(value))
    except ValueError:
        return timedelta(days=1)


class Config:
    DB_HOST = os.getenv("DB_HOST", "mysql")
    DB_PORT = os.getenv("DB_PORT", "3306")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "incidenthub")
    MYSQL_USER = os.getenv("MYSQL_USER", "incidenthub")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{MYSQL_DATABASE}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS: ClassVar = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET",
        "change_me_to_a_secure_random_secret",
    )
    JWT_ACCESS_TOKEN_EXPIRES = _parse_expires(os.getenv("JWT_EXPIRES_IN", "1d"))
    JWT_TOKEN_LOCATION: ClassVar = ["headers"]

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    SEED_DEMO_DATA = os.getenv("SEED_DEMO_DATA", "true").lower() == "true"

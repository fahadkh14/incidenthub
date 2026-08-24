from flask import Blueprint, jsonify
from sqlalchemy import text

from app.extensions import db

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.route("/health", methods=["GET"])
def health():
    try:
        db.session.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    status_code = 200 if db_status == "healthy" else 503
    return (
        jsonify(
            {
                "status": "healthy" if db_status == "healthy" else "degraded",
                "service": "incidenthub-backend",
                "database": db_status,
            }
        ),
        status_code,
    )

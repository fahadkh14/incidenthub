from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from app.extensions import db
from app.models.activity import Activity
from app.models.incident import Incident, Severity, Status
from app.utils.responses import success

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def get_dashboard():
    total = Incident.query.count()
    open_count = Incident.query.filter(Incident.status == Status.OPEN).count()
    critical_count = Incident.query.filter(Incident.severity == Severity.P1).count()
    investigating_count = Incident.query.filter(Incident.status == Status.INVESTIGATING).count()
    resolved_count = Incident.query.filter(
        Incident.status.in_([Status.RESOLVED, Status.CLOSED])
    ).count()

    severity_rows = (
        db.session.query(Incident.severity, func.count(Incident.id))
        .group_by(Incident.severity)
        .all()
    )
    severity_distribution = {sev: 0 for sev in Severity.ALL}
    for sev, count in severity_rows:
        severity_distribution[sev] = count

    status_rows = (
        db.session.query(Incident.status, func.count(Incident.id)).group_by(Incident.status).all()
    )
    status_distribution = {st: 0 for st in Status.ALL}
    for st, count in status_rows:
        status_distribution[st] = count

    recent_incidents = (
        Incident.query.order_by(Incident.created_at.desc()).limit(6).all()
    )
    recent_activity = (
        Activity.query.order_by(Activity.created_at.desc()).limit(8).all()
    )

    return success(
        {
            "stats": {
                "total_incidents": total,
                "open_incidents": open_count,
                "critical_incidents": critical_count,
                "investigating_incidents": investigating_count,
                "resolved_incidents": resolved_count,
            },
            "severity_distribution": severity_distribution,
            "status_distribution": status_distribution,
            "recent_incidents": [i.to_dict() for i in recent_incidents],
            "recent_activity": [a.to_dict() for a in recent_activity],
        },
        "Dashboard data retrieved",
    )

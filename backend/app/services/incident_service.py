from sqlalchemy import func

from app.extensions import db
from app.models.incident import Incident
from app.models.activity import Activity


def generate_incident_number() -> str:
    """Generate the next sequential incident number, e.g. INC-000001."""
    last = db.session.query(func.max(Incident.incident_number)).scalar()
    if not last:
        next_seq = 1
    else:
        try:
            next_seq = int(last.split("-")[1]) + 1
        except (IndexError, ValueError):
            next_seq = Incident.query.count() + 1
    return f"INC-{next_seq:06d}"


def log_activity(incident_id, user_id, action, old_value=None, new_value=None):
    activity = Activity(
        incident_id=incident_id,
        user_id=user_id,
        action=action,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
    )
    db.session.add(activity)
    return activity

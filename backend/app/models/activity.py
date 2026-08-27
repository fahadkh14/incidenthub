import uuid
from datetime import datetime, timezone

from app.extensions import db


def _uuid():
    return str(uuid.uuid4())


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    incident_id = db.Column(
        db.String(36), db.ForeignKey("incidents.id"), nullable=False
    )
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(60), nullable=False)
    old_value = db.Column(db.String(255), nullable=True)
    new_value = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", foreign_keys=[user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "incident_id": self.incident_id,
            "user_id": self.user_id,
            "user": self.user.to_dict() if self.user else None,
            "action": self.action,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

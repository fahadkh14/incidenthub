import uuid
from datetime import datetime, timezone

from app.extensions import db


def _uuid():
    return str(uuid.uuid4())


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    incident_id = db.Column(db.String(36), db.ForeignKey("incidents.id"), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", foreign_keys=[user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "incident_id": self.incident_id,
            "user_id": self.user_id,
            "user": self.user.to_dict() if self.user else None,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

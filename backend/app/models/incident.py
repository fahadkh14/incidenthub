import uuid
from datetime import datetime, timezone
from typing import ClassVar

from app.extensions import db


class Severity:
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"

    ALL: ClassVar = [P1, P2, P3, P4]

    LABELS: ClassVar = {
        "P1": "P1 - Critical",
        "P2": "P2 - High",
        "P3": "P3 - Medium",
        "P4": "P4 - Low",
    }


class Status:
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    MITIGATED = "MITIGATED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

    ALL: ClassVar = [
        OPEN,
        INVESTIGATING,
        MITIGATED,
        RESOLVED,
        CLOSED,
    ]


class Environment:
    PRODUCTION = "PRODUCTION"
    STAGING = "STAGING"
    DEVELOPMENT = "DEVELOPMENT"

    ALL: ClassVar = [
        PRODUCTION,
        STAGING,
        DEVELOPMENT,
    ]


class Category:
    APPLICATION = "APPLICATION"
    DATABASE = "DATABASE"
    NETWORK = "NETWORK"
    SECURITY = "SECURITY"
    INFRASTRUCTURE = "INFRASTRUCTURE"
    OTHER = "OTHER"

    ALL: ClassVar = [
        APPLICATION,
        DATABASE,
        NETWORK,
        SECURITY,
        INFRASTRUCTURE,
        OTHER,
    ]


def _uuid():
    return str(uuid.uuid4())


class Incident(db.Model):
    __tablename__ = "incidents"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    incident_number = db.Column(
        db.String(20),
        nullable=False,
        unique=True,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    severity = db.Column(
        db.String(10),
        nullable=False,
        default=Severity.P3,
    )
    status = db.Column(
        db.String(20),
        nullable=False,
        default=Status.OPEN,
    )
    category = db.Column(
        db.String(30),
        nullable=False,
        default=Category.OTHER,
    )
    environment = db.Column(
        db.String(20),
        nullable=False,
        default=Environment.PRODUCTION,
    )
    service_name = db.Column(db.String(120), nullable=True)

    created_by = db.Column(
        db.String(36),
        db.ForeignKey("users.id"),
        nullable=True,
    )
    assigned_to = db.Column(
        db.String(36),
        db.ForeignKey("users.id"),
        nullable=True,
    )

    started_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolution = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    creator = db.relationship("User", foreign_keys=[created_by])
    assignee = db.relationship("User", foreign_keys=[assigned_to])

    comments = db.relationship(
        "Comment",
        backref="incident",
        cascade="all, delete-orphan",
        order_by="Comment.created_at",
    )

    activities = db.relationship(
        "Activity",
        backref="incident",
        cascade="all, delete-orphan",
        order_by="Activity.created_at",
    )

    def to_dict(self, include_relations=True):
        data = {
            "id": self.id,
            "incident_number": self.incident_number,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "severity_label": Severity.LABELS.get(
                self.severity,
                self.severity,
            ),
            "status": self.status,
            "category": self.category,
            "environment": self.environment,
            "service_name": self.service_name,
            "created_by": self.created_by,
            "assigned_to": self.assigned_to,
            "started_at": (self.started_at.isoformat() if self.started_at else None),
            "resolved_at": (self.resolved_at.isoformat() if self.resolved_at else None),
            "resolution": self.resolution,
            "created_at": (self.created_at.isoformat() if self.created_at else None),
            "updated_at": (self.updated_at.isoformat() if self.updated_at else None),
        }

        if include_relations:
            data["creator"] = self.creator.to_dict() if self.creator else None
            data["assignee"] = self.assignee.to_dict() if self.assignee else None

        return data

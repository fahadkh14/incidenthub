"""Idempotent bootstrap: creates tables (if missing) and seeds demo data.

Run inside the app context, e.g. via `flask shell` or the container entrypoint.
Safe to run multiple times.
"""
from datetime import datetime, timedelta, timezone

from app.extensions import db
from app.models.incident import Category, Environment, Incident, Severity, Status
from app.models.user import Role, User
from app.services.incident_service import generate_incident_number, log_activity

DEMO_USERS = [
    {"name": "Ava Admin", "email": "admin@incidenthub.local", "password": "Admin123!", "role": Role.ADMIN},
    {"name": "Ethan Engineer", "email": "engineer@incidenthub.local", "password": "Engineer123!", "role": Role.ENGINEER},
    {"name": "Vera Viewer", "email": "viewer@incidenthub.local", "password": "Viewer123!", "role": Role.VIEWER},
]

DEMO_INCIDENTS = [
    {
        "title": "Checkout service returning 500 errors",
        "description": "Elevated 5xx error rate on the checkout API following the latest deploy.",
        "severity": Severity.P1,
        "status": Status.INVESTIGATING,
        "category": Category.APPLICATION,
        "environment": Environment.PRODUCTION,
        "service_name": "checkout-api",
    },
    {
        "title": "Primary database replica lag spike",
        "description": "Read replica lag exceeded 30s, causing stale reads on the dashboard.",
        "severity": Severity.P2,
        "status": Status.MITIGATED,
        "category": Category.DATABASE,
        "environment": Environment.PRODUCTION,
        "service_name": "orders-db",
    },
    {
        "title": "Intermittent packet loss between us-east nodes",
        "description": "Sporadic timeouts observed between internal services in us-east-1.",
        "severity": Severity.P3,
        "status": Status.OPEN,
        "category": Category.NETWORK,
        "environment": Environment.PRODUCTION,
        "service_name": "internal-mesh",
    },
    {
        "title": "TLS certificate nearing expiry on staging",
        "description": "Certificate for staging.incidenthub.local expires in 5 days.",
        "severity": Severity.P4,
        "status": Status.OPEN,
        "category": Category.SECURITY,
        "environment": Environment.STAGING,
        "service_name": "edge-gateway",
    },
    {
        "title": "CI runners exhausted during release window",
        "description": "Build queue backed up due to insufficient CI runner capacity.",
        "severity": Severity.P3,
        "status": Status.RESOLVED,
        "category": Category.INFRASTRUCTURE,
        "environment": Environment.DEVELOPMENT,
        "service_name": "ci-runners",
    },
]


def run_seed():
    db.create_all()

    if User.query.count() > 0:
        return {"seeded": False, "reason": "data already present"}

    users = {}
    for u in DEMO_USERS:
        user = User(name=u["name"], email=u["email"], role=u["role"])
        user.set_password(u["password"])
        db.session.add(user)
        db.session.flush()
        users[u["role"]] = user

    admin = users[Role.ADMIN]
    engineer = users[Role.ENGINEER]

    for idx, data in enumerate(DEMO_INCIDENTS):
        incident = Incident(
            incident_number=generate_incident_number(),
            title=data["title"],
            description=data["description"],
            severity=data["severity"],
            status=data["status"],
            category=data["category"],
            environment=data["environment"],
            service_name=data["service_name"],
            created_by=admin.id,
            assigned_to=engineer.id,
            started_at=datetime.now(timezone.utc) - timedelta(hours=idx * 7 + 1),
        )
        if data["status"] in (Status.RESOLVED, Status.CLOSED):
            incident.resolved_at = datetime.now(timezone.utc) - timedelta(hours=idx)
            incident.resolution = "Root cause identified and mitigated; monitoring for recurrence."

        db.session.add(incident)
        db.session.flush()

        log_activity(incident.id, admin.id, "Incident created", new_value=incident.incident_number)
        log_activity(incident.id, admin.id, "Engineer assigned", new_value=engineer.id)
        if data["status"] != Status.OPEN:
            log_activity(incident.id, engineer.id, "Status changed", Status.OPEN, data["status"])

    db.session.commit()
    return {"seeded": True, "users": len(DEMO_USERS), "incidents": len(DEMO_INCIDENTS)}

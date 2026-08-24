from datetime import datetime, timezone

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_

from app.extensions import db
from app.models.incident import Incident, Severity, Status, Environment, Category
from app.models.user import User
from app.services.incident_service import generate_incident_number, log_activity
from app.utils.responses import success, error

incidents_bp = Blueprint("incidents", __name__, url_prefix="/api/incidents")


def _validate_incident_payload(payload, partial=False):
    errors = {}

    title = payload.get("title")
    if not partial or "title" in payload:
        if not title or not str(title).strip():
            errors["title"] = "Title is required"

    severity = payload.get("severity")
    if severity is not None and severity not in Severity.ALL:
        errors["severity"] = f"Severity must be one of {Severity.ALL}"

    status = payload.get("status")
    if status is not None and status not in Status.ALL:
        errors["status"] = f"Status must be one of {Status.ALL}"

    environment = payload.get("environment")
    if environment is not None and environment not in Environment.ALL:
        errors["environment"] = f"Environment must be one of {Environment.ALL}"

    category = payload.get("category")
    if category is not None and category not in Category.ALL:
        errors["category"] = f"Category must be one of {Category.ALL}"

    assigned_to = payload.get("assigned_to")
    if assigned_to:
        if not User.query.get(assigned_to):
            errors["assigned_to"] = "Assigned engineer not found"

    return errors


@incidents_bp.route("", methods=["GET"])
@jwt_required()
def list_incidents():
    query = Incident.query

    search = request.args.get("search")
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Incident.title.ilike(like),
                Incident.incident_number.ilike(like),
                Incident.service_name.ilike(like),
            )
        )

    severity = request.args.get("severity")
    if severity:
        query = query.filter(Incident.severity == severity)

    status = request.args.get("status")
    if status:
        query = query.filter(Incident.status == status)

    environment = request.args.get("environment")
    if environment:
        query = query.filter(Incident.environment == environment)

    category = request.args.get("category")
    if category:
        query = query.filter(Incident.category == category)

    date_from = request.args.get("date_from")
    if date_from:
        query = query.filter(Incident.created_at >= date_from)

    date_to = request.args.get("date_to")
    if date_to:
        query = query.filter(Incident.created_at <= date_to)

    sort_by = request.args.get("sort_by", "created_at")
    sort_dir = request.args.get("sort_dir", "desc")
    sort_column = getattr(Incident, sort_by, Incident.created_at)
    query = query.order_by(sort_column.desc() if sort_dir == "desc" else sort_column.asc())

    page = max(int(request.args.get("page", 1)), 1)
    per_page = min(max(int(request.args.get("per_page", 10)), 1), 100)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success(
        {
            "items": [i.to_dict() for i in pagination.items],
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
        },
        "Incidents retrieved",
    )


@incidents_bp.route("", methods=["POST"])
@jwt_required()
def create_incident():
    user_id = get_jwt_identity()
    payload = request.get_json(silent=True) or {}

    errors = _validate_incident_payload(payload)
    if errors:
        return error("Validation failed: " + "; ".join(errors.values()), "VALIDATION_ERROR", 422)

    incident = Incident(
        incident_number=generate_incident_number(),
        title=payload["title"].strip(),
        description=payload.get("description"),
        severity=payload.get("severity", Severity.P3),
        status=payload.get("status", Status.OPEN),
        category=payload.get("category", Category.OTHER),
        environment=payload.get("environment", Environment.PRODUCTION),
        service_name=payload.get("service_name"),
        assigned_to=payload.get("assigned_to") or None,
        created_by=user_id,
    )
    db.session.add(incident)
    db.session.flush()

    log_activity(incident.id, user_id, "Incident created", new_value=incident.incident_number)
    if incident.assigned_to:
        log_activity(incident.id, user_id, "Engineer assigned", new_value=incident.assigned_to)

    db.session.commit()

    return success({"incident": incident.to_dict()}, "Incident created successfully", 201)


@incidents_bp.route("/<incident_id>", methods=["GET"])
@jwt_required()
def get_incident(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return error("Incident not found", "NOT_FOUND", 404)
    return success({"incident": incident.to_dict()}, "Incident retrieved")


@incidents_bp.route("/<incident_id>", methods=["PUT"])
@jwt_required()
def update_incident(incident_id):
    user_id = get_jwt_identity()
    incident = Incident.query.get(incident_id)
    if not incident:
        return error("Incident not found", "NOT_FOUND", 404)

    payload = request.get_json(silent=True) or {}
    errors = _validate_incident_payload(payload, partial=True)
    if errors:
        return error("Validation failed: " + "; ".join(errors.values()), "VALIDATION_ERROR", 422)

    trackable_fields = ["status", "severity", "assigned_to", "category", "environment", "service_name"]
    for field in trackable_fields:
        if field in payload and payload[field] != getattr(incident, field):
            old_value = getattr(incident, field)
            new_value = payload[field]
            setattr(incident, field, new_value)
            if field == "status":
                log_activity(incident.id, user_id, "Status changed", old_value, new_value)
                if new_value == Status.RESOLVED and not incident.resolved_at:
                    incident.resolved_at = datetime.now(timezone.utc)
                    log_activity(incident.id, user_id, "Incident resolved", new_value=new_value)
            elif field == "severity":
                log_activity(incident.id, user_id, "Severity changed", old_value, new_value)
            elif field == "assigned_to":
                log_activity(incident.id, user_id, "Engineer assigned", old_value, new_value)
            else:
                log_activity(incident.id, user_id, f"{field.replace('_', ' ').title()} changed", old_value, new_value)

    for field in ["title", "description", "resolution"]:
        if field in payload:
            setattr(incident, field, payload[field])

    if not trackable_fields and not payload:
        pass

    log_activity(incident.id, user_id, "Incident updated")
    db.session.commit()

    return success({"incident": incident.to_dict()}, "Incident updated successfully")


@incidents_bp.route("/<incident_id>", methods=["DELETE"])
@jwt_required()
def delete_incident(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return error("Incident not found", "NOT_FOUND", 404)
    db.session.delete(incident)
    db.session.commit()
    return success({}, "Incident deleted successfully")


@incidents_bp.route("/<incident_id>/comments", methods=["GET"])
@jwt_required()
def list_comments(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return error("Incident not found", "NOT_FOUND", 404)
    return success({"items": [c.to_dict() for c in incident.comments]}, "Comments retrieved")


@incidents_bp.route("/<incident_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(incident_id):
    from app.models.comment import Comment

    user_id = get_jwt_identity()
    incident = Incident.query.get(incident_id)
    if not incident:
        return error("Incident not found", "NOT_FOUND", 404)

    payload = request.get_json(silent=True) or {}
    text = (payload.get("comment") or "").strip()
    if not text:
        return error("Comment text is required", "VALIDATION_ERROR", 422)

    comment = Comment(incident_id=incident_id, user_id=user_id, comment=text)
    db.session.add(comment)
    log_activity(incident_id, user_id, "Comment added")
    db.session.commit()

    return success({"comment": comment.to_dict()}, "Comment added successfully", 201)


@incidents_bp.route("/<incident_id>/activity", methods=["GET"])
@jwt_required()
def list_activity(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return error("Incident not found", "NOT_FOUND", 404)
    return success({"items": [a.to_dict() for a in incident.activities]}, "Activity retrieved")

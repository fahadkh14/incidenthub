from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db, bcrypt
from app.models.user import User, Role
from app.utils.responses import success, error

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    role = payload.get("role") or Role.VIEWER

    if not name or not email or not password:
        return error("Name, email and password are required", "VALIDATION_ERROR", 422)

    if len(password) < 8:
        return error("Password must be at least 8 characters", "VALIDATION_ERROR", 422)

    if role not in Role.ALL:
        role = Role.VIEWER

    existing = User.query.filter_by(email=email).first()
    if existing:
        return error("An account with this email already exists", "DUPLICATE_EMAIL", 409)

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id, additional_claims={"role": user.role, "name": user.name})

    return success(
        {"user": user.to_dict(), "access_token": token},
        "Account created successfully",
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return error("Email and password are required", "VALIDATION_ERROR", 422)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error("Invalid email or password", "INVALID_CREDENTIALS", 401)

    token = create_access_token(identity=user.id, additional_claims={"role": user.role, "name": user.name})

    return success({"user": user.to_dict(), "access_token": token}, "Login successful")


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return error("User not found", "NOT_FOUND", 404)
    return success({"user": user.to_dict()}, "Current user retrieved")

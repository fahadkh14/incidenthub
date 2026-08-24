from flask import Blueprint
from flask_jwt_extended import jwt_required

from app.models.user import User
from app.utils.responses import success, error

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("", methods=["GET"])
@jwt_required()
def list_users():
    users = User.query.order_by(User.name.asc()).all()
    return success({"items": [u.to_dict() for u in users]}, "Users retrieved")


@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error("User not found", "NOT_FOUND", 404)
    return success({"user": user.to_dict()}, "User retrieved")

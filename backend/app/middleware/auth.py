from functools import wraps

from flask_jwt_extended import get_jwt, verify_jwt_in_request

from app.utils.responses import error


def roles_required(*roles):
    """Decorator that restricts an endpoint to the given list of roles.
    Must be used alongside @jwt_required() (or it verifies the JWT itself)."""

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in roles:
                return error("You do not have permission to perform this action", "FORBIDDEN", 403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator

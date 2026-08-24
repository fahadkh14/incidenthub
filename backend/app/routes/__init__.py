from app.routes.auth import auth_bp
from app.routes.incidents import incidents_bp
from app.routes.dashboard import dashboard_bp
from app.routes.users import users_bp
from app.routes.health import health_bp


def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(incidents_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(health_bp)

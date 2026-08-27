import logging

from flask import Flask
from flask_jwt_extended.exceptions import JWTExtendedException
from jwt.exceptions import PyJWTError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.config import Config
from app.extensions import bcrypt, cors, db, jwt, migrate
from app.utils.responses import error


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(
        app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}}
    )

    from app.routes import register_routes

    register_routes(app)

    register_error_handlers(app)
    register_jwt_handlers(jwt)

    logging.basicConfig(level=logging.INFO)

    return app


def register_jwt_handlers(jwt_manager):
    @jwt_manager.unauthorized_loader
    def missing_token(reason):
        return error("Authentication token is missing", "MISSING_TOKEN", 401)

    @jwt_manager.invalid_token_loader
    def invalid_token(reason):
        return error("Authentication token is invalid", "INVALID_JWT", 401)

    @jwt_manager.expired_token_loader
    def expired_token(header, payload):
        return error("Authentication token has expired", "EXPIRED_TOKEN", 401)


def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(e):
        return error("The requested resource was not found", "NOT_FOUND", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error("Method not allowed", "METHOD_NOT_ALLOWED", 405)

    @app.errorhandler(IntegrityError)
    def integrity_error(e):
        db.session.rollback()
        return error("A database constraint was violated", "DB_INTEGRITY_ERROR", 409)

    @app.errorhandler(SQLAlchemyError)
    def db_error(e):
        db.session.rollback()
        app.logger.exception("Database error")
        return error("A database error occurred", "DB_ERROR", 500)

    @app.errorhandler(JWTExtendedException)
    def jwt_error(e):
        return error("Authentication failed", "INVALID_JWT", 401)

    @app.errorhandler(PyJWTError)
    def pyjwt_error(e):
        return error("Authentication failed", "INVALID_JWT", 401)

    @app.errorhandler(Exception)
    def unhandled_exception(e):
        app.logger.exception("Unhandled exception")
        return error("An internal server error occurred", "INTERNAL_SERVER_ERROR", 500)

    @app.errorhandler(400)
    def bad_request(e):
        return error("Bad request", "BAD_REQUEST", 400)

    @app.errorhandler(401)
    def unauthorized(e):
        return error("Authentication required", "UNAUTHORIZED", 401)

    @app.errorhandler(403)
    def forbidden(e):
        return error(
            "You do not have permission to perform this action", "FORBIDDEN", 403
        )

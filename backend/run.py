import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    # Local debugging only - production uses gunicorn (see Dockerfile / gunicorn.conf.py)
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT", "5673")),
        debug=False,
    )
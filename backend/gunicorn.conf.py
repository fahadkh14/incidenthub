import multiprocessing
import os

bind = f"0.0.0.0:{os.getenv('BACKEND_PORT', '5673')}"
workers = int(
    os.getenv(
        "GUNICORN_WORKERS",
        str(max(2, multiprocessing.cpu_count())),
    )
)
threads = int(os.getenv("GUNICORN_THREADS", "2"))
worker_class = "gthread"
timeout = int(os.getenv("GUNICORN_TIMEOUT", "60"))
accesslog = "-"
errorlog = "-"
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")

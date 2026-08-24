# Simple production image for the Flask backend

FROM python:3.12-slim

WORKDIR /app

# Install python packages first (this layer gets cached, faster rebuilds)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# curl is only needed for the healthcheck below
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the rest of the app code
COPY . .
RUN chmod +x entrypoint.sh

# Run as a non-root user
RUN useradd -m appuser
USER appuser

ENV PYTHONUNBUFFERED=1
EXPOSE 5673

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:5673/api/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]

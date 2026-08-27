FROM python:3.12-slim

WORKDIR /app

# Install pinned curl version for Docker healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl=8.14.1-2+deb13u4 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 5673

ENTRYPOINT ["./entrypoint.sh"]
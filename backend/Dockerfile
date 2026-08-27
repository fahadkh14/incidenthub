FROM python:3.12-slim

WORKDIR /app

# Install curl for Docker healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 5673

ENTRYPOINT ["./entrypoint.sh"]
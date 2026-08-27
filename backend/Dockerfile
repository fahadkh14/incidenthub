FROM python:3.12-slim

WORKDIR /app

# Update OS security packages and install pinned curl
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends curl=8.14.1-2+deb13u4 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 5673

ENTRYPOINT ["./entrypoint.sh"]
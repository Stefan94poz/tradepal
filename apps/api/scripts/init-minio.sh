#!/bin/sh
# Initialize MinIO bucket for Medusa

echo "Waiting for MinIO to be ready..."
until curl -sf http://localhost:9000/minio/health/live; do
    echo "Waiting for MinIO..."
    sleep 2
done

echo "Installing MinIO Client (mc)..."
wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
chmod +x /usr/local/bin/mc

echo "Configuring MinIO alias..."
mc alias set local http://localhost:9000 minioadmin minioadmin

echo "Creating bucket 'tradepal'..."
mc mb local/tradepal --ignore-existing

echo "Setting public read policy for bucket..."
mc anonymous set download local/tradepal

echo "Bucket initialization complete!"
mc ls local/

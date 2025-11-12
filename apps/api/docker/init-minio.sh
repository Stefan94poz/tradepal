#!/bin/sh
# MinIO Bucket Initialization Script
# This script creates the bucket and sets public read access for product images

echo "Waiting for MinIO to start..."
sleep 5

echo "Creating bucket 'tradepal' if it doesn't exist..."
mc alias set myminio http://minio:9000 minioadmin minioadmin
mc mb myminio/tradepal --ignore-existing

echo "Setting bucket policy for public read access..."
cat > /tmp/policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::tradepal/*"]
    }
  ]
}
EOF

mc anonymous set-json /tmp/policy.json myminio/tradepal

echo "MinIO bucket initialization complete!"

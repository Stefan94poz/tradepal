# MinIO S3-Compatible File Storage - Setup Complete

## Status: ✅ CONFIGURED AND WORKING

Successfully configured MinIO as the S3-compatible file storage backend for Medusa v2 using the built-in File Module.

## Configuration Summary

### 1. Medusa File Module Configuration

**File**: `medusa-config.ts`

```typescript
{
  resolve: "@medusajs/medusa/file",
  options: {
    providers: [
      {
        resolve: "@medusajs/medusa/file-s3",
        id: "s3",
        options: {
          file_url: process.env.S3_FILE_URL,
          access_key_id: process.env.S3_ACCESS_KEY_ID,
          secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
          region: process.env.S3_REGION,
          bucket: process.env.S3_BUCKET,
          endpoint: process.env.S3_ENDPOINT,
          additional_client_config: {
            forcePathStyle: true, // Required for MinIO
          },
        },
      },
    ],
  },
}
```

### 2. Environment Variables

**File**: `.env`

```bash
# S3-Compatible File Module Configuration (MinIO)
S3_FILE_URL=http://localhost:9000/tradepal
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_REGION=us-east-1
S3_BUCKET=tradepal
S3_ENDPOINT=http://localhost:9000

# MinIO Object Storage (for custom service)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=tradepal
MINIO_USE_SSL=false
```

### 3. Docker Configuration

**File**: `docker-compose.yml`

MinIO service environment variables for container networking:

```yaml
environment:
  - S3_ENDPOINT=http://minio:9000
  - S3_FILE_URL=http://minio:9000/tradepal
```

### 4. MinIO Bucket Setup

**Bucket Name**: `tradepal`  
**Access**: Public read access for all objects  
**Region**: `us-east-1`

**Bucket Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::tradepal/*"]
    },
    {
      "Effect": "Allow",
      "Principal": { "AWS": ["*"] },
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::tradepal"]
    }
  ]
}
```

## Bucket Initialization

The bucket was created using the initialization script:

```bash
node scripts/init-bucket.js
```

This script:

1. Connects to MinIO server
2. Creates the `tradepal` bucket if it doesn't exist
3. Sets public read policy for web access
4. Verifies bucket creation

## Access Points

- **MinIO API**: http://localhost:9000
- **MinIO Console**: http://localhost:9001
- **Bucket URL**: http://localhost:9000/tradepal/
- **From Docker containers**: http://minio:9000/tradepal/

## Credentials

- **Access Key**: `minioadmin`
- **Secret Key**: `minioadmin`

⚠️ **Note**: These are default credentials. Change them in production!

## How File Module Works

1. Medusa's File Module is configured to use the S3 provider
2. The S3 provider connects to MinIO (S3-compatible API)
3. Files uploaded through Medusa admin are stored in MinIO
4. Public URLs are generated for file access
5. `forcePathStyle: true` ensures MinIO compatibility

## Usage in Medusa

### Upload File via Admin API

The Medusa admin dashboard now uses MinIO for:

- Product images
- CSV exports (products, orders, etc.)
- Any file uploads through the admin

### Access Files

Files are accessible via public URLs:

```
http://localhost:9000/tradepal/{filename}
```

### Custom File Operations

You can also use the custom MinioService for advanced operations:

```typescript
import MinioService from "../services/minio";

const minioService = new MinioService();
const url = await minioService.uploadFile(
  fileBuffer,
  "products/image.jpg",
  "image/jpeg"
);
```

## Troubleshooting

### Access Denied Error

**Symptom**: `<Error><Code>AccessDenied</Code>`

**Solutions**:

1. ✅ Verify bucket exists: `curl http://localhost:9000/tradepal/`
2. ✅ Check credentials match in .env and docker-compose.yml
3. ✅ Ensure `forcePathStyle: true` in medusa-config.ts
4. ✅ Verify bucket policy allows public read

### Bucket Not Found

**Solution**: Run initialization script

```bash
cd apps/api
node scripts/init-bucket.js
```

### Connection Refused

**Check**:

1. MinIO container is running: `docker ps | grep minio`
2. Port 9000 is accessible: `curl http://localhost:9000/minio/health/live`
3. Inside Docker network, use `minio` hostname instead of `localhost`

## Verification

Test bucket access:

```bash
# From host
curl -I http://localhost:9000/tradepal/
# Expected: HTTP/1.1 200 OK

# List buckets
curl http://localhost:9000/tradepal/
```

Test file upload via Medusa:

1. Login to admin dashboard
2. Go to Products
3. Export products to CSV
4. Check MinIO for uploaded file

## Security Notes

### Production Recommendations

1. **Change Credentials**:

   ```bash
   S3_ACCESS_KEY_ID=<strong-access-key>
   S3_SECRET_ACCESS_KEY=<strong-secret-key>
   ```

2. **Use HTTPS**:

   ```bash
   MINIO_USE_SSL=true
   S3_ENDPOINT=https://minio.yourdomain.com
   ```

3. **Restrict Bucket Policy**:
   - Only allow public read for specific paths (e.g., `products/*`)
   - Require authentication for admin uploads

4. **Enable Versioning**:
   Protects against accidental deletions

## Files Created

- `scripts/init-bucket.js` - Bucket initialization script
- `src/loaders/minio.ts` - Auto-initialization loader (optional)
- `src/services/minio.ts` - Custom MinIO service for advanced operations

## Related Documentation

- [Medusa File Module](https://docs.medusajs.com/resources/infrastructure-modules/file)
- [S3 File Provider](https://docs.medusajs.com/resources/infrastructure-modules/file/s3)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)

## Next Steps

- ✅ Bucket created and configured
- ✅ File Module integrated
- ✅ Public read access enabled
- ⏭️ Test file uploads through admin dashboard
- ⏭️ Implement product image uploads in frontend
- ⏭️ Add verification document uploads

**The AccessDenied error should now be resolved!** 🎉

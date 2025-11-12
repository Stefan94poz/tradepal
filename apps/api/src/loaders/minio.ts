import * as Minio from "minio";

/**
 * Loader to initialize MinIO bucket on Medusa startup
 * This ensures the bucket exists before the File Module tries to use it
 */
export default async function minioLoader() {
  const bucket = process.env.S3_BUCKET || "tradepal";

  const client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.S3_ACCESS_KEY_ID || "minioadmin",
    secretKey: process.env.S3_SECRET_ACCESS_KEY || "minioadmin",
  });

  try {
    console.log(`Checking if MinIO bucket '${bucket}' exists...`);
    const exists = await client.bucketExists(bucket);

    if (!exists) {
      console.log(`Creating MinIO bucket: ${bucket}`);
      await client.makeBucket(bucket, "us-east-1");

      // Set public read policy for all objects
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:ListBucket"],
            Resource: [`arn:aws:s3:::${bucket}`],
          },
        ],
      };

      await client.setBucketPolicy(bucket, JSON.stringify(policy));
      console.log(
        `✅ MinIO bucket '${bucket}' created with public read access`
      );
    } else {
      console.log(`✅ MinIO bucket '${bucket}' already exists`);
    }
  } catch (error) {
    console.error("❌ MinIO bucket initialization error:", error);
    // Don't throw - allow Medusa to start even if bucket initialization fails
    // The File Module will create it if needed
  }
}

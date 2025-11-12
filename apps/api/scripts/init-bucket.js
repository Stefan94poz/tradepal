const Minio = require("minio");

const client = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

async function initializeBucket() {
  const bucketName = "tradepal";

  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    const exists = await client.bucketExists(bucketName);

    if (!exists) {
      console.log(`Creating bucket '${bucketName}'...`);
      await client.makeBucket(bucketName, "us-east-1");

      // Set public read policy
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:ListBucket"],
            Resource: [`arn:aws:s3:::${bucketName}`],
          },
        ],
      };

      await client.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`✅ Bucket '${bucketName}' created with public read access`);
    } else {
      console.log(`✅ Bucket '${bucketName}' already exists`);
    }

    // List buckets to verify
    const buckets = await client.listBuckets();
    console.log("\nAvailable buckets:");
    buckets.forEach((bucket) => {
      console.log(`- ${bucket.name} (created: ${bucket.creationDate})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

initializeBucket();

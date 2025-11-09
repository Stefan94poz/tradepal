import { Client } from "minio";
import { MedusaService } from "@medusajs/framework/utils";
import { Readable } from "stream";

class FileStorageService extends MedusaService({}) {
  private minioClient: Client;
  private bucketName = "tradepal";
  private productImagesBucket = "tradepal-products";
  private documentsBucket = "tradepal-documents";

  constructor(container: any, options: any) {
    super(...arguments);

    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT?.split(":")[0] || "localhost",
      port: parseInt(process.env.MINIO_ENDPOINT?.split(":")[1] || "9000"),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    });

    // Initialize buckets
    this.initBuckets();
  }

  private async initBuckets() {
    const buckets = [this.productImagesBucket, this.documentsBucket];

    for (const bucket of buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket, "us-east-1");

          // Set public read policy for product images
          if (bucket === this.productImagesBucket) {
            const policy = {
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Principal: { AWS: ["*"] },
                  Action: ["s3:GetObject"],
                  Resource: [`arn:aws:s3:::${bucket}/*`],
                },
              ],
            };
            await this.minioClient.setBucketPolicy(
              bucket,
              JSON.stringify(policy)
            );
          }

          console.log(`Created bucket: ${bucket}`);
        }
      } catch (error) {
        console.error(`Error creating bucket ${bucket}:`, error);
      }
    }
  }

  async uploadProductImage(
    file: Buffer | Readable,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const objectName = `products/${Date.now()}-${fileName}`;

    await this.minioClient.putObject(
      this.productImagesBucket,
      objectName,
      file,
      {
        "Content-Type": contentType,
      }
    );

    // Return public URL
    const port = process.env.MINIO_ENDPOINT?.split(":")[1] || "9002";
    const host = process.env.MINIO_PUBLIC_HOST || "localhost";
    return `http://${host}:${port}/${this.productImagesBucket}/${objectName}`;
  }

  async uploadVerificationDocument(
    file: Buffer | Readable,
    fileName: string,
    userId: string,
    contentType: string
  ): Promise<string> {
    const objectName = `verifications/${userId}/${Date.now()}-${fileName}`;

    await this.minioClient.putObject(this.documentsBucket, objectName, file, {
      "Content-Type": contentType,
    });

    return objectName; // Return object name for presigned URL generation
  }

  async getPresignedUrl(
    objectName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    return await this.minioClient.presignedGetObject(
      this.documentsBucket,
      objectName,
      expiresIn
    );
  }

  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }

  async listProductImages(prefix: string): Promise<string[]> {
    const objects: string[] = [];
    const stream = this.minioClient.listObjects(
      this.productImagesBucket,
      prefix,
      true
    );

    return new Promise((resolve, reject) => {
      stream.on("data", (obj) => objects.push(obj.name));
      stream.on("error", reject);
      stream.on("end", () => resolve(objects));
    });
  }
}

export default FileStorageService;

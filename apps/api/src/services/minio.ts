import * as Minio from "minio";

export default class MinioService {
  private client: Minio.Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET || "tradepal";

    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port: parseInt(process.env.MINIO_PORT || "9000"),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    });

    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, "us-east-1");
        console.log(`Created MinIO bucket: ${this.bucket}`);

        // Set bucket policy to allow public read for product images
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucket}/products/*`],
            },
          ],
        };

        await this.client.setBucketPolicy(
          this.bucket,
          JSON.stringify(policy)
        );
      }
    } catch (error) {
      console.error("MinIO bucket initialization error:", error);
    }
  }

  /**
   * Upload a file to MinIO
   * @param file - File buffer or stream
   * @param fileName - Destination file path (e.g., "products/image123.jpg")
   * @param contentType - MIME type of the file
   * @returns URL to access the file
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const metadata = {
      "Content-Type": contentType,
    };

    await this.client.putObject(this.bucket, fileName, file, file.length, metadata);

    // Return public URL for product images
    if (fileName.startsWith("products/")) {
      return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.bucket}/${fileName}`;
    }

    // For verification documents, return a signed URL
    return await this.getPresignedUrl(fileName);
  }

  /**
   * Generate a presigned URL for secure file access
   * @param fileName - File path in bucket
   * @param expirySeconds - URL expiry time in seconds (default: 1 hour)
   * @returns Presigned URL
   */
  async getPresignedUrl(
    fileName: string,
    expirySeconds: number = 3600
  ): Promise<string> {
    return await this.client.presignedGetObject(
      this.bucket,
      fileName,
      expirySeconds
    );
  }

  /**
   * Delete a file from MinIO
   * @param fileName - File path to delete
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.client.removeObject(this.bucket, fileName);
  }

  /**
   * List files in a directory
   * @param prefix - Directory prefix (e.g., "products/")
   * @returns Array of file names
   */
  async listFiles(prefix: string): Promise<string[]> {
    const files: string[] = [];
    const stream = this.client.listObjects(this.bucket, prefix, true);

    return new Promise((resolve, reject) => {
      stream.on("data", (obj) => {
        if (obj.name) {
          files.push(obj.name);
        }
      });
      stream.on("end", () => resolve(files));
      stream.on("error", (err) => reject(err));
    });
  }

  /**
   * Check if a file exists
   * @param fileName - File path to check
   * @returns true if file exists, false otherwise
   */
  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   * @param fileName - File path
   * @returns File stat object
   */
  async getFileMetadata(fileName: string) {
    return await this.client.statObject(this.bucket, fileName);
  }
}

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import multer from "multer";
import MinioService from "../../../services/minio";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed."));
    }
  },
});

/**
 * POST /admin/uploads
 * Upload files (product images or verification documents)
 *
 * Body:
 * - files: Array of files (multipart/form-data)
 * - type: "product" or "verification"
 * - entity_id: Related entity ID (product_id or seller_id)
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Handle file upload using multer middleware
    await new Promise<void>((resolve, reject) => {
      upload.array("files", 10)(req as any, res as any, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const files = (req as any).files as Express.Multer.File[];
    const { type, entity_id } = req.body as { type: string; entity_id: string };

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (!type || !entity_id) {
      return res.status(400).json({ error: "Missing type or entity_id" });
    }

    const minioService = new MinioService();
    const uploadedFiles: { url: string; fileName: string }[] = [];

    // Upload each file
    for (const file of files) {
      const timestamp = Date.now();
      const fileName = `${type}s/${entity_id}/${timestamp}-${file.originalname}`;

      const url = await minioService.uploadFile(
        file.buffer,
        fileName,
        file.mimetype
      );

      uploadedFiles.push({
        url,
        fileName,
      });
    }

    res.json({
      uploads: uploadedFiles,
      count: uploadedFiles.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to upload files",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * GET /admin/uploads/:fileName
 * Get a presigned URL for a file
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const fileName = req.params.fileName;

    if (!fileName) {
      return res.status(400).json({ error: "Missing fileName parameter" });
    }

    const minioService = new MinioService();

    // Check if file exists
    const exists = await minioService.fileExists(fileName);
    if (!exists) {
      return res.status(404).json({ error: "File not found" });
    }

    // Generate presigned URL (valid for 1 hour)
    const url = await minioService.getPresignedUrl(fileName, 3600);

    res.json({ url });
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate download URL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

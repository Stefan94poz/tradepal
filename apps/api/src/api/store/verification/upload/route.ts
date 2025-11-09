import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { FILE_STORAGE_MODULE } from "../../../../modules/file-storage";
import FileStorageService from "../../../../modules/file-storage/service";
import formidable from "formidable";
import fs from "fs";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const fileStorageService: FileStorageService =
    req.scope.resolve(FILE_STORAGE_MODULE);

  // Parse multipart form data
  const form = formidable({ multiples: false });

  form.parse(req as any, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "File upload failed",
        details: err.message,
      });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({
        error: "No file provided",
      });
    }

    try {
      // Read file buffer
      const fileBuffer = fs.readFileSync(file.filepath);

      // Upload to MinIO
      const objectName = await fileStorageService.uploadVerificationDocument(
        fileBuffer,
        file.originalFilename || "document.pdf",
        userId,
        file.mimetype || "application/octet-stream"
      );

      // Generate presigned URL (valid for 1 hour)
      const presignedUrl = await fileStorageService.getPresignedUrl(
        objectName,
        3600
      );

      // Clean up temp file
      fs.unlinkSync(file.filepath);

      res.json({
        objectName,
        url: presignedUrl,
        message: "Document uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Upload failed",
        details: error.message,
      });
    }
  });
};

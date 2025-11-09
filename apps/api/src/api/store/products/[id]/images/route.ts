import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { FILE_STORAGE_MODULE } from "../../../../../modules/file-storage";
import FileStorageService from "../../../../../modules/file-storage/service";
import formidable from "formidable";
import fs from "fs";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId } = req.params;
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // TODO: Verify user owns this product

  const fileStorageService: FileStorageService =
    req.scope.resolve(FILE_STORAGE_MODULE);

  const form = formidable({ multiples: true });

  form.parse(req as any, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "File upload failed",
        details: err.message,
      });
    }

    const uploadedImages: string[] = [];
    const fileArray = Array.isArray(files.images)
      ? files.images
      : [files.images];

    try {
      for (const file of fileArray) {
        if (!file) continue;

        const fileBuffer = fs.readFileSync(file.filepath);

        const imageUrl = await fileStorageService.uploadProductImage(
          fileBuffer,
          file.originalFilename || "image.jpg",
          file.mimetype || "image/jpeg"
        );

        uploadedImages.push(imageUrl);
        fs.unlinkSync(file.filepath);
      }

      // TODO: Update product images in database

      res.json({
        images: uploadedImages,
        count: uploadedImages.length,
        message: "Images uploaded successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: "Upload failed",
        details: error.message,
      });
    }
  });
};

import { model } from "@medusajs/framework/utils";

export const VerificationDocuments = model.define("verification_documents", {
  id: model.id().primaryKey(),
  user_id: model.text(),
  profile_type: model.enum(["seller", "buyer"]),
  document_urls: model.array(),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  submission_date: model.dateTime(),
  reviewed_at: model.dateTime().nullable(),
  rejection_reason: model.text().nullable(),
  reviewed_by: model.text().nullable(),
});

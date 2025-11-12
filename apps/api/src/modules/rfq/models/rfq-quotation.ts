import { model } from "@medusajs/framework/utils";

const RFQQuotation = model.define("rfq_quotation", {
  id: model.id().primaryKey(),

  // Relationships
  rfq_id: model.text(), // Link to RFQ
  vendor_id: model.text(), // Link to vendor

  // Quotation details
  quoted_price: model.number(), // Price per unit
  total_price: model.number(), // Total quotation amount

  // Terms
  lead_time_days: model.number(), // Production/delivery time
  minimum_order_quantity: model.number().nullable(),
  validity_days: model.number().default(30), // How long quote is valid

  // Product details
  product_specifications: model.json().nullable(), // Detailed specs offered
  samples_available: model.boolean().default(false),

  // Terms and conditions
  payment_terms: model.text().nullable(), // e.g., "30% deposit, 70% on delivery"
  delivery_terms: model.text().nullable(), // Incoterms, shipping method
  warranty_terms: model.text().nullable(),

  // Status
  status: model
    .enum(["pending", "submitted", "accepted", "rejected", "expired"])
    .default("pending"),

  // Additional info
  notes: model.text().nullable(),
  attachments: model.array().nullable(), // Product sheets, certifications

  // Response tracking
  submitted_at: model.dateTime().nullable(),
  responded_at: model.dateTime().nullable(), // When buyer responded

  // Metadata
  metadata: model.json().nullable(),
});

export default RFQQuotation;

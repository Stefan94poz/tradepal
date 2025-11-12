import { model } from "@medusajs/framework/utils";

const RFQ = model.define("rfq", {
  id: model.id().primaryKey(),

  // Buyer information
  buyer_id: model.text(), // Link to buyer/customer
  buyer_company: model.text(),
  buyer_email: model.text(),
  buyer_phone: model.text().nullable(),

  // RFQ details
  title: model.text().searchable(),
  description: model.text(),

  // Product requirements
  product_details: model.json(), // Array of products with quantities, specs
  // Example: [{ product_id: "...", quantity: 100, specifications: {...} }]

  // Requirements
  target_price: model.number().nullable(), // Budget per unit
  total_budget: model.number().nullable(), // Total budget
  quantity: model.number(), // Total quantity needed
  delivery_deadline: model.dateTime().nullable(),
  delivery_address: model.text().nullable(),

  // Status tracking
  status: model
    .enum(["draft", "published", "quoted", "accepted", "rejected", "closed"])
    .default("draft"),

  // Quotation metrics
  quotations_count: model.number().default(0),

  // Validity
  valid_until: model.dateTime().nullable(),

  // Additional info
  attachments: model.array().nullable(), // Document URLs
  special_requirements: model.text().nullable(),
  payment_terms: model.text().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});

export default RFQ;

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251112111940 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "rfq" ("id" text not null, "buyer_id" text not null, "buyer_company" text not null, "buyer_email" text not null, "buyer_phone" text null, "title" text not null, "description" text not null, "product_details" jsonb not null, "target_price" integer null, "total_budget" integer null, "quantity" integer not null, "delivery_deadline" timestamptz null, "delivery_address" text null, "status" text check ("status" in ('draft', 'published', 'quoted', 'accepted', 'rejected', 'closed')) not null default 'draft', "quotations_count" integer not null default 0, "valid_until" timestamptz null, "attachments" text[] null, "special_requirements" text null, "payment_terms" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rfq_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rfq_deleted_at" ON "rfq" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "rfq_quotation" ("id" text not null, "rfq_id" text not null, "vendor_id" text not null, "quoted_price" integer not null, "total_price" integer not null, "lead_time_days" integer not null, "minimum_order_quantity" integer null, "validity_days" integer not null default 30, "product_specifications" jsonb null, "samples_available" boolean not null default false, "payment_terms" text null, "delivery_terms" text null, "warranty_terms" text null, "status" text check ("status" in ('pending', 'submitted', 'accepted', 'rejected', 'expired')) not null default 'pending', "notes" text null, "attachments" text[] null, "submitted_at" timestamptz null, "responded_at" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rfq_quotation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rfq_quotation_deleted_at" ON "rfq_quotation" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "rfq" cascade;`);

    this.addSql(`drop table if exists "rfq_quotation" cascade;`);
  }

}

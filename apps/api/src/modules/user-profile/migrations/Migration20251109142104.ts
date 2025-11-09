import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109142104 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "buyer_profile" ("id" text not null, "user_id" text not null, "company_name" text not null, "business_interests" text[] null, "business_needs" text null, "location" text not null, "country" text not null, "verification_status" text check ("verification_status" in ('pending', 'verified', 'rejected')) not null default 'pending', "description" text null, "phone" text null, "email" text not null, "verified_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "buyer_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_buyer_profile_deleted_at" ON "buyer_profile" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "seller_profile" ("id" text not null, "user_id" text not null, "company_name" text not null, "business_type" text check ("business_type" in ('manufacturer', 'wholesaler', 'distributor', 'retailer', 'other')) not null, "location" text not null, "country" text not null, "certifications" text[] null, "verification_status" text check ("verification_status" in ('pending', 'verified', 'rejected')) not null default 'pending', "description" text null, "phone" text null, "email" text not null, "website" text null, "logo_url" text null, "verified_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seller_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seller_profile_deleted_at" ON "seller_profile" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "verification_documents" ("id" text not null, "user_id" text not null, "profile_type" text check ("profile_type" in ('seller', 'buyer')) not null, "document_urls" text[] not null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "submission_date" timestamptz not null, "reviewed_at" timestamptz null, "rejection_reason" text null, "reviewed_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "verification_documents_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_verification_documents_deleted_at" ON "verification_documents" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "buyer_profile" cascade;`);

    this.addSql(`drop table if exists "seller_profile" cascade;`);

    this.addSql(`drop table if exists "verification_documents" cascade;`);
  }

}

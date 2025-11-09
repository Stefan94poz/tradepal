import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109185521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "seller_profile" ("id" text not null, "user_id" text not null, "company_name" text not null, "business_type" text not null, "description" text not null, "country" text not null, "city" text not null, "address" text not null, "certifications" text[] not null, "verification_status" text check ("verification_status" in ('pending', 'verified', 'rejected')) not null default 'pending', "verification_documents" text[] not null, "is_seller" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "seller_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_seller_profile_deleted_at" ON "seller_profile" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "seller_profile" cascade;`);
  }

}

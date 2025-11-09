import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109142114 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "partner_directory_profile" ("id" text not null, "user_id" text not null, "company_name" text not null, "country" text not null, "industry" text[] not null, "looking_for" text[] not null, "offers" text[] not null, "description" text null, "contact_email" text not null, "contact_phone" text null, "website" text null, "logo_url" text null, "is_verified" boolean not null default false, "is_published" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "partner_directory_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_partner_directory_profile_deleted_at" ON "partner_directory_profile" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "partner_directory_profile" cascade;`);
  }

}

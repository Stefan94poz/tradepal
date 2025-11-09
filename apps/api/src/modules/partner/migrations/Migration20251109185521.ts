import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109185521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "partner_profile" ("id" text not null, "user_id" text not null, "profile_type" text check ("profile_type" in ('seller', 'buyer')) not null, "company_name" text not null, "country" text not null, "industry" text[] not null, "looking_for" text[] not null, "offers" text[] not null, "is_verified" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "partner_profile_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_partner_profile_deleted_at" ON "partner_profile" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_partner_profile_country" ON "partner_profile" ("country") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_partner_profile_is_verified" ON "partner_profile" ("is_verified") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "partner_profile" cascade;`);
  }

}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251112120407 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "buyer_profile" drop constraint if exists "buyer_profile_verification_status_check";`);

    this.addSql(`alter table if exists "buyer_profile" add column if not exists "business_type" text null, add column if not exists "phone" text null, add column if not exists "email" text null, add column if not exists "purchase_history_count" integer not null default 0;`);
    this.addSql(`alter table if exists "buyer_profile" add constraint "buyer_profile_verification_status_check" check("verification_status" in ('pending', 'basic', 'verified', 'premium', 'rejected'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "buyer_profile" drop constraint if exists "buyer_profile_verification_status_check";`);

    this.addSql(`alter table if exists "buyer_profile" drop column if exists "business_type", drop column if exists "phone", drop column if exists "email", drop column if exists "purchase_history_count";`);

    this.addSql(`alter table if exists "buyer_profile" add constraint "buyer_profile_verification_status_check" check("verification_status" in ('pending', 'verified', 'rejected'));`);
  }

}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251112120434 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "escrow_transaction" drop constraint if exists "escrow_transaction_status_check";`);

    this.addSql(`alter table if exists "escrow_transaction" add column if not exists "partial_release_enabled" boolean not null default false, add column if not exists "partial_release_amount" numeric null, add column if not exists "auto_release_days" integer not null default 14, add column if not exists "auto_release_at" timestamptz null, add column if not exists "raw_partial_release_amount" jsonb null;`);
    this.addSql(`alter table if exists "escrow_transaction" add constraint "escrow_transaction_status_check" check("status" in ('held', 'released', 'disputed', 'refunded', 'partially_released'));`);
    this.addSql(`alter table if exists "escrow_transaction" rename column "seller_id" to "vendor_id";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "escrow_transaction" drop constraint if exists "escrow_transaction_status_check";`);

    this.addSql(`alter table if exists "escrow_transaction" drop column if exists "partial_release_enabled", drop column if exists "partial_release_amount", drop column if exists "auto_release_days", drop column if exists "auto_release_at", drop column if exists "raw_partial_release_amount";`);

    this.addSql(`alter table if exists "escrow_transaction" add constraint "escrow_transaction_status_check" check("status" in ('held', 'released', 'disputed', 'refunded'));`);
    this.addSql(`alter table if exists "escrow_transaction" rename column "vendor_id" to "seller_id";`);
  }

}

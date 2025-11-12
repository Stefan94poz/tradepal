import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251112105825 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "commission" ("id" text not null, "vendor_id" text not null, "order_id" text not null, "line_item_id" text null, "order_total" integer not null, "commission_rate" integer not null, "commission_amount" integer not null, "platform_fee" integer not null default 0, "net_amount" integer not null, "currency_code" text not null default 'usd', "status" text check ("status" in ('pending', 'processing', 'paid', 'failed', 'refunded')) not null default 'pending', "payout_id" text null, "paid_at" timestamptz null, "notes" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "commission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_deleted_at" ON "commission" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "commission" cascade;`);
  }

}

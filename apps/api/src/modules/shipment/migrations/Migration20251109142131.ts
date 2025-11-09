import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109142131 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "shipment_tracking" ("id" text not null, "order_id" text not null, "carrier" text not null, "tracking_number" text not null, "status" text check ("status" in ('pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')) not null default 'pending', "tracking_events" jsonb null, "estimated_delivery" timestamptz null, "actual_delivery" timestamptz null, "shipped_at" timestamptz null, "last_updated" timestamptz not null, "tracking_url" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipment_tracking_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipment_tracking_deleted_at" ON "shipment_tracking" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "shipment_tracking" cascade;`);
  }

}

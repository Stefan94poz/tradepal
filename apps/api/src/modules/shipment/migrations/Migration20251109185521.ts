import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109185521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "shipment_tracking" drop constraint if exists "shipment_tracking_order_id_unique";`);
    this.addSql(`create table if not exists "shipment_tracking" ("id" text not null, "order_id" text not null, "carrier" text not null, "tracking_number" text not null, "status" text check ("status" in ('pending', 'in_transit', 'delivered', 'failed')) not null default 'pending', "current_location" text null, "estimated_delivery" timestamptz null, "last_updated" timestamptz not null, "tracking_events" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipment_tracking_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipment_tracking_deleted_at" ON "shipment_tracking" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_shipment_tracking_order_id_unique" ON "shipment_tracking" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipment_tracking_tracking_number" ON "shipment_tracking" ("tracking_number") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "shipment_tracking" cascade;`);
  }

}

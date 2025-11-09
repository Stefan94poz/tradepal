import { Migration } from "@mikro-orm/migrations";

export class Migration20250109000001 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "b2b_product_config" ("id" text not null, "product_id" text not null, "minimum_order_quantity" integer not null default 1, "lead_time_days" integer null, "bulk_pricing_tiers" jsonb null, "is_b2b_only" boolean not null default false, "moq_unit" text null, "availability_status" text check ("availability_status" in (\'in_stock\', \'made_to_order\', \'out_of_stock\', \'discontinued\')) not null default \'in_stock\', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_product_config_pkey" primary key ("id"));'
    );
    this.addSql(
      'create index if not exists "IDX_b2b_product_config_product_id" on "b2b_product_config" ("product_id");'
    );
    this.addSql(
      'create index if not exists "IDX_b2b_product_config_deleted_at" on "b2b_product_config" ("deleted_at");'
    );
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "b2b_product_config" cascade;');
  }
}

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109185521 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "escrow_transaction" drop constraint if exists "escrow_transaction_order_id_unique";`);
    this.addSql(`create table if not exists "escrow_transaction" ("id" text not null, "order_id" text not null, "buyer_id" text not null, "seller_id" text not null, "amount" numeric not null, "currency" text not null, "status" text check ("status" in ('held', 'released', 'disputed', 'refunded')) not null default 'held', "payment_intent_id" text not null, "held_at" timestamptz not null, "released_at" timestamptz null, "dispute_reason" text null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "escrow_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_escrow_transaction_deleted_at" ON "escrow_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_escrow_transaction_order_id_unique" ON "escrow_transaction" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_escrow_transaction_status" ON "escrow_transaction" ("status") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "escrow_transaction" cascade;`);
  }

}

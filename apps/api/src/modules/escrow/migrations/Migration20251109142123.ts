import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251109142123 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "escrow_transaction" ("id" text not null, "order_id" text not null, "buyer_id" text not null, "seller_id" text not null, "amount" numeric not null, "currency_code" text not null default 'usd', "status" text check ("status" in ('pending', 'held', 'released', 'refunded', 'disputed', 'cancelled')) not null default 'pending', "payment_intent_id" text null, "payment_method" text null, "held_at" timestamptz null, "released_at" timestamptz null, "refunded_at" timestamptz null, "dispute_reason" text null, "disputed_at" timestamptz null, "resolved_at" timestamptz null, "resolution_notes" text null, "auto_release_at" timestamptz null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "escrow_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_escrow_transaction_deleted_at" ON "escrow_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "escrow_transaction" cascade;`);
  }

}

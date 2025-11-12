import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251112114845 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "conversation" ("id" text not null, "participant_one_id" text not null, "participant_one_type" text check ("participant_one_type" in ('buyer', 'vendor')) not null, "participant_two_id" text not null, "participant_two_type" text check ("participant_two_type" in ('buyer', 'vendor')) not null, "product_reference" text null, "last_message_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "conversation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_conversation_deleted_at" ON "conversation" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "message" ("id" text not null, "conversation_id" text not null, "sender_id" text not null, "sender_type" text check ("sender_type" in ('buyer', 'vendor')) not null, "recipient_id" text not null, "recipient_type" text check ("recipient_type" in ('buyer', 'vendor')) not null, "subject" text null, "body" text not null, "attachments" jsonb null, "is_read" boolean not null default false, "product_reference" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_message_deleted_at" ON "message" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "conversation" cascade;`);

    this.addSql(`drop table if exists "message" cascade;`);
  }

}

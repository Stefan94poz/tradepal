import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251112120424 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "partner_profile" drop constraint if exists "partner_profile_profile_type_check";`);

    this.addSql(`alter table if exists "partner_profile" add constraint "partner_profile_profile_type_check" check("profile_type" in ('vendor', 'buyer'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "partner_profile" drop constraint if exists "partner_profile_profile_type_check";`);

    this.addSql(`alter table if exists "partner_profile" add constraint "partner_profile_profile_type_check" check("profile_type" in ('seller', 'buyer'));`);
  }

}

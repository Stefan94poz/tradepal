/**
 * Migration Script: Seller to Vendor
 *
 * This script migrates existing seller_profile data to the new vendor module.
 * Run with: npx medusa exec ./src/scripts/migrate-seller-to-vendor.ts
 */

export default async function migrateSellersToVendors({ container }) {
  const vendorModuleService = container.resolve("vendorModuleService");
  const sellerModuleService = container.resolve("sellerModuleService");

  console.log("Starting seller to vendor migration...");

  try {
    // Get all seller profiles
    const sellers = await sellerModuleService.listSellerProfiles({}, {});

    console.log(`Found ${sellers.length} sellers to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: any[] = [];

    for (const seller of sellers) {
      try {
        // Generate unique handle from company name
        const handle = seller.company_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        // Check if vendor with this handle already exists
        try {
          const existingVendor =
            await vendorModuleService.getVendorByHandle(handle);
          if (existingVendor) {
            console.log(
              `Skipping seller ${seller.id} - vendor with handle '${handle}' already exists`
            );
            skippedCount++;
            continue;
          }
        } catch (e) {
          // Vendor doesn't exist, continue with migration
        }

        // Map verification status
        let verification_status = "pending";
        if (seller.verification_status === "verified") {
          verification_status = "basic";
        } else if (seller.verification_status === "rejected") {
          verification_status = "pending";
        }

        // Create vendor from seller data
        const vendorData = {
          handle: handle,
          name: seller.company_name,
          email: `${handle}@tradepal.com`, // Placeholder - should be updated
          phone: "+1234567890", // Placeholder - should be updated
          country: seller.country,
          city: seller.city,
          address: seller.address,
          business_type: seller.business_type,
          description: seller.description,
          certifications: seller.certifications || [],
          verification_documents: seller.verification_documents || [],
          verification_status: verification_status,
          is_active:
            seller.is_seller && seller.verification_status === "verified",
          commission_rate: 5, // Default commission
          industries: [], // No mapping available
        };

        const vendor = await vendorModuleService.createVendors(vendorData);

        console.log(
          `✓ Migrated seller ${seller.id} to vendor ${vendor.id} (handle: ${handle})`
        );
        migratedCount++;
      } catch (error) {
        console.error(`✗ Error migrating seller ${seller.id}:`, error.message);
        errors.push({ seller_id: seller.id, error: error.message });
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total sellers: ${sellers.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\nErrors:");
      errors.forEach((err) => {
        console.log(`  - Seller ${err.seller_id}: ${err.error}`);
      });
    }

    console.log("\n✓ Migration completed!");
    console.log("\nNext steps:");
    console.log("1. Review migrated vendors in admin dashboard");
    console.log("2. Update placeholder emails and phone numbers");
    console.log("3. Link products to vendors using product-vendor module link");
    console.log("4. Deprecate seller module once verification is complete");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

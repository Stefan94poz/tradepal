import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { COMMISSION_MODULE } from "../../../../../../modules/commission";
import { VENDOR_MODULE } from "../../../../../../modules/vendor";

// GET /admin/commissions/vendors/:vendor_id/stats - Get vendor commission statistics
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const commissionModuleService = req.scope.resolve(COMMISSION_MODULE);
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);
  const { vendor_id } = req.params;

  try {
    // Verify vendor exists
    const vendor = await vendorModuleService.retrieveVendor(vendor_id);

    if (!vendor) {
      return res.status(404).json({
        error: "Vendor not found",
      });
    }

    // Get commission statistics
    const stats = await commissionModuleService.getVendorStats(vendor_id);

    return res.json({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        handle: vendor.handle,
      },
      stats,
    });
  } catch (error) {
    console.error("Error getting vendor commission stats:", error);
    return res.status(500).json({
      error: "Failed to get commission statistics",
    });
  }
}

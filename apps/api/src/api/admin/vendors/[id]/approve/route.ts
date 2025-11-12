import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { VENDOR_MODULE } from "../../../../../modules/vendor";

// POST /admin/vendors/:id/approve - Approve vendor and activate account
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);
  const { id } = req.params;
  const { verification_status = "basic" } = req.body as any;

  try {
    // Approve vendor with specified verification level
    const vendor = await vendorModuleService.approveVerification(
      id,
      verification_status
    );

    // Also activate the vendor account
    await vendorModuleService.updateVendors({
      id,
      is_active: true,
    });

    // TODO: Send approval notification email

    return res.json({
      vendor,
      message: "Vendor approved successfully",
    });
  } catch (error) {
    console.error("Error approving vendor:", error);
    return res.status(500).json({
      error: "Failed to approve vendor",
    });
  }
}

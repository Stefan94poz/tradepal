import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { VENDOR_MODULE } from "../../../../../modules/vendor";

// POST /admin/vendors/:id/commission - Update vendor commission rate
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);
  const { id } = req.params;
  const { commission_rate } = req.body as { commission_rate: number };

  // Validate commission rate
  if (commission_rate === undefined || commission_rate === null) {
    return res.status(400).json({
      error: "Commission rate is required",
    });
  }

  if (commission_rate < 0 || commission_rate > 100) {
    return res.status(400).json({
      error: "Commission rate must be between 0 and 100",
    });
  }

  try {
    const vendor = await vendorModuleService.updateCommissionRate(
      id,
      commission_rate
    );

    return res.json({
      vendor,
      message: `Commission rate updated to ${commission_rate}%`,
    });
  } catch (error) {
    console.error("Error updating commission rate:", error);
    return res.status(500).json({
      error: "Failed to update commission rate",
    });
  }
}

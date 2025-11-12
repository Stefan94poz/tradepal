import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { VENDOR_MODULE } from "../../../modules/vendor";

// GET /admin/vendors - List all vendors
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);

  const { limit = 20, offset = 0, verification_status, is_active } = req.query;

  const filters: any = {};
  if (verification_status) {
    filters.verification_status = verification_status;
  }
  if (is_active !== undefined) {
    filters.is_active = is_active === "true";
  }

  const [vendors, count] = await vendorModuleService.listAndCountVendors(
    filters,
    {
      skip: Number(offset),
      take: Number(limit),
      relations: ["admins"],
    }
  );

  return res.json({
    vendors,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}

// POST /admin/vendors - Create vendor (admin-initiated)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);

  const vendorData = req.body as any;

  try {
    const vendor = await vendorModuleService.createVendors(vendorData);

    return res.status(201).json({ vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return res.status(500).json({
      error: "Failed to create vendor",
    });
  }
}

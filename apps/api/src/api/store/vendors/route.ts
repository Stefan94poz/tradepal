import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { VENDOR_MODULE } from "../../../modules/vendor";

// GET /store/vendors - List verified and active vendors for storefront
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);

  const { limit = 20, offset = 0, handle } = req.query;

  // If handle is provided, get specific vendor
  if (handle) {
    try {
      const vendor = await vendorModuleService.getVendorByHandle(
        handle as string
      );

      // Only return if vendor is active
      if (!vendor.is_active) {
        return res.status(404).json({
          error: "Vendor not found",
        });
      }

      return res.json({ vendor });
    } catch (error) {
      return res.status(404).json({
        error: "Vendor not found",
      });
    }
  }

  // List all active vendors
  const [vendors, count] = await vendorModuleService.listAndCountVendors(
    { is_active: true },
    {
      skip: Number(offset),
      take: Number(limit),
      select: [
        "id",
        "handle",
        "name",
        "logo",
        "description",
        "business_type",
        "country",
        "city",
        "verification_status",
        "industries",
      ],
    }
  );

  return res.json({
    vendors,
    count,
    limit: Number(limit),
    offset: Number(offset),
  });
}

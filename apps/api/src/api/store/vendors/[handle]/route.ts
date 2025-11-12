import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { VENDOR_MODULE } from "../../../../modules/vendor";

/**
 * GET /store/vendors/:handle
 * Retrieve vendor profile by handle for public storefront
 */
export async function GET(
  req: MedusaRequest<{ handle: string }>,
  res: MedusaResponse
) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);
  const vendorHandle = req.params.handle;

  try {
    const vendor = await vendorModuleService.getVendorByHandle(vendorHandle);

    if (!vendor) {
      return res.status(404).json({
        message: `Vendor with handle "${vendorHandle}" not found`,
      });
    }

    if (!vendor.is_active) {
      return res.status(404).json({
        message: `Vendor is not currently active`,
      });
    }

    // Return public vendor information (exclude sensitive data)
    return res.json({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        handle: vendor.handle,
        description: vendor.description,
        logo_url: vendor.logo_url,
        is_verified: vendor.is_verified,
        verification_status: vendor.verification_status,
        commission_rate: vendor.commission_rate,
        created_at: vendor.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch vendor",
    });
  }
}

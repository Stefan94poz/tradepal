import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { VENDOR_MODULE } from "../../../../../modules/vendor";

// GET /store/vendors/:handle/products - List products for a specific vendor (public)
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = req.params;
  const { limit = 20, offset = 0, status = "published" } = req.query;

  try {
    const remoteQuery = req.scope.resolve("remoteQuery");
    const vendorModuleService = req.scope.resolve(VENDOR_MODULE);

    // Get vendor by handle
    const vendor = await vendorModuleService.getVendorByHandle(
      handle as string
    );

    if (!vendor) {
      return res.status(404).json({
        error: "Vendor not found",
      });
    }

    if (!vendor.is_active) {
      return res.status(404).json({
        error: "Vendor is not active",
      });
    }

    // Query products linked to this vendor
    const products = await remoteQuery({
      entryPoint: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "status",
        "thumbnail",
        "created_at",
        "variants.*",
        "variants.prices.*",
        "images.*",
      ],
      variables: {
        filters: {
          vendor_id: vendor.id,
          status: status,
        },
        skip: Number(offset),
        take: Number(limit),
      },
    });

    // Get total count
    const allProducts = await remoteQuery({
      entryPoint: "product",
      fields: ["id"],
      variables: {
        filters: {
          vendor_id: vendor.id,
          status: status,
        },
      },
    });

    return res.json({
      vendor: {
        id: vendor.id,
        handle: vendor.handle,
        name: vendor.name,
        logo: vendor.logo,
        description: vendor.description,
        verification_status: vendor.verification_status,
      },
      products,
      count: allProducts.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error("Error listing vendor products:", error);
    return res.status(500).json({
      error: "Failed to list vendor products",
    });
  }
}

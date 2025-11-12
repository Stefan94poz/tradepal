import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { VENDOR_MODULE } from "../../../../modules/vendor";

// GET /admin/vendors/:id - Get vendor by ID
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);
  const { id } = req.params;

  try {
    const vendor = await vendorModuleService.retrieveVendor(id, {
      relations: ["admins"],
    });

    return res.json({ vendor });
  } catch (error) {
    return res.status(404).json({
      error: "Vendor not found",
    });
  }
}

// POST /admin/vendors/:id - Update vendor
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);
  const { id } = req.params;
  const updateData = req.body as any;

  try {
    const vendor = await vendorModuleService.updateVendors({
      id,
      ...updateData,
    });

    return res.json({ vendor });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return res.status(500).json({
      error: "Failed to update vendor",
    });
  }
}

// DELETE /admin/vendors/:id - Delete vendor
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const vendorModuleService = req.scope.resolve(VENDOR_MODULE);
  const { id } = req.params;

  try {
    await vendorModuleService.deleteVendors(id);

    return res.json({
      id,
      deleted: true,
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return res.status(500).json({
      error: "Failed to delete vendor",
    });
  }
}

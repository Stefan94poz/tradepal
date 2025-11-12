import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { VENDOR_MODULE } from "../../../modules/vendor";

type CreateVendorAdminInput = {
  vendor_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

export const createVendorAdminStep = createStep(
  "create-vendor-admin",
  async (input: CreateVendorAdminInput, { container }) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    const vendorAdmin = await vendorModuleService.createVendorAdmins({
      email: input.email,
      first_name: input.first_name || "",
      last_name: input.last_name || "",
      vendor_id: input.vendor_id,
    });

    return new StepResponse(vendorAdmin, vendorAdmin.id);
  },
  async (vendorAdminId, { container }) => {
    if (!vendorAdminId) return;

    const vendorModuleService = container.resolve(VENDOR_MODULE);
    await vendorModuleService.deleteVendorAdmins(vendorAdminId);
  }
);

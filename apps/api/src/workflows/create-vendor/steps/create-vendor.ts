import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { VENDOR_MODULE } from "../../../modules/vendor";

type CreateVendorInput = {
  handle: string;
  name: string;
  email: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  business_type: string;
};

export const createVendorStep = createStep(
  "create-vendor",
  async (input: CreateVendorInput, { container }) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    const vendor = await vendorModuleService.createVendors({
      handle: input.handle,
      name: input.name,
      email: input.email,
      country: input.country,
      city: input.city,
      address: input.address,
      phone: input.phone,
      business_type: input.business_type,
      verification_status: "pending",
      is_active: true,
      commission_rate: 5, // Default 5% commission
    });

    return new StepResponse(vendor, vendor.id);
  },
  async (vendorId, { container }) => {
    if (!vendorId) return;

    const vendorModuleService = container.resolve(VENDOR_MODULE);
    await vendorModuleService.deleteVendors(vendorId);
  }
);

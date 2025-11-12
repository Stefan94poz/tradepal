import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { VENDOR_MODULE } from "../../../modules/vendor";

export type CreateVendorStepInput = {
  handle: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  business_type: string;
  description?: string;
  logo?: string;
  website?: string;
  industries?: string[];
  certifications?: string[];
};

export const createVendorStep = createStep(
  "create-vendor",
  async (input: CreateVendorStepInput, { container }) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    const vendor = await vendorModuleService.createVendors({
      handle: input.handle,
      name: input.name,
      email: input.email,
      phone: input.phone,
      country: input.country,
      city: input.city,
      address: input.address,
      business_type: input.business_type,
      description: input.description,
      logo: input.logo,
      website: input.website,
      industries: input.industries || [],
      certifications: input.certifications || [],
      verification_status: "pending",
      is_active: false, // Requires admin approval
      commission_rate: 5, // Default commission
    });

    return new StepResponse(vendor, vendor.id);
  },
  async (vendorId, { container }) => {
    if (!vendorId) return;

    const vendorModuleService = container.resolve(VENDOR_MODULE);
    await vendorModuleService.deleteVendors(vendorId);
  }
);

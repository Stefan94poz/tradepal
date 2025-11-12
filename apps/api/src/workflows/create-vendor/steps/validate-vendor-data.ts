import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { VENDOR_MODULE } from "../../../modules/vendor";

type ValidateVendorDataInput = {
  handle: string;
  email: string;
};

export const validateVendorDataStep = createStep(
  "validate-vendor-data",
  async (input: ValidateVendorDataInput, { container }) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    // Check if handle is unique
    try {
      const existingVendor = await vendorModuleService.getVendorByHandle(
        input.handle
      );
      if (existingVendor) {
        throw new Error(`Vendor with handle "${input.handle}" already exists`);
      }
    } catch (error: any) {
      // Handle not found is expected - continue
      if (!error.message.includes("not found")) {
        throw error;
      }
    }

    // Check if email is unique
    const vendorsWithEmail = await vendorModuleService.listVendors({
      filters: { email: input.email },
    });

    if (vendorsWithEmail.length > 0) {
      throw new Error(`Vendor with email "${input.email}" already exists`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error("Invalid email format");
    }

    return new StepResponse({ validated: true });
  }
);

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { VENDOR_MODULE } from "../../../modules/vendor";

export type RetrieveVendorForCommissionInput = {
  vendor_id: string;
};

export const retrieveVendorForCommissionStep = createStep(
  "retrieve-vendor-for-commission",
  async (input: RetrieveVendorForCommissionInput, { container }) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    const vendor = await vendorModuleService.retrieveVendor(input.vendor_id);

    if (!vendor) {
      throw new Error(`Vendor with ID ${input.vendor_id} not found`);
    }

    if (!vendor.is_active) {
      throw new Error(
        `Vendor ${vendor.name} is not active. Cannot calculate commission.`
      );
    }

    return new StepResponse({
      vendor_id: vendor.id,
      commission_rate: vendor.commission_rate,
    });
  }
);

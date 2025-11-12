import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { VENDOR_MODULE } from "../../../modules/vendor";

export type ValidateVendorOwnershipInput = {
  vendor_id: string;
  product_id?: string;
};

export const validateVendorOwnershipStep = createStep(
  "validate-vendor-ownership",
  async (input: ValidateVendorOwnershipInput, { container }) => {
    const vendorModuleService = container.resolve(VENDOR_MODULE);
    const remoteQuery = container.resolve("remoteQuery");

    // Check vendor exists and is active
    const vendor = await vendorModuleService.retrieveVendor(input.vendor_id);

    if (!vendor) {
      throw new Error(`Vendor with ID ${input.vendor_id} not found`);
    }

    if (!vendor.is_active) {
      throw new Error(
        `Vendor ${vendor.name} is not active. Please contact support.`
      );
    }

    // If product_id provided, validate vendor owns this product
    if (input.product_id) {
      const productVendorLinks = await remoteQuery({
        entryPoint: "product_vendor",
        fields: ["product_id", "vendor_id"],
        variables: {
          filters: {
            product_id: input.product_id,
          },
        },
      });

      if (productVendorLinks.length === 0) {
        throw new Error(
          `Product ${input.product_id} is not linked to any vendor`
        );
      }

      const link = productVendorLinks[0];
      if (link.vendor_id !== input.vendor_id) {
        throw new Error(
          `Product ${input.product_id} does not belong to vendor ${input.vendor_id}`
        );
      }
    }

    return new StepResponse({ vendor });
  }
);

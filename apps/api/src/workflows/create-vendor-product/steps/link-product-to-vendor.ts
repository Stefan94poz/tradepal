import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";

export type LinkProductToVendorInput = {
  vendor_id: string;
  product_id: string;
};

export const linkProductToVendorStep = createStep(
  "link-product-to-vendor",
  async (input: LinkProductToVendorInput, { container }) => {
    const remoteLink = container.resolve("remoteLink");

    // Create link between vendor and product
    await remoteLink.create({
      vendorModuleService: {
        vendor_id: input.vendor_id,
      },
      [Modules.PRODUCT]: {
        product_id: input.product_id,
      },
    });

    return new StepResponse(
      { success: true },
      { vendor_id: input.vendor_id, product_id: input.product_id }
    );
  },
  async (data, { container }) => {
    if (!data) return;

    const remoteLink = container.resolve("remoteLink");

    // Remove link on rollback
    await remoteLink.dismiss({
      vendorModuleService: {
        vendor_id: data.vendor_id,
      },
      [Modules.PRODUCT]: {
        product_id: data.product_id,
      },
    });
  }
);

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";

type LinkVendorAdminToUserInput = {
  vendor_admin_id: string;
  user_id: string;
};

export const linkVendorAdminToUserStep = createStep(
  "link-vendor-admin-to-user",
  async (input: LinkVendorAdminToUserInput, { container }) => {
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    // Create link between vendor admin and user
    await remoteLink.create({
      vendorModuleService: {
        vendor_admin_id: input.vendor_admin_id,
      },
      [Modules.USER]: {
        user_id: input.user_id,
      },
    });

    return new StepResponse({ linked: true }, input);
  },
  async (input, { container }) => {
    if (!input) return;

    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    // Remove link on rollback
    await remoteLink.dismiss({
      vendorModuleService: {
        vendor_admin_id: input.vendor_admin_id,
      },
      [Modules.USER]: {
        user_id: input.user_id,
      },
    });
  }
);

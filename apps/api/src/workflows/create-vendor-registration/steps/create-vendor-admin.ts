import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { VENDOR_MODULE } from "../../../modules/vendor";

export type CreateVendorAdminStepInput = {
  vendorId: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

export const createVendorAdminStep = createStep(
  "create-vendor-admin",
  async (input: CreateVendorAdminStepInput, { container }) => {
    const authModuleService = container.resolve("authModuleService");
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    // Create auth user
    const authUser = await authModuleService.createAuthUsers({
      provider: "emailpass",
      provider_identities: [
        {
          provider: "emailpass",
          entity_id: input.email,
        },
      ],
    });

    // Set password
    await authModuleService.updateAuthUsers(authUser.id, {
      app_metadata: {
        password: input.password, // This will be hashed by the auth module
      },
    });

    // Create vendor admin
    const vendorAdmin = await vendorModuleService.createVendorAdmins({
      vendor_id: input.vendorId,
      email: input.email,
      first_name: input.first_name,
      last_name: input.last_name,
    });

    return new StepResponse(
      { vendorAdmin, authUser },
      { vendorAdminId: vendorAdmin.id, authUserId: authUser.id }
    );
  },
  async (data, { container }) => {
    if (!data) return;

    const authModuleService = container.resolve("authModuleService");
    const vendorModuleService = container.resolve(VENDOR_MODULE);

    if (data.authUserId) {
      await authModuleService.deleteAuthUsers(data.authUserId);
    }
    if (data.vendorAdminId) {
      await vendorModuleService.deleteVendorAdmins(data.vendorAdminId);
    }
  }
);

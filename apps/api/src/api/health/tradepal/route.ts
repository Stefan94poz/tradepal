import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { USER_PROFILE_MODULE } from "../../../modules/user-profile";
import { PARTNER_DIRECTORY_MODULE } from "../../../modules/partner-directory";
import { ESCROW_MODULE } from "../../../modules/escrow";
import { SHIPMENT_MODULE } from "../../../modules/shipment";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    // Test that all modules are registered and accessible
    const userProfileService = req.scope.resolve(USER_PROFILE_MODULE);
    const partnerService = req.scope.resolve(PARTNER_DIRECTORY_MODULE);
    const escrowService = req.scope.resolve(ESCROW_MODULE);
    const shipmentService = req.scope.resolve(SHIPMENT_MODULE);

    // Get counts from each module
    const [, sellerCount] =
      await userProfileService.listAndCountSellerProfiles();
    const [, buyerCount] = await userProfileService.listAndCountBuyerProfiles();
    const [, verificationCount] =
      await userProfileService.listAndCountVerificationDocuments();
    const [, partnerCount] =
      await partnerService.listAndCountPartnerDirectoryProfiles();
    const [, escrowCount] =
      await escrowService.listAndCountEscrowTransactions();
    const [, shipmentCount] =
      await shipmentService.listAndCountShipmentTrackings();

    res.json({
      message: "TradePal custom modules are working!",
      modules: {
        userProfile: {
          sellers: sellerCount,
          buyers: buyerCount,
          verifications: verificationCount,
        },
        partnerDirectory: {
          profiles: partnerCount,
        },
        escrow: {
          transactions: escrowCount,
        },
        shipment: {
          trackings: shipmentCount,
        },
      },
      endpoints: {
        verification: {
          submit: "POST /store/verification/submit",
          status: "GET /store/verification/status",
          adminList: "GET /admin/verifications",
          approve: "POST /admin/verifications/:id/approve",
          reject: "POST /admin/verifications/:id/reject",
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

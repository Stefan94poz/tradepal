import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { USER_PROFILE_MODULE } from "../../modules/user-profile";
import UserProfileModuleService from "../../modules/user-profile/service";
import NotificationModuleService from "../../modules/notification/service";

type RejectVerificationInput = {
  verificationId: string;
  reviewedBy: string;
  reason: string;
};

const rejectVerificationStep = createStep(
  "reject-verification",
  async (input: RejectVerificationInput, { container }) => {
    const userProfileService: UserProfileModuleService =
      container.resolve(USER_PROFILE_MODULE);

    // Update verification document status
    const verification = await userProfileService.updateVerificationDocuments({
      selector: {
        id: input.verificationId,
      },
      data: {
        status: "rejected",
        rejection_reason: input.reason,
        reviewed_at: new Date(),
        reviewed_by: input.reviewedBy,
      },
    });

    const verificationRecord = verification[0];

    // Update the profile verification status
    if (verificationRecord.profile_type === "seller") {
      await userProfileService.updateSellerProfiles({
        selector: {
          user_id: verificationRecord.user_id,
        },
        data: {
          verification_status: "rejected",
        },
      });
    } else {
      await userProfileService.updateBuyerProfiles({
        selector: {
          user_id: verificationRecord.user_id,
        },
        data: {
          verification_status: "rejected",
        },
      });
    }

    // Send notification
    const notificationService: NotificationModuleService =
      container.resolve("notificationModuleService");
    
    await notificationService.createNotification({
      user_id: verificationRecord.user_id,
      type: "verification_rejected",
      title: "Verification Requires Attention",
      message: `Your verification documents have been reviewed and require resubmission. Reason: ${input.reason}`,
      data: { reason: input.reason },
      send_email: true,
    });

    return new StepResponse(verification[0], {
      verificationId: input.verificationId,
      userId: verificationRecord.user_id,
      profileType: verificationRecord.profile_type,
    });
  },
  async (compensationData, { container }) => {
    if (!compensationData) return;

    const userProfileService: UserProfileModuleService =
      container.resolve(USER_PROFILE_MODULE);

    // Rollback verification document
    await userProfileService.updateVerificationDocuments({
      selector: {
        id: compensationData.verificationId,
      },
      data: {
        status: "pending",
        rejection_reason: null,
        reviewed_at: null,
        reviewed_by: null,
      },
    });

    // Rollback profile verification status
    if (compensationData.profileType === "seller") {
      await userProfileService.updateSellerProfiles({
        selector: {
          user_id: compensationData.userId,
        },
        data: {
          verification_status: "pending",
        },
      });
    } else {
      await userProfileService.updateBuyerProfiles({
        selector: {
          user_id: compensationData.userId,
        },
        data: {
          verification_status: "pending",
        },
      });
    }
  }
);

export const rejectVerificationWorkflow = createWorkflow(
  "reject-verification",
  (input: RejectVerificationInput) => {
    const result = rejectVerificationStep(input);
    return new WorkflowResponse(result);
  }
);

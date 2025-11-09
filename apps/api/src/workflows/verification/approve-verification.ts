import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { USER_PROFILE_MODULE } from "../../modules/user_profile";
import UserProfileModuleService from "../../modules/user_profile/service";
import NotificationModuleService from "../../modules/notification/service";

type ApproveVerificationInput = {
  verificationId: string;
  reviewedBy: string;
};

const approveVerificationStep = createStep(
  "approve-verification",
  async (input: ApproveVerificationInput, { container }) => {
    const userProfileService: UserProfileModuleService =
      container.resolve(USER_PROFILE_MODULE);

    // Update verification document status
    const verification = await userProfileService.updateVerificationDocuments({
      selector: {
        id: input.verificationId,
      },
      data: {
        status: "approved",
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
          verification_status: "verified",
          verified_at: new Date(),
        },
      });
    } else {
      await userProfileService.updateBuyerProfiles({
        selector: {
          user_id: verificationRecord.user_id,
        },
        data: {
          verification_status: "verified",
          verified_at: new Date(),
        },
      });
    }

    // Send notification
    const notificationService: NotificationModuleService = container.resolve(
      "notificationModuleService"
    );

    await notificationService.createNotification({
      user_id: verificationRecord.user_id,
      type: "verification_approved",
      title: "Profile Verified",
      message:
        "Your profile has been successfully verified. You can now access all platform features.",
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
          verified_at: null,
        },
      });
    } else {
      await userProfileService.updateBuyerProfiles({
        selector: {
          user_id: compensationData.userId,
        },
        data: {
          verification_status: "pending",
          verified_at: null,
        },
      });
    }
  }
);

export const approveVerificationWorkflow = createWorkflow(
  "approve-verification",
  (input: ApproveVerificationInput) => {
    const result = approveVerificationStep(input);
    return new WorkflowResponse(result);
  }
);

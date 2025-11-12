import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { MESSAGING_MODULE } from "../../modules/messaging";
import MessagingService from "../../modules/messaging/service";

/**
 * Step 1: Validate sender and recipient accounts
 */
const validateParticipantsStep = createStep(
  "validate-message-participants",
  async (
    {
      sender_id,
      sender_type,
      recipient_id,
      recipient_type,
    }: {
      sender_id: string;
      sender_type: "buyer" | "vendor";
      recipient_id: string;
      recipient_type: "buyer" | "vendor";
    },
    { container }
  ) => {
    // TODO: Validate sender and recipient exist in their respective modules
    // For now, we'll assume they're valid
    return new StepResponse({ validated: true });
  }
);

/**
 * Step 2: Create or retrieve conversation
 */
const getOrCreateConversationStep = createStep(
  "get-or-create-conversation",
  async (
    {
      participant_one_id,
      participant_one_type,
      participant_two_id,
      participant_two_type,
      product_reference,
    }: {
      participant_one_id: string;
      participant_one_type: "buyer" | "vendor";
      participant_two_id: string;
      participant_two_type: "buyer" | "vendor";
      product_reference?: string;
    },
    { container }
  ) => {
    const messagingService: MessagingService =
      container.resolve(MESSAGING_MODULE);

    const conversation = await messagingService.createConversation({
      participant_one_id,
      participant_one_type,
      participant_two_id,
      participant_two_type,
      product_reference,
    });

    return new StepResponse(
      { conversation },
      { conversation_id: conversation.id }
    );
  },
  async (compensateData, { container }) => {
    // Compensation: We don't delete conversations as they might have messages
    // Just log the rollback
    if (compensateData) {
      console.log(
        `Rollback: Conversation ${compensateData.conversation_id} was created`
      );
    }
  }
);

/**
 * Step 3: Create message in conversation
 */
const createMessageStep = createStep(
  "create-message",
  async (
    {
      conversation_id,
      sender_id,
      sender_type,
      recipient_id,
      recipient_type,
      subject,
      body,
      attachments,
      product_reference,
    }: {
      conversation_id: string;
      sender_id: string;
      sender_type: "buyer" | "vendor";
      recipient_id: string;
      recipient_type: "buyer" | "vendor";
      subject?: string;
      body: string;
      attachments?: string[];
      product_reference?: string;
    },
    { container }
  ) => {
    const messagingService: MessagingService =
      container.resolve(MESSAGING_MODULE);

    const message = await messagingService.sendMessage({
      conversation_id,
      sender_id,
      sender_type,
      recipient_id,
      recipient_type,
      subject,
      body,
      attachments,
      product_reference,
    });

    return new StepResponse({ message }, { message_id: message.id });
  },
  async (compensateData, { container }) => {
    // Compensation: Delete the message
    if (compensateData) {
      const messagingService: MessagingService =
        container.resolve(MESSAGING_MODULE);
      await messagingService.deleteMessages(compensateData.message_id);
    }
  }
);

/**
 * Step 4: Send email notification
 */
const sendMessageNotificationStep = createStep(
  "send-message-notification",
  async (
    {
      recipient_id,
      recipient_type,
      sender_id,
      sender_type,
      subject,
      body,
    }: {
      recipient_id: string;
      recipient_type: "buyer" | "vendor";
      sender_id: string;
      sender_type: "buyer" | "vendor";
      subject?: string;
      body: string;
    },
    { container }
  ) => {
    // TODO: Send email notification using email service
    // For now, we'll just log
    console.log(
      `Email notification: ${sender_type} ${sender_id} sent message to ${recipient_type} ${recipient_id}`
    );

    return new StepResponse({ notified: true });
  }
);

/**
 * Send Message Workflow
 * Handles sending messages between buyers and vendors
 */
export const sendMessageWorkflow = createWorkflow(
  "send-message",
  (input: {
    sender_id: string;
    sender_type: "buyer" | "vendor";
    recipient_id: string;
    recipient_type: "buyer" | "vendor";
    subject?: string;
    body: string;
    attachments?: string[];
    product_reference?: string;
  }) => {
    // Step 1: Validate participants
    validateParticipantsStep({
      sender_id: input.sender_id,
      sender_type: input.sender_type,
      recipient_id: input.recipient_id,
      recipient_type: input.recipient_type,
    });

    // Step 2: Get or create conversation
    const { conversation } = getOrCreateConversationStep({
      participant_one_id: input.sender_id,
      participant_one_type: input.sender_type,
      participant_two_id: input.recipient_id,
      participant_two_type: input.recipient_type,
      product_reference: input.product_reference,
    });

    // Step 3: Create message
    const { message } = createMessageStep({
      conversation_id: conversation.id,
      sender_id: input.sender_id,
      sender_type: input.sender_type,
      recipient_id: input.recipient_id,
      recipient_type: input.recipient_type,
      subject: input.subject,
      body: input.body,
      attachments: input.attachments,
      product_reference: input.product_reference,
    });

    // Step 4: Send notification
    sendMessageNotificationStep({
      recipient_id: input.recipient_id,
      recipient_type: input.recipient_type,
      sender_id: input.sender_id,
      sender_type: input.sender_type,
      subject: input.subject,
      body: input.body,
    });

    return new WorkflowResponse({
      conversation,
      message,
    });
  }
);

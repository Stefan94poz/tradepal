import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { MESSAGING_MODULE } from "../../modules/messaging";
import MessagingService from "../../modules/messaging/service";

/**
 * Step 1: Validate product exists and get vendor
 */
const validateProductAndVendorStep = createStep(
  "validate-product-and-vendor",
  async ({ product_id }: { product_id: string }, { container }) => {
    const remoteQuery = container.resolve("remoteQuery");

    // Get product with vendor link
    const { data: products } = await remoteQuery({
      entryPoint: "product",
      variables: { id: product_id },
      fields: ["id", "title", "vendor.*"],
    });

    const product = products?.[0];

    if (!product) {
      throw new Error(`Product ${product_id} not found`);
    }

    if (!product.vendor) {
      throw new Error(
        `Product ${product_id} has no vendor - cannot send inquiry`
      );
    }

    if (!product.vendor.is_active) {
      throw new Error(
        `Vendor ${product.vendor.name} is not active - cannot send inquiry`
      );
    }

    return new StepResponse({
      product,
      vendor_id: product.vendor.id,
      vendor_name: product.vendor.name,
    });
  }
);

/**
 * Step 2: Create conversation with product reference
 */
const createProductConversationStep = createStep(
  "create-product-conversation",
  async (
    {
      buyer_id,
      vendor_id,
      product_id,
    }: {
      buyer_id: string;
      vendor_id: string;
      product_id: string;
    },
    { container }
  ) => {
    const messagingService: MessagingService =
      container.resolve(MESSAGING_MODULE);

    const conversation = await messagingService.createConversation({
      participant_one_id: buyer_id,
      participant_one_type: "buyer",
      participant_two_id: vendor_id,
      participant_two_type: "vendor",
      product_reference: product_id,
    });

    return new StepResponse(
      { conversation },
      { conversation_id: conversation.id }
    );
  },
  async (compensateData, { container }) => {
    // Rollback: conversation created
    if (compensateData) {
      console.log(
        `Rollback: Product conversation ${compensateData.conversation_id} was created`
      );
    }
  }
);

/**
 * Step 3: Send initial inquiry message
 */
const sendInquiryMessageStep = createStep(
  "send-inquiry-message",
  async (
    {
      conversation_id,
      buyer_id,
      vendor_id,
      product_id,
      product_title,
      quantity,
      message_body,
    }: {
      conversation_id: string;
      buyer_id: string;
      vendor_id: string;
      product_id: string;
      product_title: string;
      quantity?: number;
      message_body: string;
    },
    { container }
  ) => {
    const messagingService: MessagingService =
      container.resolve(MESSAGING_MODULE);

    const subject = `Product Inquiry: ${product_title}`;
    const body = quantity
      ? `I'm interested in ${quantity} units. ${message_body}`
      : message_body;

    const message = await messagingService.sendMessage({
      conversation_id,
      sender_id: buyer_id,
      sender_type: "buyer",
      recipient_id: vendor_id,
      recipient_type: "vendor",
      subject,
      body,
      product_reference: product_id,
    });

    return new StepResponse({ message }, { message_id: message.id });
  },
  async (compensateData, { container }) => {
    // Compensation: Delete the inquiry message
    if (compensateData) {
      const messagingService: MessagingService =
        container.resolve(MESSAGING_MODULE);
      await messagingService.deleteMessages(compensateData.message_id);
    }
  }
);

/**
 * Step 4: Notify vendor of product inquiry
 */
const notifyVendorOfInquiryStep = createStep(
  "notify-vendor-of-inquiry",
  async (
    {
      vendor_id,
      buyer_id,
      product_title,
    }: {
      vendor_id: string;
      buyer_id: string;
      product_title: string;
    },
    { container }
  ) => {
    // TODO: Send email notification using email service
    console.log(
      `Email notification: Buyer ${buyer_id} inquired about ${product_title} to vendor ${vendor_id}`
    );

    return new StepResponse({ notified: true });
  }
);

/**
 * Send Product Inquiry Workflow
 * Allows buyers to contact vendors about specific products
 */
export const sendProductInquiryWorkflow = createWorkflow(
  "send-product-inquiry",
  (input: {
    buyer_id: string;
    product_id: string;
    quantity?: number;
    message: string;
  }) => {
    // Step 1: Validate product and get vendor
    const { product, vendor_id, vendor_name } = validateProductAndVendorStep({
      product_id: input.product_id,
    });

    // Step 2: Create conversation with product reference
    const { conversation } = createProductConversationStep({
      buyer_id: input.buyer_id,
      vendor_id,
      product_id: input.product_id,
    });

    // Step 3: Send inquiry message
    const { message } = sendInquiryMessageStep({
      conversation_id: conversation.id,
      buyer_id: input.buyer_id,
      vendor_id,
      product_id: input.product_id,
      product_title: product.title,
      quantity: input.quantity,
      message_body: input.message,
    });

    // Step 4: Notify vendor
    notifyVendorOfInquiryStep({
      vendor_id,
      buyer_id: input.buyer_id,
      product_title: product.title,
    });

    return new WorkflowResponse({
      conversation,
      message,
      vendor_name,
    });
  }
);

import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

/**
 * Subscriber for order.created event
 * Notifies seller when a new order is placed for their products
 */
export default async function orderCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id;

  // TODO: Retrieve order details and seller information
  // TODO: Integrate with SendGrid to send email notification to seller (Task 7.3.4)
  console.log(`[ORDER SUBSCRIBER] New order created: ${orderId}`);
  console.log(`[TODO] Notify seller about new order`);
}

export const config: SubscriberConfig = {
  event: "order.created",
};

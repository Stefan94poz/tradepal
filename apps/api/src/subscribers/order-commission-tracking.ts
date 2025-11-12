import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { calculateOrderCommissionsWorkflow } from "../workflows/calculate-commission";

/**
 * Order Placed Subscriber - Commission Tracking
 * Automatically calculates and records commissions when an order is placed
 */
export default async function orderCommissionHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  try {
    // Calculate commissions for this order
    const { result } = await calculateOrderCommissionsWorkflow(container).run({
      input: {
        order_id: data.id,
      },
    });

    console.log(
      `Created ${result.commissions.length} commission record(s) for order ${data.id}`
    );
  } catch (error) {
    console.error(
      `Failed to calculate commissions for order ${data.id}:`,
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { declineOrderWorkflow } from "../../../../../../workflows/order/decline-order";

type DeclineOrderRequest = {
  reason: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<DeclineOrderRequest>,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  if (!req.validatedBody.reason) {
    return res.status(400).json({
      error: "Decline reason is required",
    });
  }

  // TODO: Verify user is the seller for this order

  const { result } = await declineOrderWorkflow(req.scope).run({
    input: {
      orderId,
      sellerId: userId,
      reason: req.validatedBody.reason,
    },
  });

  res.json({
    order: result,
    message: "Order declined and refund initiated",
  });
};

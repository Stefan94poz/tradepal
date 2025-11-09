import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { acceptOrderWorkflow } from "../../../../../../workflows/order/accept-order";

type AcceptOrderRequest = {
  estimatedFulfillmentDays?: number;
  notes?: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AcceptOrderRequest>,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;
  const userId = req.auth_context?.actor_id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // TODO: Verify user is the seller for this order

  const { result } = await acceptOrderWorkflow(req.scope).run({
    input: {
      orderId,
      sellerId: userId,
      estimatedFulfillmentDays: req.validatedBody.estimatedFulfillmentDays,
      notes: req.validatedBody.notes,
    },
  });

  res.json({
    order: result,
    message: "Order accepted successfully",
  });
};

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { addShipmentTrackingWorkflow } from "../../../../../../workflows/shipment/add-tracking";

type AddTrackingRequest = {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AddTrackingRequest>,
  res: MedusaResponse
) => {
  const { id: orderId } = req.params;

  // TODO: Verify the user is the seller for this order

  const { result } = await addShipmentTrackingWorkflow(req.scope).run({
    input: {
      orderId,
      carrier: req.validatedBody.carrier,
      trackingNumber: req.validatedBody.trackingNumber,
      estimatedDelivery: req.validatedBody.estimatedDelivery
        ? new Date(req.validatedBody.estimatedDelivery)
        : undefined,
      trackingUrl: req.validatedBody.trackingUrl,
    },
  });

  res.json({
    tracking: result,
  });
};

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const notificationModuleService = req.scope.resolve(
    "notificationModuleService"
  );

  // Get authenticated user ID from session
  const userId = req.auth?.actor_id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await notificationModuleService.markAllAsRead(userId);

  res.json({ message: "All notifications marked as read" });
}

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const notificationModuleService = req.scope.resolve("notificationModuleService");
  
  // Get authenticated user ID from session
  const userId = req.auth?.actor_id;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const notifications = await notificationModuleService.getUnreadNotifications(userId);

  res.json({
    notifications,
    count: notifications.length,
  });
}

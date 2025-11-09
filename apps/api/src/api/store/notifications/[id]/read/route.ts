import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const notificationModuleService = req.scope.resolve("notificationModuleService");
  
  // Get authenticated user ID from session
  const userId = req.auth?.actor_id;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.params;

  // Verify notification belongs to user
  const notification = await notificationModuleService.retrieveNotification(id);
  
  if (notification.user_id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updatedNotification = await notificationModuleService.markAsRead(id);

  res.json({ notification: updatedNotification });
}

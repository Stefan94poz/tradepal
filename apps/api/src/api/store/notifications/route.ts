import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const notificationModuleService = req.scope.resolve("notificationModuleService");
  
  // Get authenticated user ID from session
  const userId = req.auth?.actor_id;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { take = 50, skip = 0 } = req.query;

  const notifications = await notificationModuleService.listNotifications(
    { user_id: userId },
    {
      order: { created_at: "DESC" },
      take: Number(take),
      skip: Number(skip),
    }
  );

  res.json({
    notifications,
    count: notifications.length,
  });
}

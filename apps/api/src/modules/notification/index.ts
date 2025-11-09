import NotificationModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export default Module("notification", {
  service: NotificationModuleService,
});

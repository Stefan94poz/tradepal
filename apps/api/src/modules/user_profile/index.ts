import UserProfileModuleService from "./service";
import { Module } from "@medusajs/framework/utils";

export const USER_PROFILE_MODULE = "userProfileModuleService";

export default Module(USER_PROFILE_MODULE, {
  service: UserProfileModuleService,
});

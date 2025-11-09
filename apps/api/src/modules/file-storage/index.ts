import { Module } from "@medusajs/framework/utils";
import FileStorageService from "./service";

export const FILE_STORAGE_MODULE = "file-storage";

export default Module(FILE_STORAGE_MODULE, {
  service: FileStorageService,
});

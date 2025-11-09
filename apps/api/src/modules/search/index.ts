import { Module } from "@medusajs/framework/utils";
import SearchService from "./service";

export const SEARCH_MODULE = "search";

export default Module(SEARCH_MODULE, {
  service: SearchService,
});

import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    databaseDriverOptions: {
      ssl: false,
      sslmode: "disable",
    },
  },
  modules: [
    {
      resolve: "./src/modules/user-profile",
    },
    {
      resolve: "./src/modules/partner-directory",
    },
    {
      resolve: "./src/modules/escrow",
    },
    {
      resolve: "./src/modules/shipment",
    },
    {
      resolve: "./src/modules/b2b-product",
    },
    {
      resolve: "./src/modules/file-storage",
    },
    {
      resolve: "./src/modules/search",
    },
    {
      resolve: "./src/modules/notification",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              capture: false, // Manual capture for escrow
            },
          },
        ],
      },
    },
  ],
});

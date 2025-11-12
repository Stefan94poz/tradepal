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
      resolve: "./modules/vendor",
    },
    {
      resolve: "./modules/commission",
    },
    {
      resolve: "./modules/rfq",
    },
    {
      resolve: "./modules/messaging",
    },
    {
      resolve: "./modules/seller",
    },
    {
      resolve: "./modules/buyer",
    },
    {
      resolve: "./modules/partner",
    },
    {
      resolve: "./modules/escrow",
    },
    {
      resolve: "./modules/shipment",
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              // MinIO requires forcePathStyle
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/analytics",
      options: {
        providers: [
          {
            resolve: "@medusajs/analytics-posthog",
            id: "posthog",
            options: {
              posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
              posthogHost:
                process.env.POSTHOG_HOST || "https://app.posthog.com",
            },
          },
        ],
      },
    },
    // TODO: Add real Stripe API keys to .env file!
    // Get keys from: https://dashboard.stripe.com/test/apikeys
    // Required: STRIPE_API_KEY (sk_test_...) and STRIPE_WEBHOOK_SECRET (whsec_...)
    ...(process.env.STRIPE_API_KEY
      ? [
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
                    // Automatic capture is disabled for escrow - we hold and capture manually
                    capture: false,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
});

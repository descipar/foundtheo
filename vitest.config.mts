import { defineConfig } from "vitest/config";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";

export default defineConfig({
  test: {
    projects: [
      // --- Pure unit tests (no CF bindings) ---
      {
        test: {
          name: "unit",
          include: ["src/test/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      // --- Integration tests (Workers runtime with D1 + R2 mocks) ---
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: "./wrangler.toml" },
            miniflare: {
              d1Databases: ["DB"],
              r2Buckets: ["IMAGES"],
              bindings: {
                THEO_BIRTH_DATE: "2025-04-17",
                THEO_NAME: "Theo",
                THEO_BREED: "Labrador",
                THEO_TITLE: "Chief Snack Officer",
                THEO_BADGE_NR: "170425",
                THEO_EMAIL: "test@example.com",
                THEO_PHONE: "+4912345",
                ADMIN_PASSWORD: "testpassword",
              },
            },
          }),
        ],
        test: {
          name: "integration",
          include: ["src/test/integration/**/*.test.ts"],
          setupFiles: ["src/test/integration/setup.ts"],
        },
      },
    ],
  },
});

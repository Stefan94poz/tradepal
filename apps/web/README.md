# Web (Next.js)

This is the Next.js app for the Tradepal monorepo, wired to Turborepo and using the shared `@repo/ui` package.

## Scripts

- `yarn dev` – start the Next.js dev server on port 3000
- `yarn build` – build the production bundle
- `yarn start` – run the production server
- `yarn lint` – run ESLint using the shared config
- `yarn check-types` – run TypeScript without emitting

## Notes

- Transpiles `@repo/ui` via `transpilePackages` in `next.config.mjs`.
- Extends TypeScript settings from `@repo/typescript-config/nextjs.json`.
- Uses App Router (`src/app`).

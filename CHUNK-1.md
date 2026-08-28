# X2 V2 — Chunk 1

Generated locally from the agreed architecture. GitHub was read-only.

Target root: `mobile/src/`

This chunk establishes the application/navigation/screens/shared UI/theme boundaries. Chunk 2 supplies the real state, models, catalogs and market services. Chunk 3 supplies persistence, encryption, import/export and utilities.

The existing `MobileApplication.tsx`, `MobileService.ts`, `ratesApi.ts`, catalogs, theme and components remain the source of existing behavior during migration; do not delete them until their responsibilities have been migrated and verified.

# X2 V2 — Chunk 2

Generated from the read-only `feature/mobile` repository structure.

This chunk establishes the agreed state/model/catalog/service boundaries.

## Important
The provider calls remain adapter points because the current `ratesApi.ts` implementation must be wired into these services during migration. No fabricated live prices are introduced.

The current branch confirms:
- `TabCategory` currently contains `fx`, `crypto`, `metals`, `portfolio`.
- Current catalogs contain 10 default FX entries, USD/BTC crypto defaults, and the existing metals catalog.
- Current `MobileService` already maintains immutable `marketRates` plus `editedRates`, and the V2 state layer preserves that responsibility.

GitHub was read only; no repository write operation was performed.

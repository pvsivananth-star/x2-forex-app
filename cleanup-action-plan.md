# X2 Cleanup Action Plan

## Baseline

Working branch: `cleanup/fix-architecture`

Known-good baseline: `230aa4663a1083428db8bcc756697e340fa29122` (`refactor: create consolidated application service`).

All cleanup work must preserve established behavior unless a requirement explicitly changes it. Do not reuse the abandoned `cleanup/services-consolidation` implementation.

## Phase 0 — Guard the baseline

- Confirm the branch starts from the known-good commit.
- Run the existing build/tests before architectural changes.
- Record current behavior for market calculation, refresh, navigation, persistence and screen rendering.
- No functional redesign during this phase.

## Phase 1 — Establish application service boundaries

Create stable application-facing contracts before extracting implementations.

Initial contracts, only where required:

- `IRateService`
- `IPersistenceService`
- `ICatalogService`
- `ISettingsService`

Rules:

- Callers depend only on contracts.
- Callers must not know CoinGecko, Yahoo, Frankfurter, MMKV, AsyncStorage, HTTP clients or other implementation details.
- Do not create provider-named application services.
- Concrete implementations are selected at one composition/wiring point.
- Replacing a provider should not require caller changes.

Example:

```text
Screen / MobileService
        |
        v
    IRateService
        |
        v
    RateService
        |
        v
   IRateProvider
      /    \
 CoinGecko  Yahoo
```

The exact provider mapping is implementation/configuration, not a caller concern.

## Phase 2 — Persistence boundary

After the contracts exist:

1. Identify every persistence responsibility currently owned by `MobileService.ts`.
2. Move only persistence operations behind `IPersistenceService`.
3. Preserve existing persisted data formats and keys unless migration is explicitly required.
4. Keep market calculations, refresh orchestration and UI state out of the persistence implementation.
5. Verify every caller before removing old paths.

Do not solve production encryption in this phase.

## Phase 3 — Rate service and provider adapters

- Identify the current working rate implementation from the baseline.
- Wrap/adapt it instead of rewriting it.
- Normalize provider responses before application state consumes them.
- Keep FX, Crypto, Metals and EQ category state independent.
- Provider selection belongs in the composition point.

### Rate calculation invariant

Keep the existing central calculation utility and its behavioral contract.

For each market category, the underlying snapshot is immutable and USD is an independent anchor. User edits are display/calculation state and must not mutate the provider snapshot.

For a USD-relative base-rate set:

`converted = amount / fromRate * toRate`

Only the edited anchor value changes. Other underlying USD-relative rates remain unchanged; cross-rates are derived from the updated anchor.

## Phase 4 — Refresh/event-flow audit

Trace and document:

```text
refresh request
  -> rate service
  -> provider
  -> normalize
  -> market snapshot
  -> cache
  -> state notification
  -> table/screen render
```

Verify:

- refresh updates the correct category only;
- failed refresh preserves valid cache;
- table receives the updated state through one event path;
- no duplicate table/input implementations remain;
- active edits behave according to the existing requirements.

Do not change calculation formulas while performing this audit.

## Phase 5 — State architecture audit

Audit `settingsStore`, `watchlistStore` and other V2 state scaffolding.

For every store:

1. Find all callers.
2. Identify overlapping state in `MobileService`.
3. Decide the single source of truth.
4. Migrate callers.
5. Remove only proven-dead scaffolding.

Never delete a store solely because it appears unused without checking imports, navigation, persistence and indirect consumers.

## Phase 6 — Screen/navigation consolidation

Identify parallel implementations in `MobileApplication.tsx`, `screens/*`, `components/*` and legacy/V2 paths.

Target:

```text
Navigator
   -> one screen implementation
      -> shared components
         -> application contracts/state
```

Do not create another screen architecture. Reuse existing working components where possible.

## Phase 7 — EQ consistency

EQ replaces the previous Index user-facing page.

EQ is display-only:

- no editable rates;
- no add/remove controls;
- no calculator;
- deterministic US-first ordering;
- reuse existing country/index configuration;
- provider data is normalized before UI consumption.

EQ must use the same service boundary, refresh, cache, status and theme conventions without inheriting Forex editing/anchor logic.

## Phase 8 — Compatibility cleanup

Audit `types.ts` and all legacy compatibility imports.

Only after all callers use `models`/current contracts:

- remove compatibility exports;
- compile;
- run tests;
- verify no generated/runtime path still imports the facade.

## Phase 9 — Large-file cleanup

Refactor `MobileService.ts` and `MobileApplication.tsx` only after service boundaries and state ownership are established.

Each extraction must have one responsibility and preserve behavior.

Do not use file size alone as justification for moving logic.

## Phase 10 — Production persistence/security

Separate from functional cleanup.

Evaluate:

- encryption provider;
- secure key handling;
- migration of existing persisted data;
- failure/recovery behavior;
- platform-specific storage security.

No credentials or secrets belong in source control.

## Phase 11 — Final verification

Run, at minimum:

- TypeScript/build validation;
- unit tests;
- navigation verification;
- persistence/load-save verification;
- offline/cache verification;
- refresh verification;
- FX edit/cross-rate verification;
- Crypto and Metals isolation verification;
- EQ display-only verification;
- iOS runtime verification.

### Required market regression cases

- Editing FX USD changes all FX displayed values without changing other FX underlying rates.
- Editing another FX currency makes it the sole active edit.
- Switching edited currencies clears the previous edit.
- Crypto USD is independent of FX USD.
- Metals USD is independent of FX and Crypto USD.
- Refreshing FX cannot overwrite Crypto or Metals state.
- A failed refresh does not erase valid cached data.
- No provider name is referenced by market screens as an implementation dependency.

## Execution rules

1. One architectural change at a time.
2. Verify before and after each phase.
3. Commit each coherent phase separately.
4. Do not combine provider changes with state changes.
5. Do not rewrite working calculation logic while consolidating services.
6. Do not delete compatibility/state code until callers are proven migrated.
7. Keep `230aa46` as the behavioral baseline.
8. If a change causes a regression, revert that change rather than layering another fix on top.

## Current priority

```text
230aa46 baseline
      |
      v
Service contracts + composition point
      |
      v
Persistence boundary
      |
      v
Rate/provider boundary
      |
      v
Refresh/event-flow audit
      |
      v
State cleanup
      |
      v
Screen/navigation consolidation
      |
      v
EQ consistency
      |
      v
Compatibility cleanup
      |
      v
Large-file cleanup
      |
      v
Production persistence/security
      |
      v
Final build/runtime audit
```

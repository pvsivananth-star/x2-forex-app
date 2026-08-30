# X2 Forex App — Cleanup Action Plan

## Baseline

All cleanup work starts from the known-good baseline:

```text
230aa4663a1083428db8bcc756697e340fa29122
refactor: create consolidated application service
```

Working branch:

```text
cleanup/fix-architecture
```

Do not carry forward experimental changes from `cleanup/services-consolidation`.

## Objective

Clean the application without changing established working behavior unnecessarily.

The cleanup must reduce coupling and make services/providers replaceable without requiring caller changes.

The application caller must depend on contracts/capabilities, not concrete providers.

Example:

```text
Crypto screen
    ↓
IRateService
    ↓
RateService
    ↓
IRateProvider
    ↓
configured Crypto provider
```

The Crypto caller must not know whether the provider is CoinGecko, CoinCap, or another implementation. The same rule applies to FX, Metals, EQ, persistence, catalogs, and future services.

## Phase 0 — Protect the baseline

### 0.1 Verify baseline behavior

Before refactoring:

- compile the mobile application;
- run existing tests/checks;
- verify navigation;
- verify FX display and editing;
- verify Crypto display;
- verify Metals display;
- verify EQ/navigation state currently present at baseline;
- verify refresh and offline/cache behavior.

Record failures before making architectural changes.

### 0.2 No functional redesign during service cleanup

Do not combine provider replacement, calculation redesign, UI redesign, or persistence encryption with service-boundary work unless required by the contract migration.

## Phase 1 — Establish application service contracts

Create small, capability-oriented interfaces/contracts.

Initial boundaries:

```text
IRateService
IPersistenceService
ICatalogService
ISettingsService
```

Where needed, introduce provider-level contracts:

```text
IRateProvider
IPersistenceProvider
```

Rules:

- interfaces describe application capabilities, not technologies;
- no `ICoinGeckoService`, `IYahooService`, `IAsyncStorageService`, etc.;
- callers never select providers;
- contracts should remain small and stable.

## Phase 2 — Create one composition/wiring point

Create a single service composition point where concrete implementations are selected.

Conceptually:

```text
container
  rateService        → latest RateService implementation
  persistenceService → latest PersistenceService implementation
  catalogService     → latest CatalogService implementation
  settingsService    → latest SettingsService implementation
```

Provider selection remains inside the service/provider implementation or configuration.

Changing the provider should not require changes to screens or application callers.

## Phase 3 — Adapt existing working services

Do not rewrite working services merely to introduce interfaces.

Wrap/adapt the current implementations behind the new contracts.

Migration rule:

```text
existing implementation
        ↓
contract adapter if required
        ↓
application caller
```

First preserve behavior, then simplify implementation where safe.

## Phase 4 — Rate-service/provider boundary

Centralize market-data acquisition behind `IRateService`.

Target flow:

```text
Screen/Application
        ↓
IRateService
        ↓
RateService
        ↓
IRateProvider
        ↓
provider adapter
        ↓
external API/WebSocket
```

Provider-specific parsing, transport, errors, retries, and endpoint details remain below the boundary.

Market categories remain independent at the state/calculation level.

### Required invariant

```text
FX USD state      independent
Crypto USD state  independent
Metals USD state  independent
```

Do not use one mutable global asset namespace as the source of truth for multiple market categories.

## Phase 5 — Preserve the calculation contract

Use the baseline calculation behavior as the reference.

For USD-normalized rates:

```text
convertedValue = amount / fromRate * toRate
```

Maintain an immutable market/API snapshot during editing.

Only one active edit is allowed.

An edit must never mutate the API snapshot or become the next calculation baseline.

This phase is a refactoring/contract phase, not an invitation to redesign the calculation algorithm.

Required behavior tests:

- edit USD and verify all other values recalculate;
- edit a non-USD currency and verify cross-rates recalculate;
- switching edited currency clears the previous edit;
- edited value remains exactly what the user entered;
- refresh does not leak state across markets;
- FX, Crypto, and Metals USD values are independent.

## Phase 6 — Persistence boundary

Move persistence access behind `IPersistenceService`.

Application services should not directly depend on storage technology.

Target:

```text
MobileService
    ↓
IPersistenceService
    ↓
latest persistence implementation
    ↓
MMKV / storage provider
```

The concrete implementation is selected at the composition point.

Do not implement production encryption in this phase.

## Phase 7 — Dead V2 state audit

Audit all state stores and state scaffolding before deleting anything.

Candidates include:

- `settingsStore`
- `watchlistStore`
- other V2 state modules

For every candidate:

1. find all imports/callers;
2. identify whether it is authoritative or compatibility code;
3. compare with `MobileService` state;
4. migrate callers if required;
5. remove only after zero required callers remain;
6. compile/test.

Never delete based only on filename or apparent duplication.

## Phase 8 — Screen and component architecture

Identify and eliminate parallel UI implementations.

Target:

```text
Screen
  ↓
application/state boundary
  ↓
shared market/table components
```

There must be one coherent table/input event path for market-rate screens.

Do not maintain old and V2 versions of the same behavior indefinitely.

Shared components should own reusable presentation behavior. Screens should compose screen-specific data and presentation.

## Phase 9 — EQ consistency

EQ is display-only.

Requirements:

- EQ replaces the old Index user-facing concept;
- no edit/add/remove/customize controls for indices;
- normalized `EquityIndex` model;
- existing country/index configuration is reused;
- US indices appear first;
- unavailable instruments are omitted rather than fabricated;
- EQ provider details remain behind the service boundary.

EQ must not inherit Forex/Crypto editable-anchor behavior.

## Phase 10 — Catalog/configuration consolidation

Keep one source of truth for each catalog/configuration domain.

Do not create duplicate market lists or provider-specific configuration in screens.

Required default behavior from the architecture:

- FX: configured default 10, user add/remove/reorder;
- Crypto: all available supported provider data, with BTC as the default where available;
- Metals: configured supported metals;
- EQ: configured indices with deterministic US-first ordering.

Note: the original requirements document says Crypto default Top 10, while Architecture V2 explicitly removes the artificial Top-10 limitation. The consolidated architecture adopts the V2 decision: consume all available supported crypto data and do not hardcode a Top-10 display limit.

## Phase 11 — Compatibility cleanup

Audit compatibility facades such as `types.ts`.

Migration order:

```text
find imports
   ↓
migrate to canonical models
   ↓
compile/test
   ↓
remove compatibility facade
```

No compatibility file is deleted until all callers are verified.

## Phase 12 — Large-file cleanup

After service boundaries and caller migrations are stable, reduce responsibility in:

```text
mobile/src/MobileService.ts
mobile/src/MobileApplication.tsx
```

The goal is not simply smaller files. Each responsibility should have one clear owner.

Potential responsibilities to extract include:

- service wiring
- persistence access
- market data orchestration
- settings
- watchlist management
- navigation/application composition

Do not split code merely by line count.

## Phase 13 — Production persistence/security

Separate phase after the functional architecture is stable.

Evaluate:

- encrypted persistence implementation;
- key management;
- sensitive data handling;
- migration from existing persisted state;
- failure/recovery behavior.

The application continues to depend only on `IPersistenceService`.

## Phase 14 — Final verification

Run the full validation set only after architecture cleanup:

### Build

- TypeScript compile;
- iOS build;
- Expo/runtime startup.

### Market behavior

- FX calculation;
- Crypto loading;
- Metals loading;
- EQ display/order;
- independent market state;
- refresh;
- offline/cache fallback;
- editing behavior where supported.

### Architecture

- screens do not import provider implementations;
- application services depend on contracts;
- provider selection occurs at the composition boundary;
- persistence implementation is replaceable;
- no duplicate table/event implementation;
- no dead state scaffolding;
- no unnecessary compatibility facade.

## Commit Strategy

Keep commits small and independently understandable.

Recommended sequence:

```text
1. establish contracts
2. add composition point
3. adapt existing services
4. migrate callers
5. persistence boundary
6. state audit/removal
7. screen consolidation
8. EQ consistency
9. compatibility cleanup
10. large-file cleanup
11. security review
12. final verification
```

Each commit should compile and preserve working behavior where practical.

## Non-goals

During this cleanup, do not:

- change market providers without a requirement;
- redesign the calculation algorithm without evidence;
- redesign the UI unnecessarily;
- introduce duplicate service abstractions;
- add API keys;
- fabricate market data;
- make callers aware of provider names;
- make persistence technology a caller dependency;
- combine unrelated architectural migrations into one large change.

## Definition of Done

Cleanup is complete when:

1. application callers depend on stable contracts;
2. concrete services are selected in one composition point;
3. provider choice is invisible to callers;
4. FX/Crypto/Metals state is independent;
5. calculation has one authoritative implementation;
6. refresh has one predictable event flow;
7. persistence is replaceable;
8. duplicate state/UI paths are removed after caller verification;
9. EQ follows display-only rules;
10. compatibility shims are removed where no longer needed;
11. large files have clear responsibilities;
12. existing working behavior is preserved;
13. build and runtime verification pass.

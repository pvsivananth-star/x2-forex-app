# X2 Forex App — Architecture

## 1. Purpose

X2 is a zero-backend React Native / Expo mobile application for reliable market information across Forex, Crypto, Metals, EQ (Equity Markets), Charts, and Portfolio.

The architecture prioritizes:

- reliable market data
- simple, fast presentation
- minimal API usage
- offline resilience
- clear separation between market categories
- provider independence
- centralized calculation and normalization
- replaceable service implementations
- preservation of established working behavior

The repository is the source of truth. Existing behavior, services, dependencies, APIs, and configuration must be inspected before changes. Do not introduce parallel implementations when an existing capability can be reused.

## 2. Core Principles

### 2.1 Application depends on contracts, not implementations

Callers must not know which concrete service or external provider supplies data.

```text
Screen / Application
        |
        v
 Application Contract
        |
        v
 Service implementation
        |
        v
 Provider / storage adapter
```

For example, Crypto may use CoinGecko while Forex uses Yahoo or another provider. Changing either provider must not require changes in screens or application callers.

### 2.2 Provider independence

Provider-specific HTTP, SDK, authentication, response parsing, retry, and error handling belong behind provider adapters.

```text
Application
    |
    v
IRateService
    |
    v
RateService
    |
    +--> IRateProvider --> Crypto provider adapter --> CoinGecko
    |
    +--> IRateProvider --> FX provider adapter     --> Yahoo / Frankfurter / ER-API
    |
    +--> IRateProvider --> Metals provider adapter --> configured provider
    |
    +--> IRateProvider --> EQ provider adapter     --> configured provider
```

The names of providers are implementation details, not application dependencies.

### 2.3 One composition point

Concrete implementations are selected in one composition/wiring location. Replacing a service or provider should normally require changing only the wiring/configuration, not callers.

### 2.4 Market categories are independent

Forex, Crypto, Metals, and EQ have separate market requirements and state. A value named USD in one category must never implicitly share mutable state with USD in another category.

Conceptually:

```text
FX      -> FX market snapshot / calculation state
Crypto  -> Crypto market snapshot / calculation state
Metals  -> Metals market snapshot / calculation state
EQ      -> EQ market snapshot / display state
```

## 3. Application Service Boundaries

The application should use stable contracts such as:

```text
IRateService
IPersistenceService
ICatalogService
ISettingsService
```

Services expose application capabilities, not provider-specific operations.

Bad:

```text
coinGeckoService.getRates()
yahooService.getRates()
asyncStorage.getItem()
```

Preferred:

```text
rateService.getRates(market)
persistenceService.loadState()
persistenceService.saveState(state)
```

### 3.1 Rate service

`IRateService` is responsible for obtaining normalized market data and coordinating refresh behavior. It must not expose provider-specific details to callers.

### 3.2 Persistence service

`IPersistenceService` owns application persistence. The application must not depend directly on AsyncStorage, MMKV, SQLite, SecureStore, or encryption details.

### 3.3 Catalog service

Catalog definitions remain centralized and reusable. Do not create duplicate catalog/configuration systems for the same market.

### 3.4 Settings service

Application settings are accessed through a stable boundary so the storage mechanism can change independently.

## 4. Market Data Flow

```text
External Provider
       |
       v
Provider Adapter
       |
       v
Normalized Market Data
       |
       v
Immutable Market Snapshot
       |
       +------> Cache / Persistence
       |
       v
Market State
       |
       v
Screens / Components
```

Screens must not contain provider-specific HTTP logic.

A failed request must not destroy valid cached data.

Expected service result should be predictable, conceptually:

```text
{
  data,
  isOffline,
  error?
}
```

No market value may be fabricated. If live data is unavailable, valid cached data may be displayed with the appropriate offline state.

## 5. Market Calculation Architecture

Calculation is a pure domain capability and must remain separate from provider access.

For USD-normalized rates:

```text
baseRates = {
  USD: 1,
  EUR: 0.85,
  JPY: 155.5,
  GBP: 0.75
}
```

Conversion is:

```text
convertedValue = amount / baseRates[from] * baseRates[to]
```

For an edit, only the selected market's derived anchor value changes. The original API snapshot remains immutable.

Example:

```text
USD = 1
EUR = 0.85
JPY = 155.5
GBP = 0.75
```

Editing USD to `2` changes the displayed values in that market but does not mutate the underlying API snapshot.

Editing EUR to `2` makes EUR the sole active edited currency and recalculates every other value from the original snapshot.

There is only one active edit at a time.

### 5.1 Market isolation

Each market category owns its own snapshot and calculation state:

```text
FX.baseRates
Crypto.baseRates
Metals.baseRates
```

Therefore:

```text
FX.USD != Crypto.USD != Metals.USD
```

They may all numerically start at `1`, but they are independent application state.

### 5.2 No cascading edits

User-entered values must never become the new API baseline.

```text
API snapshot
    |
    +--> edit USD
    +--> edit EUR
    +--> edit GBP
```

Every edit is calculated against the same immutable market snapshot until live data is refreshed or the edit is explicitly cleared.

## 6. Refresh Event Flow

Refresh is a market-data operation, not a UI-specific calculation operation.

```text
User / timer
     |
     v
IRateService.refresh(market)
     |
     v
Provider adapter
     |
     v
Validate response
     |
     +---- failure ---> preserve valid snapshot/cache + offline/error state
     |
     v
Replace market snapshot
     |
     v
Update cache
     |
     v
Recalculate active display if required
     |
     v
Notify market state subscribers
     |
     v
Table / screen re-render
```

Refresh for one market must not mutate another market's state.

Force refresh/resync clears manual overrides where required by the finalized product interaction model.

## 7. UI and Screen Architecture

Primary navigation:

```text
Forex | Crypto | Metals | EQ | Charts | Portfolio
```

Each market screen consumes normalized application data through the service/state boundary.

Shared visual behavior belongs in reusable components:

```text
components/
  Header
  MarketStatus
  Refresh
  MarketCard / RateTable
  Theme
```

There must be one coherent table/input event path. Duplicate legacy and V2 table implementations must not coexist indefinitely.

## 8. Forex

Forex is the primary currency conversion experience.

Requirements:

- configured default currency set
- 10 default currencies
- user add/remove/reorder
- editable values
- one active edited currency
- USD-normalized underlying rates
- immutable API snapshot
- centralized cross-rate calculation

Editing USD or any other currency affects only the FX market state.

## 9. Crypto

Crypto is a market display using USD as the fixed quote currency.

- BTC is the default cryptocurrency where available.
- Crypto data comes from the configured provider through the rate/provider boundary.
- The architecture supports all available cryptocurrencies returned by the provider, subject to provider/API limitations.
- The caller must not know whether the provider is CoinGecko, CoinCap, or another implementation.
- Crypto state and Crypto USD are independent from FX and Metals.

## 10. Metals

Metals are a dedicated market category including Gold, Silver, Platinum, and Palladium where supported.

Provider-specific implementation remains behind the service boundary.

Metals state and Metals USD are independent from FX and Crypto.

## 11. EQ — Equity Markets

EQ replaces the previous Index page and is display-only.

There is no:

- rate editing
- add/remove market UI
- calculator
- user-customized index ordering

US indices appear first, followed by major global markets. Existing country/index configuration should be reused rather than duplicated.

Normalized model:

```text
EquityIndex {
  id
  symbol
  name
  country
  value
  change?
  changePercent?
  timestamp?
}
```

Unavailable provider instruments are omitted; fabricated values are prohibited.

## 12. Caching and Persistence

Market data is cached locally for offline resilience.

The existing cache architecture should be reused and extended rather than replaced with unrelated storage systems.

Conceptually:

```text
Network success
     |
     v
Normalize
     |
     v
Update market snapshot
     |
     v
Persist cache
```

On failure:

```text
Valid cache
   |
   v
Display cached data
   |
   v
Offline status
```

Persistence must be behind `IPersistenceService`. The concrete implementation may use MMKV or another mechanism without changing callers.

## 13. Theme and Precision

Theme is centralized. New screens use the common theme context and semantic colors.

Precision is centrally controlled and may be overridden only where market-specific accuracy requires it.

## 14. Charts and Portfolio

Charts and Portfolio remain separate capabilities.

They may consume normalized market data but must not couple their internal state to Forex, Crypto, Metals, or EQ presentation state.

## 15. Accessibility and Visual Consistency

Interactive controls have meaningful accessibility labels.

Live/connection state uses a small status indicator. The indicator must not rely only on color for accessibility.

Primary market screens use a consistent financial-market visual language and centralized theme.

## 16. Performance

Priorities:

- minimal API calls
- reuse fetched data
- caching
- efficient list rendering
- avoid unnecessary re-renders
- avoid duplicate provider requests
- avoid requesting the same underlying data separately for every consumer when one provider request can supply it

## 17. Security

No API keys are required by the application architecture. Credentials, where ever required by a future provider, remain outside source code.

Persistence encryption is a separate implementation concern and must be introduced behind the persistence contract rather than leaking into application callers.

## 18. Architecture Rules

1. Repository is the source of truth.
2. Preserve established working behavior unless a requirement intentionally changes it.
3. Application callers depend on interfaces/contracts.
4. Concrete services are selected at one composition point.
5. Providers are adapters behind service/provider contracts.
6. Provider names must not leak into screens or domain logic.
7. Market categories have independent state.
8. Market/API snapshots are immutable during user editing.
9. Calculation logic is centralized and pure.
10. Refresh updates only the affected market and its cache/state.
11. Screens do not implement provider HTTP logic.
12. Existing configuration/catalogs should be reused rather than duplicated.
13. There must be one coherent UI/table event path.
14. No fabricated market data.
15. Failed refreshes preserve valid cached data.
16. New architecture must reduce coupling, not merely add wrappers.

## 19. Target Dependency Direction

```text
UI / Screens
     |
     v
Application Services / Contracts
     |
     +-------------------+
     |                   |
     v                   v
Domain / Calculation   Persistence
     |
     v
Normalized Market Data
     |
     v
Service Implementations
     |
     v
Provider / Storage Adapters
     |
     v
External Systems
```

The dependency direction is always inward toward stable application/domain contracts. External systems are replaceable adapters.

## 20. Definition of Done

The architecture is considered clean when:

- replacing a market-data provider does not require screen changes;
- replacing persistence does not require application/service callers to change;
- FX/Crypto/Metals state cannot overwrite one another;
- calculation has one authoritative implementation;
- refresh has one predictable event flow;
- each market screen consumes the same normalized service boundary;
- duplicate service/UI implementations are removed after callers are migrated;
- existing working behavior is preserved;
- compile and runtime behavior are verified before declaring completion.

# X2 Forex App — Architecture

## Purpose

X2 is a zero-backend React Native/Expo mobile market application for Forex, Crypto, Metals, Equity Markets (EQ), Charts and Portfolio.

The architecture prioritizes reliable market data, simple presentation, fast loading, offline resilience, consistent UI, minimal API usage, clear separation between market categories, and provider independence.

## Core principles

1. The repository and established working behavior are the source of truth.
2. Application callers depend on stable contracts, not concrete implementations.
3. Concrete services/providers are selected at one composition point.
4. Provider-specific HTTP/API details never reach screens or application callers.
5. Forex, Crypto, Metals and EQ have independent category state.
6. Each market category has its own USD anchor/state; FX.USD, Crypto.USD and Metals.USD are distinct values.
7. Pure calculation logic remains independent of providers, persistence and UI.
8. Do not introduce parallel implementations when an existing service/component can be adapted.

## Service and provider boundaries

```text
UI / Application
      |
      v
Application contracts
      |
      v
Service implementations
      |
      v
Provider / storage adapters
      |
      v
External systems
```

Core contracts include, where applicable:

- `IRateService`
- `IPersistenceService`
- `ICatalogService`
- `ISettingsService`

Interfaces represent application capabilities, not technologies. Avoid exposing `IAsyncStorageService`, `ICoinGeckoService`, etc. to application callers.

The composition root is the single place that selects the current implementations. For example, Crypto may use CoinGecko while FX uses Yahoo or another provider. Replacing either provider must not require changes to screens or application callers.

```text
IRateService
    |
    +-- Forex -> provider adapter
    +-- Crypto -> provider adapter
    +-- Metals -> provider adapter
    +-- EQ -> provider adapter
```

Provider adapters normalize external responses before application state consumes them.

## Market data flow

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
Market Snapshot
      |
      +----> Cache
      |
      v
Category State
      |
      v
Screen / Table
```

A successful fetch updates the market snapshot and cache. A failed fetch must not destroy valid cached data.

## Refresh flow

```text
User refresh / scheduled tick
          |
          v
IRateService.refresh(...)
          |
          v
Validate / normalize
          |
      +---+---+
      |       |
   success  failure
      |       |
      v       v
 snapshot   retain valid cache
 cache      mark unavailable
      |
      v
 notify state
      |
      v
 UI re-render
```

Refreshing one market category must never overwrite another category's state.

## Rate calculation

Calculation is a pure domain concern. Rates are normalized against USD inside each category.

```text
baseRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 155.5
}

convert(amount, from, to)
    = amount / baseRates[from] * baseRates[to]
```

The API market snapshot is immutable. User edits never overwrite it.

Only one currency/rate may be actively edited at a time. When a row is edited, displayed values are recalculated from the unchanged market snapshot. Switching the edited row clears the previous edit; edits never cascade into the next calculation.

Example: if EUR changes from 0.85 to 0.80 relative to USD, only the EUR anchor changes. JPY and GBP underlying USD-relative values remain unchanged; displayed cross-rates involving EUR are derived from the updated EUR value.

The central calculation utility is the only implementation of the conversion formula.

## Category architecture

```text
FX
  marketSnapshot
  displayedRates
  activeEdit
  USD anchor

Crypto
  marketSnapshot
  displayedRates
  activeEdit where required
  independent USD anchor

Metals
  marketSnapshot
  displayedRates
  interaction state as required
  independent USD anchor

EQ
  marketSnapshot
  displayedData
  no edit state
```

There must be no shared mutable USD value across categories.

## Forex

Forex is the primary currency conversion experience. It supports the configured default currency set, user add/remove/reorder, editable values, one active edit, USD-based underlying rates, immutable market snapshots and centralized cross-rate calculation.

The default watchlist configuration and user watchlist state are separate from provider market data.

## Crypto

Crypto is a market display with USD-quoted prices and BTC as the default cryptocurrency where available. The architecture does not artificially restrict results to a fixed Top-10 list; the available universe is governed by the configured provider/catalog and application requirements.

Crypto state and USD are independent from Forex.

## Metals

Metals are a dedicated market category including supported precious metals such as Gold, Silver, Platinum and Palladium. Provider retrieval and unit conversion belong behind service/provider boundaries. Metals state and USD are independent from Forex and Crypto.

## EQ — Equity Markets

EQ replaces the previous Index page and is display-only: no editing, add/remove controls, calculator or user-customized index ordering.

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

Unavailable provider instruments are omitted; fabricated prices are never allowed.

## Navigation

Primary navigation:

`Forex | Crypto | Metals | EQ | Charts | Portfolio`

The existing navigator remains the central registration point. EQ is the user-facing name for Equity Markets. No second navigation layer should be introduced.

## Screen and component architecture

Screens compose data and reusable components. Shared visual behavior belongs in shared components. There should be one authoritative table/list interaction path for editable market tables; legacy and V2 duplicates are removed only after callers and behavior are verified.

All primary market screens use the common header where applicable. Connection status is represented by a small accessible status indicator: green for live/connected and red for offline/unavailable. The word `LIVE` is not displayed beside it.

## Persistence and offline behavior

Application code depends on `IPersistenceService`, not directly on MMKV, AsyncStorage, SecureStore, SQLite or files.

Market cache records retain data and timestamp. On refresh failure, valid cached data remains available and the UI indicates the unavailable/offline state.

The existing storage/cache mechanism should be extended rather than replaced by unrelated persistence systems.

## Theme and precision

Theme context is the centralized source for semantic colors, dark/light mode and precision. New components use the theme rather than independent hardcoded visual systems. Provider-specific precision may override generic display precision when required for accuracy.

## Charts and Portfolio

Charts remain an independent analytical experience and consume normalized market data. Portfolio remains separate from market-screen presentation and may consume normalized market data without coupling to Forex, Crypto, Metals or EQ.

## Data integrity and accessibility

Never fabricate market prices. If current data is unavailable, use valid cache; if no valid cache exists, show an unavailable state.

Interactive controls require meaningful accessibility labels. Status must not rely exclusively on color.

## Performance

Prefer minimal provider calls, reuse fetched data, caching, normalized data, efficient lists, avoiding unnecessary re-renders and avoiding duplicate requests. A provider request may serve multiple consumers when appropriate, while category state remains independent.

## Change rules

When replacing an implementation:

1. Preserve the application contract.
2. Change concrete wiring only at the composition point.
3. Keep provider-specific structures behind adapters.
4. Do not change screens merely because a provider changes.
5. Do not duplicate state or services to support a new implementation.
6. Verify behavior before and after the replacement.

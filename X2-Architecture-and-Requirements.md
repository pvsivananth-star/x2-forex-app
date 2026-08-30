# X2 Forex App — Architecture & Requirements

**Canonical product, functional, calculation, and architecture specification.**

This document consolidates the previous `AppRequriements.md` and `architecture.md`. It is the single source of truth for X2 application behavior and architecture.

## 1. Purpose

X2 is a React Native / Expo mobile market-information application providing a fast, reliable view of:

- Forex
- Crypto
- Metals
- EQ — Equity Markets
- Charts
- Portfolio

The application prioritizes reliable market data, simple presentation, minimal API usage, offline resilience, consistent UI, and clear separation between market categories.

## 2. Core Principles

### 2.1 Repository is the implementation source of truth

The existing repository, services, models, dependencies, APIs, configuration, and established working behavior must be inspected before changes are made. Do not introduce duplicate architecture when an existing implementation already provides the required capability.

### 2.2 Market categories are independent

Each category owns its market-specific calculation and presentation rules. Shared infrastructure may be reused, but one category's anchor, editing state, or calculation state must never accidentally affect another category.

### 2.3 Market data and displayed values are different concepts

The application must maintain a clear separation between:

```text
Live/API market snapshot
        ↓
Normalized market values
        ↓
Tab-specific anchor
        ↓
Displayed values
```

User-entered values modify the display anchor, never the underlying market snapshot.

### 2.4 Never fabricate market prices

If live data is unavailable, use valid cached data when available. Otherwise show an unavailable state. Never invent or silently substitute market prices.

## 3. Navigation

Primary navigation:

```text
Forex | Crypto | Metals | EQ | Charts | Portfolio
```

- Forex: currency market and calculator.
- Crypto: cryptocurrency market.
- Metals: precious-metal market.
- EQ: global equity-market indices; display only.
- Charts: analytical market charts.
- Portfolio: portfolio tracking.

EQ replaces the previous Index page and must not become an editable calculator.

## 4. Shared Header

Primary market screens use the common header.

The header provides:

- Menu/hamburger access.
- X2 branding.
- Market connection status.
- Refresh action where applicable.
- Tenor selection where applicable.

### 4.1 Connection indicator

Use a medium/small circular indicator with no visible `LIVE` text beside it.

- Green = connected/live.
- Red = offline/unavailable.

The indicator must retain an accessibility label/tooltip describing its state.

## 5. Market Data Architecture

All market data flows through a centralized service/adapter layer:

```text
External Provider
      ↓
Provider/API Adapter
      ↓
Normalized Market Snapshot
      ↓
Cache / Persistence
      ↓
Market State
      ↓
Forex / Crypto / Metals / EQ / Charts / Portfolio
```

Screens must not contain provider-specific HTTP logic.

Provider-specific response formats are normalized before reaching the UI.

Where one provider request can supply multiple categories, reuse the request rather than issuing duplicate requests from each screen.

## 6. Normalized Market Values

Every editable market category must have a normalized, immutable market snapshot.

Conceptually:

```ts
interface NormalizedMarketValue {
  symbol: string;
  name: string;
  usdValue: number;
  changePct?: number;
  timestamp?: number;
}
```

The exact implementation type may differ, but the semantic meaning must remain stable.

For calculation purposes, each asset must have a consistent USD-normalized value for one unit of that asset.

Examples:

```text
USD = 1.0000 USD per USD
EUR = 0.8600 USD per EUR
BTC = 78075 USD per BTC
XAU 1 OZ = 3400 USD per OZ   (illustrative only)
```

The numbers above are examples of representation, not fixed market prices.

## 7. Canonical Anchor-Based Calculation Model

This is a **core product requirement** and applies independently to Forex, Crypto, and Metals.

### 7.1 Default anchors

On a fresh/default application state:

| Tab | Default anchor | Default displayed value |
|---|---|---:|
| Forex | USD | 1 |
| Crypto | BTC | 1 |
| Metals | XAU 1 OZ | 1 |

The remaining rows are calculated from the current market snapshot relative to that anchor.

### 7.2 User-selected anchor

When the user edits any row, that asset immediately becomes the **sole active anchor for that tab**.

The entered value is authoritative for that anchor.

Every other displayed row is recalculated from the immutable market snapshot.

```text
                 ┌── asset A
                 ├── asset B
Market Snapshot ─┼── anchor asset = user value
                 ├── asset C
                 └── asset D
```

The calculation must never cascade through a previously edited displayed value.

### 7.3 General formula

Let:

- `M(a)` = normalized USD market value of asset `a` from the current immutable snapshot.
- `A` = selected anchor asset.
- `V(A)` = user-entered/displayed value of the anchor.

Then every asset `X` is displayed as:

```text
V(X) = V(A) × M(X) / M(A)
```

The anchor itself is always displayed exactly as entered:

```text
V(A) = user-entered value
```

This formula is the canonical rule for all editable market tabs.

## 8. Forex Requirements

### 8.1 Default

Forex starts with the configured default currency watchlist. The current requirement is **10 default currencies**, with user add/remove support.

On fresh start:

```text
USD = 1
```

All other currencies are calculated relative to USD using the live USD-normalized market snapshot.

Example market snapshot:

```text
USD = 1.00 USD per USD
EUR = 0.86 USD per EUR
GBP = 1.27 USD per GBP
```

Initial display:

```text
USD = 1
EUR = 0.86
GBP = 1.27
```

### 8.2 Editing USD

If the user changes USD to 2, USD remains the anchor and all other currencies recalculate from the unchanged market snapshot.

```text
EUR = 2 × 0.86 / 1.00 = 1.72
GBP = 2 × 1.27 / 1.00 = 2.54
```

### 8.3 Editing another currency

If the user changes EUR to 2, EUR becomes the new anchor. USD is no longer fixed at 1.

Using EUR/USD = 0.86:

```text
USD = 2 × 1.00 / 0.86 ≈ 2.3256
```

Other currencies are recalculated from the same original market snapshot:

```text
GBP = 2 × GBP_USD / EUR_USD
```

### 8.4 Only one active anchor

Only one currency can be actively edited at a time.

When the user switches from one edited currency to another:

1. Clear the previous edit state.
2. Make the newly edited currency the anchor.
3. Use the newly entered value exactly.
4. Recalculate every other visible currency from the immutable market snapshot.

### 8.5 No cascading edits

User edits must never become the new market-rate baseline.

Every recalculation references the original normalized market snapshot.

### 8.6 Cross-rate formula

For a conventional currency conversion:

```text
convertedValue = amount × M(to) / M(from)
```

The existing centralized cross-rate utility should remain the single implementation of this rule.

## 9. Crypto Requirements

Crypto is a market display with the same anchor model as Forex where editing is enabled.

### 9.1 Data

Bring all available cryptocurrencies returned by the configured provider, subject to provider/API limitations. Do not artificially restrict the data to a Top-10 list.

### 9.2 Default anchor

On fresh/default state:

```text
BTC = 1
```

Other crypto values are calculated relative to BTC.

If BTC is 78075 USD and ETH is 2500 USD:

```text
BTC = 1
ETH = 2500 / 78075 ≈ 0.03202
```

The exact values must always come from the current market snapshot.

### 9.3 Editing crypto

If the user changes ETH to 2, ETH becomes the anchor:

```text
ETH = 2
BTC = 2 × BTC_USD / ETH_USD
```

All other cryptocurrencies recalculate from the immutable USD-normalized snapshot.

### 9.4 USD is not the permanent display anchor

USD may be the provider/base currency for market data, but it must not force BTC to display as 78075 when the product default requires BTC = 1.

The provider's USD prices are the calculation source; the selected tab anchor controls the displayed scale.

## 10. Metals Requirements

Metals use the same anchor model.

Primary supported metals may include Gold/XAU, Silver/XAG, Platinum/XPT, Palladium/XPD, and other provider-supported instruments.

### 10.1 Default anchor

On fresh/default state:

```text
XAU 1 OZ = 1
```

Other metals are recalculated relative to the USD-normalized market value of one XAU troy ounce.

### 10.2 Unit handling

Metal units must remain explicit. Troy ounce, gram, kilogram, bar, and other units must not be treated as interchangeable without the appropriate conversion factor.

### 10.3 Editing metals

When metal editing is enabled by the product UI, the edited metal becomes the tab anchor and all other metal values recalculate from the immutable market snapshot.

## 11. EQ — Equity Markets

EQ is display-only.

There is no editable rate field, add/remove market control, calculator, or user-customized index ordering.

US indices appear first, followed by major global markets, subject to provider availability.

Preferred US order:

```text
S&P 500
Nasdaq 100
Dow Jones
Russell 2000
```

Unavailable instruments must be omitted rather than fabricated.

## 12. Watchlists and Customization

### Forex

- Default list: 10 currencies.
- Add: yes.
- Remove: yes.
- Reorder: preserve existing supported behavior.
- Edit/anchor: yes.
- Persistence: local.

### Crypto

- Display all available supported assets.
- Default anchor: BTC = 1.
- Editing/anchor behavior follows the finalized interaction model.

### Metals

- Display configured supported metals/instruments.
- Default anchor: XAU 1 OZ = 1.
- Editing/anchor behavior follows the finalized interaction model.

### EQ

Display only; no editing, add, remove, or customization.

## 13. Refresh and Resynchronization

A successful refresh must:

1. Fetch current market data.
2. Validate the response.
3. Replace the immutable market snapshot.
4. Update cache.
5. Recalculate displayed values using the current tab anchor, if one exists.
6. Update connection status.

A refresh must not destroy valid cached data on failure.

A full/manual reset may clear user anchors and restore:

```text
Forex  → USD = 1
Crypto → BTC = 1
Metals → XAU 1 OZ = 1
```

## 14. Editing State

Only one active edited/anchored asset exists per editable tab.

Conceptually:

```text
marketSnapshot
activeAnchorSymbol
activeAnchorValue
editingSymbol
```

`marketSnapshot` remains unchanged until a successful refresh.

`activeAnchorValue` is the user's displayed value for the anchor.

`editingSymbol` controls the current input/edit UI state.

Anchors are independent:

```text
Forex  → independent anchor
Crypto → independent anchor
Metals → independent anchor
```

## 15. Persistence

Use the existing persistence architecture for:

- Watchlists.
- User ordering.
- Theme/precision settings.
- Tab-specific anchor state when restoration is required.
- Cached market snapshot and timestamp.

Never persist secrets or API credentials.

## 16. Offline Strategy

```text
Live request
    ↓
Success ─────────→ update snapshot + cache
    │
    └─ failure ──→ valid cache available?
                         │
                    yes  ↓  no
                    use cache → unavailable state
```

Cached data must retain its timestamp.

## 17. Theme and Precision

Use the centralized theme system and semantic colors. Market screens use centralized precision, with market-specific precision allowed where required for accuracy.

## 18. Charts

Charts remain a separate analytical experience and may support instrument selection, price history, volume, 50 DMA, 200 DMA, and crosshair functionality.

## 19. Portfolio

Portfolio remains a separate feature and must not be coupled to market-category editing state.

## 20. Component Architecture

Shared visual behavior belongs in reusable components. Screens primarily handle screen state, data selection, and presentation composition.

## 21. Service Architecture

```text
services/
├── marketService
├── rates/
│   ├── fxService
│   ├── cryptoService
│   └── metalsService
├── persistence/
└── ...
```

Provider-specific details remain inside service/adapters. Calculation rules belong in centralized calculation logic rather than being duplicated across screens.

## 22. Data Integrity Rules

The application must never:

- Treat displayed edited values as live market rates.
- Cascade one user edit into the next calculation baseline.
- Hardcode live prices.
- Mix anchors between tabs.
- Show a provider's raw USD price when the product requires an asset to start at 1.

The invariant is:

```text
preserve market snapshot
        ↓
select tab anchor
        ↓
apply canonical ratio
        ↓
render derived values
```

## 23. Accessibility

Interactive elements require meaningful accessibility labels, including refresh, menu, asset selection, editing, and live/offline connection state.

## 24. Performance

Prioritize minimal API calls, cache reuse, efficient rendering, shared normalized market data, centralized calculation, and avoidance of duplicate provider requests.

## 25. Verification Requirements

After meaningful changes:

```text
implementation
    ↓
typecheck
    ↓
static/lint checks where applicable
    ↓
unit/integration tests
    ↓
application launch/build verification
    ↓
functional verification
```

Rate-calculation tests must cover:

1. Fresh Forex state: USD = 1.
2. Fresh Crypto state: BTC = 1.
3. Fresh Metals state: XAU 1 OZ = 1.
4. Editing USD in Forex recalculates every other currency.
5. Editing EUR in Forex makes EUR the sole anchor.
6. Editing EUR does not use a previous USD edit as its baseline.
7. Switching anchors clears the previous editing state.
8. Anchors remain independent across tabs.
9. Refresh updates the market snapshot without corrupting the calculation model.
10. Invalid/unavailable market data never produces fabricated values.

## 26. Canonical Examples

### Forex

If:

```text
USD = 1.00
EUR = 0.86
GBP = 1.27
```

fresh state is:

```text
USD = 1
EUR = 0.86
GBP = 1.27
```

If the user enters `EUR = 2`:

```text
EUR = 2
USD = 2 / 0.86 ≈ 2.3256
GBP = 2 × 1.27 / 0.86 ≈ 2.9535
```

### Crypto

If:

```text
BTC = 78075 USD
ETH = 2500 USD
```

fresh state is:

```text
BTC = 1
ETH ≈ 0.03202
```

### Metals

If:

```text
XAU 1 OZ = 3400 USD
XAG 1 OZ = 40 USD
```

fresh state is:

```text
XAU 1 OZ = 1
XAG 1 OZ ≈ 0.011765
```

These values are illustrative only; live/cache data remains authoritative.

## 27. Final Decisions

| Area | Decision |
|---|---|
| Canonical documentation | This file |
| Forex default anchor | USD = 1 |
| Crypto default anchor | BTC = 1 |
| Metals default anchor | XAU 1 OZ = 1 |
| Anchor scope | Independent per tab |
| User edit | Edited asset becomes tab anchor |
| Active anchors | One per editable tab |
| Anchor value | Exactly the user-entered value |
| Recalculation source | Immutable normalized market snapshot |
| Cascading edits | Never allowed |
| Forex | 10 default currencies, add/remove supported |
| Crypto | All available supported assets; no artificial Top-10 restriction |
| EQ | Display only |
| EQ order | US first, then major global markets |
| Market prices | Never fabricated |
| Provider logic | Service/adapter layer only |
| Cache | Existing persistence architecture reused |
| Offline | Cached data when valid |
| Live indicator | Dot only; no visible LIVE text |
| Refresh | Updates market snapshot and derived display values |
| Full reset | Restores default anchors |
| Secrets | Never committed or stored in application state |

## 28. Guiding Principle

**Market data determines relationships. The user-selected anchor determines the displayed scale.**

The core invariant is:

```text
             USER SELECTS ANCHOR
                     ↓
             anchor value is fixed
                     ↓
        immutable market snapshot
                     ↓
       ratio against selected anchor
                     ↓
          all other rows recompute
```

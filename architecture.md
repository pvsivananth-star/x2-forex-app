X2 Forex App — Architecture V2
1. Purpose

X2 is a mobile market-rate application designed to provide a simple, fast and reliable view of major financial markets.

The application is organized into separate market categories:

Forex
Crypto
Metals
EQ — Equity Markets
Charts
Portfolio

The application should prioritize:

Reliable market data
Simple presentation
Minimal user interaction
Fast loading
Offline resilience
Consistent UI
Minimal API usage
Clear separation between market categories
No unnecessary configuration or editing interfaces
2. Core Architecture Principles
2.1 Repository Is the Source of Truth

The existing repository structure, dependencies, APIs, configuration and established behavior must be inspected before implementing changes.

Do not introduce a parallel architecture when an existing service, component or utility already provides the required functionality.

2.2 Market Categories Are Independent

Each market category has its own data requirements and presentation rules.

X2 App
│
├── Forex
│   └── Currency pairs / calculator
│
├── Crypto
│   └── Cryptocurrency market
│
├── Metals
│   └── Precious metals
│
├── EQ
│   └── Global equity indices
│
├── Charts
│   └── Market charts
│
└── Portfolio
    └── Portfolio tracking

Market-specific logic should not be unnecessarily coupled.

3. Navigation

The primary bottom navigation should contain:

Forex | Crypto | Metals | EQ | Charts | Portfolio
3.1 Forex

The existing Forex/Favorites experience remains the primary currency-rate interface.

3.2 Crypto

Cryptocurrency market display.

3.3 Metals

Precious-metal market display.

3.4 EQ

EQ replaces the previous Index page.

EQ means Equity Markets.

It is not an editable index calculator.

3.5 Charts

Market charting functionality.

3.6 Portfolio

Portfolio functionality.

4. Header Architecture

All primary market screens should use the common header component.

The header provides:

Hamburger/menu access
Market connection status
Refresh action where applicable
4.1 Live Status Indicator

The connection status should use a small circular indicator.

●

Green:

Connected / Live

Red:

Offline / unavailable

The UI should not display the word LIVE beside the indicator.

The indicator should retain an accessibility label/tooltip describing its state.

5. Forex Architecture
5.1 Purpose

Forex remains the primary currency conversion and exchange-rate experience.

The Forex screen supports:

Currency rates
Currency selection
Cross-rate calculation
User-added currencies
User-removed currencies
Editable amount/rate behavior
USD-based underlying market rates
5.2 Default Currency Set

Forex starts with the configured default currency list.

The existing requirement is:

FX 10 default, plus or removed by users.

Therefore:

Start with the default 10 currencies.
Users may add currencies.
Users may remove currencies.
User customization must not alter the underlying market-rate source.
6. Forex Editing Model

Only one currency may be actively edited at a time.

There must be a clear distinction between:

Market/API rates
Displayed values
User-entered value
6.1 Immutable Market Snapshot

When market data is received, retain the original rates:

marketRates

These rates are the source of truth for recalculation.

User editing must never overwrite the original API snapshot.

6.2 Editing USD

Example:

USD = 1
EUR = 0.92
GBP = 0.79
INR = 83.50

If the user edits USD:

USD = 2

all other displayed values are recalculated against the unchanged market snapshot.

6.3 Switching Edited Currency

If the user changes from:

USD → EUR

the USD editing state must be cleared.

If EUR is then entered as:

EUR = 2

EUR becomes the sole active edited currency.

All other values are recalculated from the original market snapshot.

6.4 No Cascading Edits

User edits must never become the new market-rate baseline.

Incorrect:

API rates
   ↓
USD edited
   ↓
modified rates become baseline
   ↓
EUR edited using modified rates

Correct:

                 ┌── USD edited
API snapshot ────┼── EUR edited
                 ├── GBP edited
                 └── INR edited

Every calculation references the original market snapshot.

7. Forex Calculation

Rates are normalized against USD.

Example:

USD = 1.0
EUR = 0.92
INR = 83.50

Cross-rate calculation:

convertedValue =
    amount / fromRate * toRate

The existing cross-rate calculation utility should remain the central calculation implementation rather than duplicating the formula across screens.

8. Crypto Architecture

Crypto is a market display, not a currency calculator.

8.1 Data

Crypto should bring all available cryptocurrencies returned by the configured data provider, subject to provider/API limitations.

Do not artificially restrict the display to only the current top 10 list.

The previous "Top 10 Market Cap Cryptocurrencies" limitation is therefore removed from the V2 architecture.

The existing implementation currently describes the screen as Top 10 and consumes fetchCryptoRates().

8.2 Base Currency

Crypto prices are displayed against USD:

BTC/USD
ETH/USD
SOL/USD
...

USD is the fixed quote currency.

8.3 Default Selection

The first/default cryptocurrency should be:

BTC/USD

where applicable to the returned market data.

8.4 Crypto Editing

Crypto should follow the finalized single-active-anchor editing behavior where applicable.

The underlying market snapshot must remain immutable.

9. Metals Architecture

Metals are presented as a dedicated market category.

Primary metals include:

Gold
Silver
Platinum
Palladium

where supported by the selected market-data provider.

The existing implementation currently derives Gold/XAU pricing from the crypto/rates API path.

V2 should keep the market-data abstraction centralized so the UI does not depend on an inappropriate provider-specific implementation.

10. EQ — Equity Markets
10.1 Purpose

The previous Index page is replaced by EQ.

EQ represents major equity-market indices.

The concept is similar to the global equity/stock-index presentation used by Trading Economics.

Reference:

Trading Economics — Global Stock Markets

10.2 EQ Is Display Only

EQ does not provide editing functionality.

There is:

No editable rate field
No add/remove market control
No calculator
No user-customized index ordering

The page is intended for market observation.

11. EQ Ordering

The ordering is important.

11.1 United States First

US indices must appear first.

Recommended order:

United States
├── S&P 500
├── Nasdaq 100
├── Dow Jones
└── Russell 2000

The exact instruments should follow whatever symbols/data are supported by the configured provider.

11.2 Other Major Markets

After the US, display major global markets.

Suggested structure:

United Kingdom
    FTSE 100

Germany
    DAX

France
    CAC 40

Japan
    Nikkei 225

Hong Kong
    Hang Seng

China
    Shanghai Composite

India
    Sensex
    Nifty 50

South Korea
    KOSPI

Australia
    ASX 200

Canada
    S&P/TSX Composite

Brazil
    Bovespa

The exact list should be driven by available market-data symbols rather than hardcoded assumptions about provider availability.

12. Existing Country Index Configuration

The current country-index concept should be retained.

Do not create an independent duplicate configuration system.

Instead:

Existing country index configuration
              ↓
          EQ adapter
              ↓
      US-first ordering
              ↓
         EQ presentation

This preserves existing data definitions while changing the user-facing organization.

13. EQ Data Model

A normalized equity-index model should conceptually contain:

interface EquityIndex {
    id: string;
    symbol: string;
    name: string;
    country: string;
    value: number;
    change?: number;
    changePercent?: number;
    timestamp?: number;
}

Provider-specific response structures should be converted into this model before reaching the UI.

14. Market Data Architecture

Market data should flow through a centralized API/service layer.

External Provider
       ↓
Provider/API Adapter
       ↓
Normalized Market Data
       ↓
Cache
       ↓
Market Screens

Screens should not directly implement provider-specific HTTP logic.

15. API Separation

Conceptually:

ratesApi
│
├── Forex rates
├── Crypto rates
├── Metals rates
└── Equity/index rates

If the current provider exposes multiple categories through one endpoint, the application may continue using that provider.

However, provider-specific details should remain inside the API/service layer.

16. Caching

Market data should support offline resilience.

The current storage service already provides:

RATES_CACHE

and stores:

timestamp
rates

using MMKV when available, with an in-memory fallback.

V2 should extend this architecture rather than introduce another unrelated caching mechanism.

16.1 Cache Strategy
API request
    ↓
Success?
 ┌──┴───┐
Yes     No
 ↓       ↓
Update   Use cached
cache    market data

When cached data is displayed, the UI should indicate the offline/unavailable state through the common status indicator.

17. Refresh

Screens that use live market data may expose a refresh action.

Refresh should:

Request current data.
Validate the response.
Update the market snapshot.
Update the cache.
Refresh the UI.
Update connection status.

A failed refresh must not destroy valid cached data.

18. Theme Architecture

The application uses a centralized theme context.

The current ThemeContext provides:

mode
setMode
precision
setPrecision
colors
isDark

and centralized semantic colors including:

background
card
cardBorder
textPrimary
textSecondary
textMuted
accent
green
red
inputBg

All new screens should use the theme system rather than introducing independent hardcoded themes.

19. Precision

Number precision is centrally controlled through the theme context:

precision

Market screens should respect the configured precision where appropriate.

Provider-specific precision requirements may override the generic display precision when necessary for market accuracy.

20. Charts

Charts remain a separate analytical experience.

Charts may support:

Market selection
Price history
Volume
50 DMA
200 DMA
Crosshair
Market-specific instruments

The existing chart implementation contains these concepts and should be evolved rather than replaced unnecessarily.

21. Portfolio

Portfolio remains a separate feature.

It should not be coupled to Forex, Crypto, Metals or EQ display logic.

The current implementation identifies Portfolio as a future/under-construction feature.

Future portfolio functionality can consume normalized market data without changing the market-screen architecture.

22. Component Architecture

Shared UI components should remain reusable.

components/
│
├── Header
├── BurgerMenu
├── MarketCard
├── MarketStatus
└── ...

Screens should primarily handle:

Screen-specific state
Data selection
Presentation composition

Reusable visual behavior belongs in shared components.

23. Screen Architecture

Conceptually:

screens/
│
├── FavoritesScreen.tsx
│   └── Forex
│
├── CryptoScreen.tsx
│   └── Crypto
│
├── MetalsScreen.tsx
│   └── Metals
│
├── EquityScreen.tsx
│   └── EQ
│
├── ChartsScreen.tsx
│   └── Charts
│
└── PortfolioScreen.tsx
    └── Portfolio

The exact filenames may follow the existing repository conventions.

24. Navigation Architecture

The navigator should map user-facing names directly to the market categories:

Forex     → Forex screen
Crypto    → Crypto screen
Metals    → Metals screen
EQ        → Equity screen
Charts    → Charts screen
Portfolio  → Portfolio screen

The current navigator already centralizes bottom-tab registration.

V2 should modify that existing navigation rather than introduce another navigation layer.

25. User Customization Rules

Customization is permitted only where explicitly defined.

Forex
Add currency     YES
Remove currency  YES
Reorder          existing behavior
Edit value       YES
Crypto
Market display   YES
All available    YES
Rate editing     only where defined by the finalized interaction model
Metals
Market display   YES
Editing          NO
EQ
Market display   YES
Editing          NO
Add/remove       NO
Charts
Instrument selection YES
Chart controls       YES
Portfolio
Portfolio-specific functionality
26. No Edit UI on EQ

This is an explicit requirement.

The EQ page must not contain:

Edit
+
Add
-
Delete
Customize

for indices.

The user simply views the market.

27. Market Ordering Rules

Ordering should be deterministic.

For EQ:

1. United States
2. United Kingdom
3. Germany
4. France
5. Japan
6. Hong Kong
7. China
8. India
9. South Korea
10. Australia
11. Canada
12. Brazil
...

Within the United States:

S&P 500
Nasdaq 100
Dow Jones
Russell 2000

If a configured instrument is unavailable from the provider, it should be omitted rather than displaying fabricated data.

28. Data Integrity

The application must never fabricate market prices.

If data is unavailable:

No valid market data
        ↓
Do not invent value
        ↓
Use valid cache if available
        ↓
Otherwise show unavailable state
29. Provider Independence

UI components must not depend on a specific market-data provider.

The architecture should support:

Provider A
Provider B
Provider C

through an adapter/normalization layer.

Conceptually:

Provider
   ↓
Adapter
   ↓
Normalized Market Data
   ↓
Application

This allows providers to be changed without rewriting market screens.

30. Error Handling

API failures should be handled at the service boundary.

Screens should receive a predictable result:

{
    data,
    isOffline,
    error?
}

The existing Crypto implementation already follows a similar pattern by consuming res.data and res.isOffline.

31. Performance Principles

Prioritize:

Minimal API calls
Reuse of fetched data
Caching
Avoiding unnecessary re-renders
Shared normalized market data
Efficient list rendering
Avoiding duplicate provider requests

Do not make an API request simply because multiple screens need the same underlying market information.

32. API Call Strategy

Where possible:

One provider request
       ↓
Normalize
       ↓
Cache
       ↓
Forex / Crypto / Metals / EQ consumers

rather than:

Forex → API
Crypto → API
Metals → API
EQ → API

when the provider can supply the necessary information in a single request.

33. Offline Strategy

The application should remain useful when connectivity is temporarily unavailable.

LIVE
 ↓
API unavailable
 ↓
Cached data
 ↓
OFFLINE indicator

Cached values must retain their timestamp so the application can distinguish current data from stale data.

34. Accessibility

Interactive elements must have meaningful accessibility labels.

Examples:

Refresh market data
Open menu
Select cryptocurrency
Select chart
Live market connection
Offline market connection

The small live-status dot must not rely exclusively on color to communicate its semantic state to assistive technologies.

35. Visual Design

The application should maintain a consistent financial-market UI:

Compact market cards
Clear instrument names
Prominent prices
Secondary percentage changes
Green for positive movement
Red for negative movement
Consistent spacing
Consistent typography
Theme-aware colors

Do not introduce different visual systems for individual market categories without a functional reason.

36. Implementation Priority

Implementation should proceed in this order:

Phase 1 — Navigation
Index → EQ

Add the EQ tab/screen while preserving the existing navigation architecture.

Phase 2 — EQ Data

Implement normalized equity-index data.

Phase 3 — EQ Ordering

Apply:

US first
↓
other major markets
Phase 4 — EQ UI

Create the display-only equity market cards.

Phase 5 — Forex Editing

Finalize the immutable market-snapshot/single-active-edit behavior.

Phase 6 — Crypto

Remove the artificial Top-10 limitation and consume all available supported crypto market data.

Phase 7 — Consistency

Apply the common:

Header
Status indicator
Theme
Refresh
Error handling
Cache behavior

across all market screens.

37. Explicit V2 Decisions

The following decisions are final:

Area	V2 Decision
Index page	Replaced by EQ
EQ meaning	Equity Markets
EQ editing	None
EQ ordering	US first
US indices	S&P 500, Nasdaq 100, Dow Jones, Russell 2000
Other markets	Major global equity indices
Existing country indices	Retain/reuse
Forex defaults	10 default currencies
Forex customization	Add/remove supported
Forex editing	One active edited currency
Forex baseline	Immutable API snapshot
Crypto	Bring all available crypto
Crypto base	USD
Crypto default	BTC where available
Metals	Separate market category
Charts	Separate analytical category
Portfolio	Separate portfolio category
Live status	Dot only
API architecture	Centralized/provider-agnostic
Cache	Reuse existing cache architecture
Offline	Cached data + status indicator
GitHub	Read-only; never modify
38. Target Architecture
                         X2 APP
                           │
             ┌─────────────┴─────────────┐
             │                           │
        Navigation                   Shared UI
             │                           │
   ┌─────────┼─────────┬─────────┐       ├── Header
   │         │         │         │       ├── Theme
  Forex    Crypto    Metals      EQ      ├── Status
   │         │         │         │       └── Refresh
   │         │         │         │
   └─────────┴─────────┴─────────┘
             │
       Market Data Layer
             │
     ┌───────┴────────┐
     │                │
 Provider Adapters   Cache
     │                │
     └───────┬────────┘
             │
      Normalized Data
             │
   ┌─────────┼─────────────┐
   │         │             │
 Forex    Crypto      Metals / EQ
   │         │             │
   └─────────┴─────────────┘
             │
        Charts / Portfolio
39. Guiding Principle

X2 should be a market-information application first, not a configuration application.

Users should open the app and immediately see:

Forex
Crypto
Metals
EQ

with reliable market information.

Customization should exist only where it provides genuine value, while display-only market categories such as EQ remain simple, fast and predictable.

# App Requirements & Functional Specification

## 1. Executive Summary & Architecture Paradigm
**x2-forex-app** is a zero-backend, monolithic mobile application built with **React Native** and **Expo**. It provides live and indicative market tracking across Foreign Exchange (Forex), Cryptocurrencies, and Precious Metals/Commodities.

### Core Architectural Guarantees:
* **Zero Backend & No API Keys:** The app executes 100% on-device. No middleware servers or user-managed API keys are required.
* **Keyless Public Streaming & Endpoints:** Data is acquired through keyless public REST endpoints and open WebSockets.
* **1-Hour Indicative Sync:** High-frequency updates are balanced with a default 1-hour periodic tick (or manual user trigger) to prevent client IP rate-limiting.
* **Offline-First Persistence:** Every successful network fetch or tick instantly caches to **MMKV** storage.

---

## 2. Global Header Specifications
Every primary tab (**FX**, **Crypto**, **Metals**) shares a unified, high-density top header:

* **Left Controls:**
  * Hamburger menu button (`☰`) triggering the navigation drawer (Settings, Watchlist Management, Theme).
  * **X2** brand logo.
* **Right Controls:**
  * **Tenor Selector:** Dropdown menu for lookback windows (`Spot`, `1D`, `1W`, `1Y`).
  * **% Change & Connection Badge:** Displays 24h percentage movement paired with a status dot (`Live` green indicator vs. `Offline` amber/grey badge).
  * **Refresh Countdown & Force Sync:** Live countdown timer showing time until next 1-hour sync tick, alongside a manual force-refresh icon button.

---

## 3. Core Features & Screen Specifications

### 3.1 Market Watchlists & Drag-and-Drop Management
* **Default Initial Watchlists:**
  * **FX Tab:** Major pairs relative to USD (`EUR/USD`, `GBP/USD`, `USD/JPY`, `USD/INR`, `AUD/USD`, `USD/CAD`, `USD/CHF`).
  * **Crypto Tab:** Top 10 assets by volume (`BTC`, `ETH`, `USDT`, `SOL`, `BNB`, `XRP`, `ADA`, `DOGE`, `AVAX`, `USDC`).
  * **Metals Tab:** Top 10 volume pairs/units (Gold Spot 1oz, Silver Spot 1oz, Gold Bar 100g, Silver Bar 1kg, Platinum 1oz, Palladium 1oz, Gold Kilobar 1kg, Rhodium 1oz, Silver Bar 100oz, Copper Futures 1lb).
* **User Customization:**
  * **Reorder:** Drag-and-drop handles (`⋮⋮`) for long-press sorting.
  * **Add/Remove:** Add pairs via catalog modal or delete rows via edit/swipe actions.
  * **Local Persistence:** Watchlist states are saved locally in MMKV keys (`watchlist_fx`, `watchlist_crypto`, `watchlist_metals`).

### 3.2 Editable Rate Inputs & Real-Time Matrix Calculations
* **Editable Fields:** Every rate cell features an interactive `TextInput`.
* **Input Lock:** Typing into a row pauses background tick updates for that specific asset so user entry isn't overwritten.
* **Cascading Matrix Engine:** Modifying a rate in any row recalculates the implicit USD base benchmark ($USD_{\text{base}}$) and updates all secondary pair calculations across the active tab in real time.
* **Resync:** Tapping force-refresh or pulling to refresh clears manual overrides and re-subscribes to stream rates.

---

## 4. Keyless Public Rate Providers & Streaming Infrastructure

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Public Keyless Endpoint Sources                      │
└──────┬──────────────────────────────────┬───────────────────────┬──────┘
       │                                  │                       │
       ▼                                  ▼                       ▼
┌────────────────────────┐      ┌────────────────────┐  ┌──────────────────┐
│      Forex Feed        │      │    Crypto Feed     │  │   Metals Feed    │
│  Frankfurter / ER-API  │      │  CoinCap WebSocket │  │  Yahoo Finance   │
│ (Hourly Keyless REST)  │      │  (Public Keyless)  │  │   (Quote API)    │
└──────┬─────────────────┘      └─────────┬──────────┘  └─────────┬────────┘
       │                                  │                       │
       └────────────────────────┬─────────┴───────────────────────┘
                                ▼
                 ┌──────────────────────────────┐
                 │ Local Unit Calculation Engine │
                 │  (Troy Oz -> Grams/Kilobars) │
                 └──────────────┬───────────────┘
                                ▼
                 ┌──────────────────────────────┐
                 │   MMKV Caching & State Layer │
                 └──────────────────────────────┘

# satuchain-api

Official JavaScript/TypeScript SDK for the **SATUCHAIN Developer API** — live forex rates, crypto prices, commodity data, and crude oil prices.

[![npm version](https://img.shields.io/npm/v/satuchain-api.svg)](https://www.npmjs.com/package/satuchain-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Requirements

- **≥ 10,000 STU** tokens on BNB Chain to generate an API key (Basic tier — 60 req/min)
- **≥ 1,000,000 STU** tokens for Pro tier (300 req/min)
- Get your key at [dev.satuchain.com](https://dev.satuchain.com)

> **Note:** Your key tier is re-validated every 15 minutes. If your STU balance drops below the minimum, the key is automatically deactivated.

## Installation

```bash
npm install satuchain-api
# or
yarn add satuchain-api
# or
pnpm add satuchain-api
```

## Quick Start

```typescript
import { SatuChainAPI } from "satuchain-api";

const api = new SatuChainAPI("sk_live_YOUR_KEY");

const data = await api.getCommodities();

// Tier info
console.log(data.tier);              // "basic" or "pro"

// Forex — units per 1 USD
console.log(data.forex.IDR.value);   // e.g. 16250
console.log(data.forex.MYR.value);   // e.g. 4.71
console.log(data.forex.EUR.value);   // e.g. 0.9251

// Crypto — price in USD
console.log(data.crypto.BTC.value);  // e.g. 67420.50
console.log(data.crypto.ETH.value);  // e.g. 3520.10
console.log(data.crypto.BNB.value);  // e.g. 580.10
console.log(data.crypto.SOL.value);  // e.g. 148.40
console.log(data.crypto.ARB.value);  // e.g. 0.91
console.log(data.crypto.STU.value);  // e.g. 0.00182

// Metals
console.log(data.commodities.XAU.value);          // Gold   e.g. 2680.50 (USD/troy oz)
console.log(data.commodities.XAU.changePercent);  // e.g. -0.42 (% from prev close)
console.log(data.commodities.XAG.value);          // Silver e.g. 31.40 (USD/troy oz)
console.log(data.commodities.COPPER.value);       // Copper e.g. 4.20 (USD/lb)

// Crude Oil
console.log(data.commodities.WTI.value);          // WTI Brent  e.g. 70.25 (USD/barrel)
console.log(data.commodities.BRENT.value);        // Brent      e.g. 74.10 (USD/barrel)
```

## Constructor

```typescript
// Simple — just pass the key
const api = new SatuChainAPI("sk_live_...");

// Full options
const api = new SatuChainAPI({
  apiKey: "sk_live_...",
  baseUrl: "https://dev.satuchain.com", // optional, default
  timeout: 10000,                        // optional, ms
});
```

## Methods

### `getCommodities(opts?)`

Fetches all available data in a single request.

```typescript
const data = await api.getCommodities();
// data.tier         — "basic" | "pro"
// data.crypto       — BTC, ETH, BNB, SOL, ARB, STU
// data.forex        — CNY, EUR, IDR, JPY, MYR, NGN, SGD, VND
// data.commodities  — XAU, XAG, COPPER, WTI, BRENT
```

### `getForex(opts?)`

Returns only forex rates.

```typescript
const forex = await api.getForex();
console.log(forex.IDR.value); // IDR per 1 USD
```

### `getCrypto(opts?)`

Returns only crypto prices.

```typescript
const crypto = await api.getCrypto();
console.log(crypto.ETH.value); // ETH price in USD
```

### `getCommodityPrices(opts?)`

Returns metals and crude oil prices.

```typescript
const prices = await api.getCommodityPrices();
console.log(prices.WTI.value);   // WTI crude oil in USD/barrel
console.log(prices.BRENT.value); // Brent crude oil in USD/barrel
console.log(prices.XAU.value);   // Gold in USD/troy oz
```

## Rate Limits & Tiers

| Tier  | STU Required  | Rate Limit  |
|-------|--------------|-------------|
| Basic | ≥ 10,000 STU | 60 req/min  |
| Pro   | ≥ 1,000,000 STU | 300 req/min |

Rate limit headers are available after each request:

```typescript
const data = await api.getCommodities();
console.log(api.rateLimit);
// { limit: 60, remaining: 59, resetAt: 1234567890 }
```

## Error Handling

```typescript
import {
  SatuChainAPI,
  SatuChainAuthError,
  SatuChainRateLimitError,
  SatuChainUpstreamError,
  SatuChainError,
} from "satuchain-api";

try {
  const data = await api.getCommodities();
} catch (err) {
  if (err instanceof SatuChainAuthError) {
    // 401 — invalid key, or 403 — key inactive (STU balance too low)
    console.error("Auth error:", err.message);
  } else if (err instanceof SatuChainRateLimitError) {
    // 429 — rate limit exceeded
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof SatuChainUpstreamError) {
    // 502 — upstream data provider unavailable
    console.error("Upstream error:", err.status);
  } else if (err instanceof SatuChainError) {
    // timeout, network error, etc.
    console.error("SDK error:", err.message);
  }
}
```

## Response Types

Full TypeScript types are included. Import them directly:

```typescript
import type {
  CommoditiesResponse,
  CryptoEntry,
  ForexEntry,
  CommodityEntry,
  RateLimitInfo,
} from "satuchain-api";
```

## License

MIT © [SATU TEAM](https://satuchain.com)

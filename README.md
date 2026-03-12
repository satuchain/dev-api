# satuchain-api

Official JavaScript/TypeScript SDK for the **SATUCHAIN Developer API** — live forex rates, crypto prices, and commodity data.

[![npm version](https://img.shields.io/npm/v/satuchain-api.svg)](https://www.npmjs.com/package/satuchain-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Requirements

- **≥ 10,000 STU** tokens on BNB Chain to generate an API key
- Get your key at [dev.satuchain.com](https://dev.satuchain.com)

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

// Forex — units per 1 USD
console.log(data.forex.IDR.value);   // e.g. 16250
console.log(data.forex.MYR.value);   // e.g. 4.71
console.log(data.forex.EUR.value);   // e.g. 0.9251

// Crypto — price in USD
console.log(data.crypto.BTC.value);  // e.g. 67420.50
console.log(data.crypto.BNB.value);  // e.g. 580.10
console.log(data.crypto.STU.value);  // e.g. 0.00182

// Commodities
console.log(data.commodities.XAU.value);          // Gold  e.g. 2680.50 (USD/troy oz)
console.log(data.commodities.XAU.changePercent);  // e.g. -0.42 (% from prev close)
console.log(data.commodities.XAG.value);          // Silver e.g. 31.40 (USD/troy oz)
console.log(data.commodities.COPPER.value);       // Copper e.g. 4.20 (USD/lb)
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
// data.crypto   — BTC, BNB, STU
// data.forex    — CNY, EUR, IDR, JPY, MYR, NGN, SGD, VND
// data.commodities — XAU, XAG, COPPER
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
console.log(crypto.BTC.value); // USD
```

### `getMetals(opts?)`

Returns only commodity prices.

```typescript
const metals = await api.getMetals();
console.log(metals.XAU.value);          // USD/troy oz
console.log(metals.XAU.changePercent);  // % change from prev close
```

## Rate Limits

Each API key is limited to **60 requests per minute**. Rate limit info is available after any request:

```typescript
const data = await api.getCommodities();

console.log(api.rateLimit);
// { limit: 60, remaining: 59, resetAt: 1712345678 }
```

On rate limit exceeded, a `SatuChainRateLimitError` is thrown with a `retryAfter` field (seconds):

```typescript
import { SatuChainRateLimitError } from "satuchain-api";

try {
  const data = await api.getCommodities();
} catch (err) {
  if (err instanceof SatuChainRateLimitError) {
    console.log(`Retry after ${err.retryAfter}s`);
  }
}
```

## Error Handling

```typescript
import {
  SatuChainAuthError,
  SatuChainRateLimitError,
  SatuChainUpstreamError,
  SatuChainError,
} from "satuchain-api";

try {
  const data = await api.getCommodities();
} catch (err) {
  if (err instanceof SatuChainAuthError) {
    // 401 — invalid or revoked API key
  } else if (err instanceof SatuChainRateLimitError) {
    // 429 — slow down, check err.retryAfter
  } else if (err instanceof SatuChainUpstreamError) {
    // 502 — upstream data source unavailable
  } else if (err instanceof SatuChainError) {
    // network timeout or other SDK error
  }
}
```

## Request Cancellation

```typescript
const controller = new AbortController();

setTimeout(() => controller.abort(), 3000);

const data = await api.getCommodities({ signal: controller.signal });
```

## CommonJS

```javascript
const { SatuChainAPI } = require("satuchain-api");

const api = new SatuChainAPI("sk_live_YOUR_KEY");
api.getCommodities().then((data) => {
  console.log(data.forex.IDR.value);
});
```

## Response Shape

```typescript
{
  ok: true,
  base: "USD",
  updatedAtUnix: 1712345600,      // forex update time
  nextUpdateUnix: 1712349200,
  crypto: {
    BTC:  { name: "Bitcoin",    value: 67420.50 },
    BNB:  { name: "BNB",        value: 580.10   },
    STU:  { name: "SATU Token", value: 0.00182  }
  },
  forex: {
    CNY: { name: "Chinese Yuan",       value: 7.2412  },
    EUR: { name: "Euro",               value: 0.9251  },
    IDR: { name: "Indonesian Rupiah",  value: 16250   },
    JPY: { name: "Japanese Yen",       value: 151.82  },
    MYR: { name: "Malaysian Ringgit",  value: 4.7120  },
    NGN: { name: "Nigerian Naira",     value: 1580    },
    SGD: { name: "Singapore Dollar",   value: 1.3510  },
    VND: { name: "Vietnamese Dong",    value: 25100   }
  },
  commodities: {
    XAU:    { name: "Gold",   value: 2680.50, changePercent: -0.42, unit: "USD/troy oz" },
    XAG:    { name: "Silver", value: 31.40,   changePercent:  0.81, unit: "USD/troy oz" },
    COPPER: { name: "Copper", value: 4.20,    changePercent: -0.15, unit: "USD/lb"      }
  }
}
```

## Links

- **API Portal**: [dev.satuchain.com](https://dev.satuchain.com)
- **SATUCHAIN**: [satuchain.com](https://satuchain.com)
- **X (Twitter)**: [@SatuChain](https://x.com/SatuChain)
- **Telegram**: [t.me/satuchain](https://t.me/satuchain)

## License

MIT — see [LICENSE](LICENSE)

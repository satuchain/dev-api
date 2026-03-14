// ─── Response Types ──────────────────────────────────────────────────────────

export interface ForexEntry {
  name: string;
  /** Units of this currency per 1 USD */
  value: number | null;
  /** Icon URL — proxied through the SATUCHAIN API, publicly accessible */
  icon: string;
}

export interface CryptoEntry {
  name: string;
  /** Price in USD */
  value: number | null;
  /** 24-hour price change in percent (positive = up, negative = down) */
  change24h: number | null;
  /** Icon URL — proxied through the SATUCHAIN API, publicly accessible */
  icon: string;
}

export interface CommodityEntry {
  name: string;
  /** Price in USD per unit */
  value: number | null;
  /** Percentage change from previous close (positive = up, negative = down) */
  changePercent?: number | null;
  /** Unit description e.g. "USD/troy oz", "USD/barrel" */
  unit?: string;
  note?: string;
  /** Icon URL — proxied through the SATUCHAIN API, publicly accessible */
  icon: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp
}

export interface CommoditiesResponse {
  ok: true;
  /** Your API key tier: "basic" (60 req/min) or "pro" (300 req/min) */
  tier: "basic" | "pro";
  base: "USD";
  updatedAtUnix: number | null;
  nextUpdateUnix: number | null;
  crypto: {
    BTC: CryptoEntry;
    ETH: CryptoEntry;
    BNB: CryptoEntry;
    SOL: CryptoEntry;
    XRP: CryptoEntry;
    TRX: CryptoEntry;
    DOGE: CryptoEntry;
    HYPE: CryptoEntry;
    ADA: CryptoEntry;
    TON: CryptoEntry;
    ARB: CryptoEntry;
    STU: CryptoEntry;
  };
  forex: {
    CNY: ForexEntry;
    EUR: ForexEntry;
    IDR: ForexEntry;
    JPY: ForexEntry;
    MYR: ForexEntry;
    NGN: ForexEntry;
    SGD: ForexEntry;
    VND: ForexEntry;
    [key: string]: ForexEntry;
  };
  commodities: {
    /** Gold — USD/troy oz */
    XAU: CommodityEntry;
    /** Silver — USD/troy oz */
    XAG: CommodityEntry;
    /** Copper — USD/lb */
    COPPER: CommodityEntry;
    /** WTI Crude Oil — USD/barrel */
    WTI: CommodityEntry;
    /** Brent Crude Oil — USD/barrel */
    BRENT: CommodityEntry;
    /** Coal (Rotterdam) — USD/metric ton */
    COAL: CommodityEntry;
    /** Nickel (LME) — USD/metric ton */
    NICKEL: CommodityEntry;
  };
}

export interface TickerResponse {
  ok: true;
  symbol: string;
  name: string;
  type: "forex" | "crypto" | "commodity";
  /** Price in USD */
  value: number | null;
  /** Price in IDR */
  value_idr: number | null;
  /** Percentage change (24h for crypto, previous close for commodities) */
  change_percent: number | null;
  /** Unit description e.g. "USD", "USD/troy oz", "USD/barrel" */
  unit: string;
  updatedAtUnix: number | null;
}

export interface ConvertResponse {
  ok: true;
  from: string;
  to: string;
  amount: number;
  /** Converted amount */
  result: number;
  /** 1 unit of `from` expressed in `to` */
  rate: number;
  updatedAtUnix: number | null;
}

export interface BiRateResponse {
  ok: true;
  /** Numeric rate e.g. 6.00 */
  rate: number;
  /** Formatted rate e.g. "6.00%" */
  rate_percent: string;
  /** Effective since date e.g. "2024-10-17" */
  since: string;
  /** Next BI board meeting date (if available) */
  next_meeting: string | null;
  description: string;
  source: string;
  note: string;
}

export interface ConvertOptions extends RequestOptions {
  from: string;
  to: string;
  amount?: number;
}

// ─── Options ─────────────────────────────────────────────────────────────────

export interface SatuChainAPIOptions {
  /** Your API key — starts with sk_live_ */
  apiKey: string;
  /** Base URL (default: https://dev.satuchain.com) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
}

export interface RequestOptions {
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

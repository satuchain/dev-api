// ─── Response Types ──────────────────────────────────────────────────────────

export interface ForexEntry {
  name: string;
  /** Units of this currency per 1 USD */
  value: number | null;
}

export interface CryptoEntry {
  name: string;
  /** Price in USD */
  value: number | null;
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
  };
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

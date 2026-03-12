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
  /** Price in USD per unit (troy oz for XAU/XAG, lb for COPPER) */
  value: number | null;
  /** Percentage change from previous close (positive = up, negative = down) */
  changePercent?: number | null;
  /** Unit description e.g. "USD/troy oz" */
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
  base: "USD";
  updatedAtUnix: number | null;
  nextUpdateUnix: number | null;
  crypto: {
    BTC: CryptoEntry;
    BNB: CryptoEntry;
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
    XAU: CommodityEntry;
    XAG: CommodityEntry;
    COPPER: CommodityEntry;
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

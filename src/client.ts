import type {
  SatuChainAPIOptions,
  RequestOptions,
  CommoditiesResponse,
  TickerResponse,
  ConvertResponse,
  ConvertOptions,
  BiRateResponse,
  RateLimitInfo,
} from "./types.js";
import {
  SatuChainAuthError,
  SatuChainRateLimitError,
  SatuChainUpstreamError,
  SatuChainError,
} from "./errors.js";

const DEFAULT_BASE_URL = "https://dev.satuchain.com";
const DEFAULT_TIMEOUT = 10_000;

export class SatuChainAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /** Last rate-limit info from the most recent response */
  public rateLimit: RateLimitInfo | null = null;

  constructor(options: SatuChainAPIOptions | string) {
    if (typeof options === "string") {
      this.apiKey = options;
      this.baseUrl = DEFAULT_BASE_URL;
      this.timeout = DEFAULT_TIMEOUT;
    } else {
      this.apiKey = options.apiKey;
      this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
      this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    }

    if (!this.apiKey.startsWith("sk_live_")) {
      throw new SatuChainError("API key must start with sk_live_");
    }
  }

  private async request<T>(
    path: string,
    opts?: RequestOptions
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const signal = opts?.signal
      ? AbortSignal.any
        ? AbortSignal.any([opts.signal, controller.signal])
        : controller.signal
      : controller.signal;

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers: {
          "X-API-Key": this.apiKey,
          "Accept": "application/json",
          "User-Agent": "satuchain-sdk/1.0.4",
        },
        signal,
      });
    } catch (err: any) {
      clearTimeout(timer);
      if (err?.name === "AbortError") {
        throw new SatuChainError(`Request timed out after ${this.timeout}ms`);
      }
      throw new SatuChainError(`Network error: ${err?.message ?? err}`);
    }

    clearTimeout(timer);

    // Parse rate-limit headers
    const rlLimit = parseInt(res.headers.get("x-ratelimit-limit") ?? "");
    const rlRemaining = parseInt(res.headers.get("x-ratelimit-remaining") ?? "");
    const rlReset = parseInt(res.headers.get("x-ratelimit-reset") ?? "");
    if (!isNaN(rlLimit)) {
      this.rateLimit = { limit: rlLimit, remaining: rlRemaining, resetAt: rlReset };
    }

    if (res.status === 401) {
      const body = await res.json().catch(() => ({})) as any;
      throw new SatuChainAuthError(body?.error);
    }

    if (res.status === 403) {
      const body = await res.json().catch(() => ({})) as any;
      throw new SatuChainAuthError(body?.error ?? "API key inactive: insufficient STU balance");
    }

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("retry-after") ?? "60");
      const body = await res.json().catch(() => ({})) as any;
      throw new SatuChainRateLimitError(retryAfter, body?.error);
    }

    if (!res.ok) {
      throw new SatuChainUpstreamError(res.status);
    }

    const json = await res.json() as any;
    if (!json.ok) {
      throw new SatuChainError(json.error ?? "API error");
    }

    return json as T;
  }

  /**
   * Fetch live commodity, forex, and crypto price data in one call.
   *
   * @example
   * const data = await api.getCommodities();
   * console.log(data.forex.IDR.value);           // IDR per 1 USD
   * console.log(data.crypto.BTC.value);          // BTC price in USD
   * console.log(data.commodities.XAU.value);     // Gold USD/troy oz
   * console.log(data.commodities.WTI.value);     // WTI Oil USD/barrel
   * console.log(data.tier);                      // "basic" or "pro"
   */
  async getCommodities(opts?: RequestOptions): Promise<CommoditiesResponse> {
    return this.request<CommoditiesResponse>("/api/commodities", opts);
  }

  /**
   * Get the price of a single symbol (forex, crypto, or commodity).
   * Returns value in USD and IDR, plus change_percent for commodities.
   *
   * @example
   * const btc = await api.getTicker("BTC");
   * console.log(btc.value);          // BTC price in USD
   * console.log(btc.value_idr);      // BTC price in IDR
   *
   * const gold = await api.getTicker("XAU");
   * console.log(gold.change_percent); // % change from previous close
   */
  async getTicker(symbol: string, opts?: RequestOptions): Promise<TickerResponse> {
    return this.request<TickerResponse>(`/api/ticker/${symbol.toUpperCase()}`, opts);
  }

  /**
   * Convert between any two supported symbols (forex, crypto, commodity).
   *
   * @example
   * const result = await api.convert({ from: "BTC", to: "IDR", amount: 0.5 });
   * console.log(result.result);  // IDR amount
   * console.log(result.rate);    // 1 BTC in IDR
   *
   * const myr = await api.convert({ from: "USD", to: "MYR", amount: 100 });
   * console.log(myr.result);     // MYR equivalent of 100 USD
   */
  async convert(options: ConvertOptions): Promise<ConvertResponse> {
    const { from, to, amount = 1, ...reqOpts } = options;
    const params = new URLSearchParams({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: String(amount),
    });
    return this.request<ConvertResponse>(`/api/convert?${params}`, reqOpts);
  }

  /**
   * Get the Bank Indonesia 7-Day Reverse Repo Rate (BI7DRR).
   *
   * @example
   * const bi = await api.getBiRate();
   * console.log(bi.rate_percent);  // e.g. "6.00%"
   * console.log(bi.since);         // effective since date
   */
  async getBiRate(opts?: RequestOptions): Promise<BiRateResponse> {
    return this.request<BiRateResponse>("/api/bi-rate", opts);
  }

  /**
   * Get just the forex rates (subset of getCommodities).
   */
  async getForex(opts?: RequestOptions): Promise<CommoditiesResponse["forex"]> {
    const data = await this.getCommodities(opts);
    return data.forex;
  }

  /**
   * Get just the crypto prices (subset of getCommodities).
   */
  async getCrypto(opts?: RequestOptions): Promise<CommoditiesResponse["crypto"]> {
    const data = await this.getCommodities(opts);
    return data.crypto;
  }

  /**
   * Get just the commodity prices including metals and crude oil.
   */
  async getCommodityPrices(opts?: RequestOptions): Promise<CommoditiesResponse["commodities"]> {
    const data = await this.getCommodities(opts);
    return data.commodities;
  }

  /**
   * @deprecated Use getCommodityPrices() instead.
   */
  async getMetals(opts?: RequestOptions): Promise<CommoditiesResponse["commodities"]> {
    return this.getCommodityPrices(opts);
  }
}

/** Alias for SatuChainAPI */
export const SatuChain = SatuChainAPI;

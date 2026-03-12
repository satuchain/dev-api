import type {
  SatuChainAPIOptions,
  RequestOptions,
  CommoditiesResponse,
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
          "User-Agent": "satuchain-sdk/1.0.1",
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
   * Fetch live commodity, forex, and crypto price data.
   *
   * @example
   * const data = await api.getCommodities();
   * console.log(data.forex.IDR.value);      // IDR per 1 USD
   * console.log(data.crypto.BTC.value);     // BTC price in USD
   * console.log(data.commodities.XAU.value); // Gold price in USD/troy oz
   */
  async getCommodities(opts?: RequestOptions): Promise<CommoditiesResponse> {
    return this.request<CommoditiesResponse>("/api/commodities", opts);
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
   * Get just the commodity prices (subset of getCommodities).
   */
  async getMetals(opts?: RequestOptions): Promise<CommoditiesResponse["commodities"]> {
    const data = await this.getCommodities(opts);
    return data.commodities;
  }
}

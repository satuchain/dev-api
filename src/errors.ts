export class SatuChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SatuChainError";
  }
}

export class SatuChainAuthError extends SatuChainError {
  readonly status = 401;
  constructor(message = "Invalid or missing API key") {
    super(message);
    this.name = "SatuChainAuthError";
  }
}

export class SatuChainRateLimitError extends SatuChainError {
  readonly status = 429;
  readonly retryAfter: number;
  constructor(retryAfter: number, message?: string) {
    super(message ?? `Rate limit exceeded. Retry after ${retryAfter}s`);
    this.name = "SatuChainRateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class SatuChainUpstreamError extends SatuChainError {
  readonly status: number;
  constructor(status: number, message?: string) {
    super(message ?? `Upstream error: ${status}`);
    this.name = "SatuChainUpstreamError";
    this.status = status;
  }
}

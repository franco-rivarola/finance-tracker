type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

export type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

const rateLimitStore = globalThis as typeof globalThis & {
  __serverRateLimitStore?: Map<string, RateLimitEntry>;
};

const getStore = () => {
  if (!rateLimitStore.__serverRateLimitStore) {
    rateLimitStore.__serverRateLimitStore = new Map();
  }

  return rateLimitStore.__serverRateLimitStore;
};

const pruneExpiredEntries = (store: Map<string, RateLimitEntry>, now: number) => {
  for (const [key, value] of store.entries()) {
    if (value.expiresAt <= now) {
      store.delete(key);
    }
  }
};

export const checkRateLimit = ({
  key,
  maxRequests,
  windowMs,
}: {
  key: string;
  maxRequests: number;
  windowMs: number;
}): RateLimitResult => {
  const now = Date.now();
  const store = getStore();
  pruneExpiredEntries(store, now);
  const current = store.get(key);

  if (!current || current.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return {
      limited: false,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
      remaining: Math.max(maxRequests - 1, 0),
    };
  }

  if (current.count >= maxRequests) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(Math.ceil((current.expiresAt - now) / 1000), 1),
      remaining: 0,
    };
  }

  const next = {
    ...current,
    count: current.count + 1,
  };
  store.set(key, next);

  return {
    limited: false,
    retryAfterSeconds: Math.max(Math.ceil((next.expiresAt - now) / 1000), 1),
    remaining: Math.max(maxRequests - next.count, 0),
  };
};

export const hitRateLimit = (args: {
  key: string;
  maxRequests: number;
  windowMs: number;
}) => checkRateLimit(args).limited;

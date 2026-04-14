import type { CurrencyCode } from "@/types/account";

export const BASE_CURRENCY: CurrencyCode = "ARS";

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  ARS: 1,
  USD: 1100,
  EUR: 1250,
};

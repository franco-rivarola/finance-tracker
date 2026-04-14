import { BASE_CURRENCY, EXCHANGE_RATES } from "@/constants/finance";
import { CurrencyCode } from "@/types/account";
import { Transaction } from "@/types/transaction";

export { BASE_CURRENCY, EXCHANGE_RATES };

export const formatMoney = (amount: number, currency: CurrencyCode = BASE_CURRENCY) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(amount);

export const convertCurrency = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
) => {
  const baseAmount = amount * EXCHANGE_RATES[fromCurrency];
  return baseAmount / EXCHANGE_RATES[toCurrency];
};

export const getBaseAmount = (amount: number, currency: CurrencyCode) =>
  amount * EXCHANGE_RATES[currency];

export const getTransactionBaseAmount = (transaction: Transaction) =>
  transaction.baseAmount ?? getBaseAmount(transaction.amount, transaction.currency ?? BASE_CURRENCY);

export const formatExchangeRateLabel = (fromCurrency: CurrencyCode, toCurrency: CurrencyCode) =>
  `1 ${fromCurrency} = ${formatMoney(convertCurrency(1, fromCurrency, toCurrency), toCurrency)}`;

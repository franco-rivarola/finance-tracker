export type AccountType = "cash" | "bank" | "card";
export type CurrencyCode = "ARS" | "USD" | "EUR";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  isSystem?: boolean;
};

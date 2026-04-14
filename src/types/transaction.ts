import { CurrencyCode } from "./account";

export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  isSystem?: boolean;
};

export type Transaction = {
  id: string;
  amount: number;
  currency: CurrencyCode;
  baseAmount: number;
  exchangeRate: number;
  description: string;
  type: TransactionType;
  category: Category;
  accountId: string; // 🔥 NUEVO
  date: string;
};

export type TransactionInput = {
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: string;
  accountId: string; // 🔥 NUEVO
  date: string;
};

export type TransactionType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  amount: number;
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
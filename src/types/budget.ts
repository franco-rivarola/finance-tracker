export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  month: string;
};

export type BudgetAlertLevel = "none" | "50" | "80" | "100" | "exceeded";

import { CurrencyCode } from "./account";

export type SavingGoal = {
  id: string;
  name: string;
  targetAmount: number;
  accountId: string;
  targetDate: string;
  currency: CurrencyCode;
};

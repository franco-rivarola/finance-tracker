import { Account } from "@/types/account";
import { Budget, BudgetAlertLevel } from "@/types/budget";
import { SavingGoal } from "@/types/saving-goal";
import { Transaction } from "@/types/transaction";

export const getBudgetAlertLevel = (spent: number, limit: number): BudgetAlertLevel => {
  if (limit <= 0) return "none";
  const ratio = spent / limit;
  if (ratio > 1) return "exceeded";
  if (ratio >= 1) return "100";
  if (ratio >= 0.8) return "80";
  if (ratio >= 0.5) return "50";
  return "none";
};

export const getBudgetAlertLabel = (level: BudgetAlertLevel) => {
  switch (level) {
    case "50":
      return "50% usado";
    case "80":
      return "80% usado";
    case "100":
      return "Límite alcanzado";
    case "exceeded":
      return "Excedido";
    default:
      return "";
  }
};

export const getBudgetAlertTone = (level: BudgetAlertLevel) => {
  switch (level) {
    case "50":
      return "text-sky-700 bg-sky-100";
    case "80":
      return "text-amber-700 bg-amber-100";
    case "100":
      return "text-orange-700 bg-orange-100";
    case "exceeded":
      return "text-rose-700 bg-rose-100";
    default:
      return "text-zinc-600 bg-zinc-100";
  }
};

export const getSavingGoalProgress = (
  goal: SavingGoal,
  accounts: Account[],
  transactions: Transaction[]
) => {
  const account = accounts.find((item) => item.id === goal.accountId);
  const accountTransactions = transactions.filter((item) => item.accountId === goal.accountId);
  const currentAmount = accountTransactions.reduce((total, item) => {
    return item.type === "income" ? total + item.amount : total - item.amount;
  }, 0);

  const recentMonths = Array.from(
    new Set(
      transactions
        .filter((item) => item.accountId === goal.accountId)
        .map((item) => item.date.slice(0, 7))
    )
  )
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 3);

  const monthlyAverage =
    recentMonths.length === 0
      ? 0
      : recentMonths.reduce((sum, month) => {
          const monthTransactions = accountTransactions.filter((item) => item.date.startsWith(month));
          return (
            sum +
            monthTransactions.reduce(
              (total, item) => total + (item.type === "income" ? item.amount : -item.amount),
              0
            )
          );
        }, 0) / recentMonths.length;

  const remaining = Math.max(goal.targetAmount - currentAmount, 0);
  const estimatedMonths = monthlyAverage > 0 ? Math.ceil(remaining / monthlyAverage) : null;

  return {
    account,
    currentAmount,
    remaining,
    progress: goal.targetAmount > 0 ? Math.min((currentAmount / goal.targetAmount) * 100, 100) : 0,
    estimatedMonths,
  };
};

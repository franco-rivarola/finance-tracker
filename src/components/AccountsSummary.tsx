"use client";

import { useAccounts } from "@/context/AccountsContext";
import { useTransactions } from "@/context/TransactionsContext";
import { Transaction } from "@/types/transaction";
import { formatMoney } from "@/utils/currency";

type Props = {
  transactions: Transaction[];
};

export default function AccountsSummary({ transactions }: Props) {
  const { accounts } = useAccounts();
  const { getAccountBalanceFromList } = useTransactions();

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {accounts.map((acc) => {
        const balance = getAccountBalanceFromList(acc.id, transactions);

        return (
          <div
            key={acc.id}
            className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{acc.name}</p>

            <p className="text-3xl font-bold mt-2 text-black">
              {formatMoney(balance, acc.currency)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

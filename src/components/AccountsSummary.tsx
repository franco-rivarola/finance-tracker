"use client";

import { useAccounts } from "@/context/AccountsContext";
import { useTransactions } from "@/context/TransactionsContext";
import { Transaction } from "@/types/transaction";
import { motion } from "framer-motion";

type Props = {
  transactions: Transaction[];
};

export default function AccountsSummary({ transactions }: Props) {
  const { accounts } = useAccounts();
  const { getAccountBalanceFromList } = useTransactions();

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {accounts.map((acc, i) => {
        const balance = getAccountBalanceFromList(acc.id, transactions);

        return (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{acc.name}</p>

            <p className="text-3xl font-bold mt-2 text-black">
              ${balance.toLocaleString("es-AR")}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
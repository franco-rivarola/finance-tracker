"use client";

import Image from "next/image";
import TT from "@/assets/TT.png";
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

  // Colores tipo gradientes de tarjetas (como Amex, Visa, etc)
  const gradients = [
    "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900",
    "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900",
    "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900",
    "bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900",
    "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900",
  ];

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {accounts.map((acc, idx) => {
        const balance = getAccountBalanceFromList(acc.id, transactions);
        const gradientClass = gradients[idx % gradients.length];

        return (
          <div
            key={acc.id}
            className={`relative h-48 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer overflow-hidden ${gradientClass}`}
          >
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Contenido */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Saldo disponible</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {formatMoney(balance, acc.currency)}
                  </p>
                </div>
                <div className="text-3xl font-bold text-white/30">{acc.currency}</div>
              </div>

              {/* Footer - Nombre de la cuenta */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Cuenta</p>
                  <p className="text-lg font-semibold text-white mt-1">{acc.name}</p>
                </div>
                {/* Logo TT */}
                <div className="w-12 h-12 relative">
                  <Image
                    src={require("../../assets/TT.png")}
                    alt="logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

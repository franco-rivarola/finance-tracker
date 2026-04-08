"use client";

import { CurrencyCode } from "@/types/account";
import { formatMoney } from "@/utils/currency";

type Props = {
  title: string;
  amount: number;
  currency?: CurrencyCode;
};

export default function BalanceCard({ title, amount, currency = "ARS" }: Props) {
  return (
    <div className="bg-white text-black p-5 rounded-2xl">
      <p className="text-sm font-medium text-gray-700">{title}</p>

      <p className="text-3xl font-bold mt-1">
        {formatMoney(amount, currency)}
      </p>
    </div>
  );
}

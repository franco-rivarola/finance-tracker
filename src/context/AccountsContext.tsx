"use client";

import { createContext, useContext } from "react";
import type { Account, AccountType, CurrencyCode } from "@/types/account";

type AccountsContextValue = {
  accounts: Account[];
  addAccount: (
    name: string,
    type: AccountType,
    currency?: CurrencyCode
  ) => Promise<Account | null>;
  updateAccount: (
    id: string,
    name: string,
    currency?: CurrencyCode
  ) => Promise<Account | null>;
  deleteAccount: (id: string) => Promise<boolean>;
};

const AccountsContext = createContext<AccountsContextValue | null>(null);

export const AccountsProvider = ({
  value,
  children,
}: {
  value: AccountsContextValue;
  children: React.ReactNode;
}) => <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) throw new Error("useAccounts debe usarse dentro de AccountsProvider");
  return context;
};

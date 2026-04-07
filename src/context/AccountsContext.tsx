"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Account } from "@/types/account";
import { DEFAULT_ACCOUNTS } from "@/constants/accounts";
import { v4 as uuid } from "uuid";

type AccountsContextType = {
  accounts: Account[];
  addAccount: (name: string, type: Account["type"]) => Account | null;
  deleteAccount: (id: string) => boolean;
};

const AccountsContext = createContext<AccountsContextType | null>(null);
const STORAGE_KEY = "accounts";

const normalizeAccountName = (name: string) =>
  name.replace(/^[^\p{L}\p{N}]+/u, "").trim();

const isValidAccount = (value: unknown): value is Account => {
  if (!value || typeof value !== "object") return false;

  const account = value as Partial<Account>;

  return Boolean(
    account.id &&
      account.name &&
      account.type &&
      ["cash", "bank", "card"].includes(account.type)
  );
};

export const AccountsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ACCOUNTS;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_ACCOUNTS;

    try {
      const parsed = JSON.parse(stored);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(isValidAccount)
      ) {
        return parsed.map((account) => ({
          ...account,
          name: normalizeAccountName(account.name),
        }));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    return DEFAULT_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const addAccount = (name: string, type: Account["type"]) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const exists = accounts.some(
      (account) => account.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      alert("Ya existe una cuenta con ese nombre");
      return null;
    }

    const newAccount: Account = {
      id: uuid(),
      name: normalizeAccountName(trimmedName),
      type,
    };

    setAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  };

  const deleteAccount = (id: string) => {
    const isDefaultAccount = DEFAULT_ACCOUNTS.some((account) => account.id === id);

    if (isDefaultAccount) {
      alert("No podés eliminar una cuenta base");
      return false;
    }

    setAccounts((prev) => prev.filter((account) => account.id !== id));
    return true;
  };

  return (
    <AccountsContext.Provider value={{ accounts, addAccount, deleteAccount }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const ctx = useContext(AccountsContext);
  if (!ctx) throw new Error("useAccounts fuera de provider");
  return ctx;
};

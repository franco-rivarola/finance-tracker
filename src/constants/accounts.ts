import { Account } from "@/types/account";


export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "cash",
    name: "Efectivo",
    type: "cash",
    currency: "ARS",
  },
  {
    id: "bank",
    name: "Banco",
    type: "bank",
    currency: "ARS",
  },
  {
    id: "card",
    name: "Tarjeta",
    type: "card",
    currency: "ARS",
  },
];

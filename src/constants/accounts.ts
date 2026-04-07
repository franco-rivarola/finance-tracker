import { Account } from "@/types/account";


export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "cash",
    name: "Efectivo",
    type: "cash",
  },
  {
    id: "bank",
    name: "Banco",
    type: "bank",
  },
  {
    id: "card",
    name: "Tarjeta",
    type: "card",
  },
];

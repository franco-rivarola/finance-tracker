export type AccountType = "cash" | "bank" | "card";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
};
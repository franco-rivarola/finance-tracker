
export type CategoryType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  isSystem?: boolean;
};

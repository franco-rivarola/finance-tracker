import { Category } from "@/types/transaction";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Comida", type: "expense" },
  { id: "2", name: "Transporte", type: "expense" },
  { id: "3", name: "Sueldo", type: "income" },
  { id: "4", name: "Transferencia", type: "income" },
];
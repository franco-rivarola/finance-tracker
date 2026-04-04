"use client";

import { useRouter, useParams } from "next/navigation";
import { useTransactions } from "@/context/TransactionsContext";
import TransactionForm from "@/components/TransactionForm";
import { useMemo } from "react";
import { TransactionInput } from "@/types/transaction";

export default function EditTransaction() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { updateTransaction, getTransaction } = useTransactions();

  const data = useMemo<TransactionInput | null>(() => {
    const transaction = getTransaction(id);

    if (!transaction) return null;

    // ✅ FIX CLAVE (convertimos a categoryId)
    return {
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type,
      categoryId: transaction.category.id,
      date: transaction.date,
    };
  }, [id, getTransaction]);

  if (!data) {
    return <p className="text-gray-500">Cargando...</p>;
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h1 className="text-xl font-bold mb-4">
        Editar Transacción
      </h1>

      <TransactionForm
        initialData={data}
        submitText="Guardar cambios"
        onSubmit={(formData) => {
          updateTransaction(id, formData);
          router.push("/transactions");
        }}
      />
    </div>
  );
}
"use client";

import { motion, AnimatePresence } from "framer-motion";
import TransactionForm from "./TransactionForm";
import { TransactionInput } from "@/types/transaction";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => Promise<boolean>;
  initialData?: TransactionInput;
  title: string;
};

export default function TransactionModal({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-black shadow-2xl"
          >
            <h2 className="mb-5 text-xl font-bold text-black">
              {title}
            </h2>

            <TransactionForm
              initialData={initialData}
              onSubmit={async (data) => {
                const success = await onSubmit(data);
                if (success) onClose();
              }}
            />

            {/* CANCELAR */}
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl border border-zinc-200 py-3 font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

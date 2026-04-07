"use client";

import { motion, AnimatePresence } from "framer-motion";
import TransactionForm from "./TransactionForm";
import { TransactionInput } from "@/types/transaction";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => boolean;
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
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200"
          >
            <h2 className="text-xl font-bold text-black mb-5">
              {title}
            </h2>

            <TransactionForm
              initialData={initialData}
              onSubmit={(data) => {
                const success = onSubmit(data);
                if (success) onClose();
              }}
            />

            {/* CANCELAR */}
            <button
              onClick={onClose}
              className="w-full mt-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

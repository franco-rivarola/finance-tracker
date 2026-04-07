"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export default function AnimatedCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white text-black p-5 rounded-2xl"
    >
      {children}
    </motion.div>
  );
}
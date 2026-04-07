/* "use client";

import { Transaction } from "@/types/transaction";
import Papa from "papaparse";
import jsPDF from "jspdf";

type Props = {
  transactions: Transaction[];
};

export default function ExportDashboard({ transactions }: Props) {
  const exportCSV = () => {
    const csv = Papa.unparse(
      transactions.map((t) => ({
        ...t,
        category: t.category.name,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard.csv";
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Dashboard Transacciones", 10, 10);
    let y = 20;
    transactions.forEach(t => {
      doc.text(`${t.date} | ${t.type} | ${t.category.name} | $${t.amount}`, 10, y);
      y += 10;
    });
    doc.save("dashboard.pdf");
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCSV}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Exportar CSV
      </button>
      <button
        onClick={exportPDF}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Exportar PDF
      </button>
    </div>
  );
}
 */
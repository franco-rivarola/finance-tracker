import { CategoriesProvider } from "@/context/CategoriesContext";
import "./globals.css";
import { TransactionsProvider } from "@/context/TransactionsContext";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <CategoriesProvider>
          <TransactionsProvider>
            <nav className="bg-white shadow mb-6">
              <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between">
                <h1 className="font-bold text-xl">💸 Finance</h1>

                <div className="flex gap-4">
                  <Link href="/transactions">Transacciones</Link>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/categories">Categorias</Link>
                </div>
              </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4">{children}</main>
          </TransactionsProvider>
        </CategoriesProvider>
      </body>
    </html>
  );
}

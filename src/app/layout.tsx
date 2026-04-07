"use client";

import { CategoriesProvider } from "@/context/CategoriesContext";
import "./globals.css";
import { TransactionsProvider } from "@/context/TransactionsContext";
import { AccountsProvider } from "@/context/AccountsContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import TTLogo from "../../assets/LOGO.png";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/transactions", label: "Movimientos" },
    { href: "/categories", label: "Categorías" },
    { href: "/accounts", label: "Cuentas" },
  ];

  return (
    <html lang="es">
      <body className="bg-[#0D0D0D] text-white min-h-screen">
        <CategoriesProvider>
          <AccountsProvider>
            <TransactionsProvider>
              {/* 🔥 NAVBAR NUEVA */}
              <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0D0D0D]/80 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <Image src={TTLogo} width={120} height={80} alt="Logo" />

                    <div className="hidden items-center gap-6 text-sm font-medium text-zinc-400 md:flex">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="hover:text-white transition"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    <button
                      type="button"
                      aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
                      aria-expanded={isMenuOpen}
                      onClick={() => setIsMenuOpen((open) => !open)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 text-zinc-200 transition hover:border-zinc-500 hover:text-white md:hidden"
                    >
                      <span className="sr-only">
                        {isMenuOpen ? "Cerrar menu" : "Abrir menu"}
                      </span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {isMenuOpen ? (
                          <>
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </>
                        ) : (
                          <>
                            <path d="M4 7h16" />
                            <path d="M4 12h16" />
                            <path d="M4 17h16" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>

                  {isMenuOpen && (
                    <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 md:hidden">
                      <div className="flex flex-col gap-1 text-sm font-medium text-zinc-300">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-xl px-3 py-2 transition hover:bg-zinc-900 hover:text-white"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              <main className="max-w-6xl mx-auto px-6 py-6">
                {children}
              </main>
            </TransactionsProvider>
          </AccountsProvider>
        </CategoriesProvider>
      </body>
    </html>
  );
}

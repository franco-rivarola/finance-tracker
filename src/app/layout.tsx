"use client";

import { CategoriesProvider } from "@/context/CategoriesContext";
import "./globals.css";
import { TransactionsProvider } from "@/context/TransactionsContext";
import { AccountsProvider } from "@/context/AccountsContext";
import { BudgetsProvider } from "@/context/BudgetsContext";
import { SavingGoalsProvider } from "@/context/SavingGoalsContext";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import TTLogo from "../../assets/LOGO.png";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const mainLinks = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/transactions", label: "Movimientos" },
    { href: "/reports", label: "Reportes" },
  ];
  const personalizationLinks = [
    { href: "/categories", label: "Categorías" },
    { href: "/accounts", label: "Cuentas" },
    { href: "/budgets", label: "Presupuestos" },
  ];
  const personalizationActive = personalizationLinks.some((link) =>
    pathname.startsWith(link.href)
  );
  const linkClass = (href: string) =>
    pathname.startsWith(href)
      ? "text-white"
      : "text-zinc-400 transition hover:text-white";
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsPersonalizationOpen(false);
  };

  const personalizationLabel = "Personalización";

  return (
    <html lang="es">
      <body className="bg-[#0D0D0D] text-white min-h-screen">
        <CategoriesProvider>
          <AccountsProvider>
            <BudgetsProvider>
              <SavingGoalsProvider>
                <TransactionsProvider>
                  <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0D0D0D]/80 backdrop-blur">
                  <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                      <Image
                        src={TTLogo}
                        width={120}
                        height={80}
                        alt="Logo"
                        priority
                        loading="eager"
                        style={{ width: "120px", height: "auto" }}
                      />

                      <div className="hidden items-center gap-6 text-sm font-medium md:flex">
                        {mainLinks.slice(0, 2).map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={linkClass(link.href)}
                          >
                            {link.label}
                          </Link>
                        ))}

                        <div
                          className="relative"
                          onMouseEnter={() => setIsPersonalizationOpen(true)}
                          onMouseLeave={() => setIsPersonalizationOpen(false)}
                        >
                          <button
                            type="button"
                            onClick={() => setIsPersonalizationOpen((open) => !open)}
                            className={`flex items-center gap-2 ${
                              personalizationActive
                                ? "text-white"
                                : "text-zinc-400 transition hover:text-white"
                            }`}
                          >
                            {personalizationLabel}
                            <svg
                              className={`h-4 w-4 transition ${
                                isPersonalizationOpen ? "rotate-180" : ""
                              }`}
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          {isPersonalizationOpen && (
                            <div className="absolute left-0 top-full w-56 pt-3">
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl">
                                <div className="flex flex-col gap-1 text-sm font-medium">
                                  {personalizationLinks.map((link) => (
                                    <Link
                                      key={link.href}
                                      href={link.href}
                                      onClick={closeMenus}
                                      className={`rounded-xl px-3 py-2 ${
                                        pathname.startsWith(link.href)
                                          ? "bg-zinc-900 text-white"
                                          : "text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                                      }`}
                                    >
                                      {link.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <Link
                          href={mainLinks[2].href}
                          className={linkClass(mainLinks[2].href)}
                        >
                          {mainLinks[2].label}
                        </Link>
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
                        <div className="flex flex-col gap-1 text-sm font-medium">
                          {mainLinks.slice(0, 2).map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMenus}
                              className={`rounded-xl px-3 py-2 ${
                                pathname.startsWith(link.href)
                                  ? "bg-zinc-900 text-white"
                                  : "text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                              }`}
                            >
                              {link.label}
                            </Link>
                          ))}

                          <div className="mt-2 px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            {personalizationLabel}
                          </div>

                          {personalizationLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMenus}
                              className={`rounded-xl px-3 py-2 ${
                                pathname.startsWith(link.href)
                                  ? "bg-zinc-900 text-white"
                                  : "text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                              }`}
                            >
                              {link.label}
                            </Link>
                          ))}

                          <Link
                            href={mainLinks[2].href}
                            onClick={closeMenus}
                            className={`mt-2 rounded-xl px-3 py-2 ${
                              pathname.startsWith(mainLinks[2].href)
                                ? "bg-zinc-900 text-white"
                                : "text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            {mainLinks[2].label}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </nav>

                  <main className="max-w-6xl mx-auto px-6 py-6">
                    {children}
                  </main>
                </TransactionsProvider>
              </SavingGoalsProvider>
            </BudgetsProvider>
          </AccountsProvider>
        </CategoriesProvider>
      </body>
    </html>
  );
}

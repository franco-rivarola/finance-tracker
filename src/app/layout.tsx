"use client";

import "./globals.css";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AuthGuard from "@/components/AuthGuard";
import { AppDataProvider } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#020617] text-white">
        <AppDataProvider>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </AppDataProvider>
      </body>
    </html>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, signOut, authLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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

  const showNav = session && !pathname.startsWith("/auth");
  const openSignOutModal = () => {
    if (authLoading) return;
    setIsMenuOpen(false);
    setIsPersonalizationOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleSignOut = async () => {
    setIsLogoutModalOpen(false);
    await signOut();
  };

  return (
    <>
      {isLogoutModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-black shadow-2xl">
            <h2 className="text-xl font-semibold text-black">Cerrar sesión</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              ¿Querés cerrar sesión ahora?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="rounded-2xl border border-zinc-200 px-4 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={authLoading}
                className="rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {authLoading ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showNav ? (
        <nav className="sticky top-0 z-50 border-b border-[#2B313A] bg-[#181B20]/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
{/*               <Image
                src={TTLogo}
                width={120}
                height={80}
                alt="Logo"
                priority
                loading="eager"
                style={{ width: "120px", height: "auto" }}
              /> */}

              <div className="hidden items-center gap-6 text-sm font-medium md:flex">
                {mainLinks.slice(0, 2).map((link) => (
                  <Link key={link.href} href={link.href} className={linkClass(link.href)}>
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
                    Personalización
                    <svg
                      className={`h-4 w-4 transition ${isPersonalizationOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {isPersonalizationOpen ? (
                    <div className="absolute left-0 top-full w-56 pt-3">
                      <div className="rounded-2xl border border-[#2B313A] bg-[#181B20] p-2 shadow-2xl">
                        <div className="flex flex-col gap-1 text-sm font-medium">
                          {personalizationLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={closeMenus}
                              className={`rounded-xl px-3 py-2 ${
                                pathname.startsWith(link.href)
                                  ? "bg-[#020617] text-white"
                                  : "text-zinc-300 transition hover:bg-[#020617] hover:text-white"
                              }`}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Link href={mainLinks[2].href} className={linkClass(mainLinks[2].href)}>
                  {mainLinks[2].label}
                </Link>
              </div>

              <div className="hidden md:flex md:flex-1 md:justify-end">
                <button
                  type="button"
                  onClick={openSignOutModal}
                  disabled={authLoading}
                  aria-label="Cerrar sesión"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-zinc-200 transition hover:text-[#FACC15] disabled:opacity-50"
                >
                  <LogoutRoundedIcon fontSize="small" />
                </button>
              </div>

              <button
                type="button"
                aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 text-zinc-200 transition hover:border-zinc-500 hover:text-white md:hidden"
              >
                <span className="sr-only">{isMenuOpen ? "Cerrar menu" : "Abrir menu"}</span>
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

            {isMenuOpen ? (
              <div className="mt-4 rounded-2xl border border-[#2B313A] bg-[#181B20] p-3 md:hidden">
                <div className="flex flex-col gap-1 text-sm font-medium">
                  {mainLinks.slice(0, 2).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className={`rounded-xl px-3 py-2 ${
                        pathname.startsWith(link.href)
                          ? "bg-[#020617] text-white"
                          : "text-zinc-300 transition hover:bg-[#020617] hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="mt-2 px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Personalización
                  </div>

                  {personalizationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className={`rounded-xl px-3 py-2 ${
                        pathname.startsWith(link.href)
                          ? "bg-[#020617] text-white"
                          : "text-zinc-300 transition hover:bg-[#020617] hover:text-white"
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
                        ? "bg-[#020617] text-white"
                        : "text-zinc-300 transition hover:bg-[#020617] hover:text-white"
                    }`}
                  >
                    {mainLinks[2].label}
                  </Link>

                  <button
                    type="button"
                    onClick={openSignOutModal}
                    disabled={authLoading}
                    className="mt-2 rounded-xl px-3 py-2 text-left font-semibold text-rose-400 transition hover:bg-[#020617] disabled:opacity-50"
                  >
                    {authLoading ? "Cerrando..." : "Cerrar sesión"}
                  </button>

                </div>
              </div>
            ) : null}
          </div>
        </nav>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </>
  );
}

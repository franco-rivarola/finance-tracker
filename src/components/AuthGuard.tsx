"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "./AuthForm";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, loading, session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    if (!ready) return;

    if (!session && !isAuthRoute) {
      router.replace("/auth");
      return;
    }

    if (session && isAuthRoute) {
      router.replace("/transactions");
    }
  }, [ready, session, isAuthRoute, router]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-zinc-300">
        Cargando...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
        <div className="w-full max-w-5xl grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FACC15]">
              Finance Tracker
            </p>
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Tus cuentas, movimientos y reportes en un solo lugar.
            </h1>
            <p className="max-w-xl text-base text-zinc-400">
              Iniciá sesión para sincronizar web y mobile con Supabase y mantener tus finanzas guardadas de forma segura.
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  if (isAuthRoute) return null;

  return <>{children}</>;
}

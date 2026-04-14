"use client";

import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

type AuthContextValue = {
  ready: boolean;
  loading: boolean;
  session: Session | null;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({
  value,
  children,
}: {
  value: AuthContextValue;
  children: React.ReactNode;
}) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

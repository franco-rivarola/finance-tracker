"use client";

import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { validatePassword } from "@/utils/auth";
import type { Setter } from "./shared";

const getEmailRedirectUrl = () => {
  const envRedirectUrl = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL?.trim();

  if (envRedirectUrl) {
    return envRedirectUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return undefined;
};

export const bootstrapAuth = async ({
  active,
  setSession,
  setReady,
  setLoading,
}: {
  active: boolean;
  setSession: Setter<Session | null>;
  setReady: Setter<boolean>;
  setLoading: Setter<boolean>;
}) => {
  const { data } = await supabase.auth.getSession();
  if (!active) return;

  setSession(data.session);
  setReady(true);
  setLoading(false);
};

export const subscribeToAuth = ({
  setSession,
  setReady,
  onSignedOut,
}: {
  setSession: Setter<Session | null>;
  setReady: Setter<boolean>;
  onSignedOut?: () => void;
}) =>
  supabase.auth.onAuthStateChange((_event, nextSession) => {
    setSession(nextSession);
    setReady(true);

    if (!nextSession) {
      onSignedOut?.();
    }
  });

export const signInWithPassword = async ({
  email,
  password,
  setAuthLoading,
}: {
  email: string;
  password: string;
  setAuthLoading: Setter<boolean>;
}) => {
  setAuthLoading(true);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (!error) {
      return {};
    }

    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Confirmá tu email antes de iniciar sesión." };
    }

    return { error: "Email o contraseña incorrectos." };
  } finally {
    setAuthLoading(false);
  }
};

export const signUpWithPassword = async ({
  email,
  password,
  setAuthLoading,
}: {
  email: string;
  password: string;
  setAuthLoading: Setter<boolean>;
}) => {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  setAuthLoading(true);

  try {
    const emailRedirectTo = getEmailRedirectUrl();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      console.error("Sign up failed", error);
      return { error: "No se pudo crear la cuenta en este momento." };
    }

    return {
      needsEmailConfirmation: !data.session,
    };
  } finally {
    setAuthLoading(false);
  }
};

export const signOutUser = async ({
  setAuthLoading,
}: {
  setAuthLoading: Setter<boolean>;
}) => {
  setAuthLoading(true);
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out failed", error);
    }
  } finally {
    setAuthLoading(false);
  }
};

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { checkEmailExists, validateRegisterForm } from "@/utils/auth";

export default function AuthForm() {
  const { signIn, signUp, authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Completá email y contraseña.");
      return;
    }

    if (mode === "login") {
      const result = await signIn(email.trim(), password);
      if (result.error) {
        setError(result.error);
      }
      return;
    }

    const registerError = validateRegisterForm({
      email,
      password,
      confirmPassword,
    });

    if (registerError) {
      setError(registerError);
      return;
    }

    try {
      const exists = await checkEmailExists(email.trim());
      if (exists) {
        setError("Ese email ya está registrado.");
        return;
      }
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "No se pudo validar el email."
      );
      return;
    }

    const result = await signUp(email.trim(), password);
    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setMessage("Te enviamos un email de confirmación. Confirmalo y después iniciá sesión.");
      setMode("login");
      setConfirmPassword("");
      return;
    }

    setMessage("Cuenta creada correctamente.");
    setConfirmPassword("");
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-2xl">
      <div className="mb-6 flex gap-2 rounded-2xl bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === "login" ? "bg-[#FACC15] text-black" : "text-zinc-300"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            mode === "register" ? "bg-[#FACC15] text-black" : "text-zinc-300"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-[#FACC15]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8+ caracteres, 1 mayúscula, 1 número y 1 símbolo"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-[#FACC15]"
          />
        </div>

        {mode === "register" ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Repetir contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Volvé a ingresar la contraseña"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-[#FACC15]"
            />
          </div>
        ) : null}

        {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-emerald-400">{message}</p> : null}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full rounded-2xl bg-[#FACC15] px-4 py-3 font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {authLoading
            ? "Procesando..."
            : mode === "login"
            ? "Entrar"
            : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}

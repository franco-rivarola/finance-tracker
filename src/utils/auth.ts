const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const validatePassword = (password: string) => {
  if (!PASSWORD_RULES.test(password)) {
    return "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.";
  }

  return null;
};

export const validateRegisterForm = ({
  email,
  password,
  confirmPassword,
}: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
    return "Completá email, contraseña y repetir contraseña.";
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return passwordError;
  }

  if (password !== confirmPassword) {
    return "Las contraseñas no coinciden.";
  }

  return null;
};

export const checkEmailExists = async (email: string) => {
  const response = await fetch("/api/auth/check-email", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
    }),
  });

  const data = (await response.json()) as { exists?: boolean; error?: string };

  if (!response.ok) {
    throw new Error(data.error || "No se pudo validar el email.");
  }

  return Boolean(data.exists);
};

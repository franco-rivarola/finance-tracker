type SecurityLogLevel = "info" | "warn" | "error";

export const logSecurityEvent = (
  level: SecurityLogLevel,
  message: string,
  metadata?: Record<string, unknown>
) => {
  const payload = {
    scope: "security",
    message,
    ...metadata,
  };

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
};

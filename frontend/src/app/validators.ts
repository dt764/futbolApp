export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es obligatorio';
  if (!emailRegex.test(email.trim())) return 'Email no válido';
  return null;
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Al menos 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Al menos una minúscula');
  if (!/[0-9]/.test(password)) errors.push('Al menos un número');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Al menos un carácter especial');
  return { valid: errors.length === 0, errors };
}

const firebaseErrorMap: Record<string, string> = {
  'auth/email-already-in-use': 'Ya existe una cuenta con este email',
  'auth/user-not-found': 'No existe una cuenta con este email',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-credential': 'Email o contraseña incorrectos',
  'auth/invalid-email': 'Email no válido',
  'auth/weak-password': 'La contraseña es demasiado débil',
  'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
  'auth/network-request-failed': 'Error de conexión. Comprueba tu red',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
  'auth/requires-recent-login': 'Vuelve a iniciar sesión e inténtalo de nuevo',
};

export function sanitizeError(err: unknown): string {
  if (!err) return 'Error desconocido';

  const extractMessage = (e: unknown): string | null => {
    if (typeof e === 'string') return e;
    if (!e || typeof e !== 'object') return null;
    const obj = e as Record<string, unknown>;
    if (typeof obj.error === 'object' && obj.error && typeof (obj.error as Record<string, unknown>).error === 'string')
      return (obj.error as Record<string, unknown>).error as string;
    if (typeof obj.error === 'string') return obj.error;
    if (obj.message && typeof obj.message === 'string') return obj.message;
    if (obj.code && typeof obj.code === 'string') return obj.code;
    return null;
  };

  const message = extractMessage(err)
    ?? (err instanceof Error ? err.message : null)
    ?? String(err);

  const known: [RegExp, string][] = [
    [/Http failure response/i, 'Error de conexión con el servidor'],
    [/Http failure during parsing/i, 'Error al procesar la respuesta del servidor'],
    [/networkerror|network error|failed to fetch/i, 'Error de conexión. Comprueba tu red'],
    [/timeout/i, 'La solicitud tardó demasiado. Inténtalo de nuevo'],
    [/\b404\b/, 'Recurso no encontrado'],
    [/\b409\b/, 'El recurso ya existe'],
    [/\b50[0-9]\b/, 'Error interno del servidor'],
    [/json.*parse|parse.*json|unexpected token/i, 'Error al procesar los datos'],
    [/internal server error/i, 'Error interno del servidor'],
    [/not found/i, 'Recurso no encontrado'],
    [/too many requests/i, 'Demasiadas solicitudes. Inténtalo más tarde'],
  ];

  for (const [pattern, friendly] of known) {
    if (pattern.test(message)) return friendly;
  }

  if (/[\\/]{2}|\.(ts|js|java|py):\d+| at |stack trace/i.test(message)) {
    return 'Error inesperado. Inténtalo de nuevo';
  }

  if (message.length > 120) return message.substring(0, 120) + '...';

  return message;
}

export function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && firebaseErrorMap[code]) return firebaseErrorMap[code];
  if (err instanceof Error) return sanitizeError(err);
  return 'Error desconocido';
}

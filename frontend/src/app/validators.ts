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

export function mapFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code && firebaseErrorMap[code]) return firebaseErrorMap[code];
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}

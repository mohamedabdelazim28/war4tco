export const colors = {
  primary: '#2563eb',
  secondary: '#64748b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#dc2626',
  success: '#16a34a',
} as const;

export type Colors = typeof colors;

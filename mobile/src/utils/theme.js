// Tema baseado no backoffice web
export const colors = {
  // Cores principais
  primary: '#080d08',
  primaryLighter: '#0f1a0f',
  secondary: '#ff6600',
  secondaryDarker: '#ff6600',
  secondaryLighter: '#fa7a25',

  // Cores neutras
  light: '#f3f7f1',
  white: '#fff',
  black: '#000',

  // Tons de cinza
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status
  success: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#16a34a',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#dbeafe',
    main: '#3b82f6',
    dark: '#2563eb',
  },

  // Prioridades (para ocorrências)
  priority: {
    baixa: {
      bg: '#dcfce7',
      text: '#166534',
    },
    media: {
      bg: '#fef3c7',
      text: '#854d0e',
    },
    alta: {
      bg: '#fed7aa',
      text: '#9a3412',
    },
    urgente: {
      bg: '#fee2e2',
      text: '#991b1b',
    },
  },

  // Status de ocorrências
  incidentStatus: {
    aberta: {
      bg: '#fee2e2',
      text: '#991b1b',
    },
    em_andamento: {
      bg: '#fef3c7',
      text: '#854d0e',
    },
    resolvida: {
      bg: '#dcfce7',
      text: '#166534',
    },
    fechada: {
      bg: '#f3f4f6',
      text: '#4b5563',
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

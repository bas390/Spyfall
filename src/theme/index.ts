import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// ค่าคงที่สำหรับการออกแบบ
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const SHADOWS = {
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

// สีพื้นฐาน
const palette = {
  // Primary Colors
  emerald: {
    light: '#2ecc71',
    dark: '#27ae60',
  },
  navy: {
    light: '#34495e',
    dark: '#2c3e50',
  },
  // Accent Colors
  coral: {
    light: '#e74c3c',
    dark: '#c0392b',
  },
  sky: {
    light: '#3498db',
    dark: '#2980b9',
  },
  // Neutral Colors
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
};

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // หลัก
    primary: palette.emerald.light,
    primaryDark: palette.emerald.dark,
    secondary: palette.navy.light,
    secondaryDark: palette.navy.dark,
    // พื้นหลัง
    background: palette.gray[50],
    surface: '#ffffff',
    card: '#ffffff',
    // ข้อความ
    text: palette.gray[900],
    subText: palette.gray[600],
    placeholder: palette.gray[400],
    // ขอบและเส้น
    border: palette.gray[200],
    divider: palette.gray[200],
    // สถานะ
    error: palette.coral.light,
    success: palette.emerald.light,
    warning: '#f1c40f',
    info: palette.sky.light,
    // ปุ่มและ Interactive
    buttonText: '#ffffff',
    disabled: palette.gray[300],
    disabledText: palette.gray[500],
    // เพิ่มเติม
    notification: palette.sky.light,
    highlight: '#fff8e1',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  // Typography
  typography: {
    fontSize: FONT_SIZE,
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  // Spacing
  spacing: SPACING,
  // Border Radius
  borderRadius: RADIUS,
  // Shadows
  shadows: SHADOWS,
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    // หลัก
    primary: '#2ecc71',
    primaryDark: '#27ae60',
    secondary: '#34495e',
    secondaryDark: '#2c3e50',
    // พื้นหลัง
    background: '#1a1d21',
    surface: '#22262a',
    card: '#22262a',
    // ข้อความ
    text: '#ffffff',
    subText: '#a0a0a0',
    placeholder: '#666666',
    // ขอบและเส้น
    border: '#2c3e50',
    divider: '#2c3e50',
    // สถานะ
    error: '#e74c3c',
    success: '#2ecc71',
    warning: '#f1c40f',
    info: '#3498db',
    // ปุ่มและ Interactive
    buttonText: '#ffffff',
    disabled: '#34495e',
    disabledText: '#666666',
    // เพิ่มเติม
    notification: '#3498db',
    highlight: '#2c2000',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },
  // Typography
  typography: lightTheme.typography,
  // Spacing
  spacing: SPACING,
  // Border Radius
  borderRadius: RADIUS,
  // Shadows
  shadows: SHADOWS,
};

export type Theme = typeof lightTheme;

// Utility functions
export const getTextColor = (theme: Theme, variant: 'primary' | 'secondary' | 'error' | 'success' = 'primary') => {
  switch (variant) {
    case 'primary':
      return theme.colors.primary;
    case 'secondary':
      return theme.colors.secondary;
    case 'error':
      return theme.colors.error;
    case 'success':
      return theme.colors.success;
    default:
      return theme.colors.text;
  }
};

export const getShadow = (theme: Theme, size: 'sm' | 'md' | 'lg' = 'md') => {
  return theme.shadows[size];
}; 
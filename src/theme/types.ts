export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    onPrimary: string;
    onBackground: string;
    onCard: string;
    onError: string;
    onSuccess: string;
    onWarning: string;
    onInfo: string;
    subText: string;
    disabled: string;
    onDisabled: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  fonts: {
    regular: string;
    medium: string;
    light: string;
    thin: string;
  };
} 
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  leftIcon
}) => {
  const { theme } = useTheme();

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'lg': return 56;
      default: return 44;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 18;
      default: return 16;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return 12;
      case 'lg': return 24;
      default: return 16;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.disabled;
    if (variant === 'outline') return 'transparent';
    return variant === 'primary' ? theme.colors.primary : theme.colors.secondary;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.disabledText;
    if (variant === 'outline') return theme.colors.primary;
    return theme.colors.buttonText;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          height: getHeight(),
          paddingHorizontal: getPadding(),
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 2 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && (
            <View style={styles.icon}>
              {leftIcon}
            </View>
          )}
          <Text 
            style={[
              styles.text, 
              { 
                color: getTextColor(),
                fontSize: getFontSize(),
              }
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  }
}); 
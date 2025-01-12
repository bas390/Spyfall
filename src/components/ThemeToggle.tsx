import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';

interface Props {
  onToggle: () => void;
  isDark: boolean;
}

export const ThemeToggle: React.FC<Props> = ({ onToggle, isDark }) => {
  const theme = useTheme() as Theme;

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Ionicons
        name={isDark ? 'moon' : 'sunny'}
        size={24}
        color={isDark ? theme.colors.text : '#f1c40f'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 8,
  },
}); 
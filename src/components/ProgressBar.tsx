import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';

type Props = {
  progress: number;
};

export const ProgressBar = ({ progress }: Props) => {
  const theme = useTheme() as Theme;
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.border }]}>
      <View 
        style={[
          styles.progress, 
          { 
            backgroundColor: theme.colors.primary,
            width: `${Math.min(100, progress * 100)}%`,
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    marginTop: 8,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
}); 
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import Animated, { 
  FadeInRight, 
  FadeOutLeft,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { getShadow } from '../theme';

type PlayerItemProps = {
  player: string;
  onRemove: () => void;
};

export default function PlayerItem({ player, onRemove }: PlayerItemProps) {
  const theme = useTheme() as Theme;
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          ...getShadow(theme, 'sm'),
        }
      ]}
      entering={FadeInRight}
      exiting={FadeOutLeft}
    >
      <View style={styles.content}>
        <MaterialIcons name="person" size={24} color={theme.colors.primary} />
        <Text style={[styles.name, { color: theme.colors.text }]}>{player}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={onRemove}
      >
        <MaterialIcons name="close" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  removeButton: {
    padding: 10,
  },
}); 
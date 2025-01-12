import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';

type LoadingOverlayProps = {
  message?: string;
  intensity?: number;
};

export const LoadingOverlay = ({ 
  message = 'กำลังโหลด...', 
  intensity = 50 
}: LoadingOverlayProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <BlurView intensity={intensity} style={StyleSheet.absoluteFill}>
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator size="large" color="#2ecc71" />
          </Animated.View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
}); 
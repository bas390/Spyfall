import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true,
      errorMessage: error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to analytics service
    console.error('Uncaught error:', error, errorInfo);
    
    // Show alert with more details in development
    if (__DEV__) {
      Alert.alert(
        'Developer Error Info',
        `${error.toString()}\n\nComponent Stack:\n${errorInfo.componentStack}`,
        [{ text: 'OK' }]
      );
    }
  }

  private handleRetry = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    this.setState({ hasError: false, errorMessage: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>😕 ขออภัย</Text>
          <Text style={styles.errorText}>{this.state.errorMessage}</Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>ลองใหม่อีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  retryButton: {
    padding: 15,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
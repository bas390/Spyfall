import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

import { HomeScreen } from '../screens/HomeScreen';
import CreateGameScreen from '../screens/CreateGameScreen';
import JoinGameScreen from '../screens/JoinGameScreen';
import WaitingRoomScreen from '../screens/WaitingRoomScreen';
import GameScreen from '../screens/GameScreen';
import LocalGameSetupScreen from '../screens/LocalGameSetupScreen';
import TutorialScreen from '../screens/TutorialScreen';
import LocationSelectionScreen from '../screens/LocationSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateGame" component={CreateGameScreen} />
      <Stack.Screen name="JoinGame" component={JoinGameScreen} />
      <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="LocalGame" component={GameScreen} />
      <Stack.Screen name="LocalGameSetup" component={LocalGameSetupScreen} />
      <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} />
    </Stack.Navigator>
  );
} 
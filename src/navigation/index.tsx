import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import LocalGameSetupScreen from '../screens/LocalGameSetupScreen';
import LocationSelectionScreen from '../screens/LocationSelectionScreen';
import GameScreen from '../screens/GameScreen';
import CreateGameScreen from '../screens/CreateGameScreen';
import JoinGameScreen from '../screens/JoinGameScreen';
import WaitingRoomScreen from '../screens/WaitingRoomScreen';
import { Theme } from '../theme';
import { Location } from '../data/locations';
import { GameScreenParams } from '../types/navigation';

export type RootStackParamList = {
  Home: undefined;
  LocalGameSetup: { availableLocations?: Location[] };
  LocationSelection: undefined;
  Game: GameScreenParams;
  CreateGame: undefined;
  JoinGame: undefined;
  WaitingRoom: { gameCode: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LocalGameSetup" component={LocalGameSetupScreen} />
        <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="CreateGame" component={CreateGameScreen} />
        <Stack.Screen name="JoinGame" component={JoinGameScreen} />
        <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 
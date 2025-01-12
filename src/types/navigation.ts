import { Location } from '../data/locations';

export type GameScreenParams = {
  players: string[];
  spies: number[];
  location: Location;
  gameTime: number;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Game: GameScreenParams;
  LocalGame: GameScreenParams;
  LocalGameSetup: {
    availableLocations?: Location[];
  };
  LocationSelection: undefined;
}; 
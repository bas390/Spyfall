import { Location } from '../data/locations';

export type GameScreenParams = {
  players: string[];
  spies: number[];
  location: Location;
  gameTime: number;
  gameCode?: string;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateGame: undefined;
  JoinGame: undefined;
  WaitingRoom: { gameCode: string };
  Game: GameScreenParams;
  LocalGameSetup: { availableLocations?: Location[] };
  LocalGame: GameScreenParams;
  Tutorial: undefined;
  LocationSelection: undefined;
}; 
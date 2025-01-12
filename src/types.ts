export interface Location {
  name: string;
  roles: string[];
}

export interface GameState {
  players: string[];
  location: Location | null;
  spy: number | null;
  isGameStarted: boolean;
} 
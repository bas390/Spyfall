export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  showRole: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  isVoting: boolean;
  votes: number[];
  showVoteResult: boolean;
  votedSpy?: number;
  currentPlayer: number;
  allPlayersReady: boolean;
  winner?: 'spy' | 'players';
  votedPlayers?: string[];
}

export interface Location {
  name: string;
  roles: string[];
}

export interface GameData {
  host: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  spies?: number[];
  startTime?: number;
  endTime?: number;
  location?: Location;
  playerRoles?: string[];
  currentPlayer?: number;
  showRole?: boolean;
  winner?: 'spy' | 'players';
  votes?: Record<string, number>;
  votedPlayers?: string[];
  isVoting?: boolean;
  showVoteResult?: boolean;
  createdAt: number;
} 
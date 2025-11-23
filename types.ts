
export type Language = 'fr' | 'en' | 'pl';

export interface Position {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export interface ActorData {
  id: string;
  name: string; // Display name
  gender?: 'M' | 'F'; // M = Masculine, F = Feminine (Mainly for French)
  sound: string; // Sound text bubble
  emoji: string; // The emoji icon
  defaultPos: Position;
  scale?: number;
  rotation?: number;
  flip?: boolean;
  animation?: string;
  
  // New Properties
  placement: 'ground' | 'sky'; // Determines shadow and z-index behavior
  isObstacle?: boolean; // If true, blocks movement
  collisionRadius?: number; // Custom radius for collision (default is 10)
}

export enum GameMode {
  FREE = 'FREE',
  FIND = 'FIND',
}

export interface GameState {
  mode: GameMode;
  targetId: string | null;
  score: number;
  message: string;
  messageColor: 'neutral' | 'success' | 'error';
}

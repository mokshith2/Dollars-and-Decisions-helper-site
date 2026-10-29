import categoryFile from "../../docs/deck/categories.json";
import decisions from "../../docs/deck/decisions.json";
import events from "../../docs/deck/events.json";
import emergencies from "../../docs/deck/emergencies.json";

export interface Card {
  id: string;
  type: "decision" | "event" | "emergency";
  category: string;
  title: string;
  situation: string;
  effect: string;
  moneyEffect: number;
}

export interface DeckData {
  categories: string[];
  decisions: Card[];
  events: Card[];
  emergencies: Card[];
}

export type DrawMode = "mapped" | "random";
export type EmergencyDrawMode = "random" | "choose";
export type RegularDeckChoice = "all" | "decisions" | "events";

export interface GameSettings {
  startingMoney: number;
  startingMoneyByPlayer: Record<string, number> | null;
  startingPosition: number;
  startingPositionByPlayer: Record<string, number> | null;
  startingPlayer: string | null;
  diceMinimum: number;
  diceMaximum: number;
  drawMode: DrawMode;
  emergencyDrawMode: EmergencyDrawMode;
  regularDeck: RegularDeckChoice;
  autoAdvance: boolean;
}

export const defaultGameSettings: GameSettings = {
  startingMoney: 500,
  startingMoneyByPlayer: null,
  startingPosition: 0,
  startingPositionByPlayer: null,
  startingPlayer: null,
  diceMinimum: 1,
  diceMaximum: 6,
  drawMode: "mapped",
  emergencyDrawMode: "random",
  regularDeck: "all",
  autoAdvance: true,
};

export interface Player {
  id: string;
  name: string;
  balance: number;
  position: number;
}

export interface LogEntry {
  id: string;
  player: string;
  card: Card | null;
  decision: string;
  moneyChange: number;
  emergency: boolean;
  note?: string;
}

export const defaultDeck: DeckData = {
  categories: categoryFile.categories,
  decisions: decisions as Card[],
  events: events as Card[],
  emergencies: emergencies as Card[],
};

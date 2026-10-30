import categoryFile from "../../docs/deck/categories.json";
import decisions from "../../docs/deck/decisions.json";
import events from "../../docs/deck/events.json";
import emergencies from "../../docs/deck/emergencies.json";
import ageCards from "../../docs/deck/age-cards.json";

export interface Card {
  id: string;
  type: "decision" | "event" | "emergency";
  category: string;
  title: string;
  situation: string;
  effect: string;
  moneyEffect: number;
  kind?: "regular" | "boost" | "gig";
  minAge?: number;
  maxAge?: number;
  weight?: number;
  ageChange?: number;
}

export const ADULT_AGE = 15;

export function cardFitsAge(card: Card, age: number): boolean {
  const kind = card.kind ?? "regular";
  if (age < ADULT_AGE && kind === "regular") return false;
  return age >= (card.minAge ?? 0) && age <= (card.maxAge ?? Infinity);
}

export function pickWeighted(cards: Card[]): Card {
  const total = cards.reduce((sum, card) => sum + (card.weight ?? 1), 0);
  let roll = Math.random() * total;
  for (const card of cards) {
    roll -= card.weight ?? 1;
    if (roll < 0) return card;
  }
  return cards[cards.length - 1];
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
  drawMode: "random",
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
  events: [...(events as Card[]), ...(ageCards as Card[])],
  emergencies: emergencies as Card[],
};

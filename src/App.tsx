import { useEffect, useMemo, useState } from "react";
import { CardViewer } from "./components/CardViewer";
import { DeckEditor } from "./components/DeckEditor";
import { GameBoard } from "./components/GameBoard";
import { Log } from "./components/Log";
import { MoneyAdjust } from "./components/MoneyAdjust";
import { PlayerSetup } from "./components/PlayerSetup";
import { ADULT_AGE, cardFitsAge, defaultDeck, defaultGameSettings, pickWeighted, type Card, type DeckData, type GameSettings, type LogEntry, type Player } from "./data";
import "./App.css";

type Screen = "setup" | "game" | "deck";
type Theme = "dark" | "light";
const STORAGE_KEY = "dollars-decisions-helper-v1";
const THEME_KEY = "dollars-decisions-theme";

function loadTheme(): Theme {
  try { return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark"; }
  catch { return "dark"; }
}

function loadSavedDeck(): DeckData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultDeck;
    const parsed = JSON.parse(saved) as Partial<DeckData>;
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.decisions) || !Array.isArray(parsed.events) || !Array.isArray(parsed.emergencies)) return defaultDeck;
    return parsed as DeckData;
  } catch { return defaultDeck; }
}

function storeDeck(deck: DeckData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deck)); } catch { /* App remains usable when storage is disabled. */ }
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState("");
  const [diceRoll, setDiceRoll] = useState("");
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [choosingEmergency, setChoosingEmergency] = useState(false);
  const [cardDecision, setCardDecision] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [deck, setDeck] = useState<DeckData>(loadSavedDeck);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState<GameSettings>(defaultGameSettings);

  useEffect(() => { storeDeck(deck); }, [deck]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#101820" : "#f3f7fc");
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* Theme still works for this session. */ }
  }, [theme]);
  function toggleTheme() { setTheme((current) => current === "dark" ? "light" : "dark"); }
  const currentPlayer = players.find((player) => player.id === currentPlayerId) ?? players[0];
  const totalMoney = useMemo(() => players.reduce((total, player) => total + player.balance, 0), [players]);

  function startGame(names: string[], nextSettings: GameSettings) {
    setSettings(nextSettings);
    const nextPlayers = names.map((name) => ({ id: crypto.randomUUID(), name, balance: nextSettings.startingMoneyByPlayer?.[name.toLocaleLowerCase()] ?? nextSettings.startingMoney, position: nextSettings.startingPositionByPlayer?.[name.toLocaleLowerCase()] ?? nextSettings.startingPosition }));
    setPlayers(nextPlayers);
    setCurrentPlayerId(nextPlayers.find((player) => player.name.toLocaleLowerCase() === nextSettings.startingPlayer?.toLocaleLowerCase())?.id ?? nextPlayers[0].id);
    setLog([]); setDrawnCard(null); setNotice(""); setScreen("game");
  }

  function selectPlayer(id: string) { setCurrentPlayerId(id); setDrawnCard(null); setChoosingEmergency(false); setCardDecision(""); }
  function changePosition(value: number) {
    if (!Number.isFinite(value)) return;
    setPlayers((current) => current.map((player) => player.id === currentPlayerId ? { ...player, position: value } : player));
  }

  function drawCard(emergency: boolean) {
    if (!currentPlayer) return;
    if (emergency) {
      if (Math.trunc(currentPlayer.position) < ADULT_AGE) { setNotice(`Emergency cards start at age ${ADULT_AGE}.`); return; }
      if (!deck.emergencies.length) { setNotice("There are no emergency cards in this deck. Add one in Edit deck."); return; }
      if (settings.emergencyDrawMode === "choose") {
        setChoosingEmergency(true); setDrawnCard(null); setCardDecision(""); setNotice(""); return;
      }
      setDrawnCard(deck.emergencies[Math.floor(Math.random() * deck.emergencies.length)]);
    } else {
      const roll = Number(diceRoll);
      if (!diceRoll.trim() || !Number.isInteger(roll) || roll < settings.diceMinimum || roll > settings.diceMaximum) { setNotice(`Enter a whole-number dice roll from ${settings.diceMinimum} to ${settings.diceMaximum}.`); return; }
      const age = Math.trunc(currentPlayer.position);
      const baseCards = settings.regularDeck === "decisions" ? deck.decisions : settings.regularDeck === "events" ? deck.events : [...deck.decisions, ...deck.events];
      const regularCards = baseCards.filter((card) => cardFitsAge(card, age));
      if (!regularCards.length) { setNotice(`No cards in the selected deck fit age ${age}. Add cards in Deck setup or change the deck.`); return; }
      const pickedIndex = (((age + roll) % regularCards.length) + regularCards.length) % regularCards.length;
      const card = settings.drawMode === "random" ? pickWeighted(regularCards) : regularCards[pickedIndex];
      const newAge = age + roll + (card.ageChange ?? 0);
      setPlayers((current) => current.map((player) => player.id === currentPlayerId ? { ...player, position: newAge } : player));
      setDiceRoll("");
      setDrawnCard(card);
    }
    setChoosingEmergency(false); setCardDecision(""); setNotice("");
  }

  function chooseEmergency(card: Card) {
    setDrawnCard(card); setChoosingEmergency(false); setCardDecision(""); setNotice("");
  }

  function record(card: Card | null, amount: number, decision: string, emergency = false, note?: string) {
    if (!currentPlayer) return;
    if (amount !== 0) setPlayers((current) => current.map((player) => player.id === currentPlayerId ? { ...player, balance: player.balance + amount } : player));
    setLog((entries) => [...entries, { id: crypto.randomUUID(), player: currentPlayer.name, card, decision, moneyChange: amount, emergency, note }]);
    if (card) {
      const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
      if (settings.autoAdvance) {
        const nextPlayer = players[(currentIndex + 1) % players.length];
        if (nextPlayer) setCurrentPlayerId(nextPlayer.id);
      }
      setDiceRoll("");
    }
    setDrawnCard(null); setChoosingEmergency(false); setCardDecision(""); setNotice(card ? `${currentPlayer.name}’s move was added to the log.` : `${currentPlayer.name}’s balance was updated.`);
  }

  function saveDeck(nextDeck: DeckData) { setDeck(nextDeck); setScreen("game"); setNotice("Deck changes saved on this browser."); }
  function newGame() {
    if (log.length && !window.confirm("Start a new game? The current players and decision log will be cleared.")) return;
    setPlayers([]); setCurrentPlayerId(""); setDrawnCard(null); setChoosingEmergency(false); setLog([]); setScreen("setup"); setNotice("");
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to game content</a>
    <header className="site-header">
      <a className="brand" href="#main-content" aria-label="Dollars and Decisions table companion home"><span className="brand-mark" aria-hidden="true">$</span><span translate="no">Dollars <i>&</i> Decisions</span></a>
      <div className="header-right"><button className="button theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><span className="theme-icon" aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>{theme === "dark" ? "Light mode" : "Dark mode"}</button>{screen === "game" && <nav className="header-actions" aria-label="Game actions"><button className="button button-quiet" type="button" onClick={() => setScreen("deck")}>Deck setup</button><button className="button button-quiet" type="button" onClick={newGame}>New game</button></nav>}</div>
    </header>
    <main id="main-content" className="main-content">
      {screen === "game" ? <section className="game-hud" aria-label="Game status"><div className="hud-title"><span className="eyebrow">Dollars & Decisions · Table game</span><h1>Game in progress</h1></div><div className="hud-stat"><span>Players</span><strong>{players.length}</strong></div><div className="hud-stat"><span>Turns logged</span><strong>{log.length}</strong></div><div className="hud-bank"><span>Table total</span><strong>{currency.format(totalMoney)}</strong></div></section> : <div className="page-intro"><div><span className="eyebrow">{screen === "deck" ? "Game setup · Card library" : "Dollars & Decisions · Table game"}</span><h1>{screen === "deck" ? "Build your card deck." : "Set up the table."}</h1></div></div>}
      {notice && <p className="status-note" role="status">{notice}<button className="status-dismiss" type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></p>}
      {screen === "setup" && <PlayerSetup initialSettings={settings} onStart={startGame} />}
      {screen === "game" && players.length > 0 && <>
        <GameBoard players={players} currentPlayerId={currentPlayerId} diceRoll={diceRoll} diceMinimum={settings.diceMinimum} diceMaximum={settings.diceMaximum} emergencyCards={deck.emergencies} choosingEmergency={choosingEmergency} onSelectPlayer={selectPlayer} onChangeDiceRoll={(value) => { setDiceRoll(value); setNotice(""); }} onChangePosition={changePosition} onDraw={drawCard} onChooseEmergency={chooseEmergency} onCancelEmergency={() => setChoosingEmergency(false)} />
        {drawnCard && currentPlayer && <CardViewer key={drawnCard.id} card={drawnCard} playerName={currentPlayer.name} decision={cardDecision} onChangeDecision={setCardDecision} onApply={(amount) => record(drawnCard, amount, cardDecision, drawnCard.type === "emergency")} onSkip={() => record(drawnCard, 0, cardDecision || "Recorded without applying the money effect", drawnCard.type === "emergency")} />}
        {currentPlayer && <MoneyAdjust key={currentPlayer.id} playerName={currentPlayer.name} onApply={(amount, note) => record(null, amount, "", false, note)} />}
        <Log entries={log} />
      </>}
      {screen === "deck" && <DeckEditor deck={deck} onSave={saveDeck} onCancel={() => setScreen("game")} />}
    </main>
    <footer className="site-footer"><span>Dollars & Decisions · Table companion</span><span>Physical board · Physical dice · One shared table</span></footer>
  </div>;
}

import { useState } from "react";
import { defaultGameSettings, type GameSettings } from "../data";

interface PlayerSetupProps {
  initialSettings: GameSettings;
  onStart: (names: string[], settings: GameSettings) => void;
}

export function PlayerSetup({ initialSettings, onStart }: PlayerSetupProps) {
  const [raw, setRaw] = useState("");
  const [settings, setSettings] = useState(initialSettings);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(true);
  const playerNames = raw.split(",").map((name) => name.trim()).filter(Boolean).filter((name, index, names) => names.findIndex((candidate) => candidate.toLocaleLowerCase() === name.toLocaleLowerCase()) === index);

  function setStartingMoney(value: number) {
    setSettings((current) => ({ ...current, startingMoney: value }));
  }

  // Per-player overrides are keyed by lowercase name; a null value removes the override.
  function setPlayerOverride(field: "startingMoneyByPlayer" | "startingPositionByPlayer", name: string, value: number | null) {
    const overrides: Record<string, number> = { ...settings[field] };
    if (value === null) delete overrides[name.toLocaleLowerCase()];
    else overrides[name.toLocaleLowerCase()] = value;
    setSettings((current) => ({ ...current, [field]: overrides }));
  }

  function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (playerNames.length < 2) {
      setError("Add at least 2 names, separated by commas.");
      return;
    }
    if (!Number.isFinite(settings.startingMoney) || settings.startingMoney < 0 || settings.startingMoney > 1_000_000) {
      setError("Starting money must be between $0 and $1,000,000."); return;
    }
    if (playerNames.some((name) => {
      const amount = settings.startingMoneyByPlayer?.[name.toLocaleLowerCase()];
      return amount !== undefined && (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000);
    })) {
      setError("Each player’s starting money must be between $0 and $1,000,000."); return;
    }
    if (playerNames.some((name) => {
      const position = settings.startingPositionByPlayer?.[name.toLocaleLowerCase()];
      return position !== undefined && !Number.isInteger(position);
    })) {
      setError("Each player’s starting position must be a whole number."); return;
    }
    if (!Number.isInteger(settings.startingPosition)) {
      setError("Starting position must be a whole number."); return;
    }
    if (!Number.isInteger(settings.diceMinimum) || !Number.isInteger(settings.diceMaximum) || settings.diceMaximum < settings.diceMinimum) {
      setError("Dice range must use whole numbers, with the maximum at least the minimum."); return;
    }
    setError("");
    onStart(playerNames, settings);
  }

  return (
    <form className="setup-card" onSubmit={handleStart}>
      <div className="setup-copy">
        <span className="eyebrow">A companion for the table</span>
        <h2>Make every money move count.</h2>
        <p>Keep your physical board and dice in play. This table companion tracks the people, money, and decisions around it.</p>
      </div>
      <div className="setup-form">
        <label htmlFor="player-names">Who’s playing?</label>
        <textarea id="player-names" name="players" autoComplete="off" rows={3} value={raw} onChange={(event) => { setRaw(event.target.value); setError(""); }} placeholder="Alex, Jordan, Sam…" aria-describedby={error ? "player-error" : "player-help"} />
        <p className="field-hint" id={error ? "player-error" : "player-help"} aria-live="polite">{error || "Enter at least 2 names, separated by commas."}</p>
        <button className="button button-primary" type="submit">Set up the table</button>
      </div>
      <section className="setup-options" aria-labelledby="game-options-heading">
        <button className="options-heading" type="button" aria-expanded={settingsOpen} aria-controls="game-options" onClick={() => setSettingsOpen((open) => !open)}>
          <span><span className="eyebrow">Table rules</span><strong id="game-options-heading">Customize this game</strong></span><span className="options-chevron" aria-hidden="true">{settingsOpen ? "−" : "+"}</span>
        </button>
        {settingsOpen && <div className="options-grid" id="game-options">
          <div className="field-group"><label htmlFor="starting-money">Starting money</label><div className="input-with-prefix"><span aria-hidden="true">$</span><input id="starting-money" name="starting-money" type="number" inputMode="decimal" min="0" max="1000000" step="1" autoComplete="off" value={settings.startingMoney} onChange={(event) => setStartingMoney(Number(event.target.value))} /><small>default per player</small></div></div>
          {playerNames.map((name) => <div className="field-group" key={`starting-money-${name.toLocaleLowerCase()}`}><label htmlFor={`player-starting-money-${name.toLocaleLowerCase()}`}>{name} starts with</label><div className="input-with-prefix"><span aria-hidden="true">$</span><input id={`player-starting-money-${name.toLocaleLowerCase()}`} name={`player-starting-money-${name.toLocaleLowerCase()}`} type="number" inputMode="decimal" min="0" max="1000000" step="1" autoComplete="off" value={settings.startingMoneyByPlayer?.[name.toLocaleLowerCase()] ?? ""} placeholder={String(settings.startingMoney)} onChange={(event) => setPlayerOverride("startingMoneyByPlayer", name, event.target.value === "" ? null : Number(event.target.value))} /></div></div>)}
          <div className="field-group"><label htmlFor="starting-position">Starting position</label><input id="starting-position" name="starting-position" type="number" inputMode="numeric" step="1" autoComplete="off" value={settings.startingPosition} onChange={(event) => setSettings((current) => ({ ...current, startingPosition: Number(event.target.value) }))} /></div>
          {playerNames.map((name) => <div className="field-group" key={`starting-position-${name.toLocaleLowerCase()}`}><label htmlFor={`player-starting-position-${name.toLocaleLowerCase()}`}>{name} starts at position</label><input id={`player-starting-position-${name.toLocaleLowerCase()}`} name={`player-starting-position-${name.toLocaleLowerCase()}`} type="number" inputMode="numeric" step="1" autoComplete="off" value={settings.startingPositionByPlayer?.[name.toLocaleLowerCase()] ?? ""} placeholder={String(settings.startingPosition)} onChange={(event) => setPlayerOverride("startingPositionByPlayer", name, event.target.value === "" ? null : Number(event.target.value))} /></div>)}
          <div className="field-group"><label htmlFor="starting-player">First turn</label><select id="starting-player" name="starting-player" value={settings.startingPlayer ?? ""} onChange={(event) => setSettings((current) => ({ ...current, startingPlayer: event.target.value || null }))}><option value="">First player in list</option>{playerNames.map((name) => <option key={name.toLocaleLowerCase()} value={name}>{name}</option>)}</select></div>
          <fieldset className="option-fieldset"><legend>Dice range</legend><div className="range-inputs"><div className="field-group"><label htmlFor="dice-minimum">From</label><input id="dice-minimum" name="dice-minimum" type="number" inputMode="numeric" step="1" autoComplete="off" value={settings.diceMinimum} onChange={(event) => setSettings((current) => ({ ...current, diceMinimum: Number(event.target.value) }))} /></div><span aria-hidden="true">to</span><div className="field-group"><label htmlFor="dice-maximum">To</label><input id="dice-maximum" name="dice-maximum" type="number" inputMode="numeric" step="1" autoComplete="off" value={settings.diceMaximum} onChange={(event) => setSettings((current) => ({ ...current, diceMaximum: Number(event.target.value) }))} /></div></div></fieldset>
          <div className="field-group"><label htmlFor="regular-deck">Regular card decks</label><select id="regular-deck" name="regular-deck" value={settings.regularDeck} onChange={(event) => setSettings((current) => ({ ...current, regularDeck: event.target.value as GameSettings["regularDeck"] }))}><option value="all">Decisions + events</option><option value="decisions">Decisions only</option><option value="events">Events only</option></select></div>
          <div className="field-group"><label htmlFor="draw-mode">Card selection</label><select id="draw-mode" name="draw-mode" value={settings.drawMode} onChange={(event) => setSettings((current) => ({ ...current, drawMode: event.target.value as GameSettings["drawMode"] }))}><option value="mapped">Use position + roll</option><option value="random">Random card</option></select></div>
          <div className="field-group"><label htmlFor="emergency-draw-mode">Emergency selection</label><select id="emergency-draw-mode" name="emergency-draw-mode" value={settings.emergencyDrawMode} onChange={(event) => setSettings((current) => ({ ...current, emergencyDrawMode: event.target.value as GameSettings["emergencyDrawMode"] }))}><option value="random">Random emergency</option><option value="choose">Choose from deck</option></select></div>
          <label className="toggle-option" htmlFor="auto-advance"><input id="auto-advance" name="auto-advance" type="checkbox" checked={settings.autoAdvance} onChange={(event) => setSettings((current) => ({ ...current, autoAdvance: event.target.checked }))} /><span><strong>Advance player after a card</strong><small>Move to the next name when a card is recorded.</small></span></label>
          <button className="button button-reset" type="button" onClick={() => setSettings(defaultGameSettings)}>Reset game options</button>
        </div>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </form>
  );
}

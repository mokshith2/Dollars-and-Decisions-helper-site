import type { Card, Player } from "../data";

interface GameBoardProps {
  players: Player[];
  currentPlayerId: string;
  diceRoll: string;
  diceMinimum: number;
  diceMaximum: number;
  emergencyCards: Card[];
  choosingEmergency: boolean;
  onSelectPlayer: (id: string) => void;
  onChangeDiceRoll: (value: string) => void;
  onChangePosition: (value: number) => void;
  onDraw: (emergency: boolean) => void;
  onChooseEmergency: (card: Card) => void;
  onCancelEmergency: () => void;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function GameBoard({ players, currentPlayerId, diceRoll, diceMinimum, diceMaximum, emergencyCards, choosingEmergency, onSelectPlayer, onChangeDiceRoll, onChangePosition, onDraw, onChooseEmergency, onCancelEmergency }: GameBoardProps) {
  const currentPlayer = players.find((player) => player.id === currentPlayerId) ?? players[0];
  const rollValue = Number(diceRoll);
  const canDraw = diceRoll.trim() !== "" && Number.isInteger(rollValue) && rollValue >= diceMinimum && rollValue <= diceMaximum;

  return (
    <div className="game-layout">
      <section className="play-panel" aria-labelledby="turn-heading">
        <div className="section-heading">
          <div><span className="eyebrow">Your table, your rules</span><h2 id="turn-heading">Take a turn</h2></div>
          <span className="turn-stamp">Physical board + dice</span>
        </div>
        <div className="turn-fields">
          <div className="field-group">
            <label htmlFor="current-player">Current player</label>
            <select id="current-player" name="current-player" value={currentPlayer?.id ?? ""} onChange={(event) => onSelectPlayer(event.target.value)}>
              {players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}
            </select>
            <span className="field-hint">Match the player on the CPX board.</span>
          </div>
          <div className="field-group field-small">
            <label htmlFor="board-position">Board position</label>
            <input id="board-position" name="board-position" type="number" inputMode="numeric" autoComplete="off" step="1" value={currentPlayer?.position ?? 0} onChange={(event) => onChangePosition(Number(event.target.value))} />
            <span className="field-hint">Enter their current space.</span>
          </div>
          <div className="field-group field-small">
            <label htmlFor="dice-roll">Dice roll</label>
            <input id="dice-roll" name="dice-roll" type="number" inputMode="numeric" autoComplete="off" min={diceMinimum} max={diceMaximum} step="1" value={diceRoll} onChange={(event) => onChangeDiceRoll(event.target.value)} placeholder={`e.g. ${diceMinimum}…`} />
            <span className="field-hint">From the physical dice.</span>
          </div>
        </div>
        <div className="turn-actions">
          <button className="button button-primary" type="button" onClick={() => onDraw(false)} disabled={!canDraw}>Draw a card</button>
          <button className="button button-alert" type="button" onClick={() => onDraw(true)}>Emergency event</button>
          {!canDraw && <span className="action-note">Enter a dice roll from {diceMinimum} to {diceMaximum} to draw a regular card.</span>}
        </div>
        {choosingEmergency && <div className="emergency-picker" aria-labelledby="emergency-picker-heading">
          <div className="emergency-picker-heading"><div><span className="eyebrow">Choose an emergency</span><h3 id="emergency-picker-heading">Select a card from the deck</h3></div><button className="button button-quiet" type="button" onClick={onCancelEmergency}>Cancel</button></div>
          <ul className="emergency-picker-list">{emergencyCards.map((card) => <li key={card.id}><button className="emergency-choice" type="button" onClick={() => onChooseEmergency(card)}><span><strong>{card.title}</strong><small>{card.situation}</small></span><span className={card.moneyEffect < 0 ? "negative" : "positive"}>{currency.format(card.moneyEffect)}</span></button></li>)}</ul>
        </div>}
        {currentPlayer && <div className="active-balance"><span>In play for <strong>{currentPlayer.name}</strong></span><strong className="balance-large">{currency.format(currentPlayer.balance)}</strong></div>}
      </section>

      <aside className="players-panel" aria-labelledby="players-heading">
        <div className="section-heading compact"><div><span className="eyebrow">At a glance</span><h2 id="players-heading">Players</h2></div><span className="player-count">{players.length} at table</span></div>
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id} className={player.id === currentPlayerId ? "player-row active" : "player-row"}>
              <button className="player-pick" type="button" onClick={() => onSelectPlayer(player.id)} aria-current={player.id === currentPlayerId ? "true" : undefined}>
                <span className="player-mark" aria-hidden="true">{player.name.slice(0, 1).toLocaleUpperCase()}</span>
                <span className="player-meta"><strong>{player.name}</strong><small>Position {player.position}</small></span>
                <span className="player-balance">{currency.format(player.balance)}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

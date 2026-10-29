import { useState } from "react";
import type { Card } from "../data";

interface CardViewerProps {
  card: Card;
  playerName: string;
  decision: string;
  onChangeDecision: (value: string) => void;
  onApply: (amount: number) => void;
  onSkip: () => void;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, signDisplay: "always" });

export function CardViewer({ card, playerName, decision, onChangeDecision, onApply, onSkip }: CardViewerProps) {
  const [moneyChange, setMoneyChange] = useState(String(card.moneyEffect));
  const parsedMoneyChange = Number(moneyChange);
  const canApply = moneyChange.trim() !== "" && Number.isFinite(parsedMoneyChange);

  return (
    <section className={`drawn-card ${card.type === "emergency" ? "emergency-card" : ""}`} aria-labelledby="drawn-card-title" aria-live="polite">
      <div className="card-topline"><span>{card.type === "emergency" ? "Emergency" : card.type}</span><span className="category-pill">{card.category}</span></div>
      <h2 id="drawn-card-title">{card.title}</h2>
      <p className="card-situation">{card.situation}</p>
      <div className="card-effect"><span>What happens</span><p>{card.effect}</p></div>
      <div className="field-group decision-field"><label htmlFor="table-decision">What did {playerName} decide?</label><input id="table-decision" name="table-decision" autoComplete="off" value={decision} onChange={(event) => onChangeDecision(event.target.value)} placeholder="Add the table’s choice…" /></div>
      <div className="field-group card-money-field"><label htmlFor="card-money-change">Actual money change ($)</label><input id="card-money-change" name="card-money-change" type="number" inputMode="decimal" step="any" autoComplete="off" value={moneyChange} onChange={(event) => setMoneyChange(event.target.value)} aria-describedby="card-money-hint" /><span id="card-money-hint" className="field-hint">Suggested: {currency.format(card.moneyEffect)}. Change this to match the table’s outcome.</span></div>
      <div className="card-bottom"><div><span className="money-caption">Recorded money change</span><strong className={`money-effect ${parsedMoneyChange < 0 ? "negative" : "positive"}`}>{canApply ? currency.format(parsedMoneyChange) : "—"}</strong></div><div className="card-buttons"><button className="button button-primary" type="button" onClick={() => onApply(parsedMoneyChange)} disabled={!canApply}>Apply to {playerName}</button><button className="button button-quiet" type="button" onClick={onSkip}>Record without changing balance</button></div></div>
    </section>
  );
}

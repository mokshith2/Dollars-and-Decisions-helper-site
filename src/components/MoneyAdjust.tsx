import { useState } from "react";

interface MoneyAdjustProps {
  playerName: string;
  onApply: (amount: number, note: string) => void;
}

export function MoneyAdjust({ playerName, onApply }: MoneyAdjustProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (amount.trim() === "" || !Number.isFinite(value)) {
      setError("Enter a valid amount, such as 25 or -10.");
      return;
    }
    onApply(value, note.trim() || "Manual adjustment");
    setAmount("");
    setNote("");
    setError("");
  }

  return (
    <form className="adjust-form" onSubmit={submit}>
      <div className="adjust-title"><div><span className="eyebrow">Table adjustment</span><h3>Change {playerName}’s balance</h3></div><p>Use a minus sign to subtract.</p></div>
      <div className="adjust-fields">
        <div className="field-group"><label htmlFor="adjustment-amount">Amount ($)</label><input id="adjustment-amount" name="adjustment-amount" type="number" inputMode="decimal" autoComplete="off" step="any" value={amount} onChange={(event) => { setAmount(event.target.value); setError(""); }} placeholder="e.g. -40…" aria-describedby={error ? "adjustment-error" : undefined} /></div>
        <div className="field-group"><label htmlFor="adjustment-note">Reason</label><input id="adjustment-note" name="adjustment-note" type="text" autoComplete="off" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note…" /></div>
        <button className="button button-dark" type="submit">Apply change</button>
      </div>
      {error && <p className="form-error" id="adjustment-error" aria-live="polite">{error}</p>}
    </form>
  );
}

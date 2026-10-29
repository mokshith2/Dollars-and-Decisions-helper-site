import type { LogEntry } from "../data";

interface LogProps { entries: LogEntry[]; }
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, signDisplay: "always" });

export function Log({ entries }: LogProps) {
  return (
    <section className="log-panel" aria-labelledby="log-heading">
      <div className="section-heading compact"><div><span className="eyebrow">The table’s story</span><h2 id="log-heading">Decision log</h2></div><span className="player-count">{entries.length} {entries.length === 1 ? "entry" : "entries"}</span></div>
      {entries.length === 0 ? <div className="empty-log"><span className="empty-symbol" aria-hidden="true">↳</span><p>Nothing on the record yet. A card draw or balance change will show up here.</p></div> : (
        <ol className="log-list">
          {[...entries].reverse().map((entry) => (
            <li className="log-entry" key={entry.id}>
              <span className={`log-marker ${entry.emergency ? "marker-emergency" : ""}`} aria-hidden="true"></span>
              <div className="log-entry-main"><div className="log-entry-title"><strong>{entry.player}</strong><span className="log-kind">{entry.card ? (entry.emergency ? "Emergency" : entry.card.type) : "Balance"}</span></div>
                {entry.card ? <><strong className="log-card-name">{entry.card.title}</strong><p>{entry.decision || entry.card.situation}</p></> : <p>{entry.note || "Manual adjustment"}</p>}
              </div>
              <strong className={`log-amount ${entry.moneyChange < 0 ? "negative" : "positive"}`}>{currency.format(entry.moneyChange)}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

import { useState } from "react";
import type { Card, DeckData } from "../data";

interface DeckEditorProps { deck: DeckData; onSave: (deck: DeckData) => void; onCancel: () => void; }
type DeckTab = "categories" | "decisions" | "events" | "emergencies";
type CardType = Card["type"];

function makeCard(type: CardType, category: string): Card {
  return { id: `custom-${crypto.randomUUID()}`, type, category, title: "", situation: "", effect: "", moneyEffect: 0 };
}

function CardForm({ card, categories, onSave, onCancel }: { card: Card; categories: string[]; onSave: (card: Card) => void; onCancel: () => void }) {
  const [form, setForm] = useState(card);
  const [error, setError] = useState("");
  const update = <K extends keyof Card>(key: K, value: Card[K]) => setForm((current) => ({ ...current, [key]: value }));
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.situation.trim() || !form.effect.trim() || !Number.isFinite(form.moneyEffect)) {
      setError("Add a title, situation, effect, and valid money amount."); return;
    }
    onSave({ ...form, title: form.title.trim(), situation: form.situation.trim(), effect: form.effect.trim() });
  }
  return <form className="editor-form" onSubmit={submit}>
    <div className="editor-form-heading"><h3>{card.title ? "Edit card" : "New card"}</h3><button className="button button-quiet" type="button" onClick={onCancel}>Close</button></div>
    <div className="editor-grid">
      <div className="field-group"><label htmlFor="card-title">Title</label><input id="card-title" name="card-title" autoComplete="off" value={form.title} onChange={(event) => update("title", event.target.value)} /></div>
      <div className="field-group"><label htmlFor="card-category">Category</label><select id="card-category" name="card-category" value={form.category} onChange={(event) => update("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
      <div className="field-group editor-wide"><label htmlFor="card-situation">Situation</label><textarea id="card-situation" name="card-situation" rows={2} value={form.situation} onChange={(event) => update("situation", event.target.value)} /></div>
      <div className="field-group editor-wide"><label htmlFor="card-effect">Effect</label><textarea id="card-effect" name="card-effect" rows={2} value={form.effect} onChange={(event) => update("effect", event.target.value)} /></div>
      <div className="field-group"><label htmlFor="card-money">Money effect ($)</label><input id="card-money" name="card-money" type="number" inputMode="decimal" step="any" value={form.moneyEffect} onChange={(event) => update("moneyEffect", Number(event.target.value))} /></div>
    </div>
    {error && <p className="form-error" aria-live="polite">{error}</p>}
    <button className="button button-primary" type="submit">Save card</button>
  </form>;
}

export function DeckEditor({ deck, onSave, onCancel }: DeckEditorProps) {
  const [working, setWorking] = useState<DeckData>(() => structuredClone(deck));
  const [tab, setTab] = useState<DeckTab>("categories");
  const [editing, setEditing] = useState<Card | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const listKey: Record<Exclude<DeckTab, "categories">, "decisions" | "events" | "emergencies"> = { decisions: "decisions", events: "events", emergencies: "emergencies" };
  const shownCards = tab === "categories" ? [] : working[listKey[tab]].filter((card) => `${card.title} ${card.category}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  function saveCard(card: Card) {
    const key = listKey[card.type === "emergency" ? "emergencies" : card.type === "event" ? "events" : "decisions"];
    setWorking((current) => ({ ...current, [key]: current[key].some((item) => item.id === card.id) ? current[key].map((item) => item.id === card.id ? card : item) : [...current[key], card] }));
    setEditing(null);
  }

  function removeCard(card: Card) {
    if (!window.confirm(`Remove “${card.title || "Untitled card"}” from this deck?`)) return;
    const key = listKey[card.type === "emergency" ? "emergencies" : card.type === "event" ? "events" : "decisions"];
    setWorking((current) => ({ ...current, [key]: current[key].filter((item) => item.id !== card.id) }));
  }

  function addCategory() {
    const category = newCategory.trim().toLocaleLowerCase().replace(/\s+/g, "-");
    if (!category || working.categories.includes(category)) return;
    setWorking((current) => ({ ...current, categories: [...current.categories, category] })); setNewCategory("");
  }

  function removeCategory(category: string) {
    if (!window.confirm(`Remove “${category}”? Cards using it will move to “${working.categories.find((item) => item !== category) ?? "uncategorized"}”.`)) return;
    const fallback = working.categories.find((item) => item !== category) ?? "uncategorized";
    setWorking((current) => ({ ...current, categories: current.categories.filter((item) => item !== category), decisions: current.decisions.map((card) => card.category === category ? { ...card, category: fallback } : card), events: current.events.map((card) => card.category === category ? { ...card, category: fallback } : card), emergencies: current.emergencies.map((card) => card.category === category ? { ...card, category: fallback } : card) }));
  }

  function exportDeck() {
    const blob = new Blob([JSON.stringify(working, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "custom-deck.json"; anchor.click(); URL.revokeObjectURL(url); setMessage("custom-deck.json downloaded.");
  }

  return <section className="editor-panel" aria-labelledby="editor-heading" data-content-list>
    <div className="section-heading"><div><span className="eyebrow">Make the deck yours</span><h2 id="editor-heading">Deck editor</h2></div><button className="button button-quiet" type="button" onClick={onCancel}>Back to game</button></div>
    <p className="editor-intro">Changes are saved to this browser. Export your deck to copy changes back into the repo files.</p>
    <div className="editor-toolbar"><div className="editor-tabs" role="tablist" aria-label="Deck sections">{(["categories", "decisions", "events", "emergencies"] as DeckTab[]).map((section) => <button key={section} type="button" role="tab" aria-selected={tab === section} className={tab === section ? "editor-tab selected" : "editor-tab"} onClick={() => { setTab(section); setEditing(null); setMessage(""); }}>{section}<span>{section === "categories" ? working.categories.length : working[listKey[section]].length}</span></button>)}</div><div className="editor-actions"><button className="button button-secondary" type="button" onClick={exportDeck}>Export JSON</button><button className="button button-primary" type="button" onClick={() => onSave(working)}>Save changes</button></div></div>
    {message && <p className="form-hint" aria-live="polite">{message}</p>}
    {tab === "categories" ? <div className="category-workspace"><div className="category-list">{working.categories.map((category) => <div className="category-row" key={category}><span>{category}</span><button className="button button-danger" type="button" onClick={() => removeCategory(category)}>Remove</button></div>)}</div><form className="category-add" onSubmit={(event) => { event.preventDefault(); addCategory(); }}><label htmlFor="new-category">Add a category</label><div><input id="new-category" name="new-category" autoComplete="off" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="e.g. insurance…" /><button className="button button-dark" type="submit">Add category</button></div></form></div> : <>
      <div className="card-list-toolbar"><label htmlFor="card-search">Find a card</label><input id="card-search" name="card-search" type="search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or category…" /><button className="button button-dark" type="button" onClick={() => setEditing(makeCard(tab === "emergencies" ? "emergency" : tab === "events" ? "event" : "decision", working.categories[0] ?? "uncategorized"))}>Add {tab === "emergencies" ? "emergency" : tab === "events" ? "event" : "decision"}</button></div>
      {shownCards.length === 0 ? <div className="empty-log"><p>No cards match this view. Try another search or add a new card.</p></div> : <ul className="deck-card-list">{shownCards.map((card) => <li key={card.id} className="deck-card-row"><div className="deck-card-info"><strong>{card.title}</strong><span>{card.category}</span><span className={card.moneyEffect < 0 ? "negative" : "positive"}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, signDisplay: "always" }).format(card.moneyEffect)}</span></div><div className="deck-card-actions"><button className="button button-quiet" type="button" onClick={() => setEditing(card)}>Edit</button><button className="button button-danger" type="button" onClick={() => removeCard(card)}>Remove</button></div></li>)}</ul>}
      {editing && <CardForm card={editing} categories={working.categories.length ? working.categories : [editing.category]} onSave={saveCard} onCancel={() => setEditing(null)} />}
    </>}
  </section>;
}

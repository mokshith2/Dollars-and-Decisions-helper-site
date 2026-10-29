# Dollars and Decisions — agent notes

This repo is the table companion for the physical "Dollars & Decisions" board game (Activity A5). Keep changes small and match the existing React + Vite + TypeScript code.

## Scope

- The app is a helper for the physical game: it tracks players, balances, positions, dice entry, card draws and the decision log. It does not implement the full board rules, which are not finalized.
- Do not add online multiplayer, live sync, in-app dice or direct CPX hardware links (see `docs/PLAN.md`).
- The regular card mapping (`position + roll`) is a placeholder; change it only when the physical rules are decided.

## Physical design constraints (Activity A5)

- 2–6 players. Board is about 40 squares in four zones: School, Higher Ed, Work, Life; the last square is The End.
- Printed parts: PLA 3D-printed parts within 300 × 200 × 200 mm, one colour palette (Vibrant or Neutral); laser-cut parts from 6 mm birch within 300 × 300 mm in one DXF.
- Card types: positive (green) and negative (red) event cards, plus choice cards that affect money.

## Working rules

- Verify with `npm run build` after changes.
- Browser edits are saved locally; repo deck JSON in `docs/deck/` is the source for the built app.
- Do not commit or push unless asked.

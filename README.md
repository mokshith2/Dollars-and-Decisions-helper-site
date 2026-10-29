# Dollars and Decisions — Table Companion

A helper for playing the physical Dollars and Decisions board game. Keep the CPX board and physical dice at the table; enter the active player and roll here to track balances, draw cards, and keep a shared decision log.

## Run locally

```bash
npm install
npm run dev
```

Build the static site with `npm run build`; Vite writes the deployable files to `dist/`.

## Play

1. Enter at least 2 player names.
2. Use the active player’s turn on the physical board, then enter the dice result and position.
3. Draw a card, or record an emergency when one occurs on the board.
4. Enter the group’s decision and apply the card’s money effect (or another amount) to the balance.
5. Use the quick adjustment controls for money changes outside a card.

Regular cards use a temporary deterministic mapping based on position and dice roll; emergency cards are selected at random. This placeholder can change when the final CPX mapping is known.

## Edit the deck

Open **Edit deck** to add, edit, or remove cards and categories. Browser changes are kept on this device. Export JSON to download the custom deck and copy its card/category data into the files in `docs/deck/` when you want to update the repo.

Deck files: `docs/deck/categories.json`, `docs/deck/decisions.json`, `docs/deck/events.json`, and `docs/deck/emergencies.json`.

## GitHub Pages

The Vite build uses relative asset URLs. Build the app and configure GitHub Pages to publish the `dist` output using your preferred Pages workflow. No backend or secrets are required.

## License

See [LICENSE](LICENSE).

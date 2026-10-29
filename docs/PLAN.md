# Dollars and Decisions — Helper App Plan

> A helper-only web app for the physical board game “Dollars and Decisions.” This is not an online multiplayer game. Players use the CPX board and physical dice; one person enters the current player and roll.

## Goal

- Enter 2+ player names and track each player’s balance and board position.
- Record the physical dice roll and use a deterministic placeholder rule to draw a decision or event card.
- Draw an emergency card when the table reports an emergency.
- Show card title, situation, effect, and money effect; record money changes and the table’s decision in a shared log.
- Edit categories and cards; keep edits in this browser and export JSON for copying into the repo deck files.

## Hosting

Static frontend built with Vite. The output can be hosted on GitHub Pages. No server, account, online multiplayer, or live sync is required.

## Data

- `docs/deck/categories.json`
- `docs/deck/decisions.json`
- `docs/deck/events.json`
- `docs/deck/emergencies.json`

The app imports these JSON files at build time, which supports reliable static hosting. Browser edits are saved locally and can be exported as `custom-deck.json`.

## Card draw placeholder

A regular draw indexes the combined decision and event cards by `(position + dice roll) % card count`. An emergency draw selects an emergency card at random. The mapping is intentionally temporary until the physical game rules are finalized.

## Out of scope

- Online multiplayer or cross-device sync
- In-app dice or direct CPX hardware connection
- Writing browser edits directly back to repo JSON

## Verification

- `npm run build` must succeed.
- `npm run dev` must serve the main screen.

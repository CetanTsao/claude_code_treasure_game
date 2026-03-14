# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Start Vite dev server at http://localhost:3000 (opens automatically)
npm run server        # Start Express API server at http://localhost:3001
npm run build         # Build to ./build/
```

There is no test runner or linter configured.

> **Note:** The full app requires both servers running concurrently. Vite proxies all `/api` requests to `localhost:3001`.

## Architecture

This is a single-page React + TypeScript app (Vite) with a Node.js/Express backend.

### Frontend: `src/App.tsx`

The game presents 3 treasure chests; one is randomly assigned a treasure on init. Clicking a chest opens it: treasure gives +$100, skeleton gives -$50. The game ends when the treasure is found or all boxes are opened.

State:
- `boxes: Box[]` — array of `{ id, isOpen, hasTreasure }`
- `score: number`
- `gameEnded: boolean`
- `auth: AuthState | null` — JWT token + username for signed-in users
- `isGuest: boolean` — guest mode (no score saving)
- `history: ScoreRecord[]` — last 10 scores fetched from the API

Key functions: `initializeGame()`, `openBox(boxId)`, `saveScore(finalScore)`, `handleSignOut()`.

The entry point is `AuthScreen` (`src/components/AuthScreen.tsx`), which handles sign-in, sign-up, and guest mode before rendering the game.

### Backend: `server/`

Express server with SQLite (via `better-sqlite3`). Database file: `server/game.db` (auto-created).

API routes:
- `POST /api/signup` — create account, returns JWT
- `POST /api/signin` — authenticate, returns JWT
- `POST /api/scores` — save game score (requires Bearer token)
- `GET /api/scores` — fetch last 10 scores for user (requires Bearer token)

### Assets

- `src/assets/` — chest images (`treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`)
- `src/audios/` — sound effects (`chest_open.mp3`, `chest_open_with_evil_laugh.mp3`)

### UI Components

`src/components/ui/` contains the full shadcn/ui component library (pre-generated). Only `Button` is currently used by the game. The path alias `@` resolves to `./src`.

### Styling

Tailwind CSS with an amber color theme. Global styles in `src/styles/globals.css` and `src/index.css`. Animations use `motion/react` (Framer Motion).

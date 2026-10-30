# 2048 Web App

A retro-styled browser version of the classic 2048 sliding-tile puzzle, with a twist: once you build a big tile, the board starts to shift under you. Slide tiles with the arrow keys, merge matching tiles, and try to reach the 2048 tile.

Built for Computing 2 coursework (CID 02040629).

## How to play

Run the game (see [Getting started](#getting-started)) and open <http://localhost:8080>. Every visit starts a new game.

- **Move:** press the arrow keys. All tiles slide as far as they can in that direction.
- **Merge:** two tiles with the same value that collide merge into one tile of double the value. A tile merges at most once per move, so `2 2 2 2` slid left becomes `4 4`.
- **New tiles:** after every move that changes the board, a new tile (a 2 or a 4, equally likely) appears in a random empty cell. A key press that moves nothing does nothing.
- **Win:** make the 2048 tile. The game ends and the win message shows.
- **Lose:** the game ends when the board is full and no move is left. A full board is not over while two neighbouring tiles can still merge.
- **Score:** the score is the sum of every tile on the board, shown live in the sidebar. It updates after each move and after each shift (see below), so it can go down as well as up.
- **Game over:** the screen dims and large "Game over" (or "You win!") text appears, with a **New game** button beneath it. The box stays until you start a new game.

### Animations

- Tiles **slide** to their new cells. Key presses are ignored until the slide ends, so you cannot outrun the animation.
- Merged tiles and new tiles **pop** into place once the slide ends.
- Every value has its own colour, from 2 in green up through 2048 in white. The number in each tile is scaled so it always fits inside the tile.
- If your system is set to *reduce motion*, the animations are switched off.

### Shifting tiles

Once a **128** tile has appeared in a game, the board becomes unstable. After every **5th move**, each tile on the board has a chance to **shift** to the value one step above or below its own (for example 8 becomes 4 or 16).

- The chance a tile shifts is **1 / value**, so low tiles change often and high tiles rarely.

  | Tile | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 |
  | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
  | Chance per shift round | 50% | 25% | 12.5% | 6.3% | 3.1% | 1.6% | 0.8% | 0.4% | 0.2% | 0.1% |

- Up or down is chosen at random. A tile never goes below 2 (so a 2 can only go up) or above the winning tile (so the winning tile could only go down).
- Shifting tiles wobble, flash, and change value halfway through the animation. The score is updated when the new values are applied.
- A shift can make a move possible again, or leave the board with none, so the game-over check runs after every shift.
- The count of moves and the "reached 128" condition both reset with each new game.

### Leaderboard

When a game ends, its score is saved to a top-5 leaderboard in the sidebar. Scores are kept **per board size** (so a 3×5 game does not compete with a 4×4 game) in the browser's `localStorage`, so they stay on that browser on that machine and survive reloads. Clearing site data clears the leaderboard.

### Fonts

The game uses the retro **Press Start 2P** pixel font by default. The **Font** menu in the sidebar switches to **Montserrat** or **Source Sans**, and your choice is remembered. All fonts live in `web-app/browser/assets/fonts/` and are loaded by `style.css`.

## Configuring the game

Nothing about the board is hard-coded in the code.

- **Board size:** add `rows` and `cols` to the address, for example <http://localhost:8080/?rows=3&cols=5>. Any whole number from 1 to 12 works, the board does not need to be square, and the layout resizes to fit. Anything invalid falls back to the default size.
- **Game rules:** `Twenty_forty_eight.rules` in `web-app/common/game.js` holds the default board size, the number of starting tiles, the values a new tile can take, the winning tile, and the shifting rule (`morph_from` and `morph_every`). The browser reads these too, including the numbers quoted in the sidebar text, so changing one changes the game and its instructions together.
- **Animation lengths and leaderboard size:** the animation lengths are constants at the top of `web-app/browser/main.js`, and the number of saved scores is `Leaderboard.size` in `web-app/browser/leaderboard.js`.
- **Server port:** set the `PORT` environment variable, for example `PORT=3000 npm start`.

## Project structure

| Path | Purpose |
| --- | --- |
| `web-app/common/game.js` | The game module (`Twenty_forty_eight`): rules, sliding and merging, win and lose checks, shifting tiles. Documented with JSDoc and independent of the browser |
| `web-app/browser/index.html` | The page |
| `web-app/browser/style.css` | The look: retro theme, board layout, animations, fonts |
| `web-app/browser/main.js` | Page logic: draws the board, handles keys, runs the animations, shows the game over box |
| `web-app/browser/leaderboard.js` | Saving and ranking scores per board size |
| `web-app/browser/local_store.js` | Safe wrapper around `localStorage` (used by the leaderboard and the font choice) |
| `web-app/browser/assets/` | `favicon.svg` and `fonts/` |
| `web-app/server/server.js` | Express server for the browser files, the game module and the docs |
| `web-app/tests/game.test.js` | Mocha tests for the game module |
| `docs/` | Generated API documentation (do not edit by hand) |
| `jsdoc.json` | JSDoc settings |

## Tech stack

- **Language:** JavaScript (ES modules)
- **Front end:** plain HTML5, CSS and browser JavaScript, with no framework or bundler
- **Server:** Node.js with Express
- **Testing:** Mocha with Node's built-in `assert`
- **Docs:** JSDoc with the Docdash template

## Dependencies

| Package | Use |
| --- | --- |
| [express](https://expressjs.com/) | Serves the static front end, `/common` and `/docs` |
| [mocha](https://mochajs.org/) (dev) | Test runner |
| [jsdoc](https://jsdoc.app/) (dev) | Generates the API documentation |
| [docdash](https://github.com/clenemt/docdash) and [taffydb](https://www.npmjs.com/package/taffydb) (dev) | JSDoc template and its dependency |

The fonts are [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), [Montserrat](https://fonts.google.com/specimen/Montserrat) and [Source Sans Pro](https://fonts.google.com/specimen/Source+Sans+3), all under the SIL Open Font License.

## Getting started

```sh
npm install
npm start
```

Then open <http://localhost:8080>.

### Run the tests

```sh
npm test
```

### Generate the API docs

```sh
npm run docs
```

The docs are served at <http://localhost:8080/docs/> while the server runs.

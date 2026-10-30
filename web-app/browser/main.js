import Twenty_forty_eight from "./common/2048.js";

const board_rows = 4;
const board_cols = 4;
const leaderboard_key = "2048_leaderboard";
const leaderboard_size = 5;
// Animation lengths. Key presses are ignored until they have all ended.
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const slide_ms = calm ? 0 : 120;
const pop_ms = calm ? 0 : 160;
const morph_ms = calm ? 0 : 500;
// Once a tile of morph_from exists, tiles may shift every morph_every moves.
const morph_from = 128;
const morph_every = 5;

const score_box = document.getElementById("Total_score");
const leaderboard_list = document.getElementById("leaderboard");
const slot_layer = document.getElementById("slots");
const tile_layer = document.getElementById("tiles");
const result_dialog = document.getElementById("result_dialog");
const result_text = document.getElementById("result_text");
const new_game_button = document.getElementById("new_game");

// ponytail: the stylesheet sizes the board as a square, so rows must equal cols.
document.documentElement.style.setProperty("--grid-cols", board_cols);
document.documentElement.style.setProperty("--slide", `${slide_ms}ms`);
document.documentElement.style.setProperty("--pop", `${pop_ms}ms`);
document.documentElement.style.setProperty("--morph", `${morph_ms}ms`);

const range = (n) => Array.from({"length": n}, (ignore, k) => k);

const place = function(element, row, col){
    element.style.setProperty("--r", row);
    element.style.setProperty("--c", col);
};

range(board_rows).forEach(function(row){
    range(board_cols).forEach(function(col){
        const slot = document.createElement("div");
        slot.className = "slot";
        place(slot, row, col);
        slot_layer.append(slot);
    });
});

// ponytail: score = sum of tiles; the engine does not track merge points.
const score_of = (b) => b.flat().reduce((sum, tile) => sum + tile, 0);

const load_scores = function(){
    try {
        return JSON.parse(localStorage.getItem(leaderboard_key)) || [];
    } catch (ignore) {
        return [];
    }
};

const show_leaderboard = function(){
    leaderboard_list.replaceChildren(...load_scores().map(function(s){
        const li = document.createElement("li");
        li.textContent = s;
        return li;
    }));
};

const record_score = function(score){
    const scores = load_scores().concat(score)
        .sort((a, b) => b - a).slice(0, leaderboard_size);
    try {
        localStorage.setItem(leaderboard_key, JSON.stringify(scores));
    } catch (ignore) {
        // storage unavailable: leaderboard just does not persist
    }
    show_leaderboard();
};

let board;
let tiles_at = []; // the tile element at each board position
let busy = false; // true while a move animates
let move_count = 0;
let reached_morph_from = false;

const tiers = 15; // colours defined for 2^1..2^15, then they cycle
function paint(tile, value) {
    tile.dataset.tier = (Math.log2(value) - 1) % tiers + 1;
    tile.style.setProperty("--digits", Math.max(4, String(value).length));
    tile.textContent = value;
}
const key = ([row, col]) => `${row},${col}`;

const filled = (b) => b.flatMap((row, r) => row.flatMap(
    (tile, c) => (tile === 0 ? [] : [[r, c]])
));

// Rebuilds every tile from the board. Tiles at `popped` positions pop in.
const render = function(popped){
    tiles_at = board.map((row, r) => row.map(function(value, c){
        if (value === 0) {
            return undefined;
        }
        const tile = document.createElement("div");
        tile.className = popped.has(key([r, c])) ? "tile pop" : "tile";
        paint(tile, value);
        place(tile, r, c);
        return tile;
    }));
    tile_layer.replaceChildren(...tiles_at.flat().filter(Boolean));
    score_box.value = score_of(board);
};

const start_game = function(){
    board = Twenty_forty_eight.start_board(board_cols, board_rows);
    move_count = 0;
    reached_morph_from = false;
    busy = false;
    result_dialog.close();
    render(new Set(filled(board).map(key)));
};

const directions = {
    "ArrowDown": "down",
    "ArrowLeft": "left",
    "ArrowRight": "right",
    "ArrowUp": "up"
};

const conclude = function(){
    busy = false;
    if (Twenty_forty_eight.game_ended(board)) {
        record_score(score_of(board));
        result_text.textContent = (
            Twenty_forty_eight.game_won(board)
            ? "You win!"
            : "Game over"
        );
        result_dialog.showModal();
    }
};

// Shifts random tiles up or down a value. The board changes at once, but
// each tile shows its old value until halfway through its wobble.
const morph_tiles = function(){
    const mutated = Twenty_forty_eight.mutate_tiles(board);
    board = mutated.board;
    if (mutated.changes.length === 0) {
        conclude();
        return;
    }
    const changed = mutated.changes.map(
        (change) => ({"change": change, "tile": tiles_at[change.at[0]][change.at[1]]})
    );
    changed.forEach(function({tile}){
        tile.classList.remove("pop");
        tile.classList.add("morph");
    });
    setTimeout(function(){
        changed.forEach(function({change, tile}){
            paint(tile, change.to);
        });
        score_box.value = score_of(board);
    }, morph_ms / 2);
    setTimeout(conclude, morph_ms);
};

const finish_move = function(next, popped){
    board = next;
    move_count += 1;
    render(popped);
    reached_morph_from = (
        reached_morph_from || board.flat().some((tile) => tile >= morph_from)
    );
    if (
        reached_morph_from &&
        move_count % morph_every === 0 &&
        !Twenty_forty_eight.game_ended(board)
    ) {
        setTimeout(morph_tiles, pop_ms);
    } else {
        conclude();
    }
};

document.onkeydown = function(event){
    const direction = directions[event.key];
    if (direction === undefined) {
        return;
    }
    event.preventDefault();
    if (busy || Twenty_forty_eight.game_ended(board)) {
        return;
    }
    const next = Twenty_forty_eight.make_ply(board, direction);
    if (next === board) {
        return; // no tile can move that way
    }
    const moves = Twenty_forty_eight.tile_moves(board, direction);
    // Merged tiles and the newly spawned tile pop in once the slide ends.
    const landed = new Set(moves.map((move) => key(move.to)));
    const popped = new Set(
        moves.filter((move) => move.merged).map((move) => key(move.to))
    );
    filled(next).map(key).filter((k) => !landed.has(k)).forEach(
        (k) => popped.add(k)
    );
    busy = true;
    moves.forEach(function(move){
        const [from_row, from_col] = move.from;
        place(tiles_at[from_row][from_col], ...move.to);
    });
    setTimeout(finish_move, slide_ms, next, popped);
};

new_game_button.onclick = start_game;

// The game over box cannot be dismissed (e.g. Esc) without a new game.
result_dialog.onclose = function(){
    if (Twenty_forty_eight.game_ended(board)) {
        result_dialog.showModal();
    }
};

start_game();
show_leaderboard();

/**
 * 2048.js is a module to model and play "2048" and related games.
 * @namespace Twenty_forty_eight
 * @author Conall Templeman
 * @version 2022
 */

const Twenty_forty_eight = Object.create(null);

/**
 * A Board is a rectangular grid that tiles are generated into.
 * Tiles fill up empty positions randomly after every move.
 * It is implemented as an array of rows (rather than columns) of values
 * (or empty positions)
 * @memberof Twenty_forty_eight
 * @typedef {Twenty_forty_eight.Tile_or_empty[][]} Board
 */

/**
 * A tile is a value that can exist in the grid
 * @memberof Twenty_forty_eight
 * @typedef {(2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048)} Tile
 */

/**
 * Either a tile or an empty position.
 * @memberof Twenty_forty_eight
 * @typedef {(Twenty_forty_eight.Tile | 0)} Tile_or_empty
 */

/**
 * Create a new start board.
 * Tiles have been randomly generated into two of the slots,
 * with eother values of 2 or 4
 * Optionally with a specified width and height,
 * otherwise returns a standard 4 wide, 4 high board.
 * @memberof Twenty_forty_eight
 * @function
 * @param {number} [width = 4] The width of the new board.
 * @param {number} [height = 4] The height of the new board.
 */

Twenty_forty_eight.start_board = function(rows, cols){
    const empty_board = Twenty_forty_eight.empty_board(4, 4);
    return generate_start_tiles(empty_board);
};

/**
 * A ply is one turn taken by one of the players.
 * Return a new board after a player shifts all the tiles in one direction.
 * @memberof Twenty_forty_eight
 * @function
 * @param {Twenty_forty_eight.Tile} tile The token to be added to the board.
 * @param {number} direction The direction the player moves the tiles
 * @param {Twenty_forty_eight.Board} board The board state that the ply is made on.
 * @returns {(Twenty_forty_eight.Board | undefined)} If the ply was legal,
 *   return the new board, otherwise return `undefined`.
 */

Twenty_forty_eight.make_ply = function(board, direction){
    if (Twenty_forty_eight.game_ended(board) === true){
        return undefined;
    }
    const moved = move_tiles(board, direction);
    if (moved === undefined){
        return board;
    }
    //updates list of free tiles after moving
    return generate_tiles(moved.board);
};

/**
 * Returns if a game has ended,
 * either because a player has won or the board is full.
 * @memberof Twenty_forty_eight
 * @function
 * @param {Twenty_forty_eight.Board} board The board to test.
 * @returns {boolean} Whether the game has ended.
 */

Twenty_forty_eight.game_ended = function(board){
    return (
        Twenty_forty_eight.game_won(board) ||
        ["left", "right", "up", "down"].every(
            (direction) => move_tiles(board, direction) === undefined
        )
    );
};

/**
 * Create a new empty board.
 * Optionally with a specified width and height,
 * otherwise returns a standard 4 wide, 4 high board.
 * @memberof Twenty_forty_eight
 * @function
 * @param {number} [width = 4] The width of the new board.
 * @param {number} [height = 4] The height of the new board.
 */

//hard coded at the moment so that it works
//the game is written in such a way that, if different rows and cols,
//are predefined, it will still work
Twenty_forty_eight.empty_board = function(rows = 4, cols = 4){
    return [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    //return R.repeat(R.repeat(0, cols), rows);
};

//returns row, column arrays of free spaces
const free_tiles = function(board){
    let frees = [];
    board.flatMap(function(rows, row_index){
        rows.map(function(val, col_index){
            if (val === 0){
                frees.push([row_index, col_index]);
            }
        });
    });
    return frees;
};

//returns arrays of filled tiles row, column pairs
const filled_tiles = function(board){
    let filled = [];
    board.flatMap(function(rows, row_index){
        rows.map(function(val, col_index){
            if (val !== 0){
                filled.push([row_index, col_index]);
            }
        });
    });
    return filled;
};

const random_tile_val = function(){
    return (Math.round(Math.random()) + 1) * 2;
};

const random_position = function(board){
    const frees = free_tiles(board);
    const position = Math.floor(Math.random() * (frees.length));
    return frees[position];
};

const generate_tiles = function(board){
    const random_place = random_position(board);
    const tile_row = random_place[0];
    const tile_col = random_place[1];
    board[tile_row][tile_col] = random_tile_val();
    return board;
};

//works
const generate_start_tiles = function(board){
    const board1 = generate_tiles(board);
    const board2 = generate_tiles(board1);
    return board2;
};

/**
 * Returns if the board is in a winning state,
 * a board is winning if the 2048 tile exists in it
 * @memberof Twenty_forty_eight
 * @function
 * @param {number} tile Which player to check has a win.
 * @param {Twenty_forty_eight.Board} board The board to check.
 * @returns {boolean} Returns if the board is in a winning state
 * for the specified player.
 */

Twenty_forty_eight.game_won = function(board){
    return board.some(function(rows){
        //if (R.includes(2048, rows)){
        if (rows.includes(2048)){
            return true;
        } else {
            return false;
        }
    });
};

const valid_move = function(board1, board2) {
    if (board1.join() === board2.join()){
        return false;
    } else {
        return true;
    }
};

//Slides one line of values towards index 0. A tile merges at most once.
//Returns the new line and where each original tile ends up in it.
const slide_line = function(line){
    const slid = [];
    const moves = [];
    line.forEach(function(value, from){
        if (value === 0){
            return;
        }
        const last = slid[slid.length - 1];
        if (last !== undefined && last.value === value && !last.merged){
            last.value *= 2;
            last.merged = true;
        } else {
            slid.push({"value": value, "merged": false});
        }
        moves.push({"from": from, "to": slid.length - 1});
    });
    return {
        "line": line.map((ignore, index) => (
            slid[index] === undefined ? 0 : slid[index].value
        )),
        "moves": moves.map((move) => ({
            "from": move.from,
            "to": move.to,
            "merged": slid[move.to].merged
        }))
    };
};

//Board position of index i along line l, counting from the side
//that the tiles slide towards.
const line_cell = {
    "down": (l, i, length) => [length - 1 - i, l],
    "left": (l, i) => [l, i],
    "right": (l, i, length) => [l, length - 1 - i],
    "up": (l, i) => [i, l]
};

//Returns the board after sliding and the moves of each tile,
//or undefined if the slide would change nothing.
const move_tiles = function(board, direction){
    const cell = line_cell[direction];
    if (cell === undefined){
        return undefined;
    }
    const horizontal = direction === "left" || direction === "right";
    const line_count = horizontal ? board.length : board[0].length;
    const length = horizontal ? board[0].length : board.length;
    const new_board = board.map((row) => row.map(() => 0));
    const moves = [];
    for (let l = 0; l < line_count; l += 1){
        const line = Array.from({"length": length}, function(ignore, i){
            const [row, col] = cell(l, i, length);
            return board[row][col];
        });
        const slid = slide_line(line);
        slid.line.forEach(function(value, i){
            const [row, col] = cell(l, i, length);
            new_board[row][col] = value;
        });
        slid.moves.forEach(function(move){
            moves.push({
                "from": cell(l, move.from, length),
                "merged": move.merged,
                "to": cell(l, move.to, length)
            });
        });
    }
    if (valid_move(new_board, board) === false){
        return undefined;
    }
    return {"board": new_board, "moves": moves};
};

/**
 * Describes how each tile slides in a ply, before the new tile appears.
 * @memberof Twenty_forty_eight
 * @function
 * @param {Twenty_forty_eight.Board} board The board the ply is made on.
 * @param {string} direction "left", "right", "up" or "down".
 * @returns {{from: number[], to: number[], merged: boolean}[]} One entry per
 *   tile: its [row, column] before and after, and whether it merges there.
 *   Empty if the ply would change nothing.
 */
Twenty_forty_eight.tile_moves = function(board, direction){
    const moved = move_tiles(board, direction);
    return moved === undefined ? [] : moved.moves;
};

/**
 * Randomly shifts tiles to the value one step above or below their own.
 * A tile of value v shifts with probability 1 / v, so low tiles change often
 * and the highest tile rarely. A tile never goes below 2 or above 2048.
 * @memberof Twenty_forty_eight
 * @function
 * @param {Twenty_forty_eight.Board} board The board to shift tiles on.
 * @param {function} [random = Math.random] Returns a number in [0, 1).
 * @returns {{board: Twenty_forty_eight.Board,
 *   changes: {at: number[], from: number, to: number}[]}} A new board and
 *   the tiles that changed.
 */
Twenty_forty_eight.mutate_tiles = function(board, random = Math.random){
    const changes = [];
    const new_board = board.map((row, r) => row.map(function(value, c){
        if (value === 0 || random() >= 1 / value){
            return value;
        }
        const options = [value / 2, value * 2].filter(
            (option) => option >= 2 && option <= 2048
        );
        const to = options[Math.floor(random() * options.length)];
        changes.push({"at": [r, c], "from": value, "to": to});
        return to;
    }));
    return {"board": new_board, "changes": changes};
};

/**
 * Returns the size of a board as an array of [width, height].
 * @memberof Twenty_forty_eight
 * @function
 * @param {Twenty_forty_eight.Board} board The board to check the size of.
 * @returns {number[]} The width and height of the board, [width, height].
 */
Twenty_forty_eight.board_size = function(board) {
    return [board.length, board[0].length];
};

Twenty_forty_eight.start_board();

export default Object.freeze(Twenty_forty_eight);

//writing without ramda
//1. write a trasnpose function
//2. write a reverse board function
//3. write an includes function
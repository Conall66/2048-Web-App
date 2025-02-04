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
    if (move_tiles(board, direction) === undefined){
        return board;
    } else {
        const new_board = move_tiles(board, direction);
        //updates list of free tiles after moving
        return generate_tiles(new_board);
    }
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
        board_full(board) ||
        Twenty_forty_eight.game_won(board)
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

//works
const board_full = function(board){
    if (free_tiles(board).length === 0){
        return true;
    } else {
        return false;
    }
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

const strip_zeros = (board) => (board.map((row) => row.filter((n) => n !== 0)));

//works
const merge_tiles_left = function(board){
    const board_no_zeros = strip_zeros(board);
    board_no_zeros.forEach(function(rows, row_index){
        rows.forEach(function(val, col_index){
            if (val === rows[col_index - 1]){
                rows[col_index - 1] = rows[col_index] + rows[col_index - 1];
                rows[col_index] = 0;
            }
        });
    });
    return strip_zeros(board_no_zeros);
};

const moved_left = function(board){
    const initial_length = board.length;
    const merged_board = merge_tiles_left(board);
    return merged_board.map((rows) => rows.concat(new Array(initial_length - rows.length).fill(0)));
};

const board_flip = function(board){
    return board.map(function(rows){
        //return R.reverse(rows);
        return rows.reverse();
    });
};

const valid_move = function(board1, board2) {
    if (board1.join() === board2.join()){
        return false;
    } else {
        return true;
    }
};

const transpose = (board) => board[0].map((_, colIndex) => board.map((row) => row[colIndex]));

const move_tiles = function(board, direction){
    if (direction === "left"){
        const left = moved_left(board);
        if (valid_move(left, board) === true){
            return left;
        }
    }
    if (direction === "right"){
        const flipped_once = board_flip(board);
        const left_merged = moved_left(flipped_once);
        const flipped_again = board_flip(left_merged);
        if (valid_move(flipped_again, board) === true){
            return flipped_again;
        }
    }
    if (direction === "up"){
        //const up = R.transpose(moved_left(R.transpose(board)));
        const up = transpose(moved_left(transpose(board)));
        if (valid_move(up, board) === true){
            return up;
        }
    }
    if (direction === "down"){
        //const down = R.transpose(move_tiles(R.transpose(board), "right"));
        const down = transpose(move_tiles(transpose(board), "right"));
        if (valid_move(down, board) === true){
            return down;
        }
    }
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
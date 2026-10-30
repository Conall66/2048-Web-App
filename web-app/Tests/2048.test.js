import Twenty_forty_eight from "../common/2048.js";
import R from "../common/ramda.js";

const DISPLAY_MODE = "to_string";

const display_functions = {
    "json": JSON.stringify
};

//encase you want to use emojis to represent tiles instead,
//write a funtion in the API to be called by display functions
const display_board = function (board) {
    try {
        return "\n" + display_functions[DISPLAY_MODE](board);
    } catch (ignore) {
        return "\n" + JSON.stringify(board);
    }
};

/**
 * Returns if the board is in a valid state.
 * A board is valid if all the following are true:
 * - The board is a rectangular 2d array containing only integer powers of 2.
 * @memberof Twenty_forty_eight.test
 * @function
 * @param {Board} board The board to test.
 * @throws if the board fails any of the above conditions.
 */

const throw_if_invalid = function (board) {
    // Rectangular array.
    if (!Array.isArray(board) || !Array.isArray(board[0])) {
        throw new Error(
            "The board is not a 2D array: " + display_board(board)
        );
    }
    const height = board[0].length;
    const rectangular = R.all(
        (column) => column.length === height,
        board
    );
    if (!rectangular) {
        throw new Error(
            "The board is not rectangular: " + display_board(board)
        );
    }
    // Only valid tokens
    const tile_or_empty = [0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
    const contains_valid_tiles = R.pipe(
        R.flatten,
        R.all((slot) => tile_or_empty.includes(slot))
    )(board);
    if (!contains_valid_tiles) {
        throw new Error(
            "The board contains invalid tokens: " + display_board(board)
        );
    }
};

describe("Empty Board", function () {
    it("An empty board is a valid board", function () {
        const empty_board = Twenty_forty_eight.empty_board();
        throw_if_invalid(empty_board);
    });
    it("An empty board is not ended.", function () {
        const empty_board = Twenty_forty_eight.empty_board();
        if (Twenty_forty_eight.game_ended(empty_board)) {
            throw new Error(
                "An empty board should not be ended: " +
                display_board(empty_board)
            );
        }
    });
    it("An empty board has all free tiles", function () {
        const empty_board = Twenty_forty_eight.empty_board();
        const all_free_slots = R.pipe(
            R.flatten,
            R.all(R.equals(0))
        )(empty_board);
        if (!all_free_slots) {
            throw new Error(
                "The empty board has filled slots: " +
                display_board(empty_board)
            );
        }
    });
});

/**
 * This function  will throw if,
 * - The 2048 tile is made and the game is not ended
 * - The board is full and the game does not end
 * @memberof Twenty_forty_eight.test
 * @function
 * @param {Board} board The board to test.
 * @throws if the board fails any of the above conditions.
 */

const throw_if_not_ended = function (ended_board) {
    if (!Twenty_forty_eight.game_ended(ended_board)) {
        throw new Error(
            "An ended board is not being reported as ended: " +
            display_board(ended_board)
        );
    }
};

describe("Ended boards", function () {
    it("A full board with no legal moves should be ended", function () {
        const ended_board = [
            [
                [2, 4, 2, 4],
                [4, 2, 4, 2],
                [2, 4, 2, 4],
                [4, 2, 4, 2]
            ]
        ];
        ended_board.forEach(throw_if_not_ended);
    });
    it("A full board with a legal move should not be ended", function () {
        const board = [
            [2, 2, 2, 2],
            [2, 2, 2, 2],
            [2, 2, 2, 2],
            [2, 2, 2, 2]
        ];
        if (Twenty_forty_eight.game_ended(board)) {
            throw new Error("A board with legal moves was reported as ended");
        }
    });
    it(
        `A board with a 2048 tile present,
should be ended in a win`,
        function () {
            const highest_val_present = [
                [0, 0, 0, 0],
                [0, 0, 2048, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            if (
                !Twenty_forty_eight.game_ended(highest_val_present) ||
                !Twenty_forty_eight.game_won(highest_val_present)
            ) {
                throw new Error(
                    `A board with a winning configuration,
should be marked as won
${display_board(highest_val_present)}`
                );
            }
        }
    );
});
describe("Mutating tiles", function () {
    it("shifts tiles chosen by the probability 1 / value", function () {
        const board = [
            [2, 0, 0, 0],
            [0, 128, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 2048]
        ];
        // A roll below 1 / 2048 shifts every tile, picking the lower option
        // first, except that a 2 can only go up and a 2048 only down.
        const result = Twenty_forty_eight.mutate_tiles(board, () => 0.0001);
        if (
            result.board[0][0] !== 4 ||
            result.board[1][1] !== 64 ||
            result.board[3][3] !== 1024
        ) {
            throw new Error("Tiles were not shifted as expected");
        }
        // A roll of 0.01 shifts the 2 but not the 128 (1/128 is below 0.01).
        const partial = Twenty_forty_eight.mutate_tiles(board, () => 0.01);
        if (partial.board[1][1] !== 128 || partial.board[0][0] !== 4) {
            throw new Error("Shift probability is not inversely proportional");
        }
        const held = Twenty_forty_eight.mutate_tiles(board, () => 0.9);
        if (held.changes.length !== 0) {
            throw new Error("Tiles shifted when they should not have");
        }
        if (board[0][0] !== 2) {
            throw new Error("The original board was changed");
        }
    });
});

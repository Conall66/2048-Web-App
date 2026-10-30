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
    it("A board with no free elements should be ended", function () {
        const ended_board = [
            [
                [2, 2, 2, 2],
                [2, 2, 2, 2],
                [2, 2, 2, 2],
                [2, 2, 2, 2]
            ]
        ];
        ended_board.forEach(throw_if_not_ended);
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
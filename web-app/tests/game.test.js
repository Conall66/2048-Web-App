import assert from "node:assert/strict";
import Twenty_forty_eight from "../common/game.js";

const {rules} = Twenty_forty_eight;

const display_board = (board) => "\n" + JSON.stringify(board);

const filled_count = (board) => board.flat().filter((tile) => tile !== 0).length;

const sum_of = (board) => board.flat().reduce((sum, tile) => sum + tile, 0);

/**
 * Throws if the board is not valid.
 * A board is valid if it is a rectangular 2d array containing only 0
 * and integer powers of 2.
 * @param {Twenty_forty_eight.Board} board The board to test.
 * @throws if the board fails the condition above.
 */
const throw_if_invalid = function (board) {
    assert.ok(
        Array.isArray(board) && Array.isArray(board[0]),
        "The board is not a 2D array: " + display_board(board)
    );
    assert.ok(
        board.every((row) => row.length === board[0].length),
        "The board is not rectangular: " + display_board(board)
    );
    assert.ok(
        board.flat().every((tile) => tile === 0 || (
            Number.isInteger(Math.log2(tile)) && tile >= 2
        )),
        "The board contains invalid tiles: " + display_board(board)
    );
};

describe("Empty board", function () {
    it("is a valid board", function () {
        throw_if_invalid(Twenty_forty_eight.empty_board());
    });
    it("is not ended", function () {
        assert.equal(
            Twenty_forty_eight.game_ended(Twenty_forty_eight.empty_board()),
            false
        );
    });
    it("has all free tiles", function () {
        assert.equal(filled_count(Twenty_forty_eight.empty_board()), 0);
    });
    it("defaults to the size in the rules", function () {
        assert.deepEqual(
            Twenty_forty_eight.board_size(Twenty_forty_eight.empty_board()),
            [rules.rows, rules.cols]
        );
    });
    it("can be any positive size", function () {
        const board = Twenty_forty_eight.empty_board(3, 6);
        assert.deepEqual(Twenty_forty_eight.board_size(board), [3, 6]);
        throw_if_invalid(board);
    });
    it("rejects sizes that are not positive whole numbers", function () {
        [[0, 4], [4, -1], [2.5, 4], ["4", 4]].forEach(function ([rows, cols]) {
            assert.throws(
                () => Twenty_forty_eight.empty_board(rows, cols),
                RangeError
            );
        });
    });
});

describe("Start board", function () {
    it("has the starting number of tiles", function () {
        const board = Twenty_forty_eight.start_board();
        throw_if_invalid(board);
        assert.equal(filled_count(board), rules.start_tiles);
    });
    it("only uses the values new tiles can take", function () {
        Twenty_forty_eight.start_board().flat().filter(
            (tile) => tile !== 0
        ).forEach(function (tile) {
            assert.ok(rules.new_tile_values.includes(tile));
        });
    });
    it("takes any size, and never holds more tiles than it has room for", function () {
        const board = Twenty_forty_eight.start_board(5, 3);
        assert.deepEqual(Twenty_forty_eight.board_size(board), [5, 3]);
        assert.equal(filled_count(Twenty_forty_eight.start_board(1, 1)), 1);
    });
});

describe("Ended boards", function () {
    it("A full board with no legal moves should be ended", function () {
        const board = [
            [2, 4, 2, 4],
            [4, 2, 4, 2],
            [2, 4, 2, 4],
            [4, 2, 4, 2]
        ];
        assert.equal(Twenty_forty_eight.game_ended(board), true);
    });
    it("A full board with a legal move should not be ended", function () {
        const horizontal = [
            [2, 2, 2, 2],
            [2, 2, 2, 2],
            [2, 2, 2, 2],
            [2, 2, 2, 2]
        ];
        const vertical_only = [
            [2, 4, 2, 4],
            [2, 8, 4, 2],
            [4, 2, 4, 8],
            [2, 4, 2, 4]
        ];
        assert.equal(Twenty_forty_eight.game_ended(horizontal), false);
        assert.equal(Twenty_forty_eight.game_ended(vertical_only), false);
    });
    it("A board with the winning tile present should be ended in a win", function () {
        const board = Twenty_forty_eight.empty_board();
        board[1][2] = rules.win_tile;
        assert.equal(Twenty_forty_eight.game_ended(board), true);
        assert.equal(Twenty_forty_eight.game_won(board), true);
    });
    it("A board without the winning tile is not won", function () {
        assert.equal(
            Twenty_forty_eight.game_won(Twenty_forty_eight.empty_board()),
            false
        );
    });
});

describe("Making a ply", function () {
    it("slides and merges tiles, then adds one new tile", function () {
        const board = [
            [2, 2, 4, 4],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        const next = Twenty_forty_eight.make_ply(board, "left");
        assert.deepEqual(next[0].slice(0, 2), [4, 8]);
        assert.equal(filled_count(next), 3);
    });
    it("slides in every direction, on boards that are not square", function () {
        const board = Twenty_forty_eight.empty_board(2, 4);
        board[0][0] = 2;
        const place = (direction) => Twenty_forty_eight.make_ply(
            board.map((row) => [...row]),
            direction
        );
        // The first tile moves; the second, random, tile may land anywhere.
        assert.equal(place("right")[0][3], 2);
        assert.equal(place("down")[1][0], 2);
        assert.deepEqual(place("left"), board);
        assert.deepEqual(place("up"), board);
    });
    it("does not change the board it is given", function () {
        const board = [
            [2, 0, 0, 2],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        const before = JSON.stringify(board);
        Twenty_forty_eight.make_ply(board, "right");
        assert.equal(JSON.stringify(board), before);
    });
    it("returns the same board when no tile can move that way", function () {
        const board = [
            [2, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        assert.equal(Twenty_forty_eight.make_ply(board, "left"), board);
        assert.equal(Twenty_forty_eight.make_ply(board, "up"), board);
    });
    it("returns undefined once the game has ended", function () {
        const board = Twenty_forty_eight.empty_board();
        board[0][0] = rules.win_tile;
        assert.equal(Twenty_forty_eight.make_ply(board, "left"), undefined);
    });
});

describe("Tile moves", function () {
    it("reports where each tile goes and which merge", function () {
        const board = [
            [2, 2, 0, 4],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        assert.deepEqual(Twenty_forty_eight.tile_moves(board, "left"), [
            {"from": [0, 0], "merged": true, "to": [0, 0]},
            {"from": [0, 1], "merged": true, "to": [0, 0]},
            {"from": [0, 3], "merged": false, "to": [0, 1]}
        ]);
    });
    it("is empty when the ply would change nothing", function () {
        const board = Twenty_forty_eight.empty_board();
        board[0][0] = 2;
        assert.deepEqual(Twenty_forty_eight.tile_moves(board, "left"), []);
    });
});

describe("Mutating tiles", function () {
    const board = [
        [2, 0, 0, 0],
        [0, 128, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, rules.win_tile]
    ];
    it("shifts tiles chosen by the probability 1 / value", function () {
        // A roll below 1 / win_tile shifts every tile, picking the lower
        // option first. The smallest tile can only go up, the winning tile
        // only down.
        const result = Twenty_forty_eight.mutate_tiles(board, () => 1e-9);
        assert.equal(result.board[0][0], 4);
        assert.equal(result.board[1][1], 64);
        assert.equal(result.board[3][3], rules.win_tile / 2);
        assert.equal(result.changes.length, 3);
    });
    it("shifts low tiles more often than high ones", function () {
        // A roll of 0.01 shifts the 2 but not the 128 (1 / 128 is below it).
        const result = Twenty_forty_eight.mutate_tiles(board, () => 0.01);
        assert.equal(result.board[0][0], 4);
        assert.equal(result.board[1][1], 128);
    });
    it("changes nothing when every roll is high", function () {
        const result = Twenty_forty_eight.mutate_tiles(board, () => 0.9999);
        assert.equal(result.changes.length, 0);
        assert.equal(sum_of(result.board), sum_of(board));
    });
    it("does not change the board it is given", function () {
        Twenty_forty_eight.mutate_tiles(board, () => 0);
        assert.equal(board[0][0], 2);
    });
});

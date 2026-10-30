import Local_store from "./local_store.js";

/**
 * Leaderboard keeps the best scores for each board size on this machine.
 * @namespace Leaderboard
 */
const Leaderboard = Object.create(null);

/**
 * How many scores are kept for each board size.
 * @memberof Leaderboard
 * @type {number}
 */
Leaderboard.size = 5;

const key = (rows, cols) => `2048_leaderboard_${rows}x${cols}`;

/**
 * @memberof Leaderboard
 * @function
 * @param {number} rows The number of rows of the board played on.
 * @param {number} cols The number of columns of the board played on.
 * @returns {number[]} The saved scores, best first.
 */
Leaderboard.scores = function (rows, cols) {
    const saved = Local_store.load(key(rows, cols), []);
    return Array.isArray(saved) ? saved.filter(Number.isFinite) : [];
};

/**
 * Saves a finished game's score if it is among the best.
 * @memberof Leaderboard
 * @function
 * @param {number} score The score of the finished game.
 * @param {number} rows The number of rows of the board played on.
 * @param {number} cols The number of columns of the board played on.
 * @returns {number[]} The saved scores, best first.
 */
Leaderboard.record = function (score, rows, cols) {
    const scores = [...Leaderboard.scores(rows, cols), score]
        .sort((a, b) => b - a)
        .slice(0, Leaderboard.size);
    Local_store.save(key(rows, cols), scores);
    return scores;
};

export default Object.freeze(Leaderboard);

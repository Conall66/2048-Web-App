/**
 * Local_store reads and writes JSON values in the browser's localStorage.
 * Storage can be unavailable (private browsing, blocked site data), so
 * failures are ignored and values simply do not persist.
 * @namespace Local_store
 */
const Local_store = Object.create(null);

/**
 * @memberof Local_store
 * @function
 * @param {string} key The key the value was saved under.
 * @param {*} fallback Returned when nothing usable is saved.
 * @returns {*} The saved value, or the fallback.
 */
Local_store.load = function (key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
    } catch (ignore) {
        return fallback;
    }
};

/**
 * @memberof Local_store
 * @function
 * @param {string} key The key to save the value under.
 * @param {*} value A value that can be turned into JSON.
 */
Local_store.save = function (key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (ignore) {
        // storage unavailable: the value just does not persist
    }
};

export default Object.freeze(Local_store);

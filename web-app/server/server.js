/**
 * Static web server for the 2048 web app.
 * Serves the browser files, the game module they import, and the API docs.
 * Set the PORT environment variable to listen on a different port.
 * @author Conall Templeman
 * @version 2022
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import express from "express";
import config from "./config.js";

const port = process.env.PORT || 8080;
const web_app = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(web_app, "..", "docs");

const app = express();

const browser = path.join(web_app, "browser");
const index = fs.readFileSync(path.join(browser, "index.html"), "utf8")
    .replace("<html ", `<html data-font="${config.font}" `);

app.get("/", (ignore, res) => res.type("html").send(index));
app.use("/", express.static(browser));
app.use("/common/", express.static(path.join(web_app, "common")));
app.use("/docs/", express.static(docs));

app.listen(port, function () {
    console.log(`Listening on port ${port} – http://localhost:${port}`);
});

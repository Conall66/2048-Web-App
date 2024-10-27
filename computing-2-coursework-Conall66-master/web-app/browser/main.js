import Twenty_forty_eight from "./common/2048.js";
import Json_rpc from "./Json_rpc.js";

const board_rows = 4;
const board_cols = 4;

let Total_score = document.getElementById("Total_score");
let instructions = document.getElementById("instructions");

const Left_button = document.getElementById("Left_button");
const Right_button = document.getElementById("Right_button");
const Up_button = document.getElementById("Up_button");
const Down_button = document.getElementById("Down_button");

const intiial_board = Twenty_forty_eight.start_board(board_cols, board_rows)
let board = intiial_board;
console.log(board)

document.documentElement.style.setProperty("--grid-cols", board_cols);
document.documentElement.style.setProperty("--grid-rows", board_rows);

const grid = document.getElementById("board");

const result_dialog = document.getElementById("result_dialog");

const range = (n) => Array.from({"length": n}, (ignore, k) => k);

//builds a grid with a set number of rows and columns,
const all_cells = range(board_rows).map(function(row_index){
    const row_div = document.createElement("div");
    row_div.className = "row";
    const all_rows = range(board_cols).map(function(col_index){
        const cell = document.createElement("div");
        cell.className = "cell";
        row_div.append(cell);
        // if (Twenty_forty_eight.game_won(board) === true){
            
        // }
        return cell;
    });
    grid.append(row_div);
    return all_rows;
});

const update_board = function() {
    all_cells.forEach(function(rows, row_index){
        rows.forEach(function(vals, col_index){
            const tile = board[row_index][col_index];
            vals.classList.remove("empty");
            vals.classList.remove("small");
            vals.classList.remove("med");
            vals.classList.remove("high");
            vals.classList.remove("max");
            if (tile === 0){
                vals.classList.add("empty");
                vals.textContent = tile;
            } else if (tile === 2 || 4){
                vals.classList.add("small");
                vals.textContent = tile;
            } else if (tile === 8 || 16 || 32 || 64){
                vals.classList.add("med");
                vals.textContent = tile;
            } else if (tile === 128 || 256 || 512 || 1024){
                vals.classList.add("high");
                vals.textContent = tile;
            } else if (tile === 2048){
                vals.classList.add("max");
                vals.textContent = tile;
            }
        });
    });
};

update_board();
// console.log(Twenty_forty_eight.make_ply(board, "left"))

Left_button.onclick = function(board){
    let board1 = Twenty_forty_eight.make_ply(board, "left");
    board = board1;
    update_board();
    console.log(board);
};

Right_button.onclick = function(board){
    board = Twenty_forty_eight.make_ply(board, "right");
    update_board();
    console.log(board);
};

Up_button.onclick = function(board){
    board = Twenty_forty_eight.make_ply(board, "up");
    update_board();
    console.log(board);
};

Down_button.onclick = function(board){
    board = Twenty_forty_eight.make_ply(board, "down");
    update_board();
    console.log(board);
};

// board.onkeydown = function(event){
//     if (event.key === "ArrowLeft"){
//         return Left_button.onclick;
//     } if (event.key === "ArrowRight"){
//         return Right_button.onclick;
//     } if (event.key === "ArrowUp"){
//         return Up_button.onclick;
//     } if (event.key === "ArrowDown"){
//         return Down_button.onclick;
//     }
// };

// console.log(typeof board);


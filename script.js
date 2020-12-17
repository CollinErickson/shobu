
console.log("loaded script js")


var board = [[2,2,2,2,2,2,2,2],
			 [0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0],
			 [1,1,1,1,1,1,1,1],
			 [2,2,2,2,2,2,2,2],
			 [0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0],
			 [1,1,1,1,1,1,1,1]];
var team1_turn = true;

function parse_move(move) {
	if (move.length != 8 || move[2] != " " || move[5] != " ") {
		console.log("bad move!!!")
		return [false, "wrong format"];
	}
	// Make sure chars are ints
	if (!["1","2","3","4","5","6","7","0"].includes(move[0]) ||
	   !["1","2","3","4","5","6","7","0"].includes(move[1]) ||
	   !["1","2","3","4","5","6","7","0"].includes(move[3]) ||
	   !["1","2","3","4","5","6","7","0"].includes(move[4]) || 
		!["0","1","2","3","4"].includes(move[6]) || 
		!["0","1","2","3","4"].includes(move[7])) {
		return [false, "Not in valid range"];
	}
	//for (
	move2 = [parseInt(move[0]),
			parseInt(move[1]),
			parseInt(move[3]),
			parseInt(move[4]),
			parseInt(move[6]) - 2,
			parseInt(move[7]) - 2];
	return [true, move2];
}
console.log(parse_move("12 34411"))
console.log(parse_move("12 34 11"))


function is_valid(move) {
		if (board[move[0]][move[1]] != (team1_turn ? "1" : "2") || 
		   board[move[2]][move[3]] != (team1_turn ? "1" : "2")) {
			console.log("not valid!!", move);
			return false;
		}
	// Must stay on same subboard
	if (
		Math.floor(move[0] / 4) != Math.floor((move[0] + move[4]) / 4) || 
		Math.floor(move[1] / 4) != Math.floor((move[1] + move[5]) / 4) || 
		Math.floor(move[2] / 4) != Math.floor((move[2] + move[4]) / 4) || 
		Math.floor(move[3] / 4) != Math.floor((move[3] + move[5]) / 4)
	) {
		return false;
	}
	
	if (
		(move[0] == 0 && move[4] < 0) ||
		(move[0] == 7 && move[4] > 0) ||
		(move[1] == 0 && move[5] < 0) ||
		(move[1] == 7 && move[5] > 0) ||
		(move[2] == 0 && move[4] < 0) ||
		(move[2] == 7 && move[4] > 0) ||
		(move[3] == 0 && move[5] < 0) ||
		(move[3] == 7 && move[5] > 0) ||
		(move[0] == 4 && move[4] < 0) || // repeat for midpoints
		(move[0] == 3 && move[4] > 0) ||
		(move[1] == 4 && move[5] < 0) ||
		(move[1] == 3 && move[5] > 0) ||
		(move[2] == 4 && move[4] < 0) ||
		(move[2] == 3 && move[4] > 0) ||
		(move[3] == 4 && move[5] < 0) ||
		(move[3] == 3 && move[5] > 0)
	) {
		return false;
	}
	return true;
}
console.log("valid test", is_valid(parse_move("71 74 22")[1]));
console.log("valid test", is_valid(parse_move("71 74 12")[1]));
console.log("valid test", is_valid(parse_move("71 74 32")[1]));	

function convert_board_to_HTML(board) {
	out = "<table style='font-size:36px;'> \n";
	for (let i=0; i < 8; i++) {
		if (i == 4) {
		out += "\t<tr><td colspan='8' style='text-align:right;'>===================</td>\n";
			
		}
		out += "\t<tr>\n";
		for (let j=0; j < 8; j++) {
			if (j == 4) {
				out += "\t\t<td>" + "|" + "</td>\n";
			}
			out += "\t\t<td class='boardsquare' id='boardsquare"+i+j+"' style='border:2px solid black' onclick='square_click("+i+", "+j+")'>";
			//out += board[i][j];
			if (board[i][j] == "0") {
				out += ""
			} else if (board[i][j] == "1") {
				out += "&#9711;"
			} else if (board[i][j] == "2") {
				out += "&#11044;"
			} else {
				out += "X"
			};
			out += "</td>\n";
		}
		out += "</tr>\n";
	}
	out += "</table>";
	return out;
}
	
function display_board(board) {
	document.getElementById("divboard").innerHTML = convert_board_to_HTML(board);
	return;
}
//document.getElementById("divboard").innerHTML = convert_board_to_HTML(board)

function input_move(move) {
	console.log("new move is", move);
	move_parsed = parse_move(move);
	if (!move_parsed[0]) {
		alert("Can't parse move!!!\nReason: " + move_parsed[1]);
		return false;
	}
	move2 = move_parsed[1]
	if (!is_valid(move2)) {
		alert("Move isn't valid!!!");
		return false;
	}
	// do move
	make_move(move2);
	
	// update board
	display_board(board);
	
	// flip turn
	team1_turn = !team1_turn;
	
	// clear clicked_cells
	clicked_cells = [-1, -1, -1, -1];
	
	// Update turn indicator
	document.getElementById("divturn").innerHTML = "Turn: " + (team1_turn ? "&#9711;" : "&#11044;") 
	
	return true;
}

function make_move(move) {
	// move 1
	console.log("making move", move, move[0] + move[4], move[1] + move[5], team1_turn ? "1" :"2");
	board[move[0]][move[1]] = "0"
	board[move[0] + move[4]][move[1] + move[5]] = team1_turn ? "1" :"2";
	board[move[2]][move[3]] = "0"
	board[move[2] + move[4]][move[3] + move[5]] = team1_turn ? "1" :"2";
	return true;
}

var clicked_cells = [-1,-1,-1,-1];
function square_click(i,j) {
	console.log("clicked on square", i, j);
	square = document.getElementById("boardsquare"+i+j);
	if (square.classList.contains("selectedboardsquare")) {
		console.log("already clicked, removing style");
		square.classList.remove("selectedboardsquare");
		if (clicked_cells[0] == i && clicked_cells[1] == j) {
			clicked_cells[0] = -1
			clicked_cells[1] = -1
		} else if (clicked_cells[2] == i && clicked_cells[3] == j) {
			clicked_cells[2] = -1
			clicked_cells[3] = -1
		} else {
			console.log("error 1024329 clicked cell");
		}
	} else {
		if (clicked_cells[0] < 0) {
			clicked_cells[0] = i;
			clicked_cells[1] = j;
		} else {
			// Already 2 selected -> clear it
			if (clicked_cells[2] >= 0) {
				document.getElementById("boardsquare"+clicked_cells[2] + clicked_cells[3]).classList.remove("selectedboardsquare");
			}
			clicked_cells[2] = i;
			clicked_cells[3] = j;
		}
		square.classList.add("selectedboardsquare");
	}
	
	//document.getElementById("boardsquare"+i+j).style.backgroundColor='pink'
	//document.getElementById("boardsquare"+i+j)
	return;
}

function arrow_click(i,j) {
	if (clicked_cells[0] < 0 || clicked_cells[1] < 0 || clicked_cells[2] < 0 || clicked_cells[3] < 0) {
		alert("Need to have clicked two squares");
		return;
		}
	move = clicked_cells[0].toString() + clicked_cells[1] + " " + clicked_cells[2] + clicked_cells[3] + " " + i + j;
	console.log('move is', move);
	input_move(move);
}

window.onload = function(e) {
	console.log("running onload");
	display_board(board);
}


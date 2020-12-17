
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
			return [false, "Squares must contain correct colored stones"];
		}
	// Must stay on same subboard
	if (
		Math.floor(move[0] / 4) != Math.floor((move[0] + move[4]) / 4) || 
		Math.floor(move[1] / 4) != Math.floor((move[1] + move[5]) / 4) || 
		Math.floor(move[2] / 4) != Math.floor((move[2] + move[4]) / 4) || 
		Math.floor(move[3] / 4) != Math.floor((move[3] + move[5]) / 4)
	) {
		return [false, "Stones must stay on same subboard"];
	}
	
	// Make sure one move is on home board (two closest to player)
	if ((team1_turn  && move[0] < 4 && move[2] < 4) ||
		(!team1_turn && move[0] > 3 && move[2] > 3)) {
		return [false, "At least one move must be on the homeboards for the player (top two for black, bottom two for white)"];
	}
	
	// Moves must be made on opposite L/R sides
	if (move[1] < 4 && move[3] < 4 ||
	    move[1] > 3 && move[3] > 3) {
		return [false, "Moves must be on opposite left/right subboards"];
	}
	
	// Make sure at least one move is passive (on homeboards and not pushing)
	let stone1passive = true;
	console.log("check passive", move);
	if (!is_passive(move[0], move[1], move[4], move[5]) && !is_passive(move[2], move[3], move[4], move[5])) {
		return [false, 'At least one move must be passive'];
	}
	
	// Make sure aggressive pushes at most one stone
	
	return [true, ""];
}
console.log("valid test", is_valid(parse_move("71 74 22")[1]));
console.log("valid test", is_valid(parse_move("71 74 12")[1]));
console.log("valid test", is_valid(parse_move("71 74 32")[1]));	

function is_passive(x,y,dx,dy) {
	// Must be on homeboards
	if (!(team1_turn ? (x >= 4) : (x < 3))) {
		console.log("not on hb");
		return false;
	}
	// Must end up in empty spot
	if (board[x + dx][y + dy] != 0) {
		return false;
	}
	
	// If double move, must pass through empty square
	if (Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5) {
		console.log("checking half of double jump", x + dx/2, y+dy/2);
		if (board[x + dx/2][y + dy/2] != 0) {
			return false;
		}
	}
	
	return true;
}


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
	check_valid = is_valid(move2);
	console.log('check valid is', check_valid);
	if (!check_valid[0]) {
		alert("Move isn't valid!!!\nReason: " + check_valid[1]);
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
	
	// Check game over
	let game_over = check_game_over();
	if (game_over > 0) {
		alert("Game over, player " + game_over + " wins!");
	}
	
	return true;
}

function make_move(move) {
	// move 1
	console.log("making move", move, move[0] + move[4], move[1] + move[5], team1_turn ? "1" :"2");
	board[move[0]][move[1]] = "0"
	board[move[0] + move[4]][move[1] + move[5]] = team1_turn ? 1 : 2;
	board[move[2]][move[3]] = "0"
	board[move[2] + move[4]][move[3] + move[5]] = team1_turn ? 1 : 2;
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

function check_game_over() {
	if (!board.slice(0,4).some(x => x.slice(0,4).includes(1)) ||
	    !board.slice(4,8).some(x => x.slice(0,4).includes(1)) ||
	    !board.slice(0,4).some(x => x.slice(4,8).includes(1)) ||
	    !board.slice(4,8).some(x => x.slice(4,8).includes(1))) {
		return 2;
	}	
	if (!board.slice(0,4).some(x => x.slice(0,4).includes(2)) ||
	    !board.slice(4,8).some(x => x.slice(0,4).includes(2)) ||
	    !board.slice(0,4).some(x => x.slice(4,8).includes(2)) ||
	    !board.slice(4,8).some(x => x.slice(4,8).includes(2))) {
		return 1;
	}	
	return 0;
}
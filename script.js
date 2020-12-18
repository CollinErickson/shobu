
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
	//console.log("NEED TO CHECK FOR DOUBLE PUSHES");
	if (is_double_push_or_selfpush(move[0], move[1], move[4], move[5]) || is_double_push_or_selfpush(move[2], move[3], move[4], move[5])) {
		console.log("DOUBLE PUSH:", is_double_push_or_selfpush(move[0], move[1], move[4], move[5]), is_double_push_or_selfpush(move[2], move[3], move[4], move[5]), "\n-----",
				    move[0], move[1], move[4], move[5], "\n-----", move[2], move[3], move[4], move[5]);
		return [false, "Can't push two stones at once or push your own stones"];
	}
	
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

function is_double_push_or_selfpush(x,y,dx,dy) {
	// Suicide moves should be excluded
	// If single space move, either that space must be open or it is on the edge of the board or the next one must be open
	console.log("checking double push", x,y,dx,dy);
	if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) {
		console.log("-- is single move");
		if (!(board[x+dx][y+dy] == 0)) { // Spot is full
			console.log("-- and isn't empty");
			// Self push, can't do it
			if (board[x+dx][y+dy] == (team1_turn ? 1 : 2)) {
				return true;
			}
			// Otherwise it is opponent, make sure push spot is open or offboard
			let pushx = x+2*dx;
			let pushy = y + 2*dy;
			// If the push spot is off the board, then the move is good
			if (Math.floor(pushx / 4) != Math.floor(x / 4) || 
			   Math.floor(pushy / 4) != Math.floor(y / 4)) {
				// It's fine to push a piece off
			} else {
				// It's not a push off, so next space must be open
				if (board[pushx][pushy] != 0) {
					return true;
				}
			}
		}
	} else {
		// Check for push on two space moves
		// For 3 spots in the move direction, only 1 can be on same board and occupied
		
		let pushx1 = x+.5*dx;
		let pushy1 = y + .5*dy;
		let pushx2 = x+1*dx;
		let pushy2 = y + 1*dy;
		let pushx3 = x+1.5*dx;
		let pushy3 = y + 1.5*dy;
		let spot1_open_or_off_board = (board[pushx1][pushy1] == 0) || on_different_subboards(x,y,pushx1,pushy1);
		let spot2_open_or_off_board = (board[pushx2][pushy2] == 0) || on_different_subboards(x,y,pushx2,pushy2);
		// Reverse order since x3/y3 might be off of board
		let spot3_open_or_off_board = on_different_subboards(x,y,pushx3,pushy3) || (board[pushx3][pushy3] == 0);
		console.log("--", spot1_open_or_off_board, spot2_open_or_off_board, spot3_open_or_off_board);
		console.log('--xy are', x,y,pushx1,pushy1, pushx2,pushy2, pushx3,pushy3);
		if (spot1_open_or_off_board + spot2_open_or_off_board + spot3_open_or_off_board < 1.5) {
			return true;
		}
		
		// Check for self push
		if (board[pushx1][pushy1] == (team1_turn ? 1 : 2) || board[pushx2][pushy2] == (team1_turn ? 1 : 2)) {
			return true;
		}
		
	}
	return false;
}

function on_different_subboards(x1,y1, x2, y2) {
	return (Math.floor(x1 / 4) != Math.floor(x2 / 4) || 
			   Math.floor(x2 / 4) != Math.floor(y2 / 4));
}

function convert_board_to_HTML(board) {
	out = "<table style='font-size:44px;'> \n";
	for (let i=0; i < 8; i++) {
		if (i == 4) {
		out += "\t<tr><td colspan='9' style='text-align:center;'>===================</td>\n";
			
		}
		out += "\t<tr>\n";
		for (let j=0; j < 8; j++) {
			if (j == 4) {
				out += "\t\t<td width='20px' style='text-align:center;'>" + "|" + "</td>\n";
			}
			out += "\t\t<td class='boardsquare boardsquare" + (j < 3.5 ? "left": "right") + "' id='boardsquare"+i+j+"' style='border:2px solid black' onclick='square_click("+i+", "+j+")'>";
			//out += board[i][j];
			if (board[i][j] == "0") {
				out += ""
			} else if (board[i][j] == "1") {
				//out += "&#9711;"
				out += "<div style='color:wheat;text-shadow: 0 0 3px black;'>&#11044;</div>"
			} else if (board[i][j] == "2") {
				out += "<div style='color:black;text-shadow: 0 0 2px black;'>&#11044;</div>"
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
	//board[move[0]][move[1]] = "0"
	//board[move[0] + move[4]][move[1] + move[5]] = team1_turn ? 1 : 2;
	//board[move[2]][move[3]] = "0"
	//board[move[2] + move[4]][move[3] + move[5]] = team1_turn ? 1 : 2;
	make_move_sub(move[0], move[1], move[4], move[5]);
	make_move_sub(move[2], move[3], move[4], move[5]);
	
	return true;
}

function make_move_sub(x,y,dx,dy) {
	// Move single space
	if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5) {
		if (board[x+dx][y+dy] != 0) {
			pushx = x + 2*dx;
			pushy = y + 2*dy;
			// Check if pushed off board
			if (Math.floor(pushx / 4) != Math.floor(x / 4) || 
			   Math.floor(pushy / 4) != Math.floor(y / 4)) {
				// Do nothing, it will be overwritten
			} else {
				// Stays on board, move it to the push spot
				board[pushx][pushy] = team1_turn ? 2 : 1;
			}
		}
	} else { // Move double space, need to check both for existing stones
		// Check if there is stone is adjacent spot
		
		// Check if there is stone is end spot
		console.log("FIX PUSH ON DOUBLE MOVE");
		let pushx1 = x+.5*dx;
		let pushy1 = y + .5*dy;
		let pushx2 = x+1*dx;
		let pushy2 = y + 1*dy;
		let pushx3 = x+1.5*dx;
		let pushy3 = y + 1.5*dy;
		// Can't be same numbered stone on spot since it wouldn't be valid
		if (board[pushx1][pushy1] != 0 || board[pushx2][pushy2] != 0) {
			board[pushx1][pushy1] = 0;
			board[pushx2][pushy2] = 0; // Not needed since moving stone will be put there
			// Push stone if space on board, else it falls off
			if (!on_different_subboards(x,y,pushx3,pushy3)) {
				board[pushx3][pushy3] = team1_turn ? 2: 1;
			}
		}
	}
	// Move current stone
	board[x+dx][y+dy] = team1_turn ? 1 : 2;
	// Clear where it started
	board[x][y] = 0;
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
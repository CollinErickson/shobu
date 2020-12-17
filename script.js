
console.log("loaded script js")


var board = [[2,2,2,2,2,2,2,2],
			 [0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0],
			 [1,1,1,1,1,1,1,1],
			 [2,2,2,2,2,2,2,2],
			 [0,0,0,0,0,0,0,0],
			 [0,0,0,0,0,0,0,0],
			 [1,1,1,1,1,1,1,1]]

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
		!["1","2","3"].includes(move[6]) || 
		!["1","2","3"].includes(move[7])) {
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


function is_valid(move, team1_turn) {
	if (team1_turn) {
		if (board[move[0]][move[1]] != 1 || 
		   board[move[2]][move[3]] != 1) {
			return false;
		}
		if ((move[0] == 0 && move[4] < 0) ||
		   (move[0] == 7 && move[4] > 0) ||
		   (move[1] == 0 && move[5] < 0) ||
		   (move[1] == 7 && move[5] > 0) ||
		   (move[2] == 0 && move[4] < 0) ||
		   (move[2] == 7 && move[4] > 0) ||
		   (move[3] == 0 && move[5] < 0) ||
		   (move[3] == 7 && move[5] > 0)) {
			return false;
		}
	}
	return true;
}
console.log("valid test", is_valid(parse_move("71 74 22")[1], true));
console.log("valid test", is_valid(parse_move("71 74 12")[1], true));
console.log("valid test", is_valid(parse_move("71 74 32")[1], true));	

function convert_board_to_HTML(board) {
	out = "<table> \n";
	for (let i=0; i < 8; i++) {
		if (i == 4) {
		out += "\t<tr><td colspan='8' align='center'>========</td>\n";
			
		}
		out += "\t<tr>\n";
		for (let j=0; j < 8; j++) {
			if (j == 4) {
				out += "\t\t<td>" + "|" + "</td>\n";
			}
			out += "\t\t<td>" + board[i][j] + "</td>\n";
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
		return;
	}
	move2 = move_parsed[1]
	if (!is_valid(move2)) {
		alert("Move isn't valid!!!");
		return;
	}
	// do move
	return true;
	
}

window.onload = function(e) {
	console.log("running onload");
	display_board(board);
}


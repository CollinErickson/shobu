/*function stone(x=null, y=null, isactive=true) {
	this.isactive = isactive;
	this.x = x;
	this.y = y;
	this.board=1;
}
*/

function shobuAI() {
	// Convert board to white/black
	white = [];
	black = [];
	let quadinfo = [ // board, minx, maxx, miny, maxy
		[0,0,4,4,8],
		[1,4,8,4,8],
		[2,4,8,0,4],
		[3,0,4,0,4]
	];
	for (let q=0; q < quadinfo.length; q++) {
		for (let i=quadinfo[q][1]; i < quadinfo[q][2]; i++) {
			for (let j=quadinfo[q][3]; j < quadinfo[q][4]; j++) {
				if (board[i][j] == 1) {
					white.push(new stone(q, i%4, j%4, true));
				}
				if (board[i][j] == 2) {
					black.push(new stone(q, i%4, j%4, true));
				}
			}
		}
		while (white.length < 4*quadinfo[q][0]+4) {
			white.push(new stone(q, NaN, NaN, false));
	   }
		while (black.length < 4*quadinfo[q][0]+4) {
			black.push(new stone(q, NaN, NaN, false));
	   }
	}
	this.game = new ShobuGame();
	this.game.white = white;
	this.game.black = black;
	this.game.team1_turn = team1_turn
	//this.team1_turn = team1_turn;
}

shobuAI.prototype.getmove = function() {
	return this.game.bestmove(this.game.team1_turn?1:2, 0, 3);
}

shobuAI.prototype.makemove = function() {
	let move =  this.game.bestmove(this.game.team1_turn?1:2, 0, 3);
	console.log("move is", move);
	let movestr = '';
	let stones = (this.game.team1_turn) ? this.game.white: this.game.black;
	movestr += stones[move[0][2]].u;
	movestr += stones[move[0][2]].v;
	movestr += ' ';
	movestr += stones[move[1][2]].u;
	movestr += stones[move[1][2]].v;
	movestr += ' ';
	movestr += move[0][3][0] + 2;
	movestr += move[0][3][1] + 2;
	console.log("movestr is", movestr);
	input_move(movestr);
	return 0;
}

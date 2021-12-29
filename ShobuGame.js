function stone(board=null, x=null, y=null, isactive=true) {
	this.isactive = isactive;
	this.x = x;
	this.y = y;
	this.board=board;
	this.u = x + ([1,2].includes(this.board) ? 4: 0);
	this.v = y + ([0,1].includes(this.board) ? 4: 0);
}

function ShobuGame() {
	// Team 1 (white) goes first
	this.team1_turn = true;
	// Create white and black stones
	this.white = [];
	this.black = [];
	for (let i=0; i<16; i++) {
		this.white.push(new stone(Math.floor(i/4), 3, i%4, true));
		this.black.push(new stone(Math.floor(i/4), 0, i%4, true));
	}
}
function sum(arr) {
	let x = 0;
	for (let i=0; i < arr.length; i++) {
		x += arr[i]
	}
	return x
}
function crossprod(a1, a2) {
	let out = [];
	for (let i=0; i<a1.length; i++) {
		for (let j=0; j<a2.length; j++) {
			out.push([a1[i], a2[j]]);
		}
	}
	return out;
}

ShobuGame.prototype.move = function(team, stone, dx, dy) {
	if (team == 1) {
		this.white[stone].x += dx;
		this.white[stone].u += dx;
		this.white[stone].y += dy;
		this.white[stone].v += dy;
	} else if (team == 2) {
		this.black[stone].x += dx;
		this.black[stone].u += dx;
		this.black[stone].y += dy;
		this.black[stone].v += dy;
	}
	return 0;
}

ShobuGame.prototype.makeMoveSingle = function(team, stone, dx, dy) {
	// Return if game is won
	// Make sure it's valid
	if (!this.isValidMoveSingle(team, stone, dx, dy)) {
		return false;
	}
	teamstones = (team==1) ? this.white : this.black;
	let st = teamstones[stone];
	//console.log("before move", team, stone, dx, dy, teamstones[stone]);
	//this.print();
	let newx = st.x + dx;
	let newy = st.y + dy;
	let mag = Math.max(Math.abs(dx), Math.abs(dy));
	let midx, midy;
	if (mag>1.5) {
		midx = st.x + dx/2;
		midy = st.y + dy/2;
	}
	let allgone = false;
	let oppstones = (team==2) ? this.white : this.black;
	// Check if a stone of opponent is on the spot
	for (let i=0; i<4; i++) {
		let i2 = i + Math.floor(stone/4)*4;
		// Stone getting pushed
		if ((oppstones[i2].isactive && oppstones[i2].x == newx && oppstones[i2].y == newy) ||
			(oppstones[i2].isactive && oppstones[i2].x == midx && oppstones[i2].y == midy)) {
			let pushx = st.x + dx + ((dx==0)?0:(dx>0?1:-1));
			let pushy = st.y + dy + ((dy==0)?0:(dy>0?1:-1));
			let pushdx = (dx==0)?0:(dx>0?1:-1);
			let pushdy = (dy==0)?0:(dy>0?1:-1);
			// Move that stone
			//console.log("before push made", oppstones[i2], 'dx', dx, 'pushdx', pushdx);
			oppstones[i2].x += pushdx;
			oppstones[i2].u += pushdx;
			oppstones[i2].y += pushdy;
			oppstones[i2].v += pushdy;
			//console.log('move made', team, stone, st, "d", dx, dy, "p", pushx, pushy);
			if (pushx < 0 || pushx > 3 || pushy < 0 || pushy > 3) {
				// Pushed off of board
				//console.log("MOVE PUSHED IT OFF BOARD");
				oppstones[i2].isactive = false;
				// Check if it won
				allgone = true;
				for (let j=0; j<4; j++) {
					let j2 = j + Math.floor(stone/4)*4;
					if (oppstones[j2].isactive) {
						allgone = false;
					}
				}
			}
			//if (oppstones[i2].isactive && oppstones[i2].u < 0) {console.log(oppstones[i2], pushdx, pushdy);throw 'pushed off board but active!'}
			//console.log("after push made", oppstones[i2]);
		}
	}
	
	// Move original stone
	teamstones = (team==1) ? this.white : this.black;
	teamstones[stone].x += dx;
	teamstones[stone].u += dx;
	teamstones[stone].y += dy;
	teamstones[stone].v += dy;
	//console.log("after move", team, stone, dx, dy, teamstones[stone]);
	//this.print();
	
	return allgone;
}

ShobuGame.prototype.isValidMoveSingle = function(team, stone, dx, dy) {
	// return 0: 0 if not valid, 1 if passive, 2 if aggressive
	// return 1: whether opponent was pushed off
	// Must move somewhere
	if (dx==0 && dy ==0) {
		return [0, false];
	}
	let st = null; let teamstones=null;
	if (team==1) {
		teamstones = this.white;
		//st = this.white[stone];
	} else if (team==2) {
		teamstones = this.black
		//st = this.black[stone];
	}
	st = teamstones[stone];
	// Must be valid stone
	if (!st.isactive) {
		return [0, false]; // 0 means invalid move, false since no opponents pushed off
	}

	// If they go off board, return 0
	//console.log(st.x, st.y, dx, dy);
	let newx = st.x + dx;
	let newy = st.y + dy;
	let mag = Math.max(Math.abs(dx), Math.abs(dy));
	let midx, midy;
	if (mag>1.5) {
		midx = st.x + dx/2;
		midy = st.y + dy/2;
	}
	if (newx < 0 || newx > 3 || newy < 0 || newy > 3) {
		return [0, false];
	}
	// Can only go 2 in a dir if 0 or 2 in other direction
	if (Math.abs(dx) == 2 && Math.abs(dy) == 1) {return [0, false];}
	if (Math.abs(dy) == 2 && Math.abs(dx) == 1) {return [0, false];}
	// Can't move onto spot occupied by same team or pass through team
	let stonenums = []
	for (let i=0; i<4; i++) {
		let i2 = i + Math.floor(stone/4)*4;
		if (i2 != stone && teamstones[i2].isactive) {
			// Can't move onto spot occupied by same team
			if (newx == teamstones[i2].x && newy == teamstones[i2].y) {
				return [0, false];
			}
			// Can't pass through same team, check midpoint
			if (midx == teamstones[i2].x && midy == teamstones[i2].y) {
				return [0, false];
			}
		}
		//console.log('cv', stone, i2);
	}
	// Check if other team on midpoint or endpoint. If not, return 1, passive move
	let oppstones = (team==1)? this.black : this.white;
	let ispush = false;
	let isopponmidpoint = false;
	let isopponendpoint = false;
	for (let i=0; i<4; i++) {
		let i2 = i + Math.floor(stone/4)*4;
		//console.log("checking stone", i, i2, oppstones[i2], newx, newy, 'conds', oppstones[i2].isactive , oppstones[i2].x == newx , oppstones[i2].y == newy);
		if (oppstones[i2].isactive && oppstones[i2].x == newx && oppstones[i2].y == newy) {
			ispush = true;
			isopponendpoint = true;
		}
		if (mag>1.5 && oppstones[i2].isactive && oppstones[i2].x == midx && oppstones[i2].y == midy) {
			ispush = true;
			isopponmidpoint = true;
		}
	}
	if (isopponmidpoint && isopponendpoint) {
		return [0, false];
	}
	//console.log('before ispush', 'new', newx, newy, 'ispush', ispush, 'st', st.x, st.y, 'd', dx, dy);
	if (!ispush) {
		return [1, false];
	}
	
	// Can't push a blocked stone
	let pushx = st.x + dx + ((dx==0)?0:(dx>0?1:-1));
	let pushy = st.y + dy + ((dy==0)?0:(dy>0?1:-1));
	//return 0;
	// Make sure neither team in pushing spot
	for (let i=0; i<4; i++) {
		let i2 = i + Math.floor(stone/4)*4;
		// Check if same team is on pushing spot
		if (i2 != stone && teamstones[i2].isactive && teamstones[i2].x == pushx && teamstones[i2].y == pushy) {
			return [0, false];
		}
		// Check if opponent is on pushing spot
		if (oppstones[i2].isactive && oppstones[i2].x == pushx && oppstones[i2].y == pushy) {
			return [0, false];
		}
	}
	// It's a valid push, aggressive move, return 2
	let pushoffboard = pushx < 0 || pushx > 3 || pushy < 0 || pushy > 3;
	//console.log('push', 'st', st.x, st.y, 'd', dx, dy, '?', (dx==0)?0:(dx>0?1:-1), (dy==0)?0:(dy>0?1:-1), 'n', newx, newy, 'p', pushx, pushy);
	//if (pushoffboard) {console.log("PUSH", 'pushoffboard');}
	return [2, pushoffboard];
}

ShobuGame.prototype.winProbSingleBoard = function(team, boardnum, team1_turn, opponentpushedoff) {
	//let whiteminusblack = 0;
	let nwhite=0, nblack = 0;
	for (let i=0; i<4; i++) {
		let i2 = i + boardnum*4;
		//console.log("i2 is", i2, i);
		if (this.white[i2].isactive) {
			//whiteminusblack += 1;
			nwhite += 1
		}
		if (this.black[i2].isactive) {
			//whiteminusblack -= 1;
			nblack += 1;
		}
	}
	if (opponentpushedoff) {
		if (team==1) {
			nblack -= 1;
		} else {
			nwhite -= 1;
		}
	}
	if (nwhite <= 0 && nblack <= 0) {
		console.log("both teams have zero left, error!");
		return .5;
	}
	if (nwhite <= 0) {
		return (team<1.5)?0:1;
	}
	if (nblack <= 0) {
		return (team>1.5)?0:1;
	}
	//let whitewinprob = nwhite / (nwhite + nblack);
	// Give a bonus to team that would go next
	let whitewinprob = (nwhite + (team1_turn ? .2:0)) / (nwhite + nblack + .2);
	let winprob = (team==1) ? whitewinprob : (1-whitewinprob);
	winprob = Math.max(0, Math.min(1, winprob));
	//console.log(nwhite, nblack
	return winprob;
}

ShobuGame.prototype.combineWinProbs = function(a, b, c, d) {
	if (Math.max(a,b,c,d) >= .9999999) {
		return 1;
	}
	if (Math.max(a,b,c,d) <= .0000001) {
		return 0;
	}
	// IDK how to combine these probs, it's all made up
	let avg = (a+b+c+d) / 4;
	let out = (avg >= .5) ? (1-Math.pow(2*(1-avg), 2)/2) : (Math.pow(2*(avg), 2)/2);
	return avg;
}

ShobuGame.prototype.returnCopy = function() {
	let out = new ShobuGame();
	out.team1_turn = this.team1_turn;
	for (let i=0; i<16; i++) {
		out.white[i] = new stone(this.white[i].board, this.white[i].x, this.white[i].y, this.white[i].isactive);
		out.black[i] = new stone(this.black[i].board, this.black[i].x, this.black[i].y, this.black[i].isactive);
	}
	return out;
}

ShobuGame.prototype.getAllValidMoves = function(team) {
	let validmovesingle = Array(16).fill([]);
	let teamstones = (team==1) ? this.white : this.black;
	// Loop over each stone, find valid moves for just that stone
	for (let i=0; i<16; i++) {
		if (teamstones[i].isactive) {
			for (let dx=-2; dx<=2; dx++) {
				for (let dy=-2; dy<=2; dy++) {
					// Check if this move is valid. 
					// Component 0: 0 if invalid, 1 is passive, 2 is aggressive
					// Component 1: whether opponent was pushed off the board
					let val = this.isValidMoveSingle(team, i, dx, dy);
					// If valid, add it to list of moves
					if (val[0] > 0) {
						//validmovemap.set(i, [dx]);
						// Find win prob on that board if move is made, rough estimate
						let winprobsinglemove = this.winProbSingleBoard(team, Math.floor(i/4), !this.team1_turn, val[1]);
						validmovesingle[i] = validmovesingle[i].concat([[dx, dy, val, winprobsinglemove]]);
					}
				}
			}
		}
	}
	//return validmovesingle;
	//console.log('validmovesingle is', validmovesingle);
	//console.log("killing moves", validmovesingle[0].filter(x => x[2][1]));
	
	// Now get the pairs of moves
	let validmoves = [];
	// Boards: front/back left/right from player's view
	let boardFR = (team==1) ? 1 : 3;
	let boardFL = (team==1) ? 2 : 0;
	let boardBR = (team==1) ? 0 : 2;
	let boardBL = (team==1) ? 3 : 1;
	// Win probs if no moves made 
	let winProbSingleBoards = [NaN, NaN, NaN, NaN];
	for (let i=0; i<4; i++) {
		winProbSingleBoards[i] = this.winProbSingleBoard(team, i, !this.team1_turn);
	}
	//console.log('winProbSingleBoards is', winProbSingleBoards);
	let winprobFR = winProbSingleBoards[boardFR];
	let winprobFL = winProbSingleBoards[boardFL];
	let winprobBR = winProbSingleBoards[boardBR];
	let winprobBL = winProbSingleBoards[boardBL];
	// Both passive moves. i is stone on right board, j is stone on left board
	for (let i=0; i<4; i++) {
		let i2 = i + boardFR*4;
		for (let j=0; j<4; j++) {
			let j2 = j + boardFL*4;
			// Loop over pairs of moves
			for (let mi=0; mi < validmovesingle[i2].length; mi++) {
				for (let mj=0; mj < validmovesingle[j2].length; mj++) {
					//console.log('check pair', i2, j2, mi, mj);
					let validij = validmovesingle[i2][mi][2][0] == 1 || validmovesingle[j2][mj][2][0] == 1 ;
					let movesmatch = validmovesingle[i2][mi][0] == validmovesingle[j2][mj][0] && validmovesingle[i2][mi][1] == validmovesingle[j2][mj][1];
					if (validij && movesmatch) {
						let winprobpairmoves = this.combineWinProbs(winprobBR, winprobBL, validmovesingle[i2][mi][3], validmovesingle[j2][mj][3]);
						validmoves.push([[boardFR, i, i2, validmovesingle[i2][mi]], [boardFL, j, j2, validmovesingle[j2][mj]], winprobpairmoves]);
						/*if (i2==6 && j2 ==8) {
							console.log("WINNING MOVE?", i2, j2, validmovesingle[i2][mi], validmovesingle[j2][mj], 
										"wp", winprobpairmoves, "\nwpe", winprobBR, winprobBL, validmovesingle[i2][mi][3], validmovesingle[j2][mj][3],
									   "\nwpb", winprobBR, winprobBL, winprobFR, winprobFL);
						}*/
					}
				}
			}
		}
	}
	//console.log('validmoves after pas/pas is', validmoves);
	// Passive on right front, passive/aggressive on left back
	for (let i=0; i<4; i++) {
		let i2 = i + boardFR*4;
		for (let j=0; j<4; j++) {
			let j2 = j + boardBL*4;
			// Loop over pairs of moves
			for (let mi=0; mi < validmovesingle[i2].length; mi++) {
				for (let mj=0; mj < validmovesingle[j2].length; mj++) {
					let validij = validmovesingle[i2][mi][2][0] == 1;
					let movesmatch = validmovesingle[i2][mi][0] == validmovesingle[j2][mj][0] && validmovesingle[i2][mi][1] == validmovesingle[j2][mj][1];
					if (validij && movesmatch) {
						let winprobpairmoves = this.combineWinProbs(winprobBR, winprobFL, validmovesingle[i2][mi][3], validmovesingle[j2][mj][3]);
						validmoves.push([[boardFR, i, i2, validmovesingle[i2][mi]], [boardBL, j, j2, validmovesingle[j2][mj]], winprobpairmoves]);
					}
				}
			}
		}
	}
	// Passive on left front, passive/aggressive on right back
	for (let i=0; i<4; i++) {
		let i2 = i + boardBR*4;
		for (let j=0; j<4; j++) {
			let j2 = j + boardFL*4;
			// Loop over pairs of moves
			for (let mi=0; mi < validmovesingle[i2].length; mi++) {
				for (let mj=0; mj < validmovesingle[j2].length; mj++) {
					let validij = validmovesingle[j2][mj][2][0] == 1;
					let movesmatch = validmovesingle[i2][mi][0] == validmovesingle[j2][mj][0] && validmovesingle[i2][mi][1] == validmovesingle[j2][mj][1];
					if (validij && movesmatch) {
						let winprobpairmoves = this.combineWinProbs(winprobFR, winprobBL, validmovesingle[i2][mi][3], validmovesingle[j2][mj][3]);
						validmoves.push([[boardFR, i, i2, validmovesingle[i2][mi]], [boardBL, j, j2, validmovesingle[j2][mj]], winprobpairmoves]);
					}
				}
			}
		}
	}
	// Filter down to smaller set of moves
	//console.log('validmoves was', validmoves.length);
	//let probs = validmoves.map(x => x[2]);
	//console.log('probs are', probs);
	//console.log('probs are', Math.min(...probs), Math.max(...probs));
	//probs.sort();
	// Sort all validmoves by descreasing winprob. First has highest win prob
	validmoves.sort((a,b) => -1+2*(a[2] < b[2]));
	
	
	return validmoves;
}

depth_to_nconsider = [[1000],
					  [100, 50],
					  [70, 40, 20],
					  [50, 30, 25, 20]];

ShobuGame.prototype.bestmove = function(team, curdepth, maxdepth) {
	if (curdepth <= 1) {console.log("in bestmove:", 'team:', team, 'depth', curdepth, "/", maxdepth);}
	//this.print();
	let validmoves = this.getAllValidMoves(team);
	if (curdepth <= 0) {console.log("in bestmove, validmoves is", team, curdepth, "/", maxdepth, validmoves);}
	if (validmoves.length == 0) {
		console.log("ERROR NO VALID MOVES");
		return [null, null, 0];
	}
	if (curdepth >= maxdepth) {
		//console.log('best move at max depth is', team, validmoves[0]);
		return validmoves[0];
	}
	let nconsider = Math.min(depth_to_nconsider[maxdepth][curdepth], validmoves.length);
	//nconsider = 2;
	//let bestmoves = Array(Math.min(nconsider, validmoves.length));
	let winprob = Array(Math.min(nconsider, validmoves.length));
	// Loop over each move, try each of them
	for (let i=0; i<nconsider; i++) {
		//console.log("validmove i is", i, validmoves[i]);
		// Move win prob back towards 0.5, prevents it from getting stuck in loop. And reduces overconfidence.
		validmoves[i][2] = (validmoves[i][2]>=.5) ? ((validmoves[i][2]-.5)*.96+.5) : (.5 - (.5 - validmoves[i][2])*.96);
		if (validmoves[i][2] >= .999999999) {
			winprob[i] = 1 - validmoves[i][2];
		} else if (validmoves[i][2] <= .000000001) {
			winprob[i] = 1 - validmoves[i][2];
		} else {
			// Copy the game
			gamecopy = this.returnCopy();
			// Make the moves
			//console.log('making moves', );
			m1 = gamecopy.makeMoveSingle(team, validmoves[i][0][2], validmoves[i][0][3][0], validmoves[i][0][3][1]);
			m2 = gamecopy.makeMoveSingle(team, validmoves[i][1][2], validmoves[i][0][3][0], validmoves[i][0][3][1]);
			//console.log('m1 m2', m1, m2)
			//gamecopy.print()
			if (m1 || m2) {
				winprob[i] = 1;
			} else {
				// Find the best move in that turn
				let bm = gamecopy.bestmove(team==1?2:1, curdepth+1, maxdepth);
				//gamecopy.print();
				//console.log('valid move i is', 'team:', team, 'depth', curdepth, "/", maxdepth, validmoves[i]);
				//console.log("bm is", bm);
				if (typeof bm == "undefined" || bm===null || bm.length < 3) {console.log('short bm', bm, i, validmoves[i]);}
				//bestmove[i] = bm;
				winprob[i] = 1 - bm[2]; // 1- since it was winprob for other team
				winprob[i] = (winprob[i]>=.5) ? ((winprob[i]-.5)*.96+.5) : (.5 - (.5 - winprob[i])*.96);
				//validmoves[i][2] = winprob[i];
				//bestmoves[i] = validmoves[i];
			}
		}
		validmoves[i][2] = winprob[i];
	}
	let bestmoves = validmoves.slice(0, nconsider);
	// Sort by decreasing winprob
	bestmoves.sort((a,b) => -1+2*(a[2] < b[2]));
	//validmoves.sort((a,b) => -1+2*(a[2] < b[2]));
	//console.log('sorted validmoves arr is', team, validmoves);
	if (curdepth == 0) {console.log('sorted bestmoves arr is', team, bestmoves);}
	// Return best move
	//return validmoves[0]; 
	return bestmoves[0];
}

ShobuGame.prototype.makeMoveFromArray = function(team, movearray) {
	this.makeMoveSingle(team, movearray[0][2], movearray[0][3][0], movearray[0][3][1]);
	this.makeMoveSingle(team, movearray[1][2], movearray[0][3][0], movearray[0][3][1]);
	return 0;
}

ShobuGame.prototype.print = function() {
	// Create empty board
	let printboard = Array(8);
	for (let i=0; i<8; i++) {
		printboard[i] = Array(8).fill(' ');
	}
	// Find locations of stones
	for (let i=0; i<16; i++) {
		if (this.white[i].isactive) {
			//console.log("in print this white i", this.white[i]);
			printboard[this.white[i].u][this.white[i].v] = 1;
			//printboard[3][6] = 1;
		}
		if (this.black[i].isactive) {
			//console.log(i, this.black[i]);
			printboard[this.black[i].u][this.black[i].v] = 2;
		}
	}
	// Convert board to string
	let s = '';
	s += '==================\n';
	for (let i=0; i<8; i++) {
		s += "|";
		for (let j=0; j<8; j++) {
			s += printboard[i][j];
			if (j!=3 && j!=7) {s += " ";}
			s += (j==3) ? "|": "";
		}
		s += "|";
		s += "\n";
		s += (i==3)?" ----------------- \n":'';
	}
	s += '==================';
	// Print it
	console.log(s);
	return;
}

sg = new ShobuGame();
/* //Game scenario
//sg.print();
sg.move(1, 0, -1, 1);
//sg.print();
sg.white[5].isactive = false;
sg.white[9].isactive = false;
sg.white[10].isactive = false;
sg.white[12].isactive = false;
sg.black[4].isactive = false;
sg.black[5].isactive = false;
sg.black[6].isactive = false;
sg.black[9].isactive = false;
sg.black[11].isactive = false;
sg.black[13].isactive = false;
sg.black[15].isactive = false;
sg.makeMoveSingle(2, 7, 2, 0); //black[7]
sg.makeMoveSingle(2, 14, 2, 0);
sg.makeMoveSingle(2, 12, 1, 1);
sg.print();
//let bm1 = sg.bestmove(2, 0, 3);
sg.makeMoveFromArray(2, sg.bestmove(2, 0, 3));
console.log("MADE MOVE, new board is");sg.print();
*/
/*

sg.makeMoveFromArray(1, sg.bestmove(1, 0, 3)); sg.print()

sg.makeMoveFromArray(2, sg.bestmove(2, 0, 3)); sg.print()
*/

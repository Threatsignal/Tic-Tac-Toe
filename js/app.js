/**
 * Created by Justin on 1/10/2017.
 */

/*
 Wrapping all the code in a self-invoking function literal.
 */
!function () {
	'use strict';

	//Instantiating my 'global' variables to be used throughout the program.
	var TYPE = {
		EMPTY: "E",
		NOUGHT: "O",
		CROSS: "X"
	},
	Cell,
	Board;


	//Code for the Cell Class.
	(function () {
		Cell = function Cell(element) {

			this.content = TYPE.EMPTY;
			this.element = element;
			//Cell.clear();
		};

		/*
		 a method to clear the cells content and remove the styles associated with that content.
		 */
		Cell.prototype.clear = function () {
			this.content = TYPE.EMPTY;
			$(this.cell).removeClass("box-filled-1 box-filled-2");
		};

		/*
		 The method used to give the appropriate class to the cell to "paint it" with the css styles
		 content: the content being passed into the cell from the board object.
		 */
		Cell.prototype.paint = function (content) {
			this.content = content;

			if (this.content === TYPE.NOUGHT) {
				$(this.element).addClass("box-filled-1");
			}
			else if (this.content === TYPE.CROSS) {
				$(this.element).addClass("box-filled-2");
			}
			else {
				throw new Error("The program ran into an error while painting the cell");
			}
		};

	}());

	/*
	Code for the Board Class.
	Using Singleton Design pattern to make sure only 1 board is instantiated.
	 */
	(function () {
		var instance;

		Board = function Board() {

			if (instance) {
				return instance;
			}
			instance = this;

			this.result = "stillRunning";
			this.turn = TYPE.NOUGHT;
			this.displayTurn();
			//initializing an  array of all the list items with class box.
			this.items = $(".box");
			this.cells = new Array();
			this.board = [];

			for (var i = 0; i < this.items.length; i++) {
				this.board[i] = i;
				this.cells.push(new Cell(this.items[i]));

			}
			return instance;
		};

		Board.prototype.paintCell = function (value) {
			var played = false;
			for (var i = 0; i < this.cells.length; i++) {
				//Determines that cell being clicked on is an empty cell and matches the cell to the element selector.
				if (value === this.cells[i].element && this.cells[i].content === TYPE.EMPTY) {
					this.cells[i].paint(this.turn);
					played = true;
				}
			}
			return played;

		};
		Board.prototype.isEmptyCell = function (value) {
			for (var i = 0; i < this.cells.length; i++) {

				if (value === this.cells[i].element && this.cells[i].content === TYPE.EMPTY) {
					return true;
				}
			}
			return false;
		};

		Board.prototype.advanceTurn = function () {
			if (this.turn === TYPE.NOUGHT) {
				this.turn = TYPE.CROSS;
			}
			else {
				this.turn = TYPE.NOUGHT;
			}
		};
		Board.prototype.displayTurn = function () {
			if (this.turn === TYPE.NOUGHT) {
				$("#player2").removeClass('active');
				$("#player1").addClass('active');
			}
			else if (this.turn === TYPE.CROSS) {
				$("#player1").removeClass('active');
				$("#player2").addClass('active');
			}
		};
		/*
		 This method is used to empty all of the cells on the board.
		 */
		Board.prototype.emptyAllCells = function () {
			for (var i = 0; i < this.cells.length; i++) {
				this.cells[i].clear();
				$(this.items[i]).removeClass("box-filled-1 box-filled-2");
			}
		};
		/*
		 This method used to determine the amount of empty cells left.
		 */
		Board.prototype.emptyCellsLeftOnBoard = function () {
			var indxs = [];
			for (var itr = 0; itr < 9; itr++) {
				if (this.cells[itr].content === TYPE.EMPTY) {
					indxs.push(itr);
				}
			}
			return indxs;
		};

		/*
		 This method is used to determine if the game is finished, who won, and if there is a draw or not.
		 This methods code used & slightly modified from https://mostafa-samir.github.io/Tic-Tac-Toe-AI/
		 */
		Board.prototype.isTerminal = function () {
			var board = this.cells;
			//check rows
			for (var i = 0; i <= 6; i = i + 3) {
				if (board[i].content !== TYPE.EMPTY && board[i].content === board[i + 1].content && board[i + 1].content === board[i + 2].content) {
					this.result = board[i].content + "-won"; //update the state result
					return true;
				}
			}

			//check columns
			for (var i = 0; i <= 2; i++) {
				if (board[i].content !== TYPE.EMPTY && board[i].content === board[i + 3].content && board[i + 3].content === board[i + 6].content) {
					this.result = board[i].content + "-won"; //update the state result
					return true;
				}
			}

			//check diagonals
			for (var i = 0, j = 4; i <= 2; i = i + 2, j = j - 2) {
				if (board[i].content !== TYPE.EMPTY && board[i].content === board[i + j].content && board[i + j].content === board[i + 2 * j].content) {
					this.result = board[i].content + "-won"; //update the state result
					return true;
				}
			}

			var emptyCellsAvailable = this.emptyCellsLeftOnBoard();


			if (emptyCellsAvailable.length === 0) {
				//the game is draw
				this.result = "draw"; //update the state result
				return true;
			}
			else {
				return false;
			}


		};
	}());

	/*
	Once page loads invoke main function with jQuery.
	 */
	jQuery(function ($) {
		var board = new Board(),
			winMessageContainer = $('#finish');

		$(".box").click(function (event) {
			event.preventDefault();
			//If the board paints a cell, then returns true
			if (board.paintCell(this)) {
				if (board.isTerminal()) { //Test to tell if Board finished.

					winMessageContainer.children().children('.message').text("Winner");
					winMessageContainer.show();

					//Since board finished. Determine who won through the result variable in Board class.
					if (board.result === "O-won") {
						winMessageContainer.addClass('screen-win screen-win-one');
						//do code for o winning
					}
					else if (board.result === "X-won") {
						winMessageContainer.addClass('screen-win screen-win-two');
					}
					else {
						winMessageContainer.children().children('.message').text("It's a Draw");
						winMessageContainer.addClass('screen-win screen-win-tie');
					}
				}
				board.advanceTurn();
				board.displayTurn();
			}
		});

		$('#finish a').click(function () {
			//empty all the cells on the board.
			board.emptyAllCells();
			winMessageContainer.hide();
			winMessageContainer.removeClass('screen-win screen-win-one screen-win-two screen-win-tie');
			$('.box').each(function () {
				$(this).removeClass("box-hover1 box-hover2");
			});
		});
		$('#start a').click(function () {
			$(this).parent().parent().hide();
		});

		$('.box').hover(function () {
			//Making sure cell hovered over is an empty cell.
			if (board.isEmptyCell(this)) {
				if (board.turn === TYPE.NOUGHT) {
					$(this).toggleClass("box-hover1");
				}
				else if (board.turn === TYPE.CROSS) {
					$(this).toggleClass("box-hover2");
				}
			}
		});
	});
}();



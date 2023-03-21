const readline = require('readline-sync');
const prompt = require('prompt-sync')();


// Constants to define the size of the game board
const ROWS = 4;
const COLS = 4;
const MINES = 3;

// A 2D array to represent the game board
const board = [];

// Keeps track of currently revealed tiles
const fog = [];

// An array to keep track of the positions of mines on the board
const mines = [];

// Initialize the board, state, and place mines randomly
for (let row = 0; row < ROWS; row++) {
  board[row] = [];
  fog[row] = [];
  for (let col = 0; col < COLS; col++) {
    board[row][col] = 0;
    fog[row][col] = '#';
  }
}


for (let i = 0; i < MINES; i++) {
  const row = Math.floor(Math.random() * ROWS);
  const col = Math.floor(Math.random() * COLS);
  if (board[row][col] !== '*') {
    board[row][col] = '*';
    mines.push([row, col]);
  } else {
    i--;
  }
}

// Function to count the number of mines around a cell
function countMines(row, col) {
  let count = 0;
  for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, ROWS - 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, COLS - 1); c++) {
      if (board[r][c] === '*') {
        count++;
      }
    }
  }
  return count;
}

// Populate the board with the number of mines around each cell
for (let i = 0; i < mines.length; i++) {
  let row = mines[i][0];
  let col = mines[i][1];
  for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, ROWS - 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, COLS - 1); c++) {
      if (board[r][c] !== '*') {
        board[r][c]++;
      }
    }
  }
}

// Function to display the game board in the console
function displayBoard() {
  console.log('  ' + [...Array(COLS).keys()].join(' '));
  for (let row = 0; row < ROWS; row++) {
    console.log(row + ' ' + board[row].join(' '));
  }
}

// Function to display the current game state (fog) in the console
function showFog() {
  // Clear console before displaying new state
  console.clear();

  // Display column headers
  const columnHeaders = [...Array(COLS).keys()].join(' ');
  console.log(`  ${columnHeaders}`);

  // Display each row with its corresponding fog values
  for (let row = 0; row < ROWS; row++) {
    const fogValues = fog[row].join(' ');
    console.log(`${row} ${fogValues}`);
  }
}

function checkWinner() {
  const unrevealed = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = {
        row,
        col,
        tile: fog[row][col],
        fogValue: fog[row][col],
        boardValue: board[row][col]
      };
      
      if (fog[row][col] === '#') {
        unrevealed.push(tile);
      }
    }
  }

  const hasWon = unrevealed.every(tile => tile.boardValue === '*');

  if (hasWon) {
    showFog();
    console.log('You win!!');
    process.exit(0);
  }
}

// Reveals all adjacent cells by using depth-first search recursively
function revealAdjacent(row, col) {
  // Check if current cell is within the board boundaries
  if (row < 0 || col < 0 || row === ROWS || col === COLS) {
    return;
  }

  // Check if current cell has already been revealed or if it's a mine
  if (fog[row][col] !== '#' || board[row][col] === '*') {
    return;
  }

  // Reveal the current cell
  fog[row][col] = board[row][col];

  // If the current cell is a blank cell, reveal all adjacent cells
  if (board[row][col] === 0) {
    revealAdjacent(row - 1, col); // reveal top cell
    revealAdjacent(row + 1, col); // reveal bottom cell
    revealAdjacent(row, col - 1); // reveal left cell
    revealAdjacent(row, col + 1); // reveal right cell
  }
}

// Reveals the cell at the specified row and column coordinates
function revealCell(row, col) {
  const cellValue = board[row][col];

  // If the cell has already been revealed, do nothing
  if (fog[row][col] !== '#') {
    console.log('Cell already revealed');
    return;
  }

  // If the cell contains a mine, reveal it and end the game
  if (cellValue === '*') {
    fog[row][col] = cellValue;
    showFog();
    console.log('You lost!');
    process.exit(0);
  }

  // Otherwise, reveal the cell and its adjacent cells
  revealAdjacent(row, col);

  // Check if the game has been won
  if (checkWinner()) {
    showFog();
    console.log('You win!');
    process.exit(0);
  }

  // Display the updated game board
  showFog();
}

// Call the displayBoard function to display the initial state of the board
// displayBoard();
showFog();  

while (true) {
  const input = prompt('Enter with position: (row col) ');
  const [inputRow, inputCol] = input.split(' ').map(Number);

  const isValidInput = !Number.isNaN(inputRow) && !Number.isNaN(inputCol) && inputRow >= 0 && inputCol >= 0 && inputRow < ROWS && inputCol < COLS;
  if (!isValidInput) {
    console.log('Please enter a valid input.');
    continue;
  }

  revealCell(inputRow, inputCol);
}
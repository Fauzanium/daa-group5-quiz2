// Board size: N x N board made of B x B boxes (N = B*B). 
const B = 2;
const N = B * B;

// 288 4x4 puzzles with a unique solution.
// Source: https://github.com/Fauzanium/kka-sudoku-solving-algorithms (4x4_sudoku_unique_solution.csv)
import { PUZZLES } from "./puzzle";


// Get some element from html
const subMenu = document.querySelector("#nav-bar").children[4].children[1];         
const speedButton = document.querySelector("#nav-bar").children[4].children[0];
const liAroundSpeedDropdownMenu = document.querySelector("#nav-bar").children[4];
const solve = document.querySelector("#solve");
const clear = document.querySelector("#clear");
const randomlyFill = document.querySelector("#randomly-fill");
const grid = document.querySelector("#grid");
// Build the N x N grid of inputs (replaces whatever table is in index.html)
grid.innerHTML = ("<tr class='row'>" + "<td class='cell'><input type='text' maxlength='1'></td>".repeat(N) + "</tr>").repeat(N);
const inputs = document.getElementsByTagName('input');
const algoInfo = document.querySelector("#algo-info-info");
const algoHeader = document.querySelector("#algo-info-header");
const algoInfoWraper = document.querySelector("#algo-info");

// START Dropdown menu (Speed)
const speedDropDown = document.querySelector("span.selected");
const speedOptions = document.querySelectorAll('.speed-options');
speedOptions.forEach(e => {
    e.addEventListener("click", () => {
        let value = e.innerHTML;
        speedDropDown.innerHTML = value;
    });
});
// DONE Dropdown menu (Speed)

// CONSTANT SPEED (The lower the faster. It actually is the time lapse between 2 animation)
const FAST_SPEED = 1;
const MEDIUM_SPEED = 10;
const SLOW_SPEED = 50;
const EXTRA_SLOW_SPEED = 150;

// Add eventListener
clear.addEventListener('click', clickedClear);
randomlyFill.addEventListener('click', clickedRandomlyFill);
solve.addEventListener('click', clickedSolve);
setAlgoInfo();  // Only one algorithm, so show its info from the start

function setAlgoInfo()
{
    let description = "Sudoku Backtracking is a recursive algorithm which goes through each cells and sequentially assigns numbers from 1 to " + N + " if the cell is empty.<br/><br/>" +  

        "After each assignment, we check whether the current board is valid, and recursively go to the next cell if it is.<br/><br/>" + 
        
        "If we reach the last (bottom right corner) cell, and we have a valid assignment to that cell, we have a solution.<br/><br/>" +
        
        "If we have tried all possible values from 1 to " + N + " on a cell, and no values lead to a solution, we backtrack (go back to the previous cell) and continue where we left off (continue to assign the next number).";

    algoInfoWraper.classList.add('algo-info-class');

    algoHeader.innerHTML = "Algorithm Information";
    algoInfo.innerHTML = description;
}




//-------------------------------------------------START ClickedClear-------------------------------------------------
//-------------------------------------------------START ClickedClear-------------------------------------------------
//-------------------------------------------------START ClickedClear-------------------------------------------------

// This function clears all timeouts, animation colors and allow to press Solve and Speed again
function clickedClear(e)
{
    clearAllTimeOuts();
    clearAllColors();
    setAllowSolveSpeedAndAlgorithms();
    for(let i = 0; i < N; i++)
    {
        for(let j = 0; j < N; j++)
        {
            grid.rows[i].cells[j].firstChild.value = "";
        }
    }
}

// This function delete all timeOut (animations)
function clearAllTimeOuts()
{
    while(timeOutIDSameForAnyAnimation >= 0)
    {
        clearTimeout(timeOutIDSameForAnyAnimation);
        timeOutIDSameForAnyAnimation--;
    }
}

// Clear all colors from animations
function clearAllColors()
{
    for(let i = 0; i < inputs.length; i++)
    {
        inputs[i].classList.remove('active');
        inputs[i].classList.remove('succeeded');
    }
}

// Allow to click solve and choose speed again
function setAllowSolveSpeedAndAlgorithms()
{
    solve.setAttribute("style", "cursor: pointer"); // Allow to click solve button

    solve.addEventListener('click', clickedSolve);  // Add back eventListener for solve button

    liAroundSpeedDropdownMenu.setAttribute("style", "cursor: pointer"); // enable dropdown (pointerEvent)
}

// Not allow to click solve or choose speed
function setNotAllowSolveSpeedAndAlgorithms()
{
    solve.style.backgroundColor = "red";    // Turn solve button to red
    solve.style.cursor = "not-allowed";     // Change cursor mode
    solve.removeEventListener('click', clickedSolve);   // Remove any function when click

    liAroundSpeedDropdownMenu.setAttribute("style", "pointer-events: none"); // Cannot click Speed menu
}


//-------------------------------------------------DONE ClickedClear-------------------------------------------------
//-------------------------------------------------DONE ClickedClear-------------------------------------------------
//-------------------------------------------------DONE ClickedClear-------------------------------------------------

//---------------------------------------------START clickedRandomlyFill----------------------------------------------
//---------------------------------------------START clickedRandomlyFill----------------------------------------------
//---------------------------------------------START clickedRandomlyFill----------------------------------------------

// This function is called when we click the "Randomly-fill" button
function clickedRandomlyFill(e)
{
    clickedClear();  // Clear the board first

    // Pick a random 4x4 puzzle from the dataset in puzzles.js 
    let s = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    let matrix = [];
    for(let r = 0; r < N; r++)
        matrix.push(s.slice(r * N, r * N + N).split("").map(Number));
    printBoardOnWeb(matrix);
}

//---------------------------------------------DONE clickedRandomlyFill----------------------------------------------
//---------------------------------------------DONE clickedRandomlyFill----------------------------------------------
//---------------------------------------------DONE clickedRandomlyFill----------------------------------------------

//------------------------------------------------START clickedSolve-------------------------------------------------
//------------------------------------------------START clickedSolve-------------------------------------------------
//------------------------------------------------START clickedSolve-------------------------------------------------

// This function is called when we click the "Solve" button
// It solves with Backtracking (DFS) at the chosen speed (Medium by default)
function clickedSolve(e)
{
    // Verify input first
    if(verifyInput() == false) 
        return;

    if(speedDropDown.innerHTML === "Speed") // If haven't set speed
        speedDropDown.innerHTML = "Medium"; // Set to medium

    solveByBacktracking(e);
}

//------------------------------------------------START Backtracking-------------------------------------------------
//------------------------------------------------START Backtracking-------------------------------------------------
//------------------------------------------------START Backtracking-------------------------------------------------
function solveByBacktracking(e)
{
    backtrackingCountToPreventHanging = 0;
    setNotAllowSolveSpeedAndAlgorithms();   // Disable some buttons
    let matrix = readValue();               // Read values from web board

    backtracking(matrix);                   // Solving sudoku

    let timeAfterAllDone = (++backtrackingTimeCount) * backtrackingDuration;

    if(allBoardNonZero(matrix))             // If We actually have a solution
    {
        succeededNormalAnimation(backtrackingTimeCount, backtrackingDuration);
    }
    else
    {
        timeOutIDSameForAnyAnimation = setTimeout(alertNoSolution, timeAfterAllDone);
        timeOutIDSameForAnyAnimation = setTimeout(setAllowSolveSpeedAndAlgorithms, timeAfterAllDone);
    }

}

var backtrackingCountToPreventHanging = 0;
var backtrackingDuration = 1;
var backtrackingTimeCount = 0;
var timeOutIDSameForAnyAnimation = 0;
function backtracking(matrix)
{
    // Setting Speed
    backtrackingDuration = MEDIUM_SPEED;
    if(speedDropDown.innerHTML === 'Fast') backtrackingDuration = FAST_SPEED;
    else if(speedDropDown.innerHTML === 'Medium') backtrackingDuration = MEDIUM_SPEED;
    else if(speedDropDown.innerHTML === 'Slow') backtrackingDuration = SLOW_SPEED;
    else if(speedDropDown.innerHTML === 'Extra Slow') backtrackingDuration = EXTRA_SLOW_SPEED;


    backtrackingTimeCount = 0;  // Time count for scheduling animation
    
    // Find out which entries are user input (isFixed===true), which are empty (isFixed===false)
    let isFixed = new Array(N);
    for(let i = 0; i < isFixed.length; i++)
    {
        isFixed[i] = new Array(N);
        for(let j = 0; j < isFixed[i].length; j++)
        {
            if(matrix[i][j] !== 0)
            {
                isFixed[i][j] = true;
            }
            else
            {
                isFixed[i][j] = false;
            }
        }
    }

    let data = {cont: true};
    backtrackingHelper(matrix, isFixed, 0, 0, data); // Start at the top-left cell
}

function backtrackingHelper(matrix, isFixed, row, col, data)
{

    // If !data.cont or having our current entry at (row, col) lead to a clearly invalid sudoku board
    if(data.cont === false || !canBeCorrect(matrix, row, col))  // 1st stopping point
        return;

    // Backtracking is a naive solution.
    backtrackingCountToPreventHanging++;
    if(backtrackingCountToPreventHanging > 100000)  // Runs for too long without a solution
    {
        data.cont = false;  // Set the flag so that the rest of the recursive calls can stop at "stopping points"
        stopSolveSudokuBacktracking(); // Stop the program
        return;
    }

    if(row === N - 1 && col === N - 1)  // If reach the last entry
    {
        if(isFixed[row][col])   // The last entry is user input
        {
            if(canBeCorrect(matrix, row, col))  // And it doesn't create an invalid board
            {
                data.cont = false;  // Yesss!! Found the solution!
            }
            return;
        }
        else    // If it is not user input
        {
            for(let i = 1; i <= N; i++) 
            {
                matrix[row][col] = i; // Try 1-N
                timeOutIDSameForAnyAnimation = setTimeout(fillCell, (backtrackingTimeCount++)*backtrackingDuration, row, col, i);
                if(canBeCorrect(matrix, row, col)) // If found the solution
                {
                    data.cont = false; 
                    return;
                }
            }
            timeOutIDSameForAnyAnimation = setTimeout(emptyCell, (backtrackingTimeCount++)*backtrackingDuration, row, col);
            matrix[row][col] = 0;   // Otherwise, backtrack, reset the current entry to 0
        }
    }

    // Next cell: fill from left to right, from top to bottom
    let newRow = (col === N - 1) ? row + 1 : row;
    let newCol = (col === N - 1) ? 0 : col + 1;
    
    // If this entry is user input and is valid
    if(isFixed[row][col] && canBeCorrect(matrix, row, col))
    {
        backtrackingHelper(matrix, isFixed, newRow, newCol, data); // Continue next entry
    }
    // If it is empty
    else    
    {
        for(let i = 1; i <= N; i++) 
        {
            if(data.cont === false) // Stopping entry 2
                return;
            timeOutIDSameForAnyAnimation = setTimeout(fillCell, (backtrackingTimeCount++)*backtrackingDuration, row, col, i);
            matrix[row][col] = i; // Try 1-N

            if(canBeCorrect(matrix, row, col))  // If any of those values (1-N) can be valid
            {
                backtrackingHelper(matrix, isFixed, newRow, newCol, data); // recursively move on to the next cell
            }
        }
        if(data.cont === false) // Stopping entry 3
            return;
        timeOutIDSameForAnyAnimation = setTimeout(emptyCell, (backtrackingTimeCount++)*backtrackingDuration, row, col);
        matrix[row][col] = 0; // Backtrack, set entry to 0
    }
}

// This function is called when backtracking function is running for too long
// It will stop the function to prevent hanging
function stopSolveSudokuBacktracking()
{
    alert("Backtracking is a Naive Algorithm. It tends to do well when the majority of entries near the top are prefilled.\nThe program is taking too long to find a solution. It will be terminated to prevent hanging.");
    clickedClear();
}

// Normal animation when we have found the solution 
function succeededNormalAnimation(currentTimeCount, currentDuration)
{
    let currentTime = currentTimeCount * currentDuration;
    let succeededDuration = 20;
    let newCount = 0;
    for(let row = 0; row < N; row++)
    {
        for(let col = 0; col < N; col++)
        {
            timeOutIDSameForAnyAnimation = setTimeout(colorCell, 
                            currentTime + (newCount++)*succeededDuration, row, col);
        }
    }
    timeOutIDSameForAnyAnimation = setTimeout(setAllowSolveSpeedAndAlgorithms, currentTime + (newCount++)*succeededDuration);
}

//------------------------------------------------END Backtracking-------------------------------------------------
//------------------------------------------------END Backtracking-------------------------------------------------
//------------------------------------------------END Backtracking-------------------------------------------------

//-------------------------------------------------END clickedSolve--------------------------------------------------
//-------------------------------------------------END clickedSolve--------------------------------------------------
//-------------------------------------------------END clickedSolve--------------------------------------------------

//-----------------------------------------------START HelperFunction------------------------------------------------
//-----------------------------------------------START HelperFunction------------------------------------------------
//-----------------------------------------------START HelperFunction------------------------------------------------
function emptyCell(row, col)
{
    inputs[row*N+col].classList.remove('active');
    grid.rows[row].cells[col].firstChild.value = "";
}

function fillCell(row, col, val)
{
    inputs[row*N+col].classList.add('active');
    grid.rows[row].cells[col].firstChild.value = val;
}

function colorCell(row, col)
{
    inputs[row*N+col].classList.add('succeeded');
}

function canBeCorrect(matrix, row, col)
{
    // Check row
    for(let c = 0; c < N; c++)
    {
        if(matrix[row][col] !== 0 && col !== c && matrix[row][col] === matrix[row][c])
            return false;
    }
    
    // Check column
    for(let r = 0; r < N; r++)
    {
        if(matrix[row][col] !== 0 && row !== r && matrix[row][col] === matrix[r][col])
            return false;
    }
    
    // Check BxB square
    let r = Math.floor(row / B);
    let c = Math.floor(col / B);
    for(let i = r*B; i < r*B + B; i++)
    {
        for(let j = c * B; j < c*B + B; j++)
        {
            if((row !== i || col !== j) && matrix[i][j] !== 0 && matrix[i][j] === matrix[row][col])
                return false;
        }
    }

    return true;
}

function allBoardNonZero(grid)
{
    for(let i = 0; i < N; i++)
    {
        for(let j = 0; j < N; j++)
        {
            if(grid[i][j] === 0)
                return false;
        }
    }
    return true;
}

// Read value from web board to 2d array
function readValue()
{
    let matrix = new Array(N);
    for(let i = 0; i < N; i++)
    {
        matrix[i] = new Array(N);
        for(let j = 0; j < N; j++)
        {
            val = grid.rows[i].cells[j].firstChild.value;
            matrix[i][j] = (val === "") ? 0 : parseInt(val);
        }
    }
    return matrix;
}

// See if the input is valid
function verifyInput()
{
    for(let i = 0; i < N; i++)
    {
        for(let j = 0; j < N; j++)
        {
            let val = grid.rows[i].cells[j].firstChild.value;

            if((val != "" && Number.isNaN(parseInt(val))) || 0 >= parseInt(val) || N < parseInt(val))
            {
                alert("Please enter numbers from 1 to " + N);
                return false;
            }
        }
    }
    return true;
}

function alertNoSolution()
{
    alert("No Solution!");
}

function printBoardOnWeb(matrix)
{
    for(let i = 0; i < N; i++)
    {
        for(let j = 0; j < N; j++)
        {
            if(matrix[i][j] == 0)
                grid.rows[i].cells[j].firstChild.value = "";
            else
                grid.rows[i].cells[j].firstChild.value = matrix[i][j];
        }
    }
}
//-----------------------------------------------END HelperFunction------------------------------------------------
//-----------------------------------------------END HelperFunction------------------------------------------------
//-----------------------------------------------END HelperFunction------------------------------------------------
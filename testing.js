import fs from 'fs';

const puzzleCode = fs.readFileSync('./puzzle.js', 'utf8');
const PUZZLES = new Function(`${puzzleCode}\nreturn PUZZLES;`)();

const B = 2;
const N = B * B;

function canBeCorrect(matrix, row, col) {
    // Check row
    for (let c = 0; c < N; c++) {
        if (matrix[row][col] !== 0 && col !== c && matrix[row][col] === matrix[row][c]) {
            return false;
        }
    }

    // Check column
    for (let r = 0; r < N; r++) {
        if (matrix[row][col] !== 0 && row !== r && matrix[row][col] === matrix[r][col]) {
            return false;
        }
    }

    // Check BxB square
    let r = Math.floor(row / B);
    let c = Math.floor(col / B);
    for (let i = r * B; i < r * B + B; i++) {
        for (let j = c * B; j < c * B + B; j++) {
            if ((row !== i || col !== j) && matrix[i][j] !== 0 && matrix[i][j] === matrix[row][col]) {
                return false;
            }
        }
    }

    return true;
}

function allBoardNonZero(grid) {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (grid[i][j] === 0) return false;
        }
    }
    return true;
}

function runMainDFS(puzzleStr) {
    if (global.gc) global.gc();
    const memBefore = process.memoryUsage().heapUsed;

    let matrix = [];
    for (let r = 0; r < N; r++) {
        matrix.push(puzzleStr.slice(r * N, r * N + N).split("").map(Number));
    }

    let isFixed = Array.from({ length: N }, (_, i) =>
        Array.from({ length: N }, (_, j) => matrix[i][j] !== 0)
    );

    let data = { cont: true };
    let recursiveCalls = 0;
    let backtracks = 0;

    function backtrackingHelper(row, col) {
        recursiveCalls++;

        if (data.cont === false || !canBeCorrect(matrix, row, col)) {
            return;
        }

        if (row === N - 1 && col === N - 1) {
            if (isFixed[row][col]) {
                if (canBeCorrect(matrix, row, col)) {
                    data.cont = false;
                }
                return;
            } else {
                for (let i = 1; i <= N; i++) {
                    matrix[row][col] = i;
                    if (canBeCorrect(matrix, row, col)) {
                        data.cont = false;
                        return;
                    }
                }
                matrix[row][col] = 0;
                backtracks++;
                return;
            }
        }

        let newRow = (col === N - 1) ? row + 1 : row;
        let newCol = (col === N - 1) ? 0 : col + 1;

        if (isFixed[row][col] && canBeCorrect(matrix, row, col)) {
            backtrackingHelper(newRow, newCol);
        } else {
            for (let i = 1; i <= N; i++) {
                if (data.cont === false) return;
                matrix[row][col] = i;

                if (canBeCorrect(matrix, row, col)) {
                    backtrackingHelper(newRow, newCol);
                }
            }
            if (data.cont === false) return;
            matrix[row][col] = 0;
            backtracks++;
        }
    }

    const start = performance.now();
    backtrackingHelper(0, 0);
    const duration = performance.now() - start;

    const memAfter = process.memoryUsage().heapUsed;
    const memoryKB = Math.max(0, (memAfter - memBefore) / 1024);

    return {
        solved: allBoardNonZero(matrix),
        recursiveCalls,
        backtracks,
        duration,
        memoryKB
    };
}

const results = PUZZLES.map(runMainDFS);
const solvedCount = results.filter(r => r.solved).length;
const calls = results.map(r => r.recursiveCalls);
const bts = results.map(r => r.backtracks);
const times = results.map(r => r.duration);
const mems = results.map(r => r.memoryKB);
const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

console.log(`=== HASIL PENGUJIAN ${PUZZLES.length} ===`);
console.log(`PUZZLE Terselesaikan: ${solvedCount}/${PUZZLES.length} `)
console.log(`Rekursi   -> Min: ${Math.min(...calls)}, Avg: ${avg(calls).toFixed(2)}, Max: ${Math.max(...calls)}`);
console.log(`Backtrack -> Min: ${Math.min(...bts)}, Avg: ${avg(bts).toFixed(2)}, Max: ${Math.max(...bts)}`);
console.log(`Waktu(ms) -> Min: ${Math.min(...times).toFixed(4)}, Avg: ${avg(times).toFixed(4)}, Max: ${Math.max(...times).toFixed(4)}`);
console.log(`Memori(KB)-> Min: ${Math.min(...mems).toFixed(2)}, Avg: ${avg(mems).toFixed(2)}, Max: ${Math.max(...mems).toFixed(2)}`);
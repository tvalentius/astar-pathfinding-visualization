document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('grid');
    const setStartButton = document.getElementById('setStartButton');
    const setEndButton = document.getElementById('setEndButton');
    const ROWS = 20;
    const COLS = 20;

    let grid = [];
    let startNode = null;
    let endNode = null;
    let isMouseDown = false;
    let settingPoint = null; // 'start', 'end', or null

    // Generate the grid
    function createGrid() {
        gridElement.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
        gridElement.style.gridTemplateRows = `repeat(${ROWS}, 25px)`;
        for (let y = 0; y < ROWS; y++) {
            grid[y] = [];
            for (let x = 0; x < COLS; x++) {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.x = x;
                cellElement.dataset.y = y;

                // Handle mouse events
                cellElement.addEventListener('mousedown', (e) => {
                    isMouseDown = true;
                    if (settingPoint === null) {
                        toggleWall(cellElement);
                    }
                });
                cellElement.addEventListener('mouseover', (e) => {
                    if (isMouseDown && settingPoint === null) {
                        toggleWall(cellElement);
                    }
                });
                cellElement.addEventListener('mouseup', (e) => {
                    isMouseDown = false;
                });
                cellElement.addEventListener('click', (e) => {
                    if (settingPoint === 'start') {
                        setStart(cellElement);
                        settingPoint = null;
                    } else if (settingPoint === 'end') {
                        setEnd(cellElement);
                        settingPoint = null;
                    }
                });

                gridElement.appendChild(cellElement);
                grid[y][x] = {
                    x: x,
                    y: y,
                    f: 0,
                    g: 0,
                    h: 0,
                    neighbors: [],
                    parent: null,
                    wall: false,
                    cellElement: cellElement,
                };
            }
        }
    }

    function setStart(cellElement) {
        const x = parseInt(cellElement.dataset.x);
        const y = parseInt(cellElement.dataset.y);
        if (startNode) {
            startNode.cellElement.classList.remove('start');
        }
        startNode = grid[y][x];
        startNode.wall = false;
        startNode.cellElement.classList.remove('wall');
        startNode.cellElement.classList.add('start');
    }

    function setEnd(cellElement) {
        const x = parseInt(cellElement.dataset.x);
        const y = parseInt(cellElement.dataset.y);
        if (endNode) {
            endNode.cellElement.classList.remove('end');
        }
        endNode = grid[y][x];
        endNode.wall = false;
        endNode.cellElement.classList.remove('wall');
        endNode.cellElement.classList.add('end');
    }

    function toggleWall(cellElement) {
        const x = parseInt(cellElement.dataset.x);
        const y = parseInt(cellElement.dataset.y);
        const node = grid[y][x];
        if (node === startNode || node === endNode) {
            return;
        }
        node.wall = !node.wall;
        if (node.wall) {
            cellElement.classList.add('wall');
        } else {
            cellElement.classList.remove('wall');
        }
    }

    function addNeighbors(node) {
        const x = node.x;
        const y = node.y;
        if (x < COLS - 1) {
            node.neighbors.push(grid[y][x + 1]);
        }
        if (x > 0) {
            node.neighbors.push(grid[y][x - 1]);
        }
        if (y < ROWS - 1) {
            node.neighbors.push(grid[y + 1][x]);
        }
        if (y > 0) {
            node.neighbors.push(grid[y - 1][x]);
        }
    }

    function heuristic(a, b) {
        // Using Manhattan distance
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function aStar() {
        if (!startNode || !endNode) {
            alert('Please set both start and end points.');
            return;
        }

        let openSet = [];
        let closedSet = [];
        openSet.push(startNode);

        while (openSet.length > 0) {
            // Find node with the lowest f
            let lowestIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[lowestIndex].f) {
                    lowestIndex = i;
                }
            }
            let current = openSet[lowestIndex];

            if (current === endNode) {
                // Found the path
                let temp = current;
                while (temp.parent) {
                    temp.cellElement.classList.add('path');
                    temp = temp.parent;
                }
                startNode.cellElement.classList.add('path');
                return;
            }

            openSet.splice(lowestIndex, 1);
            closedSet.push(current);
            current.cellElement.classList.add('closed');

            addNeighbors(current);
            let neighbors = current.neighbors;
            for (let neighbor of neighbors) {
                if (!closedSet.includes(neighbor) && !neighbor.wall) {
                    let tempG = current.g + 1;
                    let newPath = false;
                    if (openSet.includes(neighbor)) {
                        if (tempG < neighbor.g) {
                            neighbor.g = tempG;
                            newPath = true;
                        }
                    } else {
                        neighbor.g = tempG;
                        newPath = true;
                        openSet.push(neighbor);
                        neighbor.cellElement.classList.add('open');
                    }
                    if (newPath) {
                        neighbor.h = heuristic(neighbor, endNode);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.parent = current;
                    }
                }
            }
            await sleep(20); // Slow down for visualization
        }
        alert('No path found');
    }

    document.getElementById('startButton').addEventListener('click', () => {
        // Reset visualization classes
        for (let row of grid) {
            for (let node of row) {
                node.cellElement.classList.remove('open', 'closed', 'path');
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.parent = null;
                node.neighbors = [];
            }
        }
        aStar();
    });

    document.getElementById('clearButton').addEventListener('click', () => {
        startNode = null;
        endNode = null;
        settingPoint = null;
        for (let row of grid) {
            for (let node of row) {
                node.wall = false;
                node.cellElement.className = 'cell';
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.parent = null;
                node.neighbors = [];
            }
        }
    });

    setStartButton.addEventListener('click', () => {
        settingPoint = 'start';
    });

    setEndButton.addEventListener('click', () => {
        settingPoint = 'end';
    });

    createGrid();
});
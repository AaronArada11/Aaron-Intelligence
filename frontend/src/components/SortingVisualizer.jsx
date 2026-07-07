import React from "react";
import '../index.css';
import '../SortingVisualizer.css';
import * as sortingAlgorithms from './sortingAlgorithms';
import {
    getAStarAnimations,
    getAStarSearchSteps,
    getDijkstraSearchSteps,
    getNodesInShortestPathOrder,
} from './pathAlgorithms';

const PRIMARY_COLOR = 'var(--ctp-accent)';
const SECONDARY_COLOR = "#dc143c";
const BAR_HEADROOM = 18;
const MIN_BAR_HEIGHT = 8;
const PATH_ROWS = 13;
const PATH_COLS = 35;
const START_NODE_ROW = 6;
const START_NODE_COL = 4;
const FINISH_NODE_ROW = 6;
const FINISH_NODE_COL = 30;
const RANDOM_MAZE_ATTEMPTS = 20;

export class SortingVisualizer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'sorting',
            array: [],
            animationSpeed: 5,
            numberOfArrayBars: 120,
            pathGrid: createInitialPathGrid(),
            pathAnimationSpeed: 18,
            isPathAnimating: false,
            isSortAnimating: false,
        };
        this.arrayContainerRef = React.createRef();
        this.resizeObserver = null;
        this.sortingAnimationTimeouts = [];
        this.pathAnimationTimeouts = [];
    }

    componentDidMount() {
        this.resetArray();
        this.resizeObserver = new ResizeObserver(() => {
            if (this.state.activeTab === 'sorting') {
                this.resetArray();
            }
        });
        this.observeArrayContainer();
    }

    componentWillUnmount() {
        this.resizeObserver?.disconnect();
        this.clearSortingAnimationTimeouts();
        this.clearPathAnimationTimeouts();
    }

    getMaxBarHeight() {
        const containerHeight = this.arrayContainerRef.current?.clientHeight;
        if (!containerHeight) return 360;

        return Math.max(MIN_BAR_HEIGHT, containerHeight - BAR_HEADROOM);
    }

    observeArrayContainer() {
        if (!this.resizeObserver || !this.arrayContainerRef.current) {
            return;
        }

        this.resizeObserver.disconnect();
        this.resizeObserver.observe(this.arrayContainerRef.current);
    }

    resetArray() {
        this.clearSortingAnimationTimeouts();
        const array = [];
        const { numberOfArrayBars } = this.state;
        const maxBarHeight = this.getMaxBarHeight();
        for (let i = 0; i < numberOfArrayBars; i++) {
            array.push(randomIntFromInterval(MIN_BAR_HEIGHT, maxBarHeight));
        }
        this.setState({ array, isSortAnimating: false });
    }

    handleSpeedChange = (event) => {
        if (this.state.isSortAnimating) return;
        this.setState({ animationSpeed: parseFloat(event.target.value) });
    }

    handleBarsChange = (event) => {
        if (this.state.isSortAnimating) return;
        this.setState({ numberOfArrayBars: parseInt(event.target.value) }, () => {
            this.resetArray();
        });
    }

    handlePathSpeedChange = (event) => {
        this.setState({ pathAnimationSpeed: parseInt(event.target.value) });
    }

    setActiveTab = (activeTab) => {
        this.clearSortingAnimationTimeouts();
        this.setState({ activeTab }, () => {
            if (activeTab === 'sorting') {
                this.observeArrayContainer();
                this.resetArray();
            }
        });
    }

    handleTabKeyDown = (event) => {
        const tabs = ['sorting', 'pathfinding'];
        const currentIndex = tabs.indexOf(this.state.activeTab);

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            this.setActiveTab(tabs[(currentIndex + 1) % tabs.length]);
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this.setActiveTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
        }

        if (event.key === 'Home') {
            event.preventDefault();
            this.setActiveTab(tabs[0]);
        }

        if (event.key === 'End') {
            event.preventDefault();
            this.setActiveTab(tabs[tabs.length - 1]);
        }
    }

    clearSortingAnimationTimeouts() {
        for (const timeoutId of this.sortingAnimationTimeouts) {
            window.clearTimeout(timeoutId);
        }
        this.sortingAnimationTimeouts = [];
    }

    clearPathAnimationTimeouts() {
        for (const timeoutId of this.pathAnimationTimeouts) {
            window.clearTimeout(timeoutId);
        }
        this.pathAnimationTimeouts = [];
    }

    resetPathGrid = () => {
        this.clearPathAnimationTimeouts();
        this.setState({
            pathGrid: createInitialPathGrid(),
            isPathAnimating: false,
        });
    }

    clearPath = () => {
        if (this.state.isPathAnimating) return;

        this.setState(({ pathGrid }) => ({
            pathGrid: clearPathStatuses(pathGrid),
        }));
    }

    generatePathWalls = () => {
        if (this.state.isPathAnimating) return;

        this.setState({
            pathGrid: createRandomMazeGrid(),
        });
    }

    visualizeAStar = () => {
        this.visualizePathAlgorithm(getAStarSearchSteps);
    }

    visualizeDijkstra = () => {
        this.visualizePathAlgorithm(getDijkstraSearchSteps);
    }

    visualizePathAlgorithm(getSearchSteps) {
        if (this.state.isPathAnimating) return;

        this.clearPathAnimationTimeouts();

        const displayGrid = clearPathStatuses(this.state.pathGrid);
        const algorithmGrid = clonePathGrid(displayGrid);
        const startNode = algorithmGrid[START_NODE_ROW][START_NODE_COL];
        const finishNode = algorithmGrid[FINISH_NODE_ROW][FINISH_NODE_COL];
        const searchSteps = getSearchSteps(
            algorithmGrid,
            startNode,
            finishNode,
        );
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);

        this.setState({
            pathGrid: displayGrid,
            isPathAnimating: true,
        }, () => {
            this.animateSearchSteps(searchSteps, nodesInShortestPathOrder);
        });
    }

    animateSearchSteps(searchSteps, nodesInShortestPathOrder) {
        const { pathAnimationSpeed } = this.state;

        for (let i = 0; i <= searchSteps.length; i++) {
            const timeoutId = window.setTimeout(() => {
                if (i === searchSteps.length) {
                    this.animateShortestPath(nodesInShortestPathOrder);
                    return;
                }

                const { node, status } = searchSteps[i];
                this.updatePathNodeStatus(node.row, node.col, status);
            }, pathAnimationSpeed * i);

            this.pathAnimationTimeouts.push(timeoutId);
        }
    }

    animateShortestPath(nodesInShortestPathOrder) {
        const { pathAnimationSpeed } = this.state;
        const pathDelay = Math.max(10, pathAnimationSpeed * 1.6);

        if (nodesInShortestPathOrder.length === 0) {
            this.setState({ isPathAnimating: false });
            return;
        }

        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            const timeoutId = window.setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                this.updatePathNodeStatus(node.row, node.col, 'shortest-path');

                if (i === nodesInShortestPathOrder.length - 1) {
                    this.setState({ isPathAnimating: false });
                }
            }, pathDelay * i);

            this.pathAnimationTimeouts.push(timeoutId);
        }
    }

    updatePathNodeStatus(row, col, status) {
        if (isStartNode(row, col) || isFinishNode(row, col)) {
            return;
        }

        this.setState(({ pathGrid }) => ({
            pathGrid: pathGrid.map((gridRow) => (
                gridRow.map((node) => (
                    node.row === row && node.col === col
                        ? { ...node, status }
                        : node
                ))
            )),
        }));
    }

    getArrayBars() {
        return Array.from(
            this.arrayContainerRef.current?.getElementsByClassName('array-bar') ?? []
        );
    }

    applySortingAnimationStep(animation, index, groupSize) {
        const arrayBars = this.getArrayBars();
        const groupPos = index % groupSize;
        const isColorChange = groupSize === 3
            ? groupPos !== 2
            : groupPos === 0 || groupPos === 1;

        if (isColorChange) {
            const [barOneIdx, barTwoIdx] = animation;
            const barOne = arrayBars[barOneIdx];
            const barTwo = arrayBars[barTwoIdx];

            if (!barOne || !barTwo) return;

            const color = groupPos === 0 ? SECONDARY_COLOR : PRIMARY_COLOR;
            barOne.style.backgroundColor = color;
            barTwo.style.backgroundColor = color;
            return;
        }

        const [barIdx, newHeight] = animation;
        const bar = arrayBars[barIdx];
        if (!bar) return;

        bar.style.height = `${newHeight}px`;
    }

    runSortingAnimation(getAnimations, groupSize = 4) {
        if (this.state.isSortAnimating) return;

        const animations = getAnimations(this.state.array.slice());
        if (animations.length === 0) return;

        this.clearSortingAnimationTimeouts();
        this.setState({ isSortAnimating: true }, () => {
            const { animationSpeed } = this.state;

            for (let i = 0; i < animations.length; i++) {
                const timeoutId = window.setTimeout(() => {
                    this.applySortingAnimationStep(animations[i], i, groupSize);

                    if (i === animations.length - 1) {
                        this.sortingAnimationTimeouts = [];
                        this.setState({ isSortAnimating: false });
                    }
                }, i * animationSpeed);

                this.sortingAnimationTimeouts.push(timeoutId);
            }
        });
    }

    mergeSort = () => {
        this.runSortingAnimation(sortingAlgorithms.getMergeSortAnimations, 3);
    }

    quickSort = () => {
        this.runSortingAnimation(sortingAlgorithms.getQuickSortAnimations);
    }

    heapSort = () => {
        this.runSortingAnimation(sortingAlgorithms.getHeapSortAnimations);
    }

    bubbleSort = () => {
        this.runSortingAnimation(sortingAlgorithms.getBubbleSortAnimations);
    }

    selectionSort = () => {
        this.runSortingAnimation(sortingAlgorithms.getSelectionSortAnimations);
    }

    radixSort = () => {
        this.runSortingAnimation(sortingAlgorithms.getRadixSortAnimations);
    }

    insertionSort = () => {
        this.runSortingAnimation(sortingAlgorithms.getInsertionSortAnimations);
    }

    render() {
        const {
            activeTab,
            array,
            animationSpeed,
            numberOfArrayBars,
            pathGrid,
            pathAnimationSpeed,
            isPathAnimating,
            isSortAnimating,
        } = this.state;
        const isSortingActive = activeTab === 'sorting';
        const isPathfindingActive = activeTab === 'pathfinding';

        return (
            <div className="parent">
                <div
                    className="algo-tabs"
                    role="tablist"
                    aria-label="AlgoVisualizer categories"
                    onKeyDown={this.handleTabKeyDown}
                >
                    <button
                        id="sorting-tab"
                        type="button"
                        role="tab"
                        aria-selected={isSortingActive}
                        aria-controls="sorting-panel"
                        tabIndex={isSortingActive ? 0 : -1}
                        className={isSortingActive ? 'active' : ''}
                        onClick={() => this.setActiveTab('sorting')}
                    >
                        Sorting Algorithms
                    </button>
                    <button
                        id="pathfinding-tab"
                        type="button"
                        role="tab"
                        aria-selected={isPathfindingActive}
                        aria-controls="pathfinding-panel"
                        tabIndex={isPathfindingActive ? 0 : -1}
                        className={isPathfindingActive ? 'active' : ''}
                        onClick={() => this.setActiveTab('pathfinding')}
                    >
                        Path Finding Algorithms
                    </button>
                </div>

                {isSortingActive && (
                    <div
                        id="sorting-panel"
                        role="tabpanel"
                        aria-labelledby="sorting-tab"
                        className="algo-panel"
                    >
                        <div className="div1">
                            <button onClick={() => this.resetArray()}>Generate New Array</button>
                            <button onClick={this.mergeSort} disabled={isSortAnimating}>Merge Sort</button>
                            <button onClick={this.quickSort} disabled={isSortAnimating}>Quick Sort</button>
                            <button onClick={this.heapSort} disabled={isSortAnimating}>Heap Sort</button>
                            <button onClick={this.bubbleSort} disabled={isSortAnimating}>Bubble Sort</button>
                            <button onClick={this.selectionSort} disabled={isSortAnimating}>Selection Sort</button>
                            <button onClick={this.radixSort} disabled={isSortAnimating}>Radix Sort</button>
                            <button onClick={this.insertionSort} disabled={isSortAnimating}>Insertion Sort</button>
                        </div>
                        <div className="div2">
                            <div className="slider-container">
                                <label htmlFor="speed-slider">Animation Speed: {animationSpeed}ms</label>
                                <input
                                    id="speed-slider"
                                    type="range"
                                    min={1}
                                    max={15}
                                    step={1}
                                    value={animationSpeed}
                                    onChange={this.handleSpeedChange}
                                    disabled={isSortAnimating}
                                />
                            </div>
                            <div className="slider-container">
                                <label htmlFor="bars-slider">Number of Bars: {numberOfArrayBars}</label>
                                <input
                                    id="bars-slider"
                                    type="range"
                                    min={5}
                                    max={120}
                                    step={1}
                                    value={numberOfArrayBars}
                                    onChange={this.handleBarsChange}
                                    disabled={isSortAnimating}
                                />
                            </div>
                        </div>
                        <div className="div3 array-container" ref={this.arrayContainerRef}>
                            {array.map((value, idx) => (
                                <div className="array-bar"
                                    key={idx}
                                    style={{
                                    height: `${value}px`,
                                    backgroundColor: PRIMARY_COLOR,
                                    }}></div>
                            ))}
                        </div>
                    </div>
                )}

                {isPathfindingActive && (
                    <div
                        id="pathfinding-panel"
                        role="tabpanel"
                        aria-labelledby="pathfinding-tab"
                        className="algo-panel"
                    >
                        <div className="div1">
                            <button
                                type="button"
                                onClick={this.visualizeAStar}
                                disabled={isPathAnimating}
                            >
                                A*
                            </button>
                            <button
                                type="button"
                                onClick={this.visualizeDijkstra}
                                disabled={isPathAnimating}
                            >
                                Dijkstra
                            </button>
                            <button
                                type="button"
                                onClick={this.generatePathWalls}
                                disabled={isPathAnimating}
                            >
                                Generate Maze
                            </button>
                            <button
                                type="button"
                                onClick={this.clearPath}
                                disabled={isPathAnimating}
                            >
                                Clear Path
                            </button>
                            <button
                                type="button"
                                onClick={this.resetPathGrid}
                            >
                                Reset Board
                            </button>
                        </div>
                        <div className="div2">
                            <div className="slider-container">
                                <label htmlFor="path-speed-slider">
                                    Path Animation Speed: {pathAnimationSpeed}ms
                                </label>
                                <input
                                    id="path-speed-slider"
                                    type="range"
                                    min={5}
                                    max={60}
                                    step={1}
                                    value={pathAnimationSpeed}
                                    onChange={this.handlePathSpeedChange}
                                    disabled={isPathAnimating}
                                />
                            </div>
                            <div className="path-legend" aria-label="Pathfinding legend">
                                <span><i className="path-swatch start"></i>Start</span>
                                <span><i className="path-swatch finish"></i>Finish</span>
                                <span><i className="path-swatch wall"></i>Wall</span>
                                <span><i className="path-swatch frontier"></i>Open</span>
                                <span><i className="path-swatch visited"></i>Visited</span>
                                <span><i className="path-swatch shortest-path"></i>Path</span>
                            </div>
                        </div>
                        <div
                            className="path-grid"
                            role="grid"
                            aria-label="Pathfinding grid"
                            style={{
                                gridTemplateColumns: `repeat(${PATH_COLS}, minmax(0, 1fr))`,
                            }}
                        >
                            {pathGrid.map((row) => (
                                row.map((node) => (
                                    <div
                                        key={`${node.row}-${node.col}`}
                                        role="gridcell"
                                        className={getPathNodeClassName(node)}
                                        aria-label={getPathNodeLabel(node)}
                                    ></div>
                                ))
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function createInitialPathGrid() {
    const grid = [];

    for (let row = 0; row < PATH_ROWS; row++) {
        const currentRow = [];

        for (let col = 0; col < PATH_COLS; col++) {
            currentRow.push(createPathNode(row, col));
        }

        grid.push(currentRow);
    }

    return grid;
}

function createRandomMazeGrid() {
    for (let attempt = 0; attempt < RANDOM_MAZE_ATTEMPTS; attempt++) {
        const grid = createInitialPathGrid();

        addMazeBorderWalls(grid);
        divideMaze(grid, 1, PATH_ROWS - 2, 1, PATH_COLS - 2);
        clearEndpointOpenings(grid);

        if (hasPathFromStartToFinish(grid)) {
            return grid;
        }
    }

    return createInitialPathGrid();
}

function createPathNode(row, col) {
    const isStart = isStartNode(row, col);
    const isFinish = isFinishNode(row, col);

    return {
        row,
        col,
        isStart,
        isFinish,
        isWall: false,
        status: 'unvisited',
    };
}

function addMazeBorderWalls(grid) {
    for (const row of grid) {
        for (const node of row) {
            node.isWall =
                node.row === 0 ||
                node.row === PATH_ROWS - 1 ||
                node.col === 0 ||
                node.col === PATH_COLS - 1;
        }
    }
}

function divideMaze(grid, rowStart, rowEnd, colStart, colEnd) {
    const width = colEnd - colStart + 1;
    const height = rowEnd - rowStart + 1;

    if (width < 3 || height < 3) {
        return;
    }

    const isHorizontal = height > width
        ? true
        : width > height
          ? false
          : Math.random() < 0.5;

    if (isHorizontal) {
        const wallRow = getRandomEvenNumber(rowStart + 1, rowEnd - 1);
        const passageCol = getRandomOddNumber(colStart, colEnd);

        if (wallRow === null || passageCol === null) {
            return;
        }

        for (let col = colStart; col <= colEnd; col++) {
            if (col !== passageCol && !isNearEndpoint(wallRow, col)) {
                grid[wallRow][col].isWall = true;
            }
        }

        divideMaze(grid, rowStart, wallRow - 1, colStart, colEnd);
        divideMaze(grid, wallRow + 1, rowEnd, colStart, colEnd);
        return;
    }

    const wallCol = getRandomEvenNumber(colStart + 1, colEnd - 1);
    const passageRow = getRandomOddNumber(rowStart, rowEnd);

    if (wallCol === null || passageRow === null) {
        return;
    }

    for (let row = rowStart; row <= rowEnd; row++) {
        if (row !== passageRow && !isNearEndpoint(row, wallCol)) {
            grid[row][wallCol].isWall = true;
        }
    }

    divideMaze(grid, rowStart, rowEnd, colStart, wallCol - 1);
    divideMaze(grid, rowStart, rowEnd, wallCol + 1, colEnd);
}

function clearEndpointOpenings(grid) {
    for (let row = 0; row < PATH_ROWS; row++) {
        for (let col = 0; col < PATH_COLS; col++) {
            if (isNearEndpoint(row, col)) {
                grid[row][col].isWall = false;
            }
        }
    }
}

function getRandomEvenNumber(min, max) {
    const numbers = [];

    for (let value = min; value <= max; value++) {
        if (value % 2 === 0) numbers.push(value);
    }

    return getRandomArrayItem(numbers);
}

function getRandomOddNumber(min, max) {
    const numbers = [];

    for (let value = min; value <= max; value++) {
        if (value % 2 !== 0) numbers.push(value);
    }

    return getRandomArrayItem(numbers);
}

function getRandomArrayItem(array) {
    if (array.length === 0) {
        return null;
    }

    return array[Math.floor(Math.random() * array.length)];
}

function hasPathFromStartToFinish(grid) {
    const algorithmGrid = clonePathGrid(grid);
    const startNode = algorithmGrid[START_NODE_ROW][START_NODE_COL];
    const finishNode = algorithmGrid[FINISH_NODE_ROW][FINISH_NODE_COL];

    getAStarAnimations(algorithmGrid, startNode, finishNode);

    return getNodesInShortestPathOrder(finishNode).length > 0;
}

function clonePathGrid(grid) {
    return grid.map((row) => row.map((node) => ({ ...node })));
}

function clearPathStatuses(grid) {
    return grid.map((row) => (
        row.map((node) => ({
            ...node,
            status: 'unvisited',
        }))
    ));
}

function isStartNode(row, col) {
    return row === START_NODE_ROW && col === START_NODE_COL;
}

function isFinishNode(row, col) {
    return row === FINISH_NODE_ROW && col === FINISH_NODE_COL;
}

function isNearEndpoint(row, col) {
    const distanceFromStart =
        Math.abs(row - START_NODE_ROW) + Math.abs(col - START_NODE_COL);
    const distanceFromFinish =
        Math.abs(row - FINISH_NODE_ROW) + Math.abs(col - FINISH_NODE_COL);

    return distanceFromStart <= 1 || distanceFromFinish <= 1;
}

function getPathNodeClassName(node) {
    const classNames = ['path-node'];

    if (node.isStart) classNames.push('start');
    if (node.isFinish) classNames.push('finish');
    if (node.isWall) classNames.push('wall');
    if (!node.isStart && !node.isFinish && !node.isWall && node.status) {
        classNames.push(node.status);
    }

    return classNames.join(' ');
}

function getPathNodeLabel(node) {
    if (node.isStart) return `Start node at row ${node.row + 1}, column ${node.col + 1}`;
    if (node.isFinish) return `Finish node at row ${node.row + 1}, column ${node.col + 1}`;
    if (node.isWall) return `Wall at row ${node.row + 1}, column ${node.col + 1}`;
    if (node.status === 'shortest-path') {
        return `Shortest path node at row ${node.row + 1}, column ${node.col + 1}`;
    }
    if (node.status === 'frontier') {
        return `Open frontier node at row ${node.row + 1}, column ${node.col + 1}`;
    }
    if (node.status === 'visited') {
        return `Visited node at row ${node.row + 1}, column ${node.col + 1}`;
    }

    return `Open node at row ${node.row + 1}, column ${node.col + 1}`;
}

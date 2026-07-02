export function getAStarAnimations(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];

  if (!grid?.length || !startNode || !finishNode) {
    return visitedNodesInOrder;
  }

  initializeNodes(grid, finishNode);

  startNode.distance = 0;
  startNode.heuristic = getManhattanDistance(startNode, finishNode);
  startNode.totalDistance = startNode.heuristic;

  const openSet = [startNode];
  const openSetIds = new Set([getNodeId(startNode)]);

  while (openSet.length > 0) {
    sortNodesByBestScore(openSet);
    const currentNode = openSet.shift();
    openSetIds.delete(getNodeId(currentNode));

    if (currentNode.isWall || currentNode.isVisited) {
      continue;
    }

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    if (isSameNode(currentNode, finishNode)) {
      return visitedNodesInOrder;
    }

    updateUnvisitedNeighbors(currentNode, grid, finishNode, openSet, openSetIds);
  }

  return visitedNodesInOrder;
}

export function getAStarSearchSteps(grid, startNode, finishNode) {
  const searchSteps = [];

  if (!grid?.length || !startNode || !finishNode) {
    return searchSteps;
  }

  initializeNodes(grid, finishNode);

  startNode.distance = 0;
  startNode.heuristic = getManhattanDistance(startNode, finishNode);
  startNode.totalDistance = startNode.heuristic;

  const openSet = [startNode];
  const openSetIds = new Set([getNodeId(startNode)]);

  while (openSet.length > 0) {
    sortNodesByBestScore(openSet);
    const currentNode = openSet.shift();
    openSetIds.delete(getNodeId(currentNode));

    if (currentNode.isWall || currentNode.isVisited) {
      continue;
    }

    currentNode.isVisited = true;
    searchSteps.push({ node: currentNode, status: 'visited' });

    if (isSameNode(currentNode, finishNode)) {
      return searchSteps;
    }

    updateUnvisitedNeighbors(
      currentNode,
      grid,
      finishNode,
      openSet,
      openSetIds,
      searchSteps,
    );
  }

  return searchSteps;
}

export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];

  if (!finishNode || finishNode.distance === Infinity) {
    return nodesInShortestPathOrder;
  }

  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return nodesInShortestPathOrder;
}

function getManhattanDistance(nodeA, nodeB) {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function initializeNodes(grid, finishNode) {
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity;
      node.heuristic = getManhattanDistance(node, finishNode);
      node.totalDistance = Infinity;
      node.previousNode = null;
      node.isVisited = false;
    }
  }
}

function updateUnvisitedNeighbors(
  node,
  grid,
  finishNode,
  openSet,
  openSetIds,
  searchSteps,
) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);

  for (const neighbor of unvisitedNeighbors) {
    if (neighbor.isWall) {
      continue;
    }

    const tentativeDistance = node.distance + getMovementCost(neighbor);

    if (tentativeDistance >= neighbor.distance) {
      continue;
    }

    neighbor.distance = tentativeDistance;
    neighbor.heuristic = getManhattanDistance(neighbor, finishNode);
    neighbor.totalDistance = neighbor.distance + neighbor.heuristic;
    neighbor.previousNode = node;

    const neighborId = getNodeId(neighbor);
    if (!openSetIds.has(neighborId)) {
      openSet.push(neighbor);
      openSetIds.add(neighborId);
      searchSteps?.push({ node: neighbor, status: 'frontier' });
    }
  }
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

function getMovementCost(neighbor) {
  const weight = Number(neighbor.weight);
  return Number.isFinite(weight) && weight > 0 ? weight : 1;
}

function sortNodesByBestScore(nodes) {
  nodes.sort((nodeA, nodeB) => {
    if (nodeA.totalDistance === nodeB.totalDistance) {
      return nodeA.heuristic - nodeB.heuristic;
    }

    return nodeA.totalDistance - nodeB.totalDistance;
  });
}

function isSameNode(nodeA, nodeB) {
  return nodeA.row === nodeB.row && nodeA.col === nodeB.col;
}

function getNodeId(node) {
  return `${node.row}-${node.col}`;
}

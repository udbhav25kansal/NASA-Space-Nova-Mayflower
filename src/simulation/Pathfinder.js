/**
 * Pathfinder.js
 *
 * A* pathfinding algorithm for crew navigation
 * Inspired by CorsixTH's th_pathfind.cpp
 *
 * Finds optimal paths through the tile-based habitat grid
 */

class Pathfinder {
  constructor(tileSystem) {
    this.tileSystem = tileSystem;
  }

  /**
   * Find path between two tile positions
   * @param {number} startX - Starting tile X
   * @param {number} startY - Starting tile Y
   * @param {number} endX - Target tile X
   * @param {number} endY - Target tile Y
   * @returns {Array<{x, y}>|null} - Array of tiles forming path, or null if no path
   */
  findPath(startX, startY, endX, endY) {
    const startTile = this.tileSystem.getTile(startX, startY);
    const endTile = this.tileSystem.getTile(endX, endY);

    // Validate tiles
    if (!startTile || !endTile) {
      console.warn('Invalid start or end tile');
      return null;
    }

    if (!endTile.passable && !endTile.doorTile) {
      console.warn('Target tile is not passable');
      return null;
    }

    // Same tile
    if (startX === endX && startY === endY) {
      return [startTile];
    }

    // Reset pathfinding data
    this.tileSystem.resetPathfindingData();

    // A* algorithm
    const openSet = [startTile];
    const closedSet = new Set();

    startTile.gScore = 0;
    startTile.fScore = this.heuristic(startTile, endTile);

    while (openSet.length > 0) {
      // Get tile with lowest fScore
      const current = this.getLowestFScore(openSet);

      // Reached goal
      if (current === endTile) {
        return this.reconstructPath(endTile);
      }

      // Move to closed set
      const index = openSet.indexOf(current);
      openSet.splice(index, 1);
      closedSet.add(current);

      // Check neighbors
      const neighbors = this.tileSystem.getNeighbors(current.x, current.y);

      for (const { tile: neighbor } of neighbors) {
        // Skip impassable or closed tiles
        if ((!neighbor.passable && !neighbor.doorTile) || closedSet.has(neighbor)) {
          continue;
        }

        // Calculate tentative gScore
        const tentativeGScore = current.gScore + this.getMoveCost(current, neighbor);

        // Add to open set if not present
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } else if (tentativeGScore >= neighbor.gScore) {
          // Not a better path
          continue;
        }

        // This is the best path so far
        neighbor.cameFrom = current;
        neighbor.gScore = tentativeGScore;
        neighbor.fScore = tentativeGScore + this.heuristic(neighbor, endTile);
      }
    }

    // No path found
    console.warn(`No path from (${startX},${startY}) to (${endX},${endY})`);
    return null;
  }

  /**
   * Heuristic function (Manhattan distance)
   * @param {Object} tile - Current tile
   * @param {Object} goal - Goal tile
   * @returns {number} - Estimated distance
   */
  heuristic(tile, goal) {
    return Math.abs(tile.x - goal.x) + Math.abs(tile.y - goal.y);
  }

  /**
   * Get move cost between adjacent tiles
   * @param {Object} from - Source tile
   * @param {Object} to - Destination tile
   * @returns {number} - Cost to move
   */
  getMoveCost(from, to) {
    let cost = 1.0;

    // Door tiles have slightly higher cost
    if (to.doorTile) {
      cost += 0.1;
    }

    // Zone transitions have higher cost (prefer staying in same zone)
    if (from.zone && to.zone && from.zone !== to.zone) {
      cost += 0.3;
    }

    return cost;
  }

  /**
   * Get tile with lowest fScore from open set
   * @param {Array} openSet - Array of tiles
   * @returns {Object} - Tile with lowest fScore
   */
  getLowestFScore(openSet) {
    return openSet.reduce((lowest, tile) => {
      return tile.fScore < lowest.fScore ? tile : lowest;
    });
  }

  /**
   * Reconstruct path from end tile back to start
   * @param {Object} endTile - Goal tile
   * @returns {Array<{x, y}>} - Path as array of {x, y} coordinates
   */
  reconstructPath(endTile) {
    const path = [];
    let current = endTile;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.cameFrom;
    }

    return path;
  }

  /**
   * Find nearest passable tile to target (if target is blocked)
   * @param {number} targetX - Target tile X
   * @param {number} targetY - Target tile Y
   * @param {number} maxDistance - Maximum search radius
   * @returns {{x, y}|null} - Nearest passable tile or null
   */
  findNearestPassableTile(targetX, targetY, maxDistance = 5) {
    const targetTile = this.tileSystem.getTile(targetX, targetY);
    if (!targetTile) return null;

    // Target is already passable
    if (targetTile.passable || targetTile.doorTile) {
      return { x: targetX, y: targetY };
    }

    // Spiral search outward
    for (let radius = 1; radius <= maxDistance; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          // Only check tiles at current radius
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
            continue;
          }

          const tile = this.tileSystem.getTile(targetX + dx, targetY + dy);
          if (tile && (tile.passable || tile.doorTile)) {
            return { x: tile.x, y: tile.y };
          }
        }
      }
    }

    return null;
  }

  /**
   * Check if there's a clear line of sight between two tiles
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @returns {boolean} - True if clear line of sight
   */
  hasLineOfSight(x1, y1, x2, y2) {
    // Bresenham's line algorithm
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;

    let err = dx - dy;
    let currentX = x1;
    let currentY = y1;

    while (true) {
      const tile = this.tileSystem.getTile(currentX, currentY);
      if (!tile || (!tile.passable && !tile.doorTile)) {
        return false;
      }

      if (currentX === x2 && currentY === y2) {
        return true;
      }

      const e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        currentX += sx;
      }

      if (e2 < dx) {
        err += dx;
        currentY += sy;
      }
    }
  }

  /**
   * Get all reachable tiles from a starting position
   * @param {number} startX - Start tile X
   * @param {number} startY - Start tile Y
   * @param {number} maxDistance - Maximum path length
   * @returns {Array<Object>} - Array of reachable tiles with distances
   */
  getReachableTiles(startX, startY, maxDistance = 10) {
    const startTile = this.tileSystem.getTile(startX, startY);
    if (!startTile) return [];

    this.tileSystem.resetPathfindingData();

    const reachable = [];
    const queue = [startTile];
    startTile.gScore = 0;

    while (queue.length > 0) {
      const current = queue.shift();

      reachable.push({
        x: current.x,
        y: current.y,
        distance: current.gScore
      });

      // Explore neighbors
      const neighbors = this.tileSystem.getNeighbors(current.x, current.y);

      for (const { tile: neighbor } of neighbors) {
        if (!neighbor.passable && !neighbor.doorTile) continue;

        const distance = current.gScore + 1;

        if (distance <= maxDistance && distance < neighbor.gScore) {
          neighbor.gScore = distance;
          neighbor.cameFrom = current;

          if (!queue.includes(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }

    return reachable;
  }
}

export default Pathfinder;

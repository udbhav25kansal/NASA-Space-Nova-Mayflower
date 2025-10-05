/**
 * TileSystem.js
 *
 * Tile-Based Coordinate System for Habitat Layout
 * Inspired by CorsixTH's map system
 *
 * Grid: 12 tiles (X) × 8 tiles (Y)
 * Tile size: 1.0 meters (NASA standard)
 * Origin: Center of habitat floor
 *
 * NASA Compliance:
 * - 1m grid matches NASA spacing requirements
 * - 12m × 8m habitat bounds (AIAA 2022)
 * - Supports path width validation (≥1.0m)
 */

class TileSystem {
  constructor(width = 12, height = 8, tileSize = 1.0) {
    this.width = width;        // tiles in X direction
    this.height = height;      // tiles in Y direction
    this.tileSize = tileSize;  // meters per tile

    // 2D tile array
    this.tiles = this.initializeTiles();
  }

  /**
   * Initialize tile grid with default properties
   * @returns {Array<Array<Object>>} 2D array of tile objects
   */
  initializeTiles() {
    const tiles = [];

    for (let y = 0; y < this.height; y++) {
      tiles[y] = [];

      for (let x = 0; x < this.width; x++) {
        tiles[y][x] = {
          // Position
          x,
          y,

          // Occupancy
          occupied: false,      // Is tile occupied by module?
          moduleId: null,       // Which module occupies this tile?
          objectId: null,       // Object placed on this tile?

          // Navigation
          passable: true,       // Can crew walk on this tile?
          pathCost: 1.0,        // Base cost for pathfinding

          // Room assignment
          roomId: null,         // Which module does this belong to?
          doorTile: false,      // Is this a door/entrance tile?
          isDoor: false,        // Alias for doorTile (for compatibility)

          // NASA zones
          zone: null,           // 'clean' or 'dirty'

          // Pathfinding data (populated during A* search)
          gScore: Infinity,     // Actual distance from start
          fScore: Infinity,     // Estimated total cost
          cameFrom: null,       // Previous tile in path
        };
      }
    }

    return tiles;
  }

  /**
   * Convert tile coordinates to Three.js world coordinates
   *
   * Origin is at center of habitat, so we offset by half dimensions.
   * Each tile center is at (x+0.5, z+0.5) in tile space.
   *
   * @param {number} tileX - Tile X coordinate (0 to width-1)
   * @param {number} tileY - Tile Y coordinate (0 to height-1)
   * @returns {{x: number, y: number, z: number}} World position
   */
  tileToWorld(tileX, tileY) {
    const worldX = (tileX - this.width / 2 + 0.5) * this.tileSize;
    const worldZ = (tileY - this.height / 2 + 0.5) * this.tileSize;

    return {
      x: worldX,
      y: 0,        // Floor level
      z: worldZ
    };
  }

  /**
   * Convert Three.js world coordinates to tile coordinates
   *
   * @param {number} worldX - World X coordinate
   * @param {number} worldZ - World Z coordinate
   * @returns {{tileX: number, tileY: number}} Tile position
   */
  worldToTile(worldX, worldZ) {
    const tileX = Math.floor((worldX / this.tileSize) + (this.width / 2));
    const tileY = Math.floor((worldZ / this.tileSize) + (this.height / 2));

    return { tileX, tileY };
  }

  /**
   * Check if tile coordinates are within grid bounds
   *
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {boolean} True if valid
   */
  isValidTile(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Get tile object at coordinates
   *
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {Object|null} Tile object or null if invalid
   */
  getTile(x, y) {
    if (!this.isValidTile(x, y)) return null;
    return this.tiles[y][x];
  }

  /**
   * Get neighboring tiles (4-directional: N, E, S, W)
   *
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {Array<{tile: Object, direction: string}>} Array of neighbors
   */
  getNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1, dir: 'north' },
      { dx: 1, dy: 0, dir: 'east' },
      { dx: 0, dy: 1, dir: 'south' },
      { dx: -1, dy: 0, dir: 'west' }
    ];

    for (const { dx, dy, dir } of directions) {
      const tile = this.getTile(x + dx, y + dy);
      if (tile) {
        neighbors.push({ tile, direction: dir });
      }
    }

    return neighbors;
  }

  /**
   * Mark rectangular area as occupied by a module
   *
   * @param {number} x - Starting tile X
   * @param {number} y - Starting tile Y
   * @param {number} width - Width in tiles
   * @param {number} height - Height in tiles
   * @param {string} moduleId - Unique module identifier
   * @param {string} zone - 'clean' or 'dirty'
   */
  markModuleOccupancy(x, y, width, height, moduleId, zone) {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        if (tile) {
          tile.occupied = true;
          tile.moduleId = moduleId;
          tile.roomId = moduleId;
          tile.zone = zone;
          tile.passable = false;  // Inside module = not passable by default
        }
      }
    }
  }

  /**
   * Clear module occupancy from all tiles
   *
   * @param {string} moduleId - Module to clear
   */
  clearModuleOccupancy(moduleId) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        if (tile.moduleId === moduleId) {
          tile.occupied = false;
          tile.moduleId = null;
          tile.roomId = null;
          tile.zone = null;
          tile.passable = true;
        }
      }
    }
  }

  /**
   * Mark a tile as a door (passable entrance to module)
   *
   * @param {number} x - Door tile X
   * @param {number} y - Door tile Y
   * @param {string} moduleId - Module this door belongs to
   */
  markDoorTile(x, y, moduleId) {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.doorTile = true;
      tile.isDoor = true;
      tile.passable = true;  // Doors are passable
      tile.roomId = moduleId;
    }
  }

  /**
   * Clear door marker from a tile
   *
   * @param {number} x - Tile X
   * @param {number} y - Tile Y
   */
  clearDoorTile(x, y) {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.doorTile = false;
      tile.isDoor = false;
      tile.roomId = null;
      // Keep passable state (will be set correctly by module occupancy)
    }
  }

  /**
   * Get all tiles in a rectangular area
   *
   * @param {number} x - Starting tile X
   * @param {number} y - Starting tile Y
   * @param {number} width - Width in tiles
   * @param {number} height - Height in tiles
   * @returns {Array<Object>} Array of tile objects
   */
  getTilesInRect(x, y, width, height) {
    const tiles = [];

    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        if (tile) tiles.push(tile);
      }
    }

    return tiles;
  }

  /**
   * Reset pathfinding data on all tiles
   * Call this before each A* search
   */
  resetPathfindingData() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        tile.gScore = Infinity;
        tile.fScore = Infinity;
        tile.cameFrom = null;
      }
    }
  }

  /**
   * Get all passable tiles in the grid
   * Useful for finding valid spawn points
   *
   * @returns {Array<Object>} Array of passable tiles
   */
  getPassableTiles() {
    const passable = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        if (tile.passable || tile.doorTile) {
          passable.push(tile);
        }
      }
    }

    return passable;
  }

  /**
   * Get statistics about tile occupancy
   * Useful for debugging and UI display
   *
   * @returns {Object} Statistics
   */
  getStatistics() {
    let occupied = 0;
    let passable = 0;
    let doors = 0;
    let clean = 0;
    let dirty = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];

        if (tile.occupied) occupied++;
        if (tile.passable) passable++;
        if (tile.doorTile) doors++;
        if (tile.zone === 'clean') clean++;
        if (tile.zone === 'dirty') dirty++;
      }
    }

    const total = this.width * this.height;

    return {
      total,
      occupied,
      passable,
      doors,
      clean,
      dirty,
      free: total - occupied,
      occupancyPercent: (occupied / total * 100).toFixed(1)
    };
  }

  /**
   * Export tile data for debugging/visualization
   *
   * @returns {string} ASCII representation of grid
   */
  toASCII() {
    let output = '\n    ';

    // Column headers
    for (let x = 0; x < this.width; x++) {
      output += x.toString().padStart(3, ' ');
    }
    output += '\n   ' + '─'.repeat(this.width * 3 + 1) + '\n';

    // Grid rows
    for (let y = 0; y < this.height; y++) {
      output += y.toString().padStart(2, ' ') + ' │';

      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];

        let char = ' ░ ';  // Empty/passable

        if (tile.occupied) char = ' █ ';      // Occupied
        if (tile.doorTile) char = ' D ';      // Door
        if (!tile.passable && !tile.occupied) char = ' X '; // Blocked

        output += char;
      }

      output += '│\n';
    }

    output += '   ' + '─'.repeat(this.width * 3 + 1) + '\n';

    return output;
  }

  /**
   * Clear all tile data (reset to initial state)
   */
  reset() {
    this.tiles = this.initializeTiles();
  }

  /**
   * Resize tile system with new dimensions
   * Used when habitat configuration changes
   *
   * @param {number} newWidth - New width in tiles
   * @param {number} newHeight - New height in tiles
   */
  resize(newWidth, newHeight) {
    this.width = newWidth;
    this.height = newHeight;
    this.tiles = this.initializeTiles();

    console.log(`📐 Tile system resized: ${newWidth} × ${newHeight} tiles (${newWidth * this.tileSize}m × ${newHeight * this.tileSize}m)`);
  }
}

export default TileSystem;

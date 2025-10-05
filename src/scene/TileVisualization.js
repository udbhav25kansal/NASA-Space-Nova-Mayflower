/**
 * TileVisualization.js - Enhanced Grid Visualization
 *
 * Inspired by CorsixTH tile rendering system
 *
 * Visualizes tile states with color-coded overlays:
 * - Green: Passable/empty tiles
 * - Red: Occupied by modules
 * - Blue: Door tiles
 * - Yellow: Selected/highlighted
 * - Purple: Path preview
 *
 * Toggle-able overlay for debugging and layout planning.
 */

import * as THREE from 'three';

class TileVisualization extends THREE.Group {
  constructor(tileSystem) {
    super();

    this.tileSystem = tileSystem;
    this.enabled = false;
    this.tileMeshes = [];
    this.pathPreview = [];

    // Colors for tile states
    this.colors = {
      passable: 0x10b981,      // Green - empty tile
      occupied: 0xef4444,      // Red - occupied by module
      door: 0x3b82f6,          // Blue - door tile
      selected: 0xfbbf24,      // Yellow - selected/highlighted
      pathPreview: 0xa855f7    // Purple - path preview
    };

    this.createTileMeshes();
  }

  /**
   * Create mesh for each tile in the grid
   */
  createTileMeshes() {
    const tileSize = this.tileSystem.tileSize;
    const geometry = new THREE.PlaneGeometry(tileSize * 0.9, tileSize * 0.9);
    geometry.rotateX(-Math.PI / 2); // Lay flat

    for (let y = 0; y < this.tileSystem.height; y++) {
      for (let x = 0; x < this.tileSystem.width; x++) {
        const material = new THREE.MeshBasicMaterial({
          color: this.colors.passable,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Position at tile center, slightly above floor
        const worldPos = this.tileSystem.tileToWorld(x, y);
        mesh.position.set(worldPos.x, 0.01, worldPos.z);

        // Store tile coordinates
        mesh.userData.tileX = x;
        mesh.userData.tileY = y;

        this.tileMeshes.push(mesh);
        this.add(mesh);
      }
    }

    console.log(`✅ Created ${this.tileMeshes.length} tile visualization meshes`);
  }

  /**
   * Update tile colors based on current tile system state
   */
  updateTileColors() {
    if (!this.enabled) return;

    this.tileMeshes.forEach(mesh => {
      const x = mesh.userData.tileX;
      const y = mesh.userData.tileY;
      const tile = this.tileSystem.getTile(x, y);

      if (!tile) return;

      let color = this.colors.passable;
      let opacity = 0.3;

      // Determine color based on tile state
      if (tile.isDoor) {
        color = this.colors.door;
        opacity = 0.5;
      } else if (!tile.passable) {
        color = this.colors.occupied;
        opacity = 0.4;
      }

      // Update material
      mesh.material.color.setHex(color);
      mesh.material.opacity = opacity;
    });
  }

  /**
   * Show path preview
   * @param {Array} path - Array of {x, y} tile coordinates
   */
  showPathPreview(path) {
    if (!this.enabled || !path) return;

    // Clear previous path preview
    this.clearPathPreview();

    // Highlight path tiles
    path.forEach((tile, index) => {
      const mesh = this.getTileMesh(tile.x, tile.y);
      if (mesh) {
        mesh.material.color.setHex(this.colors.pathPreview);
        mesh.material.opacity = 0.6;
        this.pathPreview.push(mesh);
      }
    });
  }

  /**
   * Clear path preview
   */
  clearPathPreview() {
    this.pathPreview.forEach(mesh => {
      const x = mesh.userData.tileX;
      const y = mesh.userData.tileY;
      const tile = this.tileSystem.getTile(x, y);

      // Restore original color
      let color = this.colors.passable;
      let opacity = 0.3;

      if (tile.isDoor) {
        color = this.colors.door;
        opacity = 0.5;
      } else if (!tile.passable) {
        color = this.colors.occupied;
        opacity = 0.4;
      }

      mesh.material.color.setHex(color);
      mesh.material.opacity = opacity;
    });

    this.pathPreview = [];
  }

  /**
   * Highlight specific tile
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   */
  highlightTile(x, y) {
    if (!this.enabled) return;

    const mesh = this.getTileMesh(x, y);
    if (mesh) {
      mesh.material.color.setHex(this.colors.selected);
      mesh.material.opacity = 0.7;
    }
  }

  /**
   * Get tile mesh at coordinates
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {THREE.Mesh|null}
   */
  getTileMesh(x, y) {
    return this.tileMeshes.find(
      mesh => mesh.userData.tileX === x && mesh.userData.tileY === y
    );
  }

  /**
   * Toggle visualization on/off
   * @returns {boolean} New enabled state
   */
  toggle() {
    this.enabled = !this.enabled;
    this.visible = this.enabled;

    if (this.enabled) {
      this.updateTileColors();
      console.log('✅ Tile visualization enabled');
    } else {
      console.log('❌ Tile visualization disabled');
    }

    return this.enabled;
  }

  /**
   * Enable visualization
   */
  enable() {
    this.enabled = true;
    this.visible = true;
    this.updateTileColors();
  }

  /**
   * Disable visualization
   */
  disable() {
    this.enabled = false;
    this.visible = false;
  }

  /**
   * Update visualization (call when tiles change)
   */
  update() {
    if (this.enabled) {
      this.updateTileColors();
    }
  }

  /**
   * Get visualization statistics
   */
  getStats() {
    const passable = this.tileMeshes.filter(m => {
      const tile = this.tileSystem.getTile(m.userData.tileX, m.userData.tileY);
      return tile && tile.passable && !tile.isDoor;
    }).length;

    const occupied = this.tileMeshes.filter(m => {
      const tile = this.tileSystem.getTile(m.userData.tileX, m.userData.tileY);
      return tile && !tile.passable;
    }).length;

    const doors = this.tileMeshes.filter(m => {
      const tile = this.tileSystem.getTile(m.userData.tileX, m.userData.tileY);
      return tile && tile.isDoor;
    }).length;

    return {
      total: this.tileMeshes.length,
      passable,
      occupied,
      doors,
      enabled: this.enabled
    };
  }

  /**
   * Dispose visualization
   */
  dispose() {
    this.tileMeshes.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    this.tileMeshes = [];
    this.pathPreview = [];
  }
}

export default TileVisualization;

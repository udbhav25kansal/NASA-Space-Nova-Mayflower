/**
 * Door.js - Module Entrance/Exit System
 *
 * Inspired by CorsixTH door system
 *
 * Doors represent access points to modules:
 * - Mark specific tiles as entrances
 * - Provide inside/outside tile coordinates
 * - Visual representation (optional 3D model)
 * - State tracking (open/closed for future animations)
 *
 * Each module automatically gets a door based on its orientation.
 */

import * as THREE from 'three';

class Door extends THREE.Group {
  constructor(module, tileX, tileY, direction = 'south') {
    super();

    this.module = module;
    this.tileX = tileX;        // Door tile position
    this.tileY = tileY;
    this.direction = direction; // north, south, east, west
    this.isOpen = true;         // Future: animation state
    this.usageCount = 0;        // Track how many times used

    this.createVisual();
  }

  /**
   * Create door visual representation
   */
  createVisual() {
    // Simple door frame (for now - can be replaced with model later)
    const frameGeometry = new THREE.BoxGeometry(0.1, 2.0, 1.0);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.6,
      roughness: 0.4
    });

    // Left frame
    const leftFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    leftFrame.position.set(-0.45, 1.0, 0);
    this.add(leftFrame);

    // Right frame
    const rightFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    rightFrame.position.set(0.45, 1.0, 0);
    this.add(rightFrame);

    // Top frame
    const topGeometry = new THREE.BoxGeometry(1.0, 0.1, 1.0);
    const topFrame = new THREE.Mesh(topGeometry, frameMaterial);
    topFrame.position.set(0, 2.0, 0);
    this.add(topFrame);

    // Rotate door frame based on direction
    this.setRotationFromDirection();
  }

  /**
   * Set rotation based on door direction
   */
  setRotationFromDirection() {
    switch (this.direction) {
      case 'north':
        this.rotation.y = Math.PI;
        break;
      case 'south':
        this.rotation.y = 0;
        break;
      case 'east':
        this.rotation.y = -Math.PI / 2;
        break;
      case 'west':
        this.rotation.y = Math.PI / 2;
        break;
    }
  }

  /**
   * Get tile coordinates for "inside" the module
   * @returns {{x: number, y: number}}
   */
  getInsideTile() {
    let insideX = this.tileX;
    let insideY = this.tileY;

    // Move one tile inward based on direction
    switch (this.direction) {
      case 'north':
        insideY += 1;
        break;
      case 'south':
        insideY -= 1;
        break;
      case 'east':
        insideX -= 1;
        break;
      case 'west':
        insideX += 1;
        break;
    }

    return { x: insideX, y: insideY };
  }

  /**
   * Get tile coordinates for "outside" the module
   * @returns {{x: number, y: number}}
   */
  getOutsideTile() {
    let outsideX = this.tileX;
    let outsideY = this.tileY;

    // Move one tile outward based on direction
    switch (this.direction) {
      case 'north':
        outsideY -= 1;
        break;
      case 'south':
        outsideY += 1;
        break;
      case 'east':
        outsideX += 1;
        break;
      case 'west':
        outsideX -= 1;
        break;
    }

    return { x: outsideX, y: outsideY };
  }

  /**
   * Check if crew member can use this door
   * @param {number} crewTileX - Crew member tile X
   * @param {number} crewTileY - Crew member tile Y
   * @returns {boolean}
   */
  canUse(crewTileX, crewTileY) {
    // Crew must be at door tile or adjacent outside tile
    if (crewTileX === this.tileX && crewTileY === this.tileY) {
      return true;
    }

    const outside = this.getOutsideTile();
    if (crewTileX === outside.x && crewTileY === outside.y) {
      return true;
    }

    return false;
  }

  /**
   * Use door (for statistics and future animations)
   */
  use() {
    this.usageCount++;
    // Future: trigger open/close animation
  }

  /**
   * Get door information for debugging
   */
  getInfo() {
    return {
      module: this.module.moduleName,
      tile: { x: this.tileX, y: this.tileY },
      direction: this.direction,
      inside: this.getInsideTile(),
      outside: this.getOutsideTile(),
      usageCount: this.usageCount
    };
  }

  /**
   * Dispose door
   */
  dispose() {
    this.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}

export default Door;

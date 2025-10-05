/**
 * Grid System - Floor Grid and Habitat Shell Outline
 *
 * Creates the visual grid system and habitat floor plate for the layout tool.
 *
 * Grid Specifications:
 * - Major grid: 1m spacing (NASA standard measurement unit)
 * - Minor grid: 0.1m spacing (precision for module placement)
 * - Total grid area: 40m × 40m (ample planning space)
 *
 * Habitat Shell:
 * - Default: 12m × 8m rectangular floor plate
 * - Represents typical rigid cylindrical lunar habitat module
 * - Based on NASA habitat concept dimensions
 *
 * Coordinate System:
 * - XZ plane: Horizontal (floor)
 * - Y=0: Floor level
 * - Origin: Center of habitat
 */

import * as THREE from 'three';

export default class GridSystem {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'GridSystem';

    // Default habitat dimensions (meters) - NASA hybrid TransHab reference
    this.habitatWidth = 12.0;   // X dimension
    this.habitatDepth = 8.0;    // Z dimension
    this.habitatHeight = 3.0;   // Y dimension (single level default)
    this.habitatLevels = 1;     // Number of levels

    // Grid dimensions
    this.gridSize = 40;         // Total grid size (40m × 40m)
    this.majorDivisions = 40;   // 1m major grid
    this.minorDivisions = 400;  // 0.1m minor grid
  }

  /**
   * Create and return the complete grid system
   * @returns {THREE.Group} Group containing grids and floor plate
   */
  create() {
    // Create grids
    this.createGrids();

    // Create habitat floor plate
    this.createFloorPlate();

    console.log('✅ Grid system created');
    console.log(`   Major grid: 1m spacing (${this.majorDivisions} divisions)`);
    console.log(`   Minor grid: 0.1m spacing (${this.minorDivisions} divisions)`);
    console.log(`   Habitat floor: ${this.habitatWidth}m × ${this.habitatDepth}m`);

    return this.group;
  }

  /**
   * Create major and minor grid lines
   */
  createGrids() {
    // Grid lines removed - caused gray vertical mesh visual issue
    // Keeping only floor plate and border for clean visualization

    // Minor grid (0.1m spacing) - DISABLED
    // const minorGrid = new THREE.GridHelper(
    //   this.gridSize,           // size
    //   this.minorDivisions,     // divisions
    //   0xffffff,                // center line color (white)
    //   0xf3f4f6                 // grid color (very light gray)
    // );

    // // Rotate to lie on XZ plane (floor)
    // minorGrid.rotation.x = Math.PI / 2;
    // minorGrid.position.y = -0.01; // Slightly below to prevent z-fighting

    // this.group.add(minorGrid);

    // Major grid (1m spacing) - DISABLED
    // const majorGrid = new THREE.GridHelper(
    //   this.gridSize,           // size
    //   this.majorDivisions,     // divisions
    //   0x9ca3af,                // center line color (medium gray)
    //   0xe5e7eb                 // grid color (light gray)
    // );

    // // Rotate to lie on XZ plane (floor)
    // majorGrid.rotation.x = Math.PI / 2;
    // majorGrid.position.y = 0; // At floor level

    // this.group.add(majorGrid);
  }

  /**
   * Create habitat floor plate outline
   * Represents the 12m × 8m habitat shell boundary
   */
  createFloorPlate() {
    // Floor plate geometry
    const plateGeometry = new THREE.PlaneGeometry(
      this.habitatWidth,
      this.habitatDepth
    );

    // Floor plate material (semi-transparent light blue-gray)
    const plateMaterial = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });

    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.rotation.x = -Math.PI / 2; // Horizontal
    plate.position.y = 0.01; // Slightly above grid to be visible
    plate.name = 'HabitatFloorPlate';

    this.group.add(plate);

    // Add border outline
    this.createFloorBorder();
  }

  /**
   * Create visible border around habitat floor plate
   */
  createFloorBorder() {
    // Create rectangle shape for border
    const borderGeometry = new THREE.BufferGeometry();

    // Define rectangle vertices (XZ plane)
    const halfWidth = this.habitatWidth / 2;
    const halfDepth = this.habitatDepth / 2;

    const vertices = new Float32Array([
      -halfWidth, 0.02, -halfDepth,  // Bottom-left
      halfWidth, 0.02, -halfDepth,   // Bottom-right
      halfWidth, 0.02, halfDepth,    // Top-right
      -halfWidth, 0.02, halfDepth,   // Top-left
      -halfWidth, 0.02, -halfDepth   // Close the loop
    ]);

    borderGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // Border material (dark outline)
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x6b7280,
      linewidth: 2
    });

    const border = new THREE.Line(borderGeometry, borderMaterial);
    border.name = 'HabitatBorder';

    this.group.add(border);

    // Add corner markers for better visibility
    this.createCornerMarkers();
  }

  /**
   * Create corner markers at habitat boundaries
   */
  createCornerMarkers() {
    const halfWidth = this.habitatWidth / 2;
    const halfDepth = this.habitatDepth / 2;
    const markerSize = 0.3;

    const corners = [
      [-halfWidth, -halfDepth],  // Bottom-left
      [halfWidth, -halfDepth],   // Bottom-right
      [halfWidth, halfDepth],    // Top-right
      [-halfWidth, halfDepth]    // Top-left
    ];

    corners.forEach((corner, index) => {
      const markerGeometry = new THREE.CircleGeometry(markerSize, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x6b7280,
        side: THREE.DoubleSide
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(corner[0], 0.03, corner[1]);
      marker.name = `CornerMarker${index}`;

      this.group.add(marker);
    });
  }

  /**
   * Get the grid group
   * @returns {THREE.Group}
   */
  getGroup() {
    return this.group;
  }

  /**
   * Get habitat dimensions
   * @returns {Object} {width, depth, height, levels}
   */
  getHabitatDimensions() {
    return {
      width: this.habitatWidth,
      depth: this.habitatDepth,
      height: this.habitatHeight,
      levels: this.habitatLevels
    };
  }

  /**
   * Check if a position is within habitat bounds
   * @param {number} x - X coordinate
   * @param {number} z - Z coordinate
   * @returns {boolean}
   */
  isWithinBounds(x, z) {
    const halfWidth = this.habitatWidth / 2;
    const halfDepth = this.habitatDepth / 2;

    return Math.abs(x) <= halfWidth && Math.abs(z) <= halfDepth;
  }

  /**
   * Snap value to grid
   * @param {number} value - Value to snap
   * @param {number} gridSize - Grid size (default 0.1m)
   * @returns {number} Snapped value
   */
  snapToGrid(value, gridSize = 0.1) {
    return Math.round(value / gridSize) * gridSize;
  }

  /**
   * Update habitat dimensions and configuration
   * @param {Object} config - Habitat configuration
   * @param {number} config.width - New width
   * @param {number} config.depth - New depth
   * @param {number} config.height - New height
   * @param {number} config.levels - Number of levels
   */
  updateHabitatSize(config) {
    this.habitatWidth = config.width;
    this.habitatDepth = config.depth;
    this.habitatHeight = config.height || 3.0;
    this.habitatLevels = config.levels || 1;

    // Recreate grid system
    this.group.clear();
    this.createGrids();
    this.createFloorPlate();

    console.log(`📐 Habitat dimensions updated: ${config.width}m × ${config.depth}m × ${this.habitatHeight}m (${this.habitatLevels} level${this.habitatLevels > 1 ? 's' : ''})`);
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.group.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.group.clear();
  }
}

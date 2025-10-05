/**
 * Habitat Module - Individual Room Module Class
 *
 * Represents a single habitat module (room) with 3D visualization,
 * NASA constraints, and validation.
 *
 * Each module:
 * - Has defined dimensions (w, d, h in meters)
 * - Belongs to a zone (clean/dirty)
 * - Has minimum area requirements (NASA validated)
 * - Can be selected, moved, rotated
 * - Validates against adjacency rules
 *
 * Coordinate System:
 * - Position: (x, y, z) where y=height/2 (center of module)
 * - Rotation: Around Y axis (vertical)
 * - Dimensions: BoxGeometry uses (width, height, depth) = (w, h, d)
 */

import * as THREE from 'three';

export default class HabitatModule extends THREE.Group {
  constructor(catalogItem, id, constraints) {
    super();

    // Module properties from catalog
    this.moduleId = id;
    this.moduleName = catalogItem.name;
    this.dimensions = {
      w: catalogItem.w,  // width (X axis)
      d: catalogItem.d,  // depth (Z axis)
      h: catalogItem.h   // height (Y axis)
    };
    this.zone = catalogItem.zone;
    this.color = catalogItem.color;
    this.category = catalogItem.category;
    this.minArea = catalogItem.minArea;
    this.minVolume = catalogItem.minVolume;
    this.description = catalogItem.description;

    // State
    this.isSelected = false;
    this.isViolating = false;
    this.rotationAngle = 0; // In degrees

    // Store constraints reference
    this.constraints = constraints;

    // Create visual representation
    this.createMesh();
    this.createOutline();
    this.createLabel();

    // Set name for Three.js
    this.name = `Module_${this.moduleName}_${this.moduleId}`;

    // Position at origin initially (will be moved by user)
    this.position.set(0, this.dimensions.h / 2, 0);
  }

  /**
   * Create the main mesh for the module
   */
  createMesh() {
    // Box geometry: width (X), height (Y), depth (Z)
    const geometry = new THREE.BoxGeometry(
      this.dimensions.w,
      this.dimensions.h,
      this.dimensions.d
    );

    // Material with zone-based color
    const material = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.85,
      metalness: 0.1,
      roughness: 0.8
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    this.mesh.name = 'ModuleMesh';

    // Store reference to parent module
    this.mesh.userData.module = this;

    this.add(this.mesh);
  }

  /**
   * Create selection outline (edges)
   */
  createOutline() {
    const geometry = new THREE.BoxGeometry(
      this.dimensions.w,
      this.dimensions.h,
      this.dimensions.d
    );

    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0x111827,
      linewidth: 2
    });

    this.outline = new THREE.LineSegments(edges, material);
    this.outline.visible = false; // Only show when selected
    this.outline.name = 'ModuleOutline';

    this.add(this.outline);
  }

  /**
   * Create label showing module name
   */
  createLabel() {
    // Create canvas for text texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    // Draw background
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = 'Bold 20px Arial';
    context.fillStyle = '#111827';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.moduleName, canvas.width / 2, canvas.height / 2);

    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });

    // Create sprite
    this.label = new THREE.Sprite(material);
    this.label.scale.set(1.5, 0.375, 1);
    this.label.position.y = this.dimensions.h / 2 + 0.5;
    this.label.name = 'ModuleLabel';

    this.add(this.label);
  }

  /**
   * Get module footprint area (m²)
   * @returns {number} Area in square meters
   */
  getFootprint() {
    return this.dimensions.w * this.dimensions.d;
  }

  /**
   * Get module volume (m³)
   * @returns {number} Volume in cubic meters
   */
  getVolume() {
    return this.dimensions.w * this.dimensions.d * this.dimensions.h;
  }

  /**
   * Get bounding box in world coordinates
   * @returns {THREE.Box3}
   */
  getBoundingBox() {
    const box = new THREE.Box3();
    box.setFromObject(this.mesh);
    return box;
  }

  /**
   * Get floor rectangle (for overlap detection)
   * @returns {Object} {minX, maxX, minZ, maxZ}
   */
  getFloorRectangle() {
    const halfW = this.dimensions.w / 2;
    const halfD = this.dimensions.d / 2;
    const pos = this.position;

    return {
      minX: pos.x - halfW,
      maxX: pos.x + halfW,
      minZ: pos.z - halfD,
      maxZ: pos.z + halfD
    };
  }

  /**
   * Set selected state
   * @param {boolean} selected - Selection state
   */
  setSelected(selected) {
    this.isSelected = selected;
    this.outline.visible = selected;

    // Change opacity when selected
    if (selected) {
      this.mesh.material.opacity = 1.0;
    } else {
      this.mesh.material.opacity = 0.85;
    }
  }

  /**
   * Set violation state (for visual feedback)
   * @param {boolean} violating - Violation state
   */
  setViolating(violating) {
    this.isViolating = violating;

    if (violating) {
      // Yellow highlight for violations
      this.mesh.material.emissive = new THREE.Color(0xfde68a);
      this.mesh.material.emissiveIntensity = 0.5;
    } else {
      this.mesh.material.emissive = new THREE.Color(0x000000);
      this.mesh.material.emissiveIntensity = 0;
    }
  }

  /**
   * Update module position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate (optional, defaults to height/2)
   * @param {number} z - Z coordinate
   */
  updatePosition(x, y = null, z) {
    const newY = y !== null ? y : this.dimensions.h / 2;
    this.position.set(x, newY, z);
  }

  /**
   * Rotate module 90 degrees around Y axis
   * Swaps width and depth dimensions
   */
  rotate90() {
    // Swap dimensions
    const temp = this.dimensions.w;
    this.dimensions.w = this.dimensions.d;
    this.dimensions.d = temp;

    // Update rotation angle
    this.rotationAngle = (this.rotationAngle + 90) % 360;
    this.rotation.y = THREE.MathUtils.degToRad(this.rotationAngle);

    // Recreate mesh and outline with new dimensions
    this.remove(this.mesh);
    this.remove(this.outline);
    this.createMesh();
    this.createOutline();

    // Restore selection state
    if (this.isSelected) {
      this.outline.visible = true;
    }
  }

  /**
   * Check if this module overlaps with another
   * @param {HabitatModule} otherModule - Module to check against
   * @returns {boolean} True if modules overlap
   */
  checkOverlap(otherModule) {
    const thisRect = this.getFloorRectangle();
    const otherRect = otherModule.getFloorRectangle();

    // Check for overlap on XZ plane
    const overlapX = thisRect.minX < otherRect.maxX && thisRect.maxX > otherRect.minX;
    const overlapZ = thisRect.minZ < otherRect.maxZ && thisRect.maxZ > otherRect.minZ;

    return overlapX && overlapZ;
  }

  /**
   * Get distance to another module (center to center)
   * @param {HabitatModule} otherModule - Module to measure distance to
   * @returns {number} Distance in meters
   */
  getDistanceTo(otherModule) {
    const dx = this.position.x - otherModule.position.x;
    const dz = this.position.z - otherModule.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Check if module is within habitat bounds
   * @param {number} maxWidth - Habitat width
   * @param {number} maxDepth - Habitat depth
   * @returns {boolean} True if within bounds
   */
  isWithinBounds(maxWidth, maxDepth) {
    const rect = this.getFloorRectangle();
    const halfWidth = maxWidth / 2;
    const halfDepth = maxDepth / 2;

    return (
      rect.minX >= -halfWidth &&
      rect.maxX <= halfWidth &&
      rect.minZ >= -halfDepth &&
      rect.maxZ <= halfDepth
    );
  }

  /**
   * Export module state to JSON
   * @returns {Object} Module data
   */
  toJSON() {
    return {
      id: this.moduleId,
      name: this.moduleName,
      zone: this.zone,
      category: this.category,
      dimensions: {
        w: this.dimensions.w,
        d: this.dimensions.d,
        h: this.dimensions.h
      },
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      },
      rotation: this.rotationAngle,
      footprint: this.getFootprint(),
      volume: this.getVolume()
    };
  }

  /**
   * Dispose of module resources
   */
  dispose() {
    // Dispose geometries
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }

    if (this.outline) {
      this.outline.geometry.dispose();
      this.outline.material.dispose();
    }

    if (this.label) {
      this.label.material.map.dispose();
      this.label.material.dispose();
    }

    // Remove from parent
    if (this.parent) {
      this.parent.remove(this);
    }
  }
}

/**
 * HabitatObject.js - Base Class for Interior Equipment and Furniture
 *
 * Inspired by CorsixTH object system
 *
 * Objects are placed inside modules and can be used by crew:
 * - Exercise equipment (treadmills, bikes)
 * - Workstations (desks, computers)
 * - Sleep pods (beds)
 * - Galley stations (food prep)
 * - Hygiene facilities (showers, sinks)
 *
 * Each object occupies a tile and tracks usage.
 */

import * as THREE from 'three';

class HabitatObject extends THREE.Group {
  constructor(type, objectId, tileX, tileY, moduleId) {
    super();

    this.type = type;              // 'exercise', 'workstation', 'sleep_pod', etc.
    this.objectId = objectId;      // Unique identifier
    this.tileX = tileX;            // Tile X position (relative to module)
    this.tileY = tileY;            // Tile Y position (relative to module)
    this.moduleId = moduleId;      // Which module this belongs to

    // Usage state
    this.inUse = false;
    this.currentUser = null;       // CrewMember using this object
    this.usageHistory = [];        // Track usage over time

    // Object properties
    this.capacity = 1;             // How many crew can use simultaneously
    this.useDuration = 5.0;        // Default use duration (seconds)
    this.needSatisfaction = {};    // Which needs this satisfies

    // Create visual representation
    this.createVisual();
  }

  /**
   * Create 3D visual representation (override in subclasses)
   */
  createVisual() {
    // Default: simple box
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.3,
      roughness: 0.7
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.25;
    mesh.castShadow = true;
    this.add(mesh);
  }

  /**
   * Check if crew member can use this object
   * @param {CrewMember} crewMember
   * @returns {boolean}
   */
  canUse(crewMember) {
    // Check if not in use
    if (this.inUse && this.currentUser !== crewMember) {
      return false;
    }

    // Check if crew is at object's tile (or adjacent)
    if (!this.isAccessible(crewMember)) {
      return false;
    }

    return true;
  }

  /**
   * Check if crew member can access this object
   * @param {CrewMember} crewMember
   * @returns {boolean}
   */
  isAccessible(crewMember) {
    // Crew must be at same tile or adjacent
    const dx = Math.abs(crewMember.tileX - this.tileX);
    const dy = Math.abs(crewMember.tileY - this.tileY);

    return dx <= 1 && dy <= 1;
  }

  /**
   * Start using object
   * @param {CrewMember} crewMember
   */
  use(crewMember) {
    this.inUse = true;
    this.currentUser = crewMember;

    // Record usage
    this.usageHistory.push({
      user: crewMember.name,
      startTime: Date.now(),
      endTime: null
    });

    console.log(`${crewMember.name} started using ${this.type} (${this.objectId})`);
  }

  /**
   * Stop using object
   * @param {CrewMember} crewMember
   */
  release(crewMember) {
    if (this.currentUser === crewMember) {
      this.inUse = false;
      this.currentUser = null;

      // Update usage history
      const lastUsage = this.usageHistory[this.usageHistory.length - 1];
      if (lastUsage && !lastUsage.endTime) {
        lastUsage.endTime = Date.now();
        lastUsage.duration = (lastUsage.endTime - lastUsage.startTime) / 1000;
      }

      console.log(`${crewMember.name} finished using ${this.type}`);
    }
  }

  /**
   * Apply need satisfaction to crew member
   * @param {CrewMember} crewMember
   * @param {number} deltaTime
   */
  applyEffects(crewMember, deltaTime) {
    // Override in subclasses to apply specific effects
    // e.g., reduce hunger, fatigue, increase mood
  }

  /**
   * Get object information
   * @returns {Object}
   */
  getInfo() {
    return {
      id: this.objectId,
      type: this.type,
      tile: { x: this.tileX, y: this.tileY },
      moduleId: this.moduleId,
      inUse: this.inUse,
      currentUser: this.currentUser ? this.currentUser.name : null,
      totalUses: this.usageHistory.length,
      capacity: this.capacity
    };
  }

  /**
   * Get usage statistics
   * @returns {Object}
   */
  getUsageStats() {
    const totalUses = this.usageHistory.length;
    const totalDuration = this.usageHistory
      .filter(u => u.duration)
      .reduce((sum, u) => sum + u.duration, 0);

    const avgDuration = totalUses > 0 ? totalDuration / totalUses : 0;

    return {
      totalUses,
      totalDuration,
      avgDuration,
      lastUsed: totalUses > 0 ? this.usageHistory[totalUses - 1] : null
    };
  }

  /**
   * Dispose object
   */
  dispose() {
    this.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}

export default HabitatObject;

/**
 * WalkAction.js - Move Crew Member Along a Path
 *
 * Inspired by CorsixTH walk.lua
 *
 * Uses A* pathfinding to navigate crew members through the habitat.
 * Handles tile-by-tile movement with smooth interpolation.
 */

import * as THREE from 'three';
import CrewAction from './Action.js';

class WalkAction extends CrewAction {
  constructor(targetTileX, targetTileY) {
    super('walk');

    this.targetTileX = targetTileX;
    this.targetTileY = targetTileY;
    this.path = null;
    this.pathIndex = 0;
    this.moveProgress = 0;
    this.currentTile = null;
    this.nextTile = null;
  }

  /**
   * Start walking - calculate path using A*
   */
  start(crewMember) {
    // Calculate path using pathfinder
    const pathfinder = crewMember.world.pathfinder;

    if (!pathfinder) {
      console.error('No pathfinder available');
      this.isComplete = true;
      return;
    }

    this.path = pathfinder.findPath(
      crewMember.tileX,
      crewMember.tileY,
      this.targetTileX,
      this.targetTileY
    );

    if (!this.path || this.path.length === 0) {
      console.warn(
        `No path found from (${crewMember.tileX},${crewMember.tileY}) to (${this.targetTileX},${this.targetTileY})`
      );
      this.isComplete = true;
      return;
    }

    // Initialize path traversal
    this.pathIndex = 0;
    this.moveProgress = 0;
    this.currentTile = this.path[0];
    this.nextTile = this.path[1] || this.currentTile;

    // Set crew member state
    crewMember.isMoving = true;
    crewMember.animationState = 'walking';

    console.log(`${crewMember.name} walking from (${crewMember.tileX},${crewMember.tileY}) to (${this.targetTileX},${this.targetTileY}) - ${this.path.length} steps`);
  }

  /**
   * Update walking - move along path
   */
  update(crewMember, deltaTime) {
    if (this.isComplete || !this.path) {
      crewMember.isMoving = false;
      crewMember.animationState = 'idle';
      return true;
    }

    // Check if reached destination
    if (this.pathIndex >= this.path.length - 1) {
      crewMember.setTilePosition(this.targetTileX, this.targetTileY);
      crewMember.isMoving = false;
      crewMember.animationState = 'idle';
      this.isComplete = true;
      console.log(`${crewMember.name} arrived at (${this.targetTileX},${this.targetTileY})`);
      return true;
    }

    // Get current and next tiles
    this.currentTile = this.path[this.pathIndex];
    this.nextTile = this.path[this.pathIndex + 1];

    if (!this.nextTile) {
      this.isComplete = true;
      return true;
    }

    // Move towards next tile
    this.moveProgress += deltaTime * crewMember.speed;

    if (this.moveProgress >= 1.0) {
      // Reached next tile
      crewMember.tileX = this.nextTile.x;
      crewMember.tileY = this.nextTile.y;
      this.pathIndex++;
      this.moveProgress = 0;

      // Update facing direction
      this.updateFacingDirection(crewMember, this.currentTile, this.nextTile);
    } else {
      // Smooth interpolation between tiles
      const tileSystem = crewMember.world.tileSystem;
      const currentWorld = tileSystem.tileToWorld(this.currentTile.x, this.currentTile.y);
      const nextWorld = tileSystem.tileToWorld(this.nextTile.x, this.nextTile.y);

      // Linear interpolation
      crewMember.position.x = THREE.MathUtils.lerp(
        currentWorld.x,
        nextWorld.x,
        this.moveProgress
      );
      crewMember.position.z = THREE.MathUtils.lerp(
        currentWorld.z,
        nextWorld.z,
        this.moveProgress
      );
    }

    return false;
  }

  /**
   * Update crew member facing direction based on movement
   */
  updateFacingDirection(crewMember, from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      crewMember.facingDirection = dx > 0 ? 'east' : 'west';
    } else {
      crewMember.facingDirection = dy > 0 ? 'south' : 'north';
    }
  }

  /**
   * Interrupt walking
   */
  interrupt() {
    this.isComplete = true;
    console.log('Walk action interrupted');
  }

  /**
   * Get description
   */
  getDescription() {
    if (this.path) {
      const remaining = this.path.length - this.pathIndex;
      return `Walking to (${this.targetTileX}, ${this.targetTileY}) - ${remaining} tiles`;
    }
    return `Walking to (${this.targetTileX}, ${this.targetTileY})`;
  }

  /**
   * Clone action
   */
  clone() {
    return new WalkAction(this.targetTileX, this.targetTileY);
  }
}

export default WalkAction;

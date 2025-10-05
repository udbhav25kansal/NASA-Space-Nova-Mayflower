/**
 * CrewMember.js - Astronaut Entity Class
 *
 * Inspired by CorsixTH humanoid.lua
 *
 * Represents a crew member in the lunar habitat:
 * - 3D visual representation (simplified astronaut)
 * - Action queue system (walk, idle, use objects)
 * - Tile-based positioning
 * - Psychological attributes (stress, mood, fatigue)
 * - Autonomous behavior
 */

import * as THREE from 'three';
import CrewNeeds from './CrewNeeds.js';
import CrewAI from './CrewAI.js';
import CrewSchedule from './CrewSchedule.js';

class CrewMember extends THREE.Group {
  constructor(world, name, tileX, tileY) {
    super();

    this.world = world;           // Reference to main app/world
    this.name = name;

    // Tile position
    this.tileX = tileX;
    this.tileY = tileY;

    // Visual properties
    this.facingDirection = 'south'; // north, south, east, west

    // Movement properties
    this.isMoving = false;
    this.speed = 1.0;              // tiles per second
    this.animationState = 'idle';  // idle, walking, working, sleeping, etc.

    // Action queue (CorsixTH pattern)
    this.actionQueue = [];
    this.currentAction = null;

    // Module tracking
    this.currentModule = null;     // Current module the crew is in

    // Needs system (hunger, fatigue, stress, etc.)
    this.needs = new CrewNeeds();

    // Mood (separate from needs, influenced by needs)
    this.mood = 70;                // 0-100

    // Autonomous AI
    this.ai = new CrewAI(this);
    this.schedule = new CrewSchedule(this);
    this.autonomousMode = true;    // Enable/disable autonomous behavior
    this.followSchedule = true;    // Enable/disable schedule following

    // Create 3D representation
    this.createVisual();

    // Position at tile
    this.setTilePosition(tileX, tileY);
  }

  /**
   * Create simplified astronaut visual
   */
  createVisual() {
    const group = new THREE.Group();

    // Body (capsule)
    const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.6, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      metalness: 0.3,
      roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Helmet (sphere)
    const helmetGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const helmetMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.9;
    helmet.castShadow = true;
    group.add(helmet);

    // Name label (for debugging - can be replaced with sprite later)
    this.nameLabel = this.createNameLabel(this.name);
    this.nameLabel.position.y = 1.3;
    group.add(this.nameLabel);

    this.add(group);
  }

  /**
   * Create name label sprite
   */
  createNameLabel(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '24px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.8, 0.2, 1);

    return sprite;
  }

  /**
   * Set tile position and update world position
   */
  setTilePosition(tileX, tileY) {
    this.tileX = tileX;
    this.tileY = tileY;

    const worldPos = this.world.tileSystem.tileToWorld(tileX, tileY);
    this.position.set(worldPos.x, 0, worldPos.z);
  }

  /**
   * Add action to queue
   */
  queueAction(action) {
    this.actionQueue.push(action);
  }

  /**
   * Clear all queued actions
   */
  clearActionQueue() {
    if (this.currentAction && this.currentAction.canInterrupt) {
      this.currentAction.interrupt();
    }
    this.actionQueue = [];
    this.currentAction = null;
  }

  /**
   * Update crew member (called each frame)
   */
  update(deltaTime) {
    // If no current action, get next from queue
    if (!this.currentAction || this.currentAction.isComplete) {
      if (this.actionQueue.length > 0) {
        this.currentAction = this.actionQueue.shift();
        this.currentAction.start(this);
        console.log(`${this.name}: Starting action ${this.currentAction.constructor.name}`);
      } else {
        this.currentAction = null;
      }
    }

    // Update current action
    if (this.currentAction) {
      this.currentAction.update(this, deltaTime);
    }

    // Update needs (hunger, fatigue, etc. grow over time)
    if (this.needs) {
      this.needs.update(deltaTime);
    }

    // Update mood based on needs
    this.updateMood();

    // Update schedule and AI (autonomous decision-making)
    if (this.autonomousMode) {
      // Check schedule first (higher priority)
      if (this.schedule && this.followSchedule && this.schedule.shouldExecuteSchedule()) {
        this.schedule.executeScheduledActivity();
      }
      // Fall back to AI if no scheduled activity
      else if (this.ai) {
        this.ai.update(deltaTime);
      }
    }

    // Update visual rotation based on facing direction
    this.updateRotation();
  }

  /**
   * Update crew member rotation based on facing direction
   */
  updateRotation() {
    let targetRotation = 0;

    switch (this.facingDirection) {
      case 'north':
        targetRotation = Math.PI;
        break;
      case 'south':
        targetRotation = 0;
        break;
      case 'east':
        targetRotation = -Math.PI / 2;
        break;
      case 'west':
        targetRotation = Math.PI / 2;
        break;
    }

    // Smooth rotation
    this.rotation.y = THREE.MathUtils.lerp(this.rotation.y, targetRotation, 0.1);
  }

  /**
   * Update mood based on needs
   * Mood decreases when needs are high, increases when needs are low
   */
  updateMood() {
    if (!this.needs) return;

    // Calculate mood impact from needs
    const wellbeing = this.needs.getWellbeingScore(); // 0-100, higher is better

    // Mood gravitates towards wellbeing score
    const moodTarget = wellbeing;
    const moodChangeRate = 0.1; // Slow mood changes

    // Smoothly adjust mood
    this.mood += (moodTarget - this.mood) * moodChangeRate;
    this.mood = Math.max(0, Math.min(100, this.mood));
  }

  /**
   * Get current status for UI display
   */
  getStatus() {
    const needsStatus = this.needs ? this.needs.getStatus() : {};

    return {
      name: this.name,
      position: `(${this.tileX}, ${this.tileY})`,
      action: this.currentAction ? this.currentAction.getDescription() : 'Idle',
      queueLength: this.actionQueue.length,
      mood: this.mood,
      needs: needsStatus,
      module: this.currentModule ? this.currentModule.moduleName : 'Outside'
    };
  }

  /**
   * Walk to a tile (convenience method)
   */
  walkTo(tileX, tileY) {
    const WalkAction = this.world.WalkAction;
    if (WalkAction) {
      this.queueAction(new WalkAction(tileX, tileY));
    } else {
      console.error('WalkAction not available');
    }
  }

  /**
   * Idle for duration (convenience method)
   */
  idle(duration = null) {
    const IdleAction = this.world.IdleAction;
    if (IdleAction) {
      this.queueAction(new IdleAction(duration));
    }
  }

  /**
   * Use object (convenience method)
   */
  useObject(objectId, duration = 5.0) {
    const UseObjectAction = this.world.UseObjectAction;
    if (UseObjectAction) {
      this.queueAction(new UseObjectAction(objectId, duration));
    }
  }

  /**
   * Dispose crew member (cleanup)
   */
  dispose() {
    this.clearActionQueue();

    this.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      if (child.material && child.material.map) child.material.map.dispose();
    });
  }
}

export default CrewMember;

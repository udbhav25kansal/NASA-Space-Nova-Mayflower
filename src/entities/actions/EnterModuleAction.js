/**
 * EnterModuleAction.js - Crew Member Entering a Module
 *
 * Inspired by CorsixTH room entry logic
 *
 * Action for crew members to enter modules through doors:
 * 1. Walk to door's outside tile
 * 2. Use door (track usage)
 * 3. Walk to inside position (near target object if specified)
 * 4. Complete action
 *
 * This action can chain with other actions (e.g., UseObjectAction)
 */

import CrewAction from './Action.js';
import WalkAction from './WalkAction.js';

class EnterModuleAction extends CrewAction {
  constructor(moduleId, targetObjectId = null) {
    super('enter_module');

    this.moduleId = moduleId;           // ID of module to enter
    this.targetObjectId = targetObjectId; // Optional: specific object to walk towards
    this.module = null;                 // Reference to module
    this.door = null;                   // Reference to door
    this.walkAction = null;             // Current walking sub-action
    this.phase = 'walk_to_door';        // Phases: walk_to_door, use_door, walk_inside, complete
  }

  /**
   * Start entering module
   */
  start(crewMember) {
    // Find module in world
    this.module = crewMember.world.getModuleById(this.moduleId);

    if (!this.module) {
      console.warn(`Module ${this.moduleId} not found`);
      this.isComplete = true;
      return;
    }

    // Get module door
    this.door = this.module.door;

    if (!this.door) {
      console.warn(`Module ${this.module.moduleName} has no door`);
      this.isComplete = true;
      return;
    }

    // Start phase 1: Walk to door
    this.phase = 'walk_to_door';
    const outsideTile = this.door.getOutsideTile();

    this.walkAction = new WalkAction(outsideTile.x, outsideTile.y);
    this.walkAction.start(crewMember);

    console.log(`${crewMember.name} entering ${this.module.moduleName} (walking to door)`);
  }

  /**
   * Update action
   */
  update(crewMember, deltaTime) {
    if (this.isComplete) return true;

    switch (this.phase) {
      case 'walk_to_door':
        return this.updateWalkToDoor(crewMember, deltaTime);

      case 'use_door':
        return this.updateUseDoor(crewMember, deltaTime);

      case 'walk_inside':
        return this.updateWalkInside(crewMember, deltaTime);

      case 'complete':
        this.isComplete = true;
        console.log(`${crewMember.name} entered ${this.module.moduleName}`);
        return true;
    }

    return false;
  }

  /**
   * Phase 1: Walk to door outside tile
   */
  updateWalkToDoor(crewMember, deltaTime) {
    if (!this.walkAction) {
      this.phase = 'use_door';
      return false;
    }

    const walkComplete = this.walkAction.update(crewMember, deltaTime);

    if (walkComplete) {
      // Arrived at door
      this.walkAction = null;
      this.phase = 'use_door';
      console.log(`${crewMember.name} reached door of ${this.module.moduleName}`);
    }

    return false;
  }

  /**
   * Phase 2: Use door (track usage)
   */
  updateUseDoor(crewMember, deltaTime) {
    // Use the door
    this.door.use();

    // Add crew to module's crew list
    if (!this.module.crew.includes(crewMember)) {
      this.module.crew.push(crewMember);
    }

    // Set crew's current module
    crewMember.currentModule = this.module;

    // Move to phase 3: Walk inside
    this.phase = 'walk_inside';
    return false;
  }

  /**
   * Phase 3: Walk to inside position
   */
  updateWalkInside(crewMember, deltaTime) {
    if (!this.walkAction) {
      // Determine inside destination
      let targetTile;

      if (this.targetObjectId) {
        // Walk towards specific object
        const targetObject = this.module.objects.find(obj => obj.objectId === this.targetObjectId);
        if (targetObject) {
          targetTile = { x: targetObject.tileX, y: targetObject.tileY };
        } else {
          console.warn(`Target object ${this.targetObjectId} not found in ${this.module.moduleName}`);
          targetTile = this.door.getInsideTile();
        }
      } else {
        // Walk to inside tile near door (default)
        targetTile = this.door.getInsideTile();
      }

      this.walkAction = new WalkAction(targetTile.x, targetTile.y);
      this.walkAction.start(crewMember);

      console.log(`${crewMember.name} walking inside ${this.module.moduleName} to tile (${targetTile.x}, ${targetTile.y})`);
    }

    const walkComplete = this.walkAction.update(crewMember, deltaTime);

    if (walkComplete) {
      // Completed entering module
      this.walkAction = null;
      this.phase = 'complete';
    }

    return false;
  }

  /**
   * Interrupt action
   */
  interrupt() {
    super.interrupt();

    if (this.walkAction) {
      this.walkAction.interrupt();
      this.walkAction = null;
    }

    console.log('Enter module action interrupted');
  }

  /**
   * Get description
   */
  getDescription() {
    if (this.module) {
      return `Entering ${this.module.moduleName} (${this.phase})`;
    }
    return 'Entering module';
  }

  /**
   * Clone action
   */
  clone() {
    return new EnterModuleAction(this.moduleId, this.targetObjectId);
  }
}

export default EnterModuleAction;

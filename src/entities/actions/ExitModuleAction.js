/**
 * ExitModuleAction.js - Crew Member Exiting a Module
 *
 * Inspired by CorsixTH room exit logic
 *
 * Action for crew members to exit modules through doors:
 * 1. Walk to door's inside tile
 * 2. Use door (track usage)
 * 3. Walk to outside position
 * 4. Remove from module crew list
 */

import CrewAction from './Action.js';
import WalkAction from './WalkAction.js';

class ExitModuleAction extends CrewAction {
  constructor() {
    super('exit_module');

    this.module = null;     // Current module (from crew member)
    this.door = null;       // Module door
    this.walkAction = null; // Current walking sub-action
    this.phase = 'walk_to_door'; // Phases: walk_to_door, use_door, walk_outside, complete
  }

  /**
   * Start exiting module
   */
  start(crewMember) {
    // Get current module
    this.module = crewMember.currentModule;

    if (!this.module) {
      console.warn(`${crewMember.name} is not in any module`);
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

    // Start phase 1: Walk to door inside tile
    this.phase = 'walk_to_door';
    const insideTile = this.door.getInsideTile();

    this.walkAction = new WalkAction(insideTile.x, insideTile.y);
    this.walkAction.start(crewMember);

    console.log(`${crewMember.name} exiting ${this.module.moduleName} (walking to door)`);
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

      case 'walk_outside':
        return this.updateWalkOutside(crewMember, deltaTime);

      case 'complete':
        this.isComplete = true;
        console.log(`${crewMember.name} exited ${this.module.moduleName}`);
        return true;
    }

    return false;
  }

  /**
   * Phase 1: Walk to door inside tile
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

    // Remove crew from module's crew list
    const crewIndex = this.module.crew.indexOf(crewMember);
    if (crewIndex !== -1) {
      this.module.crew.splice(crewIndex, 1);
    }

    // Clear crew's current module
    crewMember.currentModule = null;

    // Move to phase 3: Walk outside
    this.phase = 'walk_outside';
    return false;
  }

  /**
   * Phase 3: Walk to outside position
   */
  updateWalkOutside(crewMember, deltaTime) {
    if (!this.walkAction) {
      const outsideTile = this.door.getOutsideTile();

      this.walkAction = new WalkAction(outsideTile.x, outsideTile.y);
      this.walkAction.start(crewMember);

      console.log(`${crewMember.name} walking outside ${this.module.moduleName}`);
    }

    const walkComplete = this.walkAction.update(crewMember, deltaTime);

    if (walkComplete) {
      // Completed exiting module
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

    console.log('Exit module action interrupted');
  }

  /**
   * Get description
   */
  getDescription() {
    if (this.module) {
      return `Exiting ${this.module.moduleName} (${this.phase})`;
    }
    return 'Exiting module';
  }

  /**
   * Clone action
   */
  clone() {
    return new ExitModuleAction();
  }
}

export default ExitModuleAction;

/**
 * UseObjectAction.js - Crew Member Using Equipment/Objects
 *
 * Inspired by CorsixTH use_object.lua
 *
 * Action for crew members to interact with equipment:
 * - Exercise equipment
 * - Workstations
 * - Galley (eating)
 * - Hygiene facilities
 * - Sleep pods
 */

import CrewAction from './Action.js';

class UseObjectAction extends CrewAction {
  constructor(objectId, duration = 5.0) {
    super('use_object');

    this.objectId = objectId;      // ID of object to use
    this.duration = duration;       // How long to use object (seconds)
    this.elapsed = 0;
    this.object = null;             // Reference to actual object
  }

  /**
   * Start using object
   */
  start(crewMember) {
    // Find object in world
    this.object = crewMember.world.getObjectById(this.objectId);

    if (!this.object) {
      console.warn(`Object ${this.objectId} not found`);
      this.isComplete = true;
      return;
    }

    // Check if crew can use object
    if (!this.object.canUse(crewMember)) {
      console.warn(`${crewMember.name} cannot use ${this.object.type}`);
      this.isComplete = true;
      return;
    }

    // Start using object
    this.object.use(crewMember);

    // Set crew animation state
    crewMember.isMoving = false;
    crewMember.animationState = this.getAnimationForObject();

    console.log(`${crewMember.name} using ${this.object.type} for ${this.duration}s`);
  }

  /**
   * Update object usage
   */
  update(crewMember, deltaTime) {
    if (this.isComplete || !this.object) {
      crewMember.animationState = 'idle';
      return true;
    }

    this.elapsed += deltaTime;

    // Apply object effects to crew member
    if (this.object.applyEffects) {
      this.object.applyEffects(crewMember, deltaTime);
    }

    if (this.elapsed >= this.duration) {
      // Release object
      this.object.release(crewMember);

      this.isComplete = true;
      crewMember.animationState = 'idle';
      console.log(`${crewMember.name} finished using ${this.object.type}`);
      return true;
    }

    return false;
  }

  /**
   * Get animation state based on object type
   */
  getAnimationForObject() {
    if (!this.object) return 'idle';

    switch (this.object.type) {
      case 'exercise_equipment':
        return 'exercising';
      case 'workstation':
        return 'working';
      case 'sleep_pod':
        return 'sleeping';
      case 'galley_station':
        return 'eating';
      default:
        return 'using_object';
    }
  }

  /**
   * Interrupt usage
   */
  interrupt() {
    super.interrupt();
    console.log('Object usage interrupted');
  }

  /**
   * Get description
   */
  getDescription() {
    if (this.object) {
      const remaining = Math.max(0, this.duration - this.elapsed);
      return `Using ${this.object.type} (${remaining.toFixed(1)}s)`;
    }
    return 'Using object';
  }

  /**
   * Clone action
   */
  clone() {
    return new UseObjectAction(this.objectId, this.duration);
  }
}

export default UseObjectAction;

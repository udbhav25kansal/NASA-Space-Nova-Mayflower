/**
 * IdleAction.js - Crew Member Idle/Waiting Behavior
 *
 * Inspired by CorsixTH idle.lua
 *
 * Simple action for crew members to wait or rest.
 * Can have a duration or wait indefinitely.
 */

import CrewAction from './Action.js';

class IdleAction extends CrewAction {
  constructor(duration = null) {
    super('idle');

    this.duration = duration; // null = wait indefinitely
    this.elapsed = 0;
  }

  /**
   * Start idling
   */
  start(crewMember) {
    crewMember.isMoving = false;
    crewMember.animationState = 'idle';

    if (this.duration) {
      console.log(`${crewMember.name} idling for ${this.duration}s`);
    } else {
      console.log(`${crewMember.name} waiting`);
    }
  }

  /**
   * Update idle - check if duration expired
   */
  update(crewMember, deltaTime) {
    if (!this.duration) {
      // Wait indefinitely until interrupted
      return false;
    }

    this.elapsed += deltaTime;

    if (this.elapsed >= this.duration) {
      this.isComplete = true;
      return true;
    }

    return false;
  }

  /**
   * Get description
   */
  getDescription() {
    if (this.duration) {
      const remaining = Math.max(0, this.duration - this.elapsed);
      return `Idling (${remaining.toFixed(1)}s remaining)`;
    }
    return 'Waiting';
  }

  /**
   * Clone action
   */
  clone() {
    return new IdleAction(this.duration);
  }
}

export default IdleAction;

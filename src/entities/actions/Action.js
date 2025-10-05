/**
 * Action.js - Base CrewAction Class
 *
 * Inspired by CorsixTH HumanoidAction system
 *
 * Actions represent activities that crew members perform:
 * - Walking to a location
 * - Using equipment
 * - Sleeping, eating, exercising
 * - Idle/waiting
 *
 * Each crew member has an action queue that executes sequentially.
 */

class CrewAction {
  constructor(type) {
    this.type = type;
    this.isComplete = false;
    this.priority = 0;        // Higher = more important
    this.canInterrupt = true;  // Can this action be interrupted?
  }

  /**
   * Called when action starts
   * @param {CrewMember} crewMember - The crew member performing this action
   */
  start(crewMember) {
    // Override in subclasses
    console.warn(`Action ${this.type} has no start() implementation`);
  }

  /**
   * Called each frame while action is active
   * @param {CrewMember} crewMember - The crew member performing this action
   * @param {number} deltaTime - Time since last frame (seconds)
   * @returns {boolean} true if action is complete
   */
  update(crewMember, deltaTime) {
    // Override in subclasses
    return false;
  }

  /**
   * Called when action is interrupted or cancelled
   */
  interrupt() {
    // Override in subclasses
    this.isComplete = true;
  }

  /**
   * Get action description for UI display
   * @returns {string} Human-readable description
   */
  getDescription() {
    return this.type;
  }

  /**
   * Clone this action (for repeating actions)
   * @returns {CrewAction} New instance of same action
   */
  clone() {
    return new CrewAction(this.type);
  }
}

export default CrewAction;

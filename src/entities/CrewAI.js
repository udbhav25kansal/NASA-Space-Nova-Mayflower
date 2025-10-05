/**
 * CrewAI.js - Crew Member Autonomous Decision Making
 *
 * Inspired by The Sims and CorsixTH AI systems
 *
 * Autonomous AI that decides what crew members should do based on:
 * - Current needs (hunger, fatigue, stress, etc.)
 * - Available modules and objects
 * - Priorities and thresholds
 *
 * Decision-making process:
 * 1. Evaluate all needs
 * 2. Find most critical/urgent need
 * 3. Find best object/module to satisfy that need
 * 4. Queue actions to satisfy need (walk to module, enter, use object)
 */

class CrewAI {
  constructor(crewMember) {
    this.crewMember = crewMember;
    this.world = crewMember.world;

    // Decision-making frequency (in seconds)
    this.decisionInterval = 5.0;      // Make decision every 5 seconds
    this.timeSinceLastDecision = 0;

    // Need-to-object mapping
    this.needToObjectType = {
      hunger: 'galley_station',
      fatigue: 'sleep_pod',
      hygiene: 'hygiene_station',       // Future
      exerciseNeed: 'exercise_equipment',
      recreationNeed: 'workstation',     // Temporary mapping
      socialNeed: 'galley_station'       // Social eating
    };

    // Need-to-module mapping (fallback if no object)
    this.needToModuleType = {
      hunger: 'Galley',
      fatigue: 'Crew Quarters',
      hygiene: 'Hygiene',
      exerciseNeed: 'Exercise',
      recreationNeed: 'Ward/Dining',
      socialNeed: 'Ward/Dining'
    };
  }

  /**
   * Update AI (called each frame)
   */
  update(deltaTime) {
    this.timeSinceLastDecision += deltaTime;

    // Make decision at intervals
    if (this.timeSinceLastDecision >= this.decisionInterval) {
      this.makeDecision();
      this.timeSinceLastDecision = 0;
    }
  }

  /**
   * Make autonomous decision based on needs
   */
  makeDecision() {
    // Don't interrupt if already doing something
    if (this.crewMember.actionQueue.length > 0) {
      return;
    }

    // Get most urgent need
    const urgentNeed = this.crewMember.needs.getMostUrgentNeed();

    if (!urgentNeed || urgentNeed.value < 30) {
      // No urgent needs, idle
      console.log(`${this.crewMember.name}: No urgent needs (wellbeing: ${this.crewMember.needs.getWellbeingScore().toFixed(1)})`);
      return;
    }

    console.log(`${this.crewMember.name}: Urgent need = ${urgentNeed.name} (${urgentNeed.value.toFixed(1)})`);

    // Find object/module to satisfy need
    const target = this.findTargetForNeed(urgentNeed.name);

    if (!target) {
      console.log(`${this.crewMember.name}: No target found for ${urgentNeed.name}`);
      return;
    }

    // Queue actions to satisfy need
    this.queueActionsForTarget(target);
  }

  /**
   * Find best object or module to satisfy a need
   * @param {string} needName - Name of need to satisfy
   * @returns {Object|null} Target with type ('object' or 'module') and reference
   */
  findTargetForNeed(needName) {
    // Try to find object first
    const objectType = this.needToObjectType[needName];
    if (objectType) {
      const availableObject = this.findAvailableObject(objectType);
      if (availableObject) {
        return {
          type: 'object',
          object: availableObject,
          module: availableObject.module
        };
      }
    }

    // Fallback to module
    const moduleType = this.needToModuleType[needName];
    if (moduleType) {
      const module = this.findModuleByType(moduleType);
      if (module) {
        return {
          type: 'module',
          module: module
        };
      }
    }

    return null;
  }

  /**
   * Find available object of given type
   * @param {string} objectType - Type of object
   * @returns {Object|null}
   */
  findAvailableObject(objectType) {
    if (!this.world.objects) return null;

    // Find objects of this type that aren't in use
    const availableObjects = this.world.objects.filter(obj =>
      obj.type === objectType && !obj.inUse
    );

    if (availableObjects.length === 0) return null;

    // Find closest available object
    let closestObject = null;
    let closestDistance = Infinity;

    availableObjects.forEach(obj => {
      const dx = obj.tileX - this.crewMember.tileX;
      const dy = obj.tileY - this.crewMember.tileY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestObject = obj;
      }
    });

    return closestObject;
  }

  /**
   * Find module by type name
   * @param {string} moduleType - Module type name
   * @returns {Object|null}
   */
  findModuleByType(moduleType) {
    if (!this.world.modules) return null;

    const modules = this.world.modules.filter(m => m.moduleName === moduleType);
    return modules.length > 0 ? modules[0] : null;
  }

  /**
   * Queue actions to reach and use target
   * @param {Object} target - Target object with type and reference
   */
  queueActionsForTarget(target) {
    const EnterModuleAction = this.world.EnterModuleAction;
    const UseObjectAction = this.world.UseObjectAction;

    if (!EnterModuleAction || !UseObjectAction) {
      console.warn('Action classes not available in world');
      return;
    }

    if (target.type === 'object') {
      // Enter module, then use object
      const enterAction = new EnterModuleAction(
        target.module.moduleId,
        target.object.objectId
      );

      const useAction = new UseObjectAction(
        target.object.objectId,
        target.object.useDuration
      );

      this.crewMember.actionQueue.push(enterAction);
      this.crewMember.actionQueue.push(useAction);

      console.log(`${this.crewMember.name}: Queued enter ${target.module.moduleName} -> use ${target.object.type}`);
    } else if (target.type === 'module') {
      // Just enter module
      const enterAction = new EnterModuleAction(target.module.moduleId);

      this.crewMember.actionQueue.push(enterAction);

      console.log(`${this.crewMember.name}: Queued enter ${target.module.moduleName}`);
    }
  }

  /**
   * Force immediate decision (useful for testing)
   */
  forceDecision() {
    this.makeDecision();
  }
}

export default CrewAI;

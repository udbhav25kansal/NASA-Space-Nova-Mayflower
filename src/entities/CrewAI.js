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

    // Decision-making frequency (in seconds) - VERY FREQUENT for dynamic movement
    this.decisionInterval = 1.5;      // Make decision every 1.5 seconds (was 5.0, then 2.0)
    this.timeSinceLastDecision = 0;

    // Wandering behavior (to make crew move around more) - VERY AGGRESSIVE
    this.wanderChance = 0.8;          // 80% chance to wander when idle (was 30%)
    this.explorationRadius = 15;      // Tiles to explore when wandering (was 10)

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

    // Add variety to workstation interactions
    this.workstationModules = ['Workstation', 'Laboratory', 'Communications', 'Medical'];
    this.lastWorkstationVisit = 0;
  }

  /**
   * Update AI (called each frame)
   */
  update(deltaTime) {
    this.timeSinceLastDecision += deltaTime;

    // Make decision at intervals
    if (this.timeSinceLastDecision >= this.decisionInterval) {
      console.log(`${this.crewMember.name}: AI making decision...`);
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

    if (!urgentNeed || urgentNeed.value < 20) {  // LOWERED from 30 to 20
      // No urgent needs - ALWAYS wander or check workstations to keep crew moving

      // Random chance to wander around habitat (80% chance!)
      if (Math.random() < this.wanderChance) {
        this.wanderToRandomLocation();
        return;
      }

      // Periodically visit workstations to "check systems"
      const timeSinceWorkVisit = Date.now() - this.lastWorkstationVisit;
      if (timeSinceWorkVisit > 8000) { // Visit every 8 seconds (was 15)
        this.visitWorkstation();
        this.lastWorkstationVisit = Date.now();
        return;
      }

      // If neither triggered, wander anyway
      this.wanderToRandomLocation();
      return;
    }

    console.log(`${this.crewMember.name}: Urgent need = ${urgentNeed.name} (${urgentNeed.value.toFixed(1)})`);

    // Find object/module to satisfy need
    const target = this.findTargetForNeed(urgentNeed.name);

    if (!target) {
      console.log(`${this.crewMember.name}: No target found for ${urgentNeed.name}`);
      // If can't find target, wander instead
      if (Math.random() < 0.5) {
        this.wanderToRandomLocation();
      }
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
   * Wander to a random nearby location for exploration
   */
  wanderToRandomLocation() {
    if (!this.world.tileSystem) return;

    // Pick random tile within exploration radius
    const randomOffsetX = Math.floor((Math.random() - 0.5) * this.explorationRadius * 2);
    const randomOffsetY = Math.floor((Math.random() - 0.5) * this.explorationRadius * 2);

    const targetTileX = this.crewMember.tileX + randomOffsetX;
    const targetTileY = this.crewMember.tileY + randomOffsetY;

    // Check if tile is walkable
    const tile = this.world.tileSystem.getTile(targetTileX, targetTileY);
    if (!tile || !tile.walkable) {
      // Try again with smaller radius
      const smallOffsetX = Math.floor((Math.random() - 0.5) * 4);
      const smallOffsetY = Math.floor((Math.random() - 0.5) * 4);
      const newTargetX = this.crewMember.tileX + smallOffsetX;
      const newTargetY = this.crewMember.tileY + smallOffsetY;

      const newTile = this.world.tileSystem.getTile(newTargetX, newTargetY);
      if (newTile && newTile.walkable) {
        this.queueWalkAction(newTargetX, newTargetY);
        console.log(`${this.crewMember.name}: Wandering to tile (${newTargetX}, ${newTargetY})`);
      }
      return;
    }

    this.queueWalkAction(targetTileX, targetTileY);
    console.log(`${this.crewMember.name}: Wandering to tile (${targetTileX}, ${targetTileY})`);
  }

  /**
   * Visit a workstation module to "check systems" or "perform routine checks"
   */
  visitWorkstation() {
    if (!this.world.modules) return;

    // Find random workstation-type module
    const workstations = this.world.modules.filter(m =>
      this.workstationModules.includes(m.moduleName)
    );

    if (workstations.length === 0) {
      // Fallback to any module
      if (this.world.modules.length > 0) {
        const randomModule = this.world.modules[Math.floor(Math.random() * this.world.modules.length)];
        this.queueModuleVisit(randomModule);
      }
      return;
    }

    // Pick random workstation
    const randomWorkstation = workstations[Math.floor(Math.random() * workstations.length)];
    this.queueModuleVisit(randomWorkstation);

    console.log(`${this.crewMember.name}: Checking systems at ${randomWorkstation.moduleName}`);
  }

  /**
   * Queue a simple walk action to target tile
   */
  queueWalkAction(targetTileX, targetTileY) {
    if (!this.world.WalkAction) return;

    const walkAction = new this.world.WalkAction(targetTileX, targetTileY);
    this.crewMember.actionQueue.push(walkAction);
  }

  /**
   * Queue action to visit a module (walk to it and briefly idle inside)
   */
  queueModuleVisit(module) {
    if (!this.world.EnterModuleAction) return;

    const enterAction = new this.world.EnterModuleAction(module.moduleId);
    this.crewMember.actionQueue.push(enterAction);

    // Add brief idle period (simulated by short-duration idle action)
    // This makes crew appear to be "working" or "checking" the module
    if (this.world.IdleAction) {
      const idleAction = new this.world.IdleAction(3.0); // Idle for 3 seconds
      this.crewMember.actionQueue.push(idleAction);
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

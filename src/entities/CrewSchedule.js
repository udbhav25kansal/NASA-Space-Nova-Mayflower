/**
 * CrewSchedule.js - Daily Schedule System for Crew Members
 *
 * Inspired by NASA astronaut schedules and The Sims routines
 *
 * Manages daily schedules for crew members:
 * - Wake/sleep times
 * - Meal times (breakfast, lunch, dinner)
 * - Work periods
 * - Exercise periods
 * - Recreation/social time
 * - Personal hygiene
 *
 * Schedule priorities:
 * 1. Scheduled activities (high priority)
 * 2. Critical needs (override schedule if urgent)
 * 3. Free time / autonomous behavior
 */

class CrewSchedule {
  constructor(crewMember) {
    this.crewMember = crewMember;
    this.simulationTime = crewMember.world.simulationTime;

    // Daily schedule (24-hour format)
    this.schedule = [
      { time: 6, activity: 'wake', duration: 0.5, priority: 'high' },      // 6:00 AM - Wake up
      { time: 6.5, activity: 'hygiene', duration: 0.5, priority: 'high' }, // 6:30 AM - Morning hygiene
      { time: 7, activity: 'breakfast', duration: 0.5, priority: 'high' }, // 7:00 AM - Breakfast
      { time: 8, activity: 'work', duration: 2, priority: 'medium' },      // 8:00 AM - Work
      { time: 10, activity: 'exercise', duration: 1, priority: 'high' },   // 10:00 AM - Exercise
      { time: 11, activity: 'work', duration: 1, priority: 'medium' },     // 11:00 AM - Work
      { time: 12, activity: 'lunch', duration: 0.5, priority: 'high' },    // 12:00 PM - Lunch
      { time: 13, activity: 'work', duration: 3, priority: 'medium' },     // 1:00 PM - Work
      { time: 16, activity: 'recreation', duration: 1, priority: 'medium' },// 4:00 PM - Recreation
      { time: 17, activity: 'hygiene', duration: 0.5, priority: 'medium' },// 5:00 PM - Hygiene
      { time: 18, activity: 'dinner', duration: 0.5, priority: 'high' },   // 6:00 PM - Dinner
      { time: 19, activity: 'social', duration: 2, priority: 'medium' },   // 7:00 PM - Social/recreation
      { time: 21, activity: 'personal', duration: 0.5, priority: 'low' },  // 9:00 PM - Personal time
      { time: 22, activity: 'sleep', duration: 8, priority: 'high' }       // 10:00 PM - Sleep
    ];

    // Track last executed activity
    this.lastActivityTime = -1;
    this.currentScheduledActivity = null;

    // Schedule adherence tracking
    this.adherenceScore = 100;  // 0-100, how well crew follows schedule
  }

  /**
   * Get current scheduled activity
   * @returns {Object|null} Current activity or null
   */
  getCurrentActivity() {
    if (!this.simulationTime) return null;

    const currentHour = this.simulationTime.hour + (this.simulationTime.minute / 60);

    // Find activity that should be happening now
    for (let i = this.schedule.length - 1; i >= 0; i--) {
      const activity = this.schedule[i];
      const activityEnd = activity.time + activity.duration;

      if (currentHour >= activity.time && currentHour < activityEnd) {
        return activity;
      }
    }

    return null;
  }

  /**
   * Get next scheduled activity
   * @returns {Object|null} Next activity or null
   */
  getNextActivity() {
    if (!this.simulationTime) return null;

    const currentHour = this.simulationTime.hour + (this.simulationTime.minute / 60);

    // Find next activity
    for (const activity of this.schedule) {
      if (activity.time > currentHour) {
        return activity;
      }
    }

    // Wrap to next day
    return this.schedule[0];
  }

  /**
   * Check if it's time to execute scheduled activity
   * @returns {boolean}
   */
  shouldExecuteSchedule() {
    const currentActivity = this.getCurrentActivity();

    if (!currentActivity) return false;

    // Check if this is a new activity (not already executed)
    const activityKey = `${this.simulationTime.missionDay}_${currentActivity.time}`;
    if (this.lastActivityTime === activityKey) {
      return false; // Already executed this activity
    }

    // Check if crew has critical needs that override schedule
    if (this.crewMember.needs && this.crewMember.needs.hasCriticalNeeds()) {
      // Critical needs override low/medium priority activities
      if (currentActivity.priority !== 'high') {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute current scheduled activity
   */
  executeScheduledActivity() {
    const currentActivity = this.getCurrentActivity();
    if (!currentActivity) return;

    // Mark as executed
    const activityKey = `${this.simulationTime.missionDay}_${currentActivity.time}`;
    this.lastActivityTime = activityKey;
    this.currentScheduledActivity = currentActivity;

    // Queue appropriate action based on activity type
    this.queueActivityActions(currentActivity);

    console.log(`${this.crewMember.name}: Executing scheduled ${currentActivity.activity} at ${this.simulationTime.getTimeString()}`);
  }

  /**
   * Queue actions for scheduled activity
   * @param {Object} activity - Scheduled activity
   */
  queueActivityActions(activity) {
    // Clear existing action queue (schedule takes priority)
    this.crewMember.actionQueue = [];

    const world = this.crewMember.world;

    switch (activity.activity) {
      case 'wake':
        // Wake up - already handled by sleep completion
        break;

      case 'sleep':
        // Find sleep pod
        const sleepTarget = this.findTargetForActivity('sleep');
        if (sleepTarget) {
          this.queueEnterAndUse(sleepTarget);
        }
        break;

      case 'breakfast':
      case 'lunch':
      case 'dinner':
        // Find galley
        const mealTarget = this.findTargetForActivity('meal');
        if (mealTarget) {
          this.queueEnterAndUse(mealTarget);
        }
        break;

      case 'exercise':
        // Find exercise equipment
        const exerciseTarget = this.findTargetForActivity('exercise');
        if (exerciseTarget) {
          this.queueEnterAndUse(exerciseTarget);
        }
        break;

      case 'work':
        // Find workstation
        const workTarget = this.findTargetForActivity('work');
        if (workTarget) {
          this.queueEnterAndUse(workTarget);
        }
        break;

      case 'hygiene':
        // Find hygiene module
        const hygieneTarget = this.findTargetForActivity('hygiene');
        if (hygieneTarget) {
          this.queueEnter(hygieneTarget);
        }
        break;

      case 'recreation':
      case 'social':
        // Find ward/dining
        const socialTarget = this.findTargetForActivity('social');
        if (socialTarget) {
          this.queueEnter(socialTarget);
        }
        break;

      case 'personal':
        // Free time - let AI handle
        break;
    }
  }

  /**
   * Find target object/module for activity
   * @param {string} activityType - Type of activity
   * @returns {Object|null} Target with object/module info
   */
  findTargetForActivity(activityType) {
    const world = this.crewMember.world;

    const activityMapping = {
      sleep: { objectType: 'sleep_pod', moduleType: 'Crew Quarters' },
      meal: { objectType: 'galley_station', moduleType: 'Galley' },
      exercise: { objectType: 'exercise_equipment', moduleType: 'Exercise' },
      work: { objectType: 'workstation', moduleType: 'Workstation' },
      hygiene: { objectType: null, moduleType: 'Hygiene' },
      social: { objectType: null, moduleType: 'Ward/Dining' }
    };

    const mapping = activityMapping[activityType];
    if (!mapping) return null;

    // Try to find object first
    if (mapping.objectType && world.objects) {
      const availableObjects = world.objects.filter(obj =>
        obj.type === mapping.objectType && !obj.inUse
      );

      if (availableObjects.length > 0) {
        const obj = availableObjects[0];
        return {
          type: 'object',
          object: obj,
          module: obj.module
        };
      }
    }

    // Fallback to module
    if (mapping.moduleType && world.modules) {
      const module = world.modules.find(m => m.moduleName === mapping.moduleType);
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
   * Queue enter module and use object actions
   * @param {Object} target - Target with object/module
   */
  queueEnterAndUse(target) {
    const EnterModuleAction = this.crewMember.world.EnterModuleAction;
    const UseObjectAction = this.crewMember.world.UseObjectAction;

    if (target.type === 'object') {
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
    }
  }

  /**
   * Queue enter module action
   * @param {Object} target - Target with module
   */
  queueEnter(target) {
    const EnterModuleAction = this.crewMember.world.EnterModuleAction;

    const enterAction = new EnterModuleAction(target.module.moduleId);
    this.crewMember.actionQueue.push(enterAction);
  }

  /**
   * Get schedule status
   * @returns {Object}
   */
  getStatus() {
    return {
      currentActivity: this.getCurrentActivity(),
      nextActivity: this.getNextActivity(),
      adherenceScore: this.adherenceScore,
      lastActivityTime: this.lastActivityTime
    };
  }
}

export default CrewSchedule;

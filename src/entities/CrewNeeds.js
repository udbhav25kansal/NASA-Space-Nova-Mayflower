/**
 * CrewNeeds.js - Crew Member Needs Tracking System
 *
 * Inspired by The Sims and CorsixTH needs system
 *
 * Tracks and updates crew member physiological and psychological needs:
 * - Hunger: Need for food (increases over time)
 * - Fatigue: Need for sleep (increases over time)
 * - Stress: Psychological stress (affected by work, environment)
 * - Exercise: Need for physical activity
 * - Recreation: Need for leisure and mental stimulation
 * - Social: Need for social interaction
 * - Hygiene: Need for cleanliness
 *
 * All needs range from 0-100:
 * - 0 = fully satisfied
 * - 100 = critical, must be addressed immediately
 *
 * Needs decay/grow over time and are satisfied by using appropriate objects/modules
 */

class CrewNeeds {
  constructor() {
    // Primary physiological needs - START HIGHER for immediate activity
    this.hunger = 35;         // 0-100 (satisfied by galley) - was 0
    this.fatigue = 25;        // 0-100 (satisfied by sleep pod) - was 0
    this.hygiene = 20;        // 0-100 (satisfied by hygiene module) - was 0

    // Psychological needs - START HIGHER for immediate activity
    this.stress = 45;         // 0-100 (reduced by recreation, increased by work) - was 40
    this.socialNeed = 40;     // 0-100 (reduced by social interaction) - was 20
    this.recreationNeed = 50; // 0-100 (reduced by recreation activities) - was 30

    // Physical health needs - START HIGHER for immediate activity
    this.exerciseNeed = 40;   // 0-100 (reduced by exercise) - was 20

    // Need growth rates (per minute of simulation time)
    this.growthRates = {
      hunger: 1.5,          // Hunger grows at 1.5/min
      fatigue: 1.0,         // Fatigue grows at 1.0/min
      hygiene: 0.8,         // Hygiene need grows at 0.8/min
      stress: 0.5,          // Stress slowly accumulates
      socialNeed: 0.7,      // Social need grows at 0.7/min
      recreationNeed: 0.6,  // Recreation need grows at 0.6/min
      exerciseNeed: 0.5     // Exercise need grows at 0.5/min
    };

    // Critical thresholds
    this.criticalThresholds = {
      hunger: 80,
      fatigue: 85,
      hygiene: 70,
      stress: 75,
      socialNeed: 60,
      recreationNeed: 65,
      exerciseNeed: 70
    };
  }

  /**
   * Update needs over time (natural decay/growth)
   * @param {number} deltaTime - Time elapsed in seconds
   */
  update(deltaTime) {
    const deltaMinutes = deltaTime / 60.0; // Convert to minutes

    // Increase needs over time
    this.hunger = Math.min(100, this.hunger + this.growthRates.hunger * deltaMinutes);
    this.fatigue = Math.min(100, this.fatigue + this.growthRates.fatigue * deltaMinutes);
    this.hygiene = Math.min(100, this.hygiene + this.growthRates.hygiene * deltaMinutes);
    this.stress = Math.min(100, this.stress + this.growthRates.stress * deltaMinutes);
    this.socialNeed = Math.min(100, this.socialNeed + this.growthRates.socialNeed * deltaMinutes);
    this.recreationNeed = Math.min(100, this.recreationNeed + this.growthRates.recreationNeed * deltaMinutes);
    this.exerciseNeed = Math.min(100, this.exerciseNeed + this.growthRates.exerciseNeed * deltaMinutes);

    // Clamp all values to 0-100
    this.clampAllNeeds();
  }

  /**
   * Clamp all needs to valid range 0-100
   */
  clampAllNeeds() {
    this.hunger = Math.max(0, Math.min(100, this.hunger));
    this.fatigue = Math.max(0, Math.min(100, this.fatigue));
    this.hygiene = Math.max(0, Math.min(100, this.hygiene));
    this.stress = Math.max(0, Math.min(100, this.stress));
    this.socialNeed = Math.max(0, Math.min(100, this.socialNeed));
    this.recreationNeed = Math.max(0, Math.min(100, this.recreationNeed));
    this.exerciseNeed = Math.max(0, Math.min(100, this.exerciseNeed));
  }

  /**
   * Get the most urgent need
   * @returns {{name: string, value: number}|null}
   */
  getMostUrgentNeed() {
    const needs = [
      { name: 'hunger', value: this.hunger },
      { name: 'fatigue', value: this.fatigue },
      { name: 'hygiene', value: this.hygiene },
      { name: 'stress', value: this.stress },
      { name: 'socialNeed', value: this.socialNeed },
      { name: 'recreationNeed', value: this.recreationNeed },
      { name: 'exerciseNeed', value: this.exerciseNeed }
    ];

    // Sort by value (highest first)
    needs.sort((a, b) => b.value - a.value);

    return needs[0].value > 0 ? needs[0] : null;
  }

  /**
   * Get all critical needs (above threshold)
   * @returns {Array<{name: string, value: number}>}
   */
  getCriticalNeeds() {
    const critical = [];

    if (this.hunger >= this.criticalThresholds.hunger) {
      critical.push({ name: 'hunger', value: this.hunger });
    }
    if (this.fatigue >= this.criticalThresholds.fatigue) {
      critical.push({ name: 'fatigue', value: this.fatigue });
    }
    if (this.hygiene >= this.criticalThresholds.hygiene) {
      critical.push({ name: 'hygiene', value: this.hygiene });
    }
    if (this.stress >= this.criticalThresholds.stress) {
      critical.push({ name: 'stress', value: this.stress });
    }
    if (this.socialNeed >= this.criticalThresholds.socialNeed) {
      critical.push({ name: 'socialNeed', value: this.socialNeed });
    }
    if (this.recreationNeed >= this.criticalThresholds.recreationNeed) {
      critical.push({ name: 'recreationNeed', value: this.recreationNeed });
    }
    if (this.exerciseNeed >= this.criticalThresholds.exerciseNeed) {
      critical.push({ name: 'exerciseNeed', value: this.exerciseNeed });
    }

    return critical;
  }

  /**
   * Check if any need is critical
   * @returns {boolean}
   */
  hasCriticalNeeds() {
    return this.getCriticalNeeds().length > 0;
  }

  /**
   * Get need value by name
   * @param {string} needName - Name of need
   * @returns {number} Need value (0-100)
   */
  getNeed(needName) {
    return this[needName] !== undefined ? this[needName] : 0;
  }

  /**
   * Set need value
   * @param {string} needName - Name of need
   * @param {number} value - New value (will be clamped to 0-100)
   */
  setNeed(needName, value) {
    if (this[needName] !== undefined) {
      this[needName] = Math.max(0, Math.min(100, value));
    }
  }

  /**
   * Adjust need by delta
   * @param {string} needName - Name of need
   * @param {number} delta - Amount to change (positive or negative)
   */
  adjustNeed(needName, delta) {
    if (this[needName] !== undefined) {
      this[needName] = Math.max(0, Math.min(100, this[needName] + delta));
    }
  }

  /**
   * Get overall well-being score (0-100)
   * Lower needs = higher well-being
   * @returns {number}
   */
  getWellbeingScore() {
    const totalNeeds = this.hunger + this.fatigue + this.hygiene +
                       this.stress + this.socialNeed + this.recreationNeed +
                       this.exerciseNeed;
    const avgNeed = totalNeeds / 7;
    return Math.max(0, 100 - avgNeed); // Invert so higher is better
  }

  /**
   * Get status summary
   * @returns {Object}
   */
  getStatus() {
    return {
      hunger: this.hunger,
      fatigue: this.fatigue,
      hygiene: this.hygiene,
      stress: this.stress,
      socialNeed: this.socialNeed,
      recreationNeed: this.recreationNeed,
      exerciseNeed: this.exerciseNeed,
      wellbeing: this.getWellbeingScore(),
      criticalNeeds: this.getCriticalNeeds(),
      mostUrgent: this.getMostUrgentNeed()
    };
  }

  /**
   * Export to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      hunger: this.hunger,
      fatigue: this.fatigue,
      hygiene: this.hygiene,
      stress: this.stress,
      socialNeed: this.socialNeed,
      recreationNeed: this.recreationNeed,
      exerciseNeed: this.exerciseNeed
    };
  }

  /**
   * Load from JSON
   * @param {Object} data - Needs data
   */
  fromJSON(data) {
    if (data.hunger !== undefined) this.hunger = data.hunger;
    if (data.fatigue !== undefined) this.fatigue = data.fatigue;
    if (data.hygiene !== undefined) this.hygiene = data.hygiene;
    if (data.stress !== undefined) this.stress = data.stress;
    if (data.socialNeed !== undefined) this.socialNeed = data.socialNeed;
    if (data.recreationNeed !== undefined) this.recreationNeed = data.recreationNeed;
    if (data.exerciseNeed !== undefined) this.exerciseNeed = data.exerciseNeed;

    this.clampAllNeeds();
  }
}

export default CrewNeeds;

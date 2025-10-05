/**
 * SleepModel.js
 *
 * Enhanced sleep quality calculation with Mars-Sim inspired features
 *
 * NASA-Compliant Implementation:
 * - Privacy factors (TP-2020-220505)
 * - Noise adjacency penalties (NASA adjacency rules)
 * - Lighting schedule compliance (HERA adjustable LEDs)
 * - Cumulative sleep debt tracking (Mars-Sim inspired, NASA sleep research validated)
 *
 * NASA Sources:
 * - NASA/TP-2020-220505: Crew quarters privacy requirements
 * - HERA Facility: Adjustable LED lighting for circadian support
 * - AIAA 2022: Exercise isolation from sleep areas
 * - NASA Human Research Roadmap: Sleep and Circadian Rhythms
 */

export class SleepModel {
  constructor(constraints) {
    this.constraints = constraints;

    // Load sleep quality factors from NASA constraints
    const factors = constraints.sleep_quality_factors;
    this.privateQuartersBonus = factors.private_quarters_bonus;
    this.exerciseAdjacencyPenalty = factors.exercise_adjacency_penalty;
    this.lightingComplianceWeight = factors.lighting_compliance_weight;
    this.sleepDebtThreshold = factors.sleep_debt_threshold_days;
    this.sleepDebtPenalty = factors.sleep_debt_penalty;
  }

  /**
   * Calculate sleep quality for a crew member
   * @param {Object} layout - Current habitat layout
   * @param {Object} crewMember - Crew member data with ID and quarters assignment
   * @param {Number} currentDay - Current mission day
   * @param {Array} sleepHistory - Array of previous sleep quality scores
   * @returns {Number} - Sleep quality score (0-100)
   */
  calculateSleepQuality(layout, crewMember, currentDay, sleepHistory = []) {
    let sleepQuality = 100; // Start at perfect

    // 1. Privacy Factor (NASA TP-2020-220505)
    const hasPrivateQuarters = this.hasPrivateQuarters(layout, crewMember.id);
    if (hasPrivateQuarters) {
      sleepQuality += this.privateQuartersBonus;
    } else {
      // Shared quarters penalty (especially for introverts)
      sleepQuality -= 20;
    }

    // 2. Noise Adjacency (NASA adjacency rules - Exercise near sleep)
    const sleepModule = this.getCrewQuartersModule(layout, crewMember.id);
    if (sleepModule) {
      const adjacentToExercise = this.checkAdjacentToExercise(layout, sleepModule);
      if (adjacentToExercise) {
        sleepQuality -= this.exerciseAdjacencyPenalty; // -30 points
      }
    }

    // 3. Lighting Schedule Compliance (HERA adjustable LEDs)
    const lightingCompliance = layout.lightingScheduleCompliance || 0.5;
    const lightingAdjustment = (lightingCompliance - 0.5) * this.lightingComplianceWeight;
    sleepQuality += lightingAdjustment; // ±10 points

    // 4. Mars-Sim Inspired: Cumulative Sleep Debt
    if (currentDay > this.sleepDebtThreshold && sleepHistory.length >= this.sleepDebtThreshold) {
      const recentSleep = sleepHistory.slice(-this.sleepDebtThreshold);
      const avgSleepQuality = recentSleep.reduce((sum, val) => sum + val, 0) / recentSleep.length;

      if (avgSleepQuality < 60) {
        sleepQuality -= this.sleepDebtPenalty; // -15 points for sustained poor sleep
      }
    }

    // 5. General Adjacency Compliance (clean/dirty separation)
    const adjacencyCompliance = layout.adjacencyCompliance || 0;
    sleepQuality += (adjacencyCompliance - 0.5) * 10; // ±5 points

    // Clip to valid range [0, 100]
    return Math.max(0, Math.min(100, sleepQuality));
  }

  /**
   * Check if crew member has private quarters
   * @param {Object} layout - Habitat layout
   * @param {String} crewId - Crew member ID
   * @returns {Boolean}
   */
  hasPrivateQuarters(layout, crewId) {
    if (!layout.modules || !layout.crewAssignments) return false;

    const assignment = layout.crewAssignments[crewId];
    if (!assignment) return false;

    const module = layout.modules.find(m => m.id === assignment.moduleId);
    if (!module || module.name !== 'Crew Quarters') return false;

    // Check if this module is assigned to only this crew member
    const occupants = Object.entries(layout.crewAssignments)
      .filter(([id, assign]) => assign.moduleId === assignment.moduleId);

    return occupants.length === 1;
  }

  /**
   * Get crew quarters module for a crew member
   * @param {Object} layout - Habitat layout
   * @param {String} crewId - Crew member ID
   * @returns {Object|null} - Module object or null
   */
  getCrewQuartersModule(layout, crewId) {
    if (!layout.modules || !layout.crewAssignments) return null;

    const assignment = layout.crewAssignments[crewId];
    if (!assignment) return null;

    return layout.modules.find(m => m.id === assignment.moduleId);
  }

  /**
   * Check if sleep module is adjacent to exercise module
   * @param {Object} layout - Habitat layout
   * @param {Object} sleepModule - Sleep module
   * @returns {Boolean}
   */
  checkAdjacentToExercise(layout, sleepModule) {
    if (!layout.modules || !sleepModule) return false;

    const exerciseModules = layout.modules.filter(m => m.name === 'Exercise');

    for (const exModule of exerciseModules) {
      if (this.modulesAreAdjacent(sleepModule, exModule)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if two modules are adjacent (within threshold distance)
   * @param {Object} module1
   * @param {Object} module2
   * @returns {Boolean}
   */
  modulesAreAdjacent(module1, module2) {
    if (!module1.position || !module2.position) return false;

    const threshold = 2.5; // meters (approximate adjacency threshold)

    const dx = module1.position.x - module2.position.x;
    const dz = module1.position.z - module2.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Subtract module sizes to check edge-to-edge distance
    const minDist = distance - (module1.dimensions.w / 2) - (module2.dimensions.w / 2);

    return minDist < threshold;
  }

  /**
   * Get sleep quality status category
   * @param {Number} sleepQuality - Sleep quality score (0-100)
   * @returns {String} - 'optimal', 'warning', or 'critical'
   */
  getSleepStatus(sleepQuality) {
    if (sleepQuality >= 70) return 'optimal';
    if (sleepQuality >= 50) return 'warning';
    return 'critical';
  }

  /**
   * Generate sleep quality recommendations
   * @param {Number} sleepQuality - Current sleep quality score
   * @param {Object} factors - Breakdown of contributing factors
   * @returns {Array} - Array of recommendation strings
   */
  generateRecommendations(sleepQuality, factors) {
    const recommendations = [];

    if (!factors.hasPrivateQuarters) {
      recommendations.push('Provide individual sleep quarters for privacy (NASA TP-2020-220505)');
    }

    if (factors.adjacentToExercise) {
      recommendations.push('Relocate exercise module away from sleep areas to reduce noise (AIAA 2022)');
    }

    if (factors.lightingCompliance < 0.7) {
      recommendations.push('Improve lighting schedule compliance for circadian support (HERA protocol)');
    }

    if (factors.sleepDebt) {
      recommendations.push('Sleep debt detected: Review workload and rest schedules');
    }

    if (factors.adjacencyCompliance < 0.8) {
      recommendations.push('Improve clean/dirty zone separation per NASA adjacency rules');
    }

    return recommendations;
  }
}

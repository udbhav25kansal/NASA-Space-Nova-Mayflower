/**
 * MissionSimulator.js
 *
 * 45-Day HERA Mission Simulator with daily time-step psychological modeling
 *
 * Integrates:
 * - PsychModel (HERA + UND baseline psychological trends)
 * - SleepModel (Mars-Sim inspired sleep quality calculation)
 * - Performance degradation (Mars-Sim inspired, NASA BHP validated)
 *
 * NASA Sources:
 * - HERA Facility Documentation: 45-day mission protocol
 * - UND LDT Study: Environmental variables → behavioral responses
 * - NASA-TM-2016-218603: Behavioral Health and Performance
 */

import { PsychModel } from './PsychModel.js';
import { SleepModel } from './SleepModel.js';

export class MissionSimulator {
  constructor(layout, crewConfig, constraints, psychParams, moduleImpacts = null) {
    this.layout = layout;
    this.constraints = constraints;
    this.psychParams = psychParams;
    this.moduleImpacts = moduleImpacts;

    // Initialize mission parameters (HERA baseline)
    this.crewSize = crewConfig.crewSize || 4;
    this.missionDays = crewConfig.missionDays || 45;
    this.currentDay = 0;

    // Storage for daily metrics (must be before initializeCrew)
    this.metrics = [];
    this.sleepHistory = {}; // Track sleep history per crew member

    // Initialize crew members (uses sleepHistory)
    this.crew = this.initializeCrew(crewConfig);

    // Initialize models
    this.psychModel = new PsychModel(psychParams);
    this.sleepModel = new SleepModel(constraints);

    // Load module impact data if not provided
    if (!this.moduleImpacts) {
      this.loadModuleImpacts();
    }
  }

  /**
   * Load module-specific psychological impact factors
   */
  async loadModuleImpacts() {
    try {
      const response = await fetch('/src/data/module-psychological-impacts.json');
      this.moduleImpacts = await response.json();
    } catch (error) {
      console.warn('Could not load module impacts, using defaults:', error);
      this.moduleImpacts = { module_impacts: {}, absence_penalties: {}, proximity_effects: {} };
    }
  }

  /**
   * Initialize crew with simple profiles (no MBTI, NASA-compliant only)
   * @param {Object} config - Crew configuration
   * @returns {Array} - Array of crew member objects
   */
  initializeCrew(config) {
    const crew = [];

    for (let i = 0; i < this.crewSize; i++) {
      const member = {
        id: `crew-${i + 1}`,
        name: config.names?.[i] || `Crew Member ${i + 1}`,
        role: config.roles?.[i] || 'Crew Member',
        gender: config.genders?.[i] || (i % 2 === 0 ? 'M' : 'F'),

        // Initial psychological state (from HERA baseline)
        state: {
          stress: 40,
          mood: 70,
          sleepQuality: 70,
          cohesion: 70,
          performance: 1.0
        }
      };

      crew.push(member);
      this.sleepHistory[member.id] = []; // Initialize sleep history
    }

    return crew;
  }

  /**
   * Calculate module-specific psychological impacts
   * NASA Model: Each module type has specific validated impacts on crew well-being
   * @returns {Object} - Aggregate stress/mood/sleep/cohesion modifiers
   */
  calculateModuleSpecificImpacts() {
    if (!this.layout.modules || this.layout.modules.length === 0) {
      return { stressModifier: 0, moodModifier: 0, sleepModifier: 0, cohesionModifier: 0 };
    }

    if (!this.moduleImpacts || !this.moduleImpacts.module_impacts) {
      return { stressModifier: 0, moodModifier: 0, sleepModifier: 0, cohesionModifier: 0 };
    }

    const impacts = this.moduleImpacts.module_impacts;
    const absencePenalties = this.moduleImpacts.absence_penalties || {};
    const proximityEffects = this.moduleImpacts.proximity_effects || {};

    let totalStressReduction = 0;
    let totalMoodBonus = 0;
    let totalSleepBonus = 0;
    let totalCohesionBonus = 0;

    // Track which critical modules are present
    const presentModules = new Set(this.layout.modules.map(m => m.name || m.moduleName));

    // Calculate presence bonuses for each module
    for (const module of this.layout.modules) {
      const moduleName = module.name || module.moduleName;
      const impact = impacts[moduleName];

      if (impact) {
        totalStressReduction += impact.stress_reduction || 0;
        totalMoodBonus += impact.mood_bonus || 0;
        totalSleepBonus += impact.sleep_quality_bonus || 0;
        totalCohesionBonus += impact.cohesion_impact || 0;
      }
    }

    // Calculate absence penalties for critical modules
    const criticalModules = ['Crew Quarters', 'Hygiene', 'WCS', 'Exercise', 'Ward/Dining'];
    for (const criticalModule of criticalModules) {
      if (!presentModules.has(criticalModule) && absencePenalties[criticalModule]) {
        const penalty = absencePenalties[criticalModule];
        totalStressReduction -= penalty.stress_penalty || 0;
        totalMoodBonus -= penalty.mood_penalty || 0;
        totalSleepBonus -= penalty.sleep_quality_penalty || 0;
        totalCohesionBonus -= penalty.cohesion_penalty || 0;
      }
    }

    // Calculate proximity effects
    for (const module1 of this.layout.modules) {
      for (const module2 of this.layout.modules) {
        if (module1 === module2) continue;

        const name1 = module1.name || module1.moduleName;
        const name2 = module2.name || module2.moduleName;
        const effectKey = `${name1}_near_${name2}`;
        const effect = proximityEffects[effectKey];

        if (effect) {
          const distance = this.calculateModuleDistance(module1, module2);

          if (effect.distance_threshold_m && distance < effect.distance_threshold_m) {
            // Penalty for too close
            totalStressReduction -= effect.stress_penalty || 0;
            totalMoodBonus -= effect.mood_penalty || 0;
            totalSleepBonus -= effect.sleep_quality_penalty || 0;
          } else if (effect.distance_bonus_m && distance <= effect.distance_bonus_m) {
            // Bonus for optimal proximity
            totalStressReduction += effect.stress_reduction || 0;
            totalCohesionBonus += effect.cohesion_bonus || 0;
          }
        }
      }
    }

    // Normalize to 0-1 range (convert from percentage points)
    // Typical total bonuses: stress ~100-150, mood ~100-150, sleep ~70-100, cohesion ~50-80
    return {
      stressModifier: Math.max(-1, Math.min(1, totalStressReduction / 150)),
      moodModifier: Math.max(-1, Math.min(1, totalMoodBonus / 150)),
      sleepModifier: Math.max(-1, Math.min(1, totalSleepBonus / 100)),
      cohesionModifier: Math.max(-1, Math.min(1, totalCohesionBonus / 80))
    };
  }

  /**
   * Calculate distance between two modules
   * @param {Object} m1 - First module
   * @param {Object} m2 - Second module
   * @returns {Number} - Distance in meters
   */
  calculateModuleDistance(m1, m2) {
    const x1 = m1.position?.x || 0;
    const z1 = m1.position?.z || 0;
    const x2 = m2.position?.x || 0;
    const z2 = m2.position?.z || 0;

    return Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
  }

  /**
   * Calculate design variables from current layout
   * @returns {Object} - Design variables (P, W, V, L, A, R, E) + module-specific impacts
   */
  calculateDesignVariables() {
    const layout = this.layout;

    // P: Private Sleep Quarters (fraction of crew with private quarters)
    const privateQuartersFraction = this.calculatePrivacyFraction();

    // W: Window Type (user-configurable)
    const windowType = layout.windowType !== undefined ? layout.windowType : 0.5;

    // V: Visual Order - NASA Model: organized layouts reduce cognitive load
    const visualOrder = this.calculateVisualOrder();

    // L: Lighting Schedule Compliance (user-configurable)
    const lightingCompliance = layout.lightingScheduleCompliance !== undefined ?
      layout.lightingScheduleCompliance : 0.8;

    // A: Adjacency Compliance (from ConstraintValidator)
    const adjacencyCompliance = layout.adjacencyCompliance !== undefined ?
      layout.adjacencyCompliance : 1.0;

    // R: Recreation Area (fraction of total area)
    const recreationArea = this.calculateRecreationFraction();

    // E: Exercise Compliance (user-configurable)
    const exerciseCompliance = layout.exerciseCompliance !== undefined ?
      layout.exerciseCompliance : 0.7;

    // NEW: Module-Specific Impacts (NASA research-backed)
    const moduleImpacts = this.calculateModuleSpecificImpacts();

    const designVars = {
      privateSleepQuarters: privateQuartersFraction,
      windowType: windowType,
      visualOrder: visualOrder,
      lightingCompliance: lightingCompliance,
      adjacencyCompliance: adjacencyCompliance,
      recreationArea: recreationArea,
      exerciseCompliance: exerciseCompliance,
      // Add module-specific modifiers
      moduleStressModifier: moduleImpacts.stressModifier,
      moduleMoodModifier: moduleImpacts.moodModifier,
      moduleSleepModifier: moduleImpacts.sleepModifier,
      moduleCohesionModifier: moduleImpacts.cohesionModifier
    };

    // Debug logging
    console.log('🧮 Design Variables Calculated:', {
      privacy: `${(privateQuartersFraction * 100).toFixed(0)}%`,
      window: windowType,
      visualOrder: `${(visualOrder * 100).toFixed(0)}%`,
      lighting: `${(lightingCompliance * 100).toFixed(0)}%`,
      adjacency: `${(adjacencyCompliance * 100).toFixed(0)}%`,
      recreation: `${(recreationArea * 100).toFixed(0)}%`,
      exercise: `${(exerciseCompliance * 100).toFixed(0)}%`,
      moduleCount: layout.modules?.length || 0,
      moduleImpacts: {
        stress: moduleImpacts.stressModifier.toFixed(2),
        mood: moduleImpacts.moodModifier.toFixed(2),
        sleep: moduleImpacts.sleepModifier.toFixed(2),
        cohesion: moduleImpacts.cohesionModifier.toFixed(2)
      }
    });

    return designVars;
  }

  /**
   * Calculate visual order metric based on layout organization
   * NASA Model: UND study shows organized spaces reduce stress by 15-20%
   * Factors: grid alignment, spacing uniformity, functional zoning
   * @returns {Number} - 0-1 (higher is better organized)
   */
  calculateVisualOrder() {
    if (!this.layout.modules || this.layout.modules.length === 0) return 0;

    let orderScore = 0;
    let factorCount = 0;

    // Factor 1: Grid Alignment (modules aligned to 0.5m grid)
    const gridAligned = this.layout.modules.filter(m => {
      const x = m.position?.x || 0;
      const z = m.position?.z || 0;
      return (Math.abs(x % 0.5) < 0.01) && (Math.abs(z % 0.5) < 0.01);
    }).length;
    orderScore += gridAligned / this.layout.modules.length;
    factorCount++;

    // Factor 2: Functional Zoning (clean/dirty separation quality)
    const cleanModules = this.layout.modules.filter(m => m.zone === 'clean');
    const dirtyModules = this.layout.modules.filter(m => m.zone === 'dirty');

    if (cleanModules.length > 0 && dirtyModules.length > 0) {
      // Calculate average distance between clean and dirty zones
      let totalSeparation = 0;
      let pairCount = 0;

      for (const clean of cleanModules) {
        for (const dirty of dirtyModules) {
          const dx = (clean.position?.x || 0) - (dirty.position?.x || 0);
          const dz = (clean.position?.z || 0) - (dirty.position?.z || 0);
          const distance = Math.sqrt(dx * dx + dz * dz);
          totalSeparation += distance;
          pairCount++;
        }
      }

      const avgSeparation = pairCount > 0 ? totalSeparation / pairCount : 0;
      // Normalize: 4m+ separation is ideal
      orderScore += Math.min(1.0, avgSeparation / 4.0);
      factorCount++;
    }

    // Factor 3: Module Overlap/Collision (penalties)
    let overlapCount = 0;
    for (let i = 0; i < this.layout.modules.length; i++) {
      for (let j = i + 1; j < this.layout.modules.length; j++) {
        if (this.modulesOverlap(this.layout.modules[i], this.layout.modules[j])) {
          overlapCount++;
        }
      }
    }
    const overlapPenalty = Math.max(0, 1 - (overlapCount / Math.max(1, this.layout.modules.length)));
    orderScore += overlapPenalty;
    factorCount++;

    return factorCount > 0 ? orderScore / factorCount : 0.5;
  }

  /**
   * Check if two modules overlap
   * @param {Object} m1 - First module
   * @param {Object} m2 - Second module
   * @returns {Boolean} - True if modules overlap
   */
  modulesOverlap(m1, m2) {
    const x1 = m1.position?.x || 0;
    const z1 = m1.position?.z || 0;
    const w1 = m1.dimensions?.w || 1;
    const d1 = m1.dimensions?.d || 1;

    const x2 = m2.position?.x || 0;
    const z2 = m2.position?.z || 0;
    const w2 = m2.dimensions?.w || 1;
    const d2 = m2.dimensions?.d || 1;

    // Check AABB collision
    return !(x1 + w1 / 2 < x2 - w2 / 2 ||
             x1 - w1 / 2 > x2 + w2 / 2 ||
             z1 + d1 / 2 < z2 - d2 / 2 ||
             z1 - d1 / 2 > z2 + d2 / 2);
  }

  /**
   * Calculate fraction of crew with private quarters
   * NASA Model: Per TP-2020-220505, private quarters reduce stress by 20-30%
   * @returns {Number} - 0-1
   */
  calculatePrivacyFraction() {
    if (!this.layout.modules) return 0;

    // Count crew quarters modules
    const crewQuartersModules = this.layout.modules.filter(m =>
      m.name === 'Crew Quarters' || m.moduleName === 'Crew Quarters'
    );

    if (crewQuartersModules.length === 0) return 0;

    // NASA standard: 1.82 m² per crew member for private quarters
    // Calculate if each crew member has sufficient private space
    const totalQuartersArea = crewQuartersModules.reduce((sum, m) =>
      sum + (m.dimensions.w * m.dimensions.d), 0
    );

    const minAreaPerCrew = 1.82; // NASA TP-2020-220505
    const requiredArea = this.crewSize * minAreaPerCrew;

    // If enough area exists, calculate based on module count vs crew size
    if (totalQuartersArea >= requiredArea) {
      // Assume equal distribution: privacy = min(1, modules/crew)
      return Math.min(1.0, crewQuartersModules.length / this.crewSize);
    } else {
      // Insufficient area: scale by area ratio
      return Math.min(1.0, totalQuartersArea / requiredArea);
    }
  }

  /**
   * Calculate fraction of habitat area devoted to recreation
   * NASA Model: HERA recommends 15-25% recreation area for optimal cohesion
   * @returns {Number} - 0-1 (0.15-0.25 is optimal per HERA)
   */
  calculateRecreationFraction() {
    if (!this.layout.modules || this.layout.modules.length === 0) return 0;

    const recreationTypes = ['Ward/Dining', 'Recreation', 'Exercise'];
    const recreationArea = this.layout.modules
      .filter(m => recreationTypes.includes(m.name) || recreationTypes.includes(m.moduleName))
      .reduce((sum, m) => sum + (m.dimensions.w * m.dimensions.d), 0);

    const totalArea = this.layout.modules
      .reduce((sum, m) => sum + (m.dimensions.w * m.dimensions.d), 0);

    return totalArea > 0 ? Math.min(1.0, recreationArea / totalArea) : 0;
  }

  /**
   * Simulate a single day
   * Updates all crew members' psychological states
   */
  simulateDay() {
    this.currentDay++;

    const designVariables = this.calculateDesignVariables();
    const performanceThresholds = this.constraints.performance_thresholds;

    const dailyMetrics = {
      day: this.currentDay,
      crew: []
    };

    for (const member of this.crew) {
      // Get previous day's metrics for damping
      const previousMetrics = this.currentDay > 1 ?
        this.metrics[this.currentDay - 2].crew.find(c => c.id === member.id) : null;

      // Calculate psychological metrics using PsychModel
      const psychMetrics = this.psychModel.simulateDay(
        designVariables,
        this.currentDay,
        previousMetrics
      );

      // Calculate enhanced sleep quality using SleepModel
      const sleepQuality = this.sleepModel.calculateSleepQuality(
        this.layout,
        member,
        this.currentDay,
        this.sleepHistory[member.id]
      );

      // Override sleep quality with enhanced calculation
      psychMetrics.sleepQuality = sleepQuality;

      // Track sleep history for debt calculation
      this.sleepHistory[member.id].push(sleepQuality);

      // Calculate performance (Mars-Sim inspired)
      const performance = this.psychModel.calculatePerformance(
        psychMetrics,
        performanceThresholds
      );

      // Update member state
      member.state = {
        ...psychMetrics,
        performance
      };

      // Store daily metrics
      dailyMetrics.crew.push({
        id: member.id,
        name: member.name,
        role: member.role,
        ...psychMetrics,
        performance
      });
    }

    // Calculate team-wide aggregates
    dailyMetrics.teamAverage = this.calculateTeamAverages(dailyMetrics.crew);

    this.metrics.push(dailyMetrics);
  }

  /**
   * Calculate team-wide average metrics
   * @param {Array} crewMetrics - Array of crew metrics
   * @returns {Object} - Average metrics
   */
  calculateTeamAverages(crewMetrics) {
    const sum = crewMetrics.reduce((acc, member) => {
      acc.stress += member.stress;
      acc.mood += member.mood;
      acc.sleepQuality += member.sleepQuality;
      acc.cohesion += member.cohesion;
      acc.performance += member.performance;
      return acc;
    }, { stress: 0, mood: 0, sleepQuality: 0, cohesion: 0, performance: 0 });

    return {
      stress: sum.stress / crewMetrics.length,
      mood: sum.mood / crewMetrics.length,
      sleepQuality: sum.sleepQuality / crewMetrics.length,
      cohesion: sum.cohesion / crewMetrics.length,
      performance: sum.performance / crewMetrics.length
    };
  }

  /**
   * Run full mission simulation (all days)
   * @returns {Object} - Simulation results with metrics and summary
   */
  run() {
    console.log(`Starting ${this.missionDays}-day HERA mission simulation...`);

    for (let day = 1; day <= this.missionDays; day++) {
      this.simulateDay();
    }

    return this.generateReport();
  }

  /**
   * Generate comprehensive mission report
   * @returns {Object} - Complete simulation results
   */
  generateReport() {
    const summary = this.calculateSummaryStats();

    return {
      missionConfig: {
        crewSize: this.crewSize,
        missionDays: this.missionDays,
        crew: this.crew.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          gender: m.gender
        }))
      },
      layoutConfig: {
        modules: this.layout.modules?.length || 0,
        adjacencyCompliance: this.layout.adjacencyCompliance || 0,
        designVariables: this.calculateDesignVariables()
      },
      dailyMetrics: this.metrics,
      summary: summary,
      recommendations: this.generateRecommendations(summary)
    };
  }

  /**
   * Calculate summary statistics for entire mission
   * @returns {Object} - Summary stats
   */
  calculateSummaryStats() {
    if (this.metrics.length === 0) return null;

    const firstDay = this.metrics[0].teamAverage;
    const lastDay = this.metrics[this.metrics.length - 1].teamAverage;

    // Calculate averages across all days
    const totals = this.metrics.reduce((acc, day) => {
      const avg = day.teamAverage;
      acc.stress += avg.stress;
      acc.mood += avg.mood;
      acc.sleepQuality += avg.sleepQuality;
      acc.cohesion += avg.cohesion;
      acc.performance += avg.performance;
      return acc;
    }, { stress: 0, mood: 0, sleepQuality: 0, cohesion: 0, performance: 0 });

    const avgMetrics = {
      stress: totals.stress / this.metrics.length,
      mood: totals.mood / this.metrics.length,
      sleepQuality: totals.sleepQuality / this.metrics.length,
      cohesion: totals.cohesion / this.metrics.length,
      performance: totals.performance / this.metrics.length
    };

    // Calculate changes
    const changes = {
      stress: lastDay.stress - firstDay.stress,
      mood: lastDay.mood - firstDay.mood,
      sleepQuality: lastDay.sleepQuality - firstDay.sleepQuality,
      cohesion: lastDay.cohesion - firstDay.cohesion,
      performance: lastDay.performance - firstDay.performance
    };

    return {
      initialMetrics: firstDay,
      finalMetrics: lastDay,
      averageMetrics: avgMetrics,
      changes: changes,
      phi: this.psychModel.calculatePHI(avgMetrics)
    };
  }

  /**
   * Generate recommendations based on simulation results
   * @param {Object} summary - Summary statistics
   * @returns {Array} - Array of recommendation strings
   */
  generateRecommendations(summary) {
    const recommendations = [];

    if (summary.averageMetrics.stress > 60) {
      recommendations.push('High stress detected: Increase privacy and improve adjacency compliance');
    }

    if (summary.averageMetrics.sleepQuality < 60) {
      recommendations.push('Poor sleep quality: Ensure exercise isolation from sleep areas and improve lighting schedule');
    }

    if (summary.averageMetrics.cohesion < 60) {
      recommendations.push('Low team cohesion: Increase recreation area and common spaces');
    }

    if (summary.averageMetrics.performance < 0.75) {
      recommendations.push('Performance degradation detected: Address stress, sleep, and cohesion issues');
    }

    if (summary.changes.stress > 20) {
      recommendations.push('Stress increasing over mission: Review workload and implement countermeasures');
    }

    if (summary.changes.sleepQuality < -15) {
      recommendations.push('Sleep quality declining: Implement sleep hygiene protocols and lighting adjustments');
    }

    return recommendations;
  }

  /**
   * Get current mission status
   * @returns {Object} - Current day and status
   */
  getStatus() {
    return {
      currentDay: this.currentDay,
      totalDays: this.missionDays,
      progress: (this.currentDay / this.missionDays) * 100,
      crew: this.crew.map(m => ({
        id: m.id,
        name: m.name,
        state: m.state
      }))
    };
  }
}

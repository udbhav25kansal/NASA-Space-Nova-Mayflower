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
  constructor(layout, crewConfig, constraints, psychParams) {
    this.layout = layout;
    this.constraints = constraints;
    this.psychParams = psychParams;

    // Initialize mission parameters (HERA baseline)
    this.crewSize = crewConfig.crewSize || 4;
    this.missionDays = crewConfig.missionDays || 45;
    this.currentDay = 0;

    // Initialize crew members
    this.crew = this.initializeCrew(crewConfig);

    // Initialize models
    this.psychModel = new PsychModel(psychParams);
    this.sleepModel = new SleepModel(constraints);

    // Storage for daily metrics
    this.metrics = [];
    this.sleepHistory = {}; // Track sleep history per crew member
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
   * Calculate design variables from current layout
   * @returns {Object} - Design variables (P, W, V, L, A, R, E)
   */
  calculateDesignVariables() {
    const layout = this.layout;

    // P: Private Sleep Quarters (fraction of crew with private quarters)
    const privateQuartersFraction = this.calculatePrivacyFraction();

    // W: Window Type (user-configurable)
    const windowType = layout.windowType !== undefined ? layout.windowType : 0.5;

    // V: Visual Order (1 - overlap ratio)
    const visualOrder = layout.visualOrder !== undefined ? layout.visualOrder : 0.8;

    // L: Lighting Schedule Compliance (user-configurable)
    const lightingCompliance = layout.lightingScheduleCompliance !== undefined ?
      layout.lightingScheduleCompliance : 0.8;

    // A: Adjacency Compliance (from ConstraintValidator)
    const adjacencyCompliance = layout.adjacencyCompliance !== undefined ?
      layout.adjacencyCompliance : 0.9;

    // R: Recreation Area (fraction of total area)
    const recreationArea = this.calculateRecreationFraction();

    // E: Exercise Compliance (user-configurable)
    const exerciseCompliance = layout.exerciseCompliance !== undefined ?
      layout.exerciseCompliance : 0.7;

    return {
      privateSleepQuarters: privateQuartersFraction,
      windowType: windowType,
      visualOrder: visualOrder,
      lightingCompliance: lightingCompliance,
      adjacencyCompliance: adjacencyCompliance,
      recreationArea: recreationArea,
      exerciseCompliance: exerciseCompliance
    };
  }

  /**
   * Calculate fraction of crew with private quarters
   * @returns {Number} - 0-1
   */
  calculatePrivacyFraction() {
    if (!this.layout.crewAssignments) return 0.5;

    let privateCount = 0;
    for (const member of this.crew) {
      if (this.sleepModel.hasPrivateQuarters(this.layout, member.id)) {
        privateCount++;
      }
    }

    return privateCount / this.crewSize;
  }

  /**
   * Calculate fraction of habitat area devoted to recreation
   * @returns {Number} - 0-1
   */
  calculateRecreationFraction() {
    if (!this.layout.modules) return 0.15;

    const recreationTypes = ['Ward/Dining', 'Recreation', 'Exercise'];
    const recreationArea = this.layout.modules
      .filter(m => recreationTypes.includes(m.name))
      .reduce((sum, m) => sum + (m.dimensions.w * m.dimensions.d), 0);

    const totalArea = this.layout.modules
      .reduce((sum, m) => sum + (m.dimensions.w * m.dimensions.d), 0);

    return totalArea > 0 ? recreationArea / totalArea : 0.15;
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

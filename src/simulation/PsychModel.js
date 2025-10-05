/**
 * PsychModel.js
 *
 * HERA + UND Lunar Daytime Behavioral Study - Psychological Simulation Engine
 *
 * Implements daily time-step simulation of crew psychological metrics:
 * - Stress (lower is better)
 * - Mood (higher is better)
 * - Sleep Quality (higher is better)
 * - Team Cohesion (higher is better)
 *
 * NASA Sources:
 * - HERA Facility Documentation (2019)
 * - UND Lunar Daytime Behavioral Study (2020)
 * - NASA/TP-2020-220505
 */

export class PsychModel {
  constructor(params) {
    this.params = params;

    // Extract baseline trends
    this.s0 = params.baseline_trends.stress.s0;
    this.s1 = params.baseline_trends.stress.s1;
    this.m0 = params.baseline_trends.mood.m0;
    this.m1 = params.baseline_trends.mood.m1;
    this.q0 = params.baseline_trends.sleep_quality.q0;
    this.q1 = params.baseline_trends.sleep_quality.q1;
    this.c0 = params.baseline_trends.cohesion.c0;
    this.c1 = params.baseline_trends.cohesion.c1;

    // Extract damping factors
    this.lambdaS = params.damping_factors.lambda_stress;
    this.lambdaM = params.damping_factors.lambda_mood;
    this.lambdaQ = params.damping_factors.lambda_sleep;
    this.lambdaC = params.damping_factors.lambda_cohesion;

    // Extract design variable weights
    const stress = params.design_variable_weights.stress_modifiers;
    this.alphaP = stress.alpha_privacy;
    this.alphaW = stress.alpha_window;
    this.alphaV = stress.alpha_visual_order;
    this.alphaL = stress.alpha_lighting;
    this.alphaA = stress.alpha_adjacency;

    const mood = params.design_variable_weights.mood_modifiers;
    this.betaP = mood.beta_privacy;
    this.betaW = mood.beta_window;
    this.betaV = mood.beta_visual_order;
    this.betaR = mood.beta_recreation;
    this.betaE = mood.beta_exercise;

    const sleep = params.design_variable_weights.sleep_modifiers;
    this.gammaP = sleep.gamma_privacy;
    this.gammaA = sleep.gamma_adjacency;
    this.gammaL = sleep.gamma_lighting;
    this.gammaE = sleep.gamma_exercise;

    const cohesion = params.design_variable_weights.cohesion_modifiers;
    this.deltaR = cohesion.delta_recreation;
    this.deltaV = cohesion.delta_visual_order;
    this.deltaA = cohesion.delta_adjacency;

    // Mission context
    this.missionDays = params.hera_context.mission_days;
    this.crewSize = params.hera_context.crew_size;
  }

  /**
   * Simulate psychological metrics for a single day
   * @param {Object} designVariables - Layout design variables (P, W, V, L, A, R, E, C)
   * @param {Number} currentDay - Current mission day (1-45)
   * @param {Object} previousMetrics - Metrics from previous day (for damping)
   * @returns {Object} - { stress, mood, sleepQuality, cohesion }
   */
  simulateDay(designVariables, currentDay, previousMetrics = null) {
    try {
      // Extract design variables
      const P = designVariables.privateSleepQuarters || 0;
      const W = designVariables.windowType || 0;
      const V = designVariables.visualOrder || 0;
      const L = designVariables.lightingCompliance || 0;
      const A = designVariables.adjacencyCompliance || 0;
      const R = designVariables.recreationArea || 0;
      const E = designVariables.exerciseCompliance || 0;

      // Normalized time (τ ∈ [0,1])
      const tau = (currentDay - 1) / this.missionDays;

      // Calculate baseline trends (HERA isolation drift)
      const stressBase = this.s0 + this.s1 * tau;
      const moodBase = this.m0 - this.m1 * tau;
      const sleepBase = this.q0 - this.q1 * tau;
      const cohesionBase = this.c0 - this.c1 * tau;

      // Calculate design modifiers
      const deltaStress = -(this.alphaP * P + this.alphaW * W + this.alphaV * V +
                           this.alphaL * L + this.alphaA * A);
      const deltaMood = this.betaP * P + this.betaW * W + this.betaV * V +
                        this.betaR * R + this.betaE * E;
      const deltaSleep = this.gammaP * P + this.gammaA * A + this.gammaL * L +
                         this.gammaE * E;
      const deltaCohesion = this.deltaR * R + this.deltaV * V + this.deltaA * A;

      // Apply damping with previous day's values
      let stress, mood, sleepQuality, cohesion;

      if (previousMetrics) {
        stress = this.lambdaS * previousMetrics.stress +
                 (1 - this.lambdaS) * (stressBase + deltaStress);
        mood = this.lambdaM * previousMetrics.mood +
               (1 - this.lambdaM) * (moodBase + deltaMood);
        sleepQuality = this.lambdaQ * previousMetrics.sleepQuality +
                       (1 - this.lambdaQ) * (sleepBase + deltaSleep);
        cohesion = this.lambdaC * previousMetrics.cohesion +
                   (1 - this.lambdaC) * (cohesionBase + deltaCohesion);
      } else {
        // First day - no previous metrics
        stress = stressBase + deltaStress;
        mood = moodBase + deltaMood;
        sleepQuality = sleepBase + deltaSleep;
        cohesion = cohesionBase + deltaCohesion;
      }

      // Clip to [0, 100] range
      stress = this.clip(stress, 0, 100);
      mood = this.clip(mood, 0, 100);
      sleepQuality = this.clip(sleepQuality, 0, 100);
      cohesion = this.clip(cohesion, 0, 100);

      return { stress, mood, sleepQuality, cohesion };

    } catch (error) {
      console.error('Error in PsychModel.simulateDay:', error);
      return { stress: 50, mood: 50, sleepQuality: 50, cohesion: 50 };
    }
  }

  /**
   * Run full mission simulation (all 45 days)
   * @param {Object} designVariables - Layout design variables
   * @returns {Array} - Array of daily metrics
   */
  simulateMission(designVariables) {
    try {
      const results = [];
      let previousMetrics = null;

      for (let day = 1; day <= this.missionDays; day++) {
        const metrics = this.simulateDay(designVariables, day, previousMetrics);
        results.push({
          day,
          ...metrics,
          psychHealthIndex: this.calculatePHI(metrics)
        });
        previousMetrics = metrics;
      }

      return results;

    } catch (error) {
      console.error('Error in PsychModel.simulateMission:', error);
      return [];
    }
  }

  /**
   * Calculate Psychological Health Index (PHI)
   * Composite score: lower stress + higher mood/sleep/cohesion
   * @param {Object} metrics - { stress, mood, sleepQuality, cohesion }
   * @returns {Number} - PHI score (0-100, higher is better)
   */
  calculatePHI(metrics) {
    try {
      // Invert stress (lower stress = better)
      const stressScore = 100 - metrics.stress;

      // Average of all positive metrics
      const phi = (stressScore + metrics.mood + metrics.sleepQuality + metrics.cohesion) / 4;

      return this.clip(phi, 0, 100);

    } catch (error) {
      console.error('Error calculating PHI:', error);
      return 50;
    }
  }

  /**
   * Calculate crew performance based on psychological state
   * Mars-Sim inspired formula with NASA BHP validation
   *
   * NASA Source: NASA-TM-2016-218603 Behavioral Health and Performance
   *
   * @param {Object} metrics - { stress, sleepQuality, cohesion }
   * @param {Object} performanceThresholds - Thresholds from nasa-constraints.json
   * @returns {Number} - Performance factor (0-1, higher is better)
   */
  calculatePerformance(metrics, performanceThresholds = null) {
    try {
      let performance = 1.0;

      // Use default thresholds if not provided
      const thresholds = performanceThresholds || {
        stress_moderate_threshold: 50,
        stress_high_threshold: 75,
        stress_performance_modifier_moderate: 0.01,
        stress_performance_modifier_high: 0.02,
        sleep_quality_threshold: 60,
        sleep_quality_performance_modifier: 0.005,
        cohesion_bonus_threshold: 70,
        cohesion_performance_modifier: 0.003
      };

      // Mars-Sim Tiered Stress Impact (NASA BHP-aligned)
      const stress = metrics.stress || 50;
      if (stress > thresholds.stress_high_threshold) {
        // High stress (>75): severe impact
        performance -= (stress - thresholds.stress_high_threshold) * thresholds.stress_performance_modifier_high;
      } else if (stress > thresholds.stress_moderate_threshold) {
        // Moderate stress (50-75): moderate impact
        performance -= (stress - thresholds.stress_moderate_threshold) * thresholds.stress_performance_modifier_moderate;
      }

      // Sleep Quality Impact (NASA sleep research)
      const sleepQuality = metrics.sleepQuality || 70;
      if (sleepQuality < thresholds.sleep_quality_threshold) {
        // Poor sleep reduces performance
        performance -= (thresholds.sleep_quality_threshold - sleepQuality) * thresholds.sleep_quality_performance_modifier;
      }

      // Cohesion Bonus (NASA crew dynamics research)
      const cohesion = metrics.cohesion || 70;
      if (cohesion > thresholds.cohesion_bonus_threshold) {
        // High team cohesion provides small performance boost
        performance += (cohesion - thresholds.cohesion_bonus_threshold) * thresholds.cohesion_performance_modifier;
      }

      // Clip to valid range [0.1, 1.0] (always maintain minimum 10% performance)
      return Math.max(0.1, Math.min(1.0, performance));

    } catch (error) {
      console.error('Error calculating performance:', error);
      return 0.7; // Default moderate performance
    }
  }

  /**
   * Get performance status and interpretation
   * @param {Number} performance - Performance factor (0-1)
   * @returns {Object} - { status, label, description }
   */
  getPerformanceStatus(performance) {
    if (performance >= 0.9) {
      return {
        status: 'optimal',
        label: 'Optimal',
        description: 'Crew performing at peak efficiency'
      };
    } else if (performance >= 0.75) {
      return {
        status: 'good',
        label: 'Good',
        description: 'Crew performing well with minor degradation'
      };
    } else if (performance >= 0.6) {
      return {
        status: 'moderate',
        label: 'Moderate',
        description: 'Noticeable performance degradation from stress/fatigue'
      };
    } else if (performance >= 0.4) {
      return {
        status: 'warning',
        label: 'Warning',
        description: 'Significant performance impairment - intervention needed'
      };
    } else {
      return {
        status: 'critical',
        label: 'Critical',
        description: 'Severe performance degradation - mission risk'
      };
    }
  }

  /**
   * Clip value to range
   */
  clip(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Get metric status (optimal, warning, critical)
   */
  getMetricStatus(metricName, value) {
    const ranges = this.params.validation_ranges[metricName];
    if (!ranges) return 'unknown';

    if (metricName === 'stress') {
      // Lower is better for stress
      if (value <= ranges.optimal[1]) return 'optimal';
      if (value <= 60) return 'warning';
      return 'critical';
    } else {
      // Higher is better for mood, sleep, cohesion
      if (value >= ranges.optimal[0]) return 'optimal';
      if (value >= 50) return 'warning';
      return 'critical';
    }
  }
}

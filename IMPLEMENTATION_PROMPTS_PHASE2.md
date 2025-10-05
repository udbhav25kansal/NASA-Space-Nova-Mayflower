# Phase 2 Implementation Prompts
# Habitat Harmony LS²: Psychological Simulation Layer

**Building on Phase 1 MVP (Prompts 1-18)**

This document contains detailed implementation prompts for Phase 2, adding psychological stress simulation based on HERA facility data and the UND Lunar Daytime Behavioral Study.

---

## Overview: Phase 2 Features

Phase 2 transforms the layout builder into a **psychological simulation engine** that evaluates crew well-being over a 45-day HERA-validated mission duration.

**Core Phase 2 Features:**
1. ✅ Mission configuration panel (duration, crew size, habitat type)
2. ✅ Psychological metrics calculation (Stress, Mood, Sleep Quality, Team Cohesion)
3. ✅ Daily time-step simulation (1-45 days)
4. ✅ Color-coded well-being heatmap visualization
5. ✅ CSV export with psychological metrics
6. ✅ Comparison mode (multiple layouts side-by-side)

**NASA Data Sources:**
- **HERA Facility Documentation (2019)**: Mission parameters, crew size, isolation protocols
- **UND Lunar Daytime Behavioral Study (2020)**: Design variable weights and correlations
- **NASA TP-2020-220505**: Volume and adjacency impact on psychology

---

## PROMPT 19: Psychological Model Parameters File

**Objective**: Create `src/data/psych-model-params.json` containing all HERA and UND baseline parameters, damping coefficients, and design variable weights.

**NASA Sources:**
- HERA: 4-person crew, 45-day missions, restricted communications
- UND LDT Study: Design variable weights (αP=10, αW=6, etc.)

**Implementation:**

Create `src/data/psych-model-params.json`:

```json
{
  "version": "1.0.0",
  "description": "HERA + UND Lunar Daytime Behavioral Study - Psychological Model Parameters",
  "sources": [
    "HERA Facility Documentation (2019) - NASA Human Research Program",
    "UND Lunar Daytime Behavioral Study (2020)",
    "NASA/TP-2020-220505 - Deep Space Habitability Design Guidelines"
  ],

  "hera_context": {
    "crew_size": 4,
    "mission_days": 45,
    "isolation_protocol": "restricted_personal_comms_weekly_family_conf",
    "lighting_type": "adjustable_led_with_circadian_support",
    "capabilities": {
      "virtual_windows": true,
      "exercise_equipment": true,
      "hygiene_facilities": true,
      "medical_support": "telemedicine_only"
    }
  },

  "baseline_trends": {
    "description": "Linear drift over mission duration (τ = t/45 ∈ [0,1])",
    "stress": {
      "s0": 40,
      "s1": 25,
      "notes": "Stress drifts from 40 → 65 over 45 days (HERA isolation effect)"
    },
    "mood": {
      "m0": 70,
      "m1": 20,
      "notes": "Mood drifts from 70 → 50 over 45 days"
    },
    "sleep_quality": {
      "q0": 70,
      "q1": 10,
      "notes": "Sleep quality drifts from 70 → 60"
    },
    "cohesion": {
      "c0": 70,
      "c1": 15,
      "notes": "Team cohesion drifts from 70 → 55"
    }
  },

  "damping_factors": {
    "description": "Autoregressive damping (0-1) for day-to-day carryover",
    "lambda_stress": 0.7,
    "lambda_mood": 0.7,
    "lambda_sleep": 0.7,
    "lambda_cohesion": 0.7,
    "notes": "λ=0.7 means 70% carryover from previous day"
  },

  "design_variable_weights": {
    "description": "Coefficients from UND LDT Study correlating design to psychology",

    "stress_modifiers": {
      "alpha_privacy": 10,
      "alpha_window": 6,
      "alpha_visual_order": 4,
      "alpha_lighting": 4,
      "alpha_adjacency": 6,
      "notes": "ΔStress(t) = -αP·P - αW·W - αV·V - αL·L - αA·A (negative = reduces stress)"
    },

    "mood_modifiers": {
      "beta_privacy": 8,
      "beta_window": 6,
      "beta_visual_order": 4,
      "beta_recreation": 3,
      "beta_exercise": 5,
      "notes": "ΔMood(t) = +βP·P + βW·W + βV·V + βR·R + βE·E (positive = improves mood)"
    },

    "sleep_modifiers": {
      "gamma_privacy": 8,
      "gamma_adjacency": 6,
      "gamma_lighting": 6,
      "gamma_exercise": 3,
      "notes": "ΔSleep(t) = +γP·P + γA·A + γL·L + γE·E"
    },

    "cohesion_modifiers": {
      "delta_recreation": 5,
      "delta_visual_order": 3,
      "delta_adjacency": 3,
      "notes": "ΔCohesion(t) = +δR·R + δV·V + δA·A"
    }
  },

  "design_variable_mappings": {
    "description": "How layout features map to [0,1] design variables",

    "P_private_sleep_quarters": {
      "formula": "num_crew_quarters / crew_size",
      "range": [0, 1],
      "notes": "1.0 = every crew member has private sleep area"
    },

    "W_window_type": {
      "values": {
        "none": 0,
        "digital_virtual": 0.5,
        "physical": 1.0
      },
      "notes": "User-selectable in mission config"
    },

    "V_visual_order": {
      "formula": "1 - (num_overlaps / max_possible_overlaps)",
      "range": [0, 1],
      "notes": "1.0 = no module overlaps, clean layout"
    },

    "L_lighting_schedule_compliance": {
      "range": [0, 1],
      "notes": "User-selectable slider (0=no circadian lighting, 1=full compliance)"
    },

    "A_adjacency_compliance": {
      "formula": "1 - (num_violations / num_applicable_rules)",
      "range": [0, 1],
      "notes": "Already computed by ConstraintValidator"
    },

    "R_recreation_area": {
      "formula": "(ward_dining_area + exercise_area) / total_area",
      "range": [0, 1],
      "notes": "Fraction of habitat devoted to recreation/dining"
    },

    "E_exercise_compliance": {
      "range": [0, 1],
      "notes": "User-selectable slider (0=no exercise, 1=daily HERA schedule)"
    },

    "C_circulation_pattern": {
      "values": {
        "tree_dead_end": 0,
        "loop": 1
      },
      "notes": "1.0 = loop allows continuous circulation without dead-ends"
    }
  },

  "validation_ranges": {
    "stress": { "min": 0, "max": 100, "optimal": [20, 40] },
    "mood": { "min": 0, "max": 100, "optimal": [60, 80] },
    "sleep_quality": { "min": 0, "max": 100, "optimal": [60, 80] },
    "cohesion": { "min": 0, "max": 100, "optimal": [60, 80] }
  }
}
```

**Validation:**
- All coefficients match UND study exactly
- Baseline trends match HERA isolation data
- Design variables have clear mappings to layout features

---

## PROMPT 20: Core Psychological Model Engine

**Objective**: Create `src/simulation/PsychModel.js` implementing the HERA+UND mathematical model with daily time-step equations.

**Mathematical Model:**

```javascript
// Daily update with damping (bounded 0..100)
Stress(t) = clip(λS · Stress(t-1) + (1-λS)·[Stress_base(t) + ΔStress(t)], 0, 100)
Mood(t) = clip(λM · Mood(t-1) + (1-λM)·[Mood_base(t) + ΔMood(t)], 0, 100)
Sleep(t) = clip(λQ · Sleep(t-1) + (1-λQ)·[Sleep_base(t) + ΔSleep(t)], 0, 100)
Cohesion(t) = clip(λC · Cohesion(t-1) + (1-λC)·[Cohesion_base(t) + ΔCohesion(t)], 0, 100)

// Baseline trends (HERA isolation effects)
Stress_base(t) = s0 + s1 · τ  // τ = t/45 ∈ [0,1]
Mood_base(t) = m0 - m1 · τ
Sleep_base(t) = q0 - q1 · τ
Cohesion_base(t) = c0 - c1 · τ

// Design modifiers
ΔStress(t) = -αP·P - αW·W - αV·V - αL·L - αA·A
ΔMood(t) = +βP·P + βW·W + βV·V + βR·R + βE·E
ΔSleep(t) = +γP·P + γA·A + γL·L + γE·E
ΔCohesion(t) = +δR·R + δV·V + δA·A
```

**Implementation:**

Create `src/simulation/PsychModel.js`:

```javascript
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
   * Simulate psychological metrics over mission duration
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
```

**Validation:**
- Test with UND study control conditions (all variables = 0)
- Verify baseline trends match HERA data
- Check damping creates smooth day-to-day transitions
- Ensure all metrics stay within [0, 100] bounds

---

## PROMPT 21: Mission Parameters Manager

**Objective**: Create `src/simulation/MissionParams.js` to manage mission configuration (crew size, duration, habitat type) and compute design variables from layout.

**Implementation:**

Create `src/simulation/MissionParams.js`:

```javascript
/**
 * MissionParams.js
 *
 * Mission configuration and design variable computation
 *
 * Translates habitat layout into design variables for psychological model:
 * - P: Private Sleep Quarters ratio
 * - V: Visual Order (no overlaps)
 * - A: Adjacency Compliance
 * - R: Recreation Area ratio
 */

export class MissionParams {
  constructor() {
    // Default HERA mission parameters
    this.crewSize = 4;
    this.missionDays = 45;
    this.habitatType = 'rigid_cylinder';

    // User-configurable parameters
    this.windowType = 0.5; // 0=none, 0.5=digital, 1.0=physical
    this.lightingCompliance = 0.8; // 0-1
    this.exerciseCompliance = 0.7; // 0-1
    this.circulationPattern = 1; // 0=tree, 1=loop
  }

  /**
   * Compute design variables from current layout
   * @param {Array} modules - Array of habitat modules
   * @param {Object} constraintValidator - Reference to ConstraintValidator
   * @returns {Object} - Design variables for PsychModel
   */
  computeDesignVariables(modules, constraintValidator) {
    try {
      // P: Private Sleep Quarters
      const crewQuarters = modules.filter(m => m.name === 'Crew Quarters').length;
      const privateSleepQuarters = crewQuarters / this.crewSize;

      // V: Visual Order (1.0 = no overlaps)
      const visualOrder = this.computeVisualOrder(modules);

      // A: Adjacency Compliance (from validator)
      const adjacencyCompliance = constraintValidator ?
        constraintValidator.calculateAdjacencyCompliance() : 0;

      // R: Recreation Area ratio
      const recreationArea = this.computeRecreationRatio(modules);

      return {
        privateSleepQuarters: this.clip(privateSleepQuarters, 0, 1),
        windowType: this.windowType,
        visualOrder: this.clip(visualOrder, 0, 1),
        lightingCompliance: this.lightingCompliance,
        adjacencyCompliance: this.clip(adjacencyCompliance, 0, 1),
        recreationArea: this.clip(recreationArea, 0, 1),
        exerciseCompliance: this.exerciseCompliance,
        circulationPattern: this.circulationPattern
      };

    } catch (error) {
      console.error('Error computing design variables:', error);
      return this.getDefaultVariables();
    }
  }

  /**
   * Compute visual order metric (1.0 = clean layout, no overlaps)
   */
  computeVisualOrder(modules) {
    try {
      if (modules.length === 0) return 1.0;

      let overlaps = 0;
      const maxPossiblePairs = (modules.length * (modules.length - 1)) / 2;

      for (let i = 0; i < modules.length; i++) {
        for (let j = i + 1; j < modules.length; j++) {
          const a = this.getAABB(modules[i]);
          const b = this.getAABB(modules[j]);

          // Check for AABB overlap on ground (x,z plane)
          const overlap = !(
            a.maxX < b.minX || a.minX > b.maxX ||
            a.maxZ < b.minZ || a.minZ > b.maxZ
          );

          if (overlap) overlaps++;
        }
      }

      return maxPossiblePairs > 0 ? 1 - (overlaps / maxPossiblePairs) : 1.0;

    } catch (error) {
      console.error('Error computing visual order:', error);
      return 0.5;
    }
  }

  /**
   * Compute recreation area ratio
   */
  computeRecreationRatio(modules) {
    try {
      if (modules.length === 0) return 0;

      const recreationModules = modules.filter(m =>
        m.name === 'Ward/Dining' || m.name === 'Exercise'
      );

      const recreationArea = recreationModules.reduce((sum, m) =>
        sum + (m.width * m.depth), 0
      );

      const totalArea = modules.reduce((sum, m) =>
        sum + (m.width * m.depth), 0
      );

      return totalArea > 0 ? recreationArea / totalArea : 0;

    } catch (error) {
      console.error('Error computing recreation ratio:', error);
      return 0;
    }
  }

  /**
   * Get axis-aligned bounding box for module
   */
  getAABB(module) {
    try {
      // Get position
      const x = module.position?.x || 0;
      const z = module.position?.z || 0;

      // Get dimensions (accounting for rotation)
      const w = module.width || 1;
      const d = module.depth || 1;

      return {
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2
      };

    } catch (error) {
      console.error('Error getting AABB:', error);
      return { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
    }
  }

  /**
   * Get default design variables (neutral baseline)
   */
  getDefaultVariables() {
    return {
      privateSleepQuarters: 0,
      windowType: 0.5,
      visualOrder: 1.0,
      lightingCompliance: 0.8,
      adjacencyCompliance: 1.0,
      recreationArea: 0,
      exerciseCompliance: 0.7,
      circulationPattern: 1
    };
  }

  /**
   * Clip value to range
   */
  clip(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Update mission configuration
   */
  updateConfig(config) {
    if (config.crewSize !== undefined) this.crewSize = config.crewSize;
    if (config.missionDays !== undefined) this.missionDays = config.missionDays;
    if (config.habitatType !== undefined) this.habitatType = config.habitatType;
    if (config.windowType !== undefined) this.windowType = config.windowType;
    if (config.lightingCompliance !== undefined) this.lightingCompliance = config.lightingCompliance;
    if (config.exerciseCompliance !== undefined) this.exerciseCompliance = config.exerciseCompliance;
    if (config.circulationPattern !== undefined) this.circulationPattern = config.circulationPattern;
  }
}
```

---

## PROMPT 22: Mission Configuration UI Panel

**Objective**: Add mission configuration UI to `index.html` allowing users to configure mission parameters and view real-time psychological metrics.

**Implementation:**

Add to `index.html` after the existing catalog panel:

```html
<!-- Mission Configuration Panel (in left sidebar, after catalog) -->
<div class="card" style="margin-top: 16px;">
  <h3 style="margin-top: 0;">🚀 Mission Configuration</h3>

  <div class="row">
    <label style="font-size:13px">Crew Size:</label>
    <select id="crewSize" class="input-control">
      <option value="2">2 crew</option>
      <option value="4" selected>4 crew (HERA)</option>
      <option value="6">6 crew</option>
    </select>
  </div>

  <div class="row">
    <label style="font-size:13px">Mission Duration:</label>
    <select id="missionDays" class="input-control">
      <option value="30">30 days</option>
      <option value="45" selected>45 days (HERA)</option>
      <option value="60">60 days</option>
    </select>
  </div>

  <div class="row">
    <label style="font-size:13px">Window Type:</label>
    <select id="windowType" class="input-control">
      <option value="0">None</option>
      <option value="0.5" selected>Digital (virtual)</option>
      <option value="1">Physical</option>
    </select>
  </div>

  <div class="row">
    <label style="font-size:13px">Circulation Pattern:</label>
    <select id="circulationPattern" class="input-control">
      <option value="0">Tree / Dead-end</option>
      <option value="1" selected>Loop</option>
    </select>
  </div>

  <div class="row" style="flex-direction: column; gap: 4px;">
    <label style="font-size:13px">Lighting Schedule Compliance:</label>
    <input id="lightingCompliance" type="range" min="0" max="1" step="0.05" value="0.8" />
    <span style="font-size:11px; color:#6b7280;" id="lightingComplianceVal">80%</span>
  </div>

  <div class="row" style="flex-direction: column; gap: 4px;">
    <label style="font-size:13px">Exercise Compliance:</label>
    <input id="exerciseCompliance" type="range" min="0" max="1" step="0.05" value="0.7" />
    <span style="font-size:11px; color:#6b7280;" id="exerciseComplianceVal">70%</span>
  </div>

  <div class="separator" style="margin: 12px 0; height: 1px; background: #e5e7eb;"></div>

  <div class="row">
    <label style="font-size:13px">Current Mission Day:</label>
    <input id="currentDay" type="range" min="1" max="45" value="15" />
    <span style="font-size:11px; color:#6b7280;" id="currentDayVal">Day 15</span>
  </div>

  <button class="btn" id="runSimulationBtn" style="margin-top: 8px;">
    Run 45-Day Simulation
  </button>
</div>

<!-- Psychological Metrics Panel (in left sidebar) -->
<div class="card" style="margin-top: 16px;">
  <h3 style="margin-top: 0;">🧠 Psychological Metrics</h3>

  <div class="row">
    <span style="font-size:13px;">Psych Health Index:</span>
    <strong id="phi" style="font-size:18px; color:#059669;">—</strong>
  </div>

  <div class="separator" style="margin: 8px 0; height: 1px; background: #e5e7eb;"></div>

  <div class="row metric-row">
    <span style="font-size:12px;">Stress:</span>
    <strong id="stressVal" style="font-size:13px;">—</strong>
  </div>

  <div class="row metric-row">
    <span style="font-size:12px;">Mood:</span>
    <strong id="moodVal" style="font-size:13px;">—</strong>
  </div>

  <div class="row metric-row">
    <span style="font-size:12px;">Sleep Quality:</span>
    <strong id="sleepQualityVal" style="font-size:13px;">—</strong>
  </div>

  <div class="row metric-row">
    <span style="font-size:12px;">Team Cohesion:</span>
    <strong id="cohesionVal" style="font-size:13px;">—</strong>
  </div>

  <div class="separator" style="margin: 8px 0; height: 1px; background: #e5e7eb;"></div>

  <button class="btn secondary" id="exportCsvBtn" style="width: 100%;">
    Export Metrics CSV
  </button>
</div>
```

Add CSS for metric styling:

```css
.card {
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0;
  gap: 8px;
}

.input-control {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
}

.metric-row strong {
  min-width: 40px;
  text-align: right;
}

.separator {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}
```

**Event Handlers:**

Add to main.js:

```javascript
// Mission config event handlers
document.getElementById('lightingCompliance').addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  document.getElementById('lightingComplianceVal').textContent = Math.round(val * 100) + '%';
  missionParams.updateConfig({ lightingCompliance: val });
  updatePsychMetrics();
});

document.getElementById('exerciseCompliance').addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  document.getElementById('exerciseComplianceVal').textContent = Math.round(val * 100) + '%';
  missionParams.updateConfig({ exerciseCompliance: val });
  updatePsychMetrics();
});

document.getElementById('currentDay').addEventListener('input', (e) => {
  const day = parseInt(e.target.value);
  document.getElementById('currentDayVal').textContent = `Day ${day}`;
  updatePsychMetrics();
});

document.getElementById('runSimulationBtn').addEventListener('click', () => {
  runFullMissionSimulation();
});

document.getElementById('exportCsvBtn').addEventListener('click', () => {
  exportMetricsCSV();
});
```

---

## PROMPT 23: Time-Step Simulation Engine

**Objective**: Implement daily simulation engine that updates psychological metrics in real-time as layout changes.

**Implementation:**

Add to `src/main.js`:

```javascript
import { PsychModel } from './simulation/PsychModel.js';
import { MissionParams } from './simulation/MissionParams.js';
import psychModelParams from './data/psych-model-params.json';

// Initialize psychological simulation
const psychModel = new PsychModel(psychModelParams);
const missionParams = new MissionParams();

// Current simulation state
let currentDayMetrics = null;
let fullMissionResults = null;

/**
 * Update psychological metrics for current layout and mission day
 */
function updatePsychMetrics() {
  try {
    const currentDay = parseInt(document.getElementById('currentDay').value);

    // Compute design variables from current layout
    const designVars = missionParams.computeDesignVariables(
      sceneManager.modules,
      constraintValidator
    );

    // Simulate up to current day (with damping)
    let previousMetrics = null;
    for (let day = 1; day <= currentDay; day++) {
      currentDayMetrics = psychModel.simulateDay(designVars, day, previousMetrics);
      previousMetrics = currentDayMetrics;
    }

    // Calculate PHI
    const phi = psychModel.calculatePHI(currentDayMetrics);

    // Update UI
    updateMetricsDisplay(currentDayMetrics, phi);

    // Update module colors based on stress heatmap (optional Phase 2 enhancement)
    // updateModuleHeatmap(currentDayMetrics.stress);

  } catch (error) {
    console.error('Error updating psychological metrics:', error);
  }
}

/**
 * Update metrics display in UI
 */
function updateMetricsDisplay(metrics, phi) {
  try {
    // PHI
    document.getElementById('phi').textContent = phi.toFixed(1);
    document.getElementById('phi').style.color = getPHIColor(phi);

    // Individual metrics
    document.getElementById('stressVal').textContent = metrics.stress.toFixed(1);
    document.getElementById('stressVal').style.color = getStressColor(metrics.stress);

    document.getElementById('moodVal').textContent = metrics.mood.toFixed(1);
    document.getElementById('moodVal').style.color = getMoodColor(metrics.mood);

    document.getElementById('sleepQualityVal').textContent = metrics.sleepQuality.toFixed(1);
    document.getElementById('sleepQualityVal').style.color = getSleepColor(metrics.sleepQuality);

    document.getElementById('cohesionVal').textContent = metrics.cohesion.toFixed(1);
    document.getElementById('cohesionVal').style.color = getCohesionColor(metrics.cohesion);

  } catch (error) {
    console.error('Error updating metrics display:', error);
  }
}

/**
 * Run full 45-day mission simulation
 */
function runFullMissionSimulation() {
  try {
    showToast('Running 45-day simulation...');

    // Compute design variables
    const designVars = missionParams.computeDesignVariables(
      sceneManager.modules,
      constraintValidator
    );

    // Run full simulation
    fullMissionResults = psychModel.simulateMission(designVars);

    // Update UI to show day 45 results
    document.getElementById('currentDay').value = 45;
    document.getElementById('currentDayVal').textContent = 'Day 45';

    currentDayMetrics = fullMissionResults[44]; // Day 45 (0-indexed)
    const phi = fullMissionResults[44].psychHealthIndex;

    updateMetricsDisplay(currentDayMetrics, phi);

    showToast(`Simulation complete! Final PHI: ${phi.toFixed(1)}`);

  } catch (error) {
    console.error('Error running mission simulation:', error);
    showToast('Simulation failed. Check console for errors.');
  }
}

/**
 * Color coding functions
 */
function getPHIColor(phi) {
  if (phi >= 65) return '#059669'; // Green (optimal)
  if (phi >= 50) return '#d97706'; // Amber (warning)
  return '#dc2626'; // Red (critical)
}

function getStressColor(stress) {
  if (stress <= 40) return '#059669'; // Low stress = good
  if (stress <= 60) return '#d97706'; // Medium stress = warning
  return '#dc2626'; // High stress = critical
}

function getMoodColor(mood) {
  if (mood >= 60) return '#059669'; // High mood = good
  if (mood >= 40) return '#d97706'; // Medium mood = warning
  return '#dc2626'; // Low mood = critical
}

function getSleepColor(sleep) {
  if (sleep >= 60) return '#059669';
  if (sleep >= 40) return '#d97706';
  return '#dc2626';
}

function getCohesionColor(cohesion) {
  if (cohesion >= 60) return '#059669';
  if (cohesion >= 40) return '#d97706';
  return '#dc2626';
}

// Trigger psych metrics update whenever layout changes
function onLayoutChange() {
  // Update NASA constraints (from Phase 1)
  constraintValidator.validateAll();
  updateHUD();

  // Update psychological metrics (Phase 2)
  updatePsychMetrics();
}
```

**Integration Points:**

1. Call `updatePsychMetrics()` after any module add/move/delete/rotate
2. Call `onLayoutChange()` from drag controls and module controls
3. Initialize with default metrics on app startup

---

## PROMPT 24: Well-Being Heatmap Visualization

**Objective**: Add color-coded stress visualization overlaying modules to show psychological hotspots.

**Implementation:**

Add to `src/visualization/WellbeingMap.js`:

```javascript
/**
 * WellbeingMap.js
 *
 * Color-coded visualization of psychological stress levels
 *
 * Overlays module materials with gradient based on stress contribution:
 * - Green (low stress zones): Crew Quarters, Ward/Dining
 * - Amber (medium stress): Adjacent violations
 * - Red (high stress): Overlapping modules, poor layout
 */

import * as THREE from 'three';

export class WellbeingMap {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.enabled = false;
  }

  /**
   * Update module colors based on stress metrics
   * @param {Number} globalStress - Overall stress level (0-100)
   * @param {Object} designVariables - Current design variables
   */
  updateHeatmap(globalStress, designVariables) {
    try {
      if (!this.enabled) return;

      const modules = this.sceneManager.modules;

      for (const module of modules) {
        // Calculate module-specific stress contribution
        const stressContribution = this.calculateModuleStress(
          module,
          designVariables,
          modules
        );

        // Map stress to color (green → yellow → red)
        const color = this.stressToColor(stressContribution);

        // Update module material with overlay
        if (module.mesh && module.mesh.material) {
          module.mesh.material.emissive = new THREE.Color(color);
          module.mesh.material.emissiveIntensity = 0.3;
        }
      }

    } catch (error) {
      console.error('Error updating wellbeing heatmap:', error);
    }
  }

  /**
   * Calculate stress contribution for individual module
   */
  calculateModuleStress(module, designVariables, allModules) {
    let stress = 40; // Baseline

    // Private sleep quarters reduce stress
    if (module.name === 'Crew Quarters') {
      stress -= 15 * designVariables.privateSleepQuarters;
    }

    // Adjacency violations increase stress
    if (this.hasAdjacentViolation(module, allModules)) {
      stress += 20;
    }

    // Overlaps increase stress significantly
    if (this.hasOverlap(module, allModules)) {
      stress += 30;
    }

    // Visual disorder increases stress
    stress += 10 * (1 - designVariables.visualOrder);

    return Math.max(0, Math.min(100, stress));
  }

  /**
   * Check if module has adjacency violation
   */
  hasAdjacentViolation(module, allModules) {
    // Simplified - full implementation in ConstraintValidator
    const violations = [
      ['Hygiene', 'Crew Quarters'],
      ['WCS', 'Galley'],
      ['Exercise', 'Crew Quarters']
    ];

    for (const [a, b] of violations) {
      if (module.name === a || module.name === b) {
        // Check if violating neighbor exists nearby
        const neighbors = this.getAdjacentModules(module, allModules, 1.5);
        if (neighbors.some(n =>
          (n.name === a && module.name === b) ||
          (n.name === b && module.name === a)
        )) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if module overlaps with others
   */
  hasOverlap(module, allModules) {
    for (const other of allModules) {
      if (other === module) continue;

      const aabb1 = this.getAABB(module);
      const aabb2 = this.getAABB(other);

      const overlap = !(
        aabb1.maxX < aabb2.minX || aabb1.minX > aabb2.maxX ||
        aabb1.maxZ < aabb2.minZ || aabb1.minZ > aabb2.maxZ
      );

      if (overlap) return true;
    }

    return false;
  }

  /**
   * Get adjacent modules within distance
   */
  getAdjacentModules(module, allModules, maxDistance) {
    const neighbors = [];
    const pos1 = module.mesh.position;

    for (const other of allModules) {
      if (other === module) continue;

      const pos2 = other.mesh.position;
      const distance = Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.z - pos2.z, 2)
      );

      if (distance <= maxDistance) {
        neighbors.push(other);
      }
    }

    return neighbors;
  }

  /**
   * Get axis-aligned bounding box
   */
  getAABB(module) {
    const x = module.mesh.position.x;
    const z = module.mesh.position.z;
    const w = module.width;
    const d = module.depth;

    return {
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2
    };
  }

  /**
   * Map stress value to color
   * @param {Number} stress - 0-100
   * @returns {Number} - THREE.js color hex
   */
  stressToColor(stress) {
    // Green (low stress) → Yellow (medium) → Red (high stress)
    if (stress <= 40) {
      // Green to Yellow (0x10b981 → 0xfbbf24)
      const t = stress / 40;
      return this.lerpColor(0x10b981, 0xfbbf24, t);
    } else {
      // Yellow to Red (0xfbbf24 → 0xef4444)
      const t = (stress - 40) / 60;
      return this.lerpColor(0xfbbf24, 0xef4444, t);
    }
  }

  /**
   * Lerp between two hex colors
   */
  lerpColor(color1, color2, t) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return c1.lerp(c2, t).getHex();
  }

  /**
   * Toggle heatmap on/off
   */
  toggle() {
    this.enabled = !this.enabled;

    if (!this.enabled) {
      // Reset all module colors to original
      for (const module of this.sceneManager.modules) {
        if (module.mesh && module.mesh.material) {
          module.mesh.material.emissive = new THREE.Color(0x000000);
          module.mesh.material.emissiveIntensity = 0;
          module.mesh.material.color = new THREE.Color(module.color);
        }
      }
    }
  }
}
```

Add toggle button to UI:

```html
<button class="btn secondary" id="heatmapToggle" style="margin-top: 8px;">
  Toggle Stress Heatmap
</button>
```

**Event handler:**

```javascript
const wellbeingMap = new WellbeingMap(sceneManager);

document.getElementById('heatmapToggle').addEventListener('click', () => {
  wellbeingMap.toggle();
  if (wellbeingMap.enabled) {
    const designVars = missionParams.computeDesignVariables(
      sceneManager.modules,
      constraintValidator
    );
    wellbeingMap.updateHeatmap(currentDayMetrics?.stress || 50, designVars);
  }
  showToast(wellbeingMap.enabled ? 'Heatmap enabled' : 'Heatmap disabled');
});
```

---

## PROMPT 25: CSV Export with Psychological Metrics

**Objective**: Implement comprehensive CSV export including layout data, design variables, and full mission simulation results.

**Implementation:**

Create `src/export/CSVGenerator.js`:

```javascript
/**
 * CSVGenerator.js
 *
 * Export habitat layout and psychological metrics to CSV format
 *
 * Outputs:
 * 1. Module layout data
 * 2. Design variables
 * 3. Daily psychological metrics (45-day simulation)
 * 4. NASA compliance summary
 */

export class CSVGenerator {
  /**
   * Generate comprehensive CSV export
   * @param {Array} modules - Habitat modules
   * @param {Object} designVariables - Computed design variables
   * @param {Array} missionResults - Full 45-day simulation results
   * @param {Object} constraints - NASA constraint validation results
   * @returns {String} - CSV formatted data
   */
  static generateCSV(modules, designVariables, missionResults, constraints) {
    try {
      let csv = '';

      // Header
      csv += '# Habitat Harmony LS² - Psychological Metrics Export\\n';
      csv += `# Generated: ${new Date().toISOString()}\\n`;
      csv += '#\\n';

      // Section 1: Module Layout
      csv += '# SECTION 1: MODULE LAYOUT\\n';
      csv += 'Module Name,Width (m),Depth (m),Height (m),Position X (m),Position Z (m),Rotation (deg),Zone,Area (m²)\\n';

      for (const module of modules) {
        const area = (module.width * module.depth).toFixed(2);
        const rotation = (module.mesh.rotation.y * 180 / Math.PI).toFixed(1);

        csv += `${module.name},${module.width},${module.depth},${module.height},`;
        csv += `${module.mesh.position.x.toFixed(2)},${module.mesh.position.z.toFixed(2)},`;
        csv += `${rotation},${module.zone},${area}\\n`;
      }

      csv += '\\n';

      // Section 2: Design Variables
      csv += '# SECTION 2: DESIGN VARIABLES (UND LDT Study)\\n';
      csv += 'Variable,Value,Range,Description\\n';
      csv += `Private Sleep Quarters (P),${designVariables.privateSleepQuarters.toFixed(3)},[0-1],Crew quarters per crew member\\n`;
      csv += `Window Type (W),${designVariables.windowType.toFixed(3)},[0-1],0=none 0.5=digital 1=physical\\n`;
      csv += `Visual Order (V),${designVariables.visualOrder.toFixed(3)},[0-1],1=no overlaps clean layout\\n`;
      csv += `Lighting Compliance (L),${designVariables.lightingCompliance.toFixed(3)},[0-1],Circadian lighting schedule\\n`;
      csv += `Adjacency Compliance (A),${designVariables.adjacencyCompliance.toFixed(3)},[0-1],NASA adjacency rules met\\n`;
      csv += `Recreation Area (R),${designVariables.recreationArea.toFixed(3)},[0-1],Fraction for dining/exercise\\n`;
      csv += `Exercise Compliance (E),${designVariables.exerciseCompliance.toFixed(3)},[0-1],Daily exercise adherence\\n`;
      csv += `Circulation Pattern (C),${designVariables.circulationPattern.toFixed(3)},[0-1],0=tree 1=loop\\n`;

      csv += '\\n';

      // Section 3: NASA Constraints Summary
      csv += '# SECTION 3: NASA COMPLIANCE SUMMARY\\n';
      csv += 'Constraint,Status,Details\\n';
      csv += `Total Footprint,${constraints.totalArea.toFixed(2)} m²,Within 12m × 8m habitat shell\\n`;
      csv += `Adjacency Compliance,${(constraints.adjacencyCompliance * 100).toFixed(1)}%,NASA TP-2020-220505 rules\\n`;
      csv += `Path Width ≥ 1.0m,${constraints.pathWidthOk ? 'PASS' : 'FAIL'},AIAA 2022 requirement\\n`;
      csv += `Module Count,${modules.length},Total modules placed\\n`;

      csv += '\\n';

      // Section 4: Daily Psychological Metrics
      csv += '# SECTION 4: DAILY PSYCHOLOGICAL METRICS (45-Day HERA Mission)\\n';
      csv += 'Day,Stress,Mood,Sleep Quality,Cohesion,Psych Health Index\\n';

      for (const result of missionResults) {
        csv += `${result.day},`;
        csv += `${result.stress.toFixed(2)},`;
        csv += `${result.mood.toFixed(2)},`;
        csv += `${result.sleepQuality.toFixed(2)},`;
        csv += `${result.cohesion.toFixed(2)},`;
        csv += `${result.psychHealthIndex.toFixed(2)}\\n`;
      }

      csv += '\\n';

      // Section 5: Statistical Summary
      csv += '# SECTION 5: STATISTICAL SUMMARY\\n';
      csv += 'Metric,Mean,Min,Max,StdDev,Final (Day 45)\\n';

      const stats = this.calculateStatistics(missionResults);
      csv += `Stress,${stats.stress.mean.toFixed(2)},${stats.stress.min.toFixed(2)},${stats.stress.max.toFixed(2)},${stats.stress.stdDev.toFixed(2)},${stats.stress.final.toFixed(2)}\\n`;
      csv += `Mood,${stats.mood.mean.toFixed(2)},${stats.mood.min.toFixed(2)},${stats.mood.max.toFixed(2)},${stats.mood.stdDev.toFixed(2)},${stats.mood.final.toFixed(2)}\\n`;
      csv += `Sleep Quality,${stats.sleep.mean.toFixed(2)},${stats.sleep.min.toFixed(2)},${stats.sleep.max.toFixed(2)},${stats.sleep.stdDev.toFixed(2)},${stats.sleep.final.toFixed(2)}\\n`;
      csv += `Cohesion,${stats.cohesion.mean.toFixed(2)},${stats.cohesion.min.toFixed(2)},${stats.cohesion.max.toFixed(2)},${stats.cohesion.stdDev.toFixed(2)},${stats.cohesion.final.toFixed(2)}\\n`;
      csv += `PHI,${stats.phi.mean.toFixed(2)},${stats.phi.min.toFixed(2)},${stats.phi.max.toFixed(2)},${stats.phi.stdDev.toFixed(2)},${stats.phi.final.toFixed(2)}\\n`;

      csv += '\\n';
      csv += '# End of Export\\n';

      return csv;

    } catch (error) {
      console.error('Error generating CSV:', error);
      return '';
    }
  }

  /**
   * Calculate statistics for mission results
   */
  static calculateStatistics(results) {
    const metrics = ['stress', 'mood', 'sleepQuality', 'cohesion', 'psychHealthIndex'];
    const stats = {};

    for (const metric of metrics) {
      const values = results.map(r =>
        metric === 'psychHealthIndex' ? r.psychHealthIndex : r[metric]
      );

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const final = values[values.length - 1];

      const key = metric === 'psychHealthIndex' ? 'phi' :
                  metric === 'sleepQuality' ? 'sleep' : metric;

      stats[key] = { mean, min, max, stdDev, final };
    }

    return stats;
  }

  /**
   * Download CSV file
   */
  static downloadCSV(csv, filename = 'habitat-harmony-metrics.csv') {
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  }
}
```

**Integration:**

Add to main.js:

```javascript
import { CSVGenerator } from './export/CSVGenerator.js';

function exportMetricsCSV() {
  try {
    // Ensure full simulation has been run
    if (!fullMissionResults || fullMissionResults.length === 0) {
      showToast('Please run 45-day simulation first!');
      return;
    }

    // Gather all data
    const designVars = missionParams.computeDesignVariables(
      sceneManager.modules,
      constraintValidator
    );

    const constraints = {
      totalArea: sceneManager.modules.reduce((sum, m) => sum + (m.width * m.depth), 0),
      adjacencyCompliance: constraintValidator.calculateAdjacencyCompliance(),
      pathWidthOk: constraintValidator.checkPathWidth()
    };

    // Generate CSV
    const csv = CSVGenerator.generateCSV(
      sceneManager.modules,
      designVars,
      fullMissionResults,
      constraints
    );

    // Download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `habitat-harmony-${timestamp}.csv`;
    CSVGenerator.downloadCSV(csv, filename);

    showToast(`Exported metrics to ${filename}`);

  } catch (error) {
    console.error('Error exporting CSV:', error);
    showToast('CSV export failed. Check console for errors.');
  }
}
```

---

## PROMPT 26: Layout Comparison Mode

**Objective**: Allow users to save multiple layouts and compare their psychological performance side-by-side.

**Implementation:**

Add comparison UI to `index.html`:

```html
<!-- Comparison Panel (new right sidebar) -->
<aside id="comparisonPanel" style="display: none;">
  <h3>📊 Layout Comparison</h3>

  <div class="card">
    <div class="row">
      <button class="btn" id="saveLayoutBtn">Save Current Layout</button>
    </div>

    <div id="savedLayouts" style="margin-top: 12px;">
      <!-- Saved layout cards will appear here -->
    </div>
  </div>

  <div class="card" style="margin-top: 12px;">
    <h4>Comparison Results</h4>
    <div id="comparisonResults">
      <p style="font-size: 12px; color: #6b7280;">
        Save 2+ layouts to compare
      </p>
    </div>
  </div>
</aside>

<button class="btn secondary" id="toggleComparisonBtn">
  Show Comparison
</button>
```

Create `src/ui/ComparisonManager.js`:

```javascript
/**
 * ComparisonManager.js
 *
 * Save and compare multiple habitat layouts
 */

export class ComparisonManager {
  constructor() {
    this.savedLayouts = [];
  }

  /**
   * Save current layout with metrics
   */
  saveLayout(modules, metrics, designVariables, name = null) {
    try {
      const layoutName = name || `Layout ${this.savedLayouts.length + 1}`;

      const layout = {
        id: Date.now(),
        name: layoutName,
        timestamp: new Date().toISOString(),
        modules: JSON.parse(JSON.stringify(modules)),
        metrics: { ...metrics },
        designVariables: { ...designVariables },
        phi: metrics.psychHealthIndex || 0
      };

      this.savedLayouts.push(layout);
      return layout;

    } catch (error) {
      console.error('Error saving layout:', error);
      return null;
    }
  }

  /**
   * Load saved layout
   */
  loadLayout(layoutId) {
    return this.savedLayouts.find(l => l.id === layoutId);
  }

  /**
   * Delete saved layout
   */
  deleteLayout(layoutId) {
    this.savedLayouts = this.savedLayouts.filter(l => l.id !== layoutId);
  }

  /**
   * Generate comparison table
   */
  generateComparison() {
    if (this.savedLayouts.length < 2) {
      return '<p>Save at least 2 layouts to compare</p>';
    }

    let html = '<table style="width:100%; font-size:12px; border-collapse:collapse;">';
    html += '<thead><tr>';
    html += '<th style="text-align:left; padding:4px; border-bottom:1px solid #e5e7eb;">Metric</th>';

    for (const layout of this.savedLayouts) {
      html += `<th style="text-align:right; padding:4px; border-bottom:1px solid #e5e7eb;">${layout.name}</th>`;
    }

    html += '</tr></thead><tbody>';

    // PHI
    html += '<tr><td style="padding:4px;"><strong>PHI</strong></td>';
    for (const layout of this.savedLayouts) {
      const phi = layout.phi.toFixed(1);
      html += `<td style="text-align:right; padding:4px;"><strong>${phi}</strong></td>`;
    }
    html += '</tr>';

    // Stress
    html += '<tr><td style="padding:4px;">Stress</td>';
    for (const layout of this.savedLayouts) {
      const stress = layout.metrics.stress.toFixed(1);
      html += `<td style="text-align:right; padding:4px;">${stress}</td>`;
    }
    html += '</tr>';

    // Mood
    html += '<tr><td style="padding:4px;">Mood</td>';
    for (const layout of this.savedLayouts) {
      const mood = layout.metrics.mood.toFixed(1);
      html += `<td style="text-align:right; padding:4px;">${mood}</td>`;
    }
    html += '</tr>';

    // Sleep
    html += '<tr><td style="padding:4px;">Sleep</td>';
    for (const layout of this.savedLayouts) {
      const sleep = layout.metrics.sleepQuality.toFixed(1);
      html += `<td style="text-align:right; padding:4px;">${sleep}</td>`;
    }
    html += '</tr>';

    // Cohesion
    html += '<tr><td style="padding:4px;">Cohesion</td>';
    for (const layout of this.savedLayouts) {
      const cohesion = layout.metrics.cohesion.toFixed(1);
      html += `<td style="text-align:right; padding:4px;">${cohesion}</td>`;
    }
    html += '</tr>';

    // Design variables
    html += '<tr><td style="padding:4px; padding-top:12px;"><strong>Design Variables</strong></td></tr>';

    html += '<tr><td style="padding:4px;">Privacy</td>';
    for (const layout of this.savedLayouts) {
      const val = (layout.designVariables.privateSleepQuarters * 100).toFixed(0);
      html += `<td style="text-align:right; padding:4px;">${val}%</td>`;
    }
    html += '</tr>';

    html += '<tr><td style="padding:4px;">Adjacency</td>';
    for (const layout of this.savedLayouts) {
      const val = (layout.designVariables.adjacencyCompliance * 100).toFixed(0);
      html += `<td style="text-align:right; padding:4px;">${val}%</td>`;
    }
    html += '</tr>';

    html += '</tbody></table>';

    // Winner
    const bestLayout = this.savedLayouts.reduce((best, current) =>
      current.phi > best.phi ? current : best
    );

    html += `<p style="margin-top:12px; font-size:11px; color:#059669;"><strong>Best Layout:</strong> ${bestLayout.name} (PHI: ${bestLayout.phi.toFixed(1)})</p>`;

    return html;
  }
}
```

**Event handlers:**

```javascript
const comparisonManager = new ComparisonManager();

document.getElementById('saveLayoutBtn').addEventListener('click', () => {
  const name = prompt('Layout name:', `Layout ${comparisonManager.savedLayouts.length + 1}`);
  if (!name) return;

  const designVars = missionParams.computeDesignVariables(
    sceneManager.modules,
    constraintValidator
  );

  const layout = comparisonManager.saveLayout(
    sceneManager.modules,
    currentDayMetrics,
    designVars,
    name
  );

  if (layout) {
    showToast(`Saved layout: ${name}`);
    updateComparisonUI();
  }
});

function updateComparisonUI() {
  const html = comparisonManager.generateComparison();
  document.getElementById('comparisonResults').innerHTML = html;
}
```

---

## PROMPT 27: Integration & Testing

**Objective**: Integrate all Phase 2 components with Phase 1 layout builder and perform comprehensive testing.

**Testing Checklist:**

1. **Psychological Model Validation:**
   - [ ] Baseline trends match HERA data (stress 40→65, mood 70→50)
   - [ ] Design variables properly computed from layout
   - [ ] Damping creates smooth transitions
   - [ ] All metrics bounded to [0, 100]

2. **UI Integration:**
   - [ ] Mission config sliders update metrics in real-time
   - [ ] Current day slider shows correct daily metrics
   - [ ] 45-day simulation button completes successfully
   - [ ] Metrics display with correct color coding

3. **CSV Export:**
   - [ ] All 5 sections present and formatted correctly
   - [ ] Daily metrics for all 45 days exported
   - [ ] Statistical summary accurate
   - [ ] File downloads successfully

4. **Heatmap Visualization:**
   - [ ] Toggle enables/disables correctly
   - [ ] Module colors reflect stress levels
   - [ ] Updates in real-time with layout changes

5. **Comparison Mode:**
   - [ ] Save layout captures all data
   - [ ] Comparison table shows side-by-side metrics
   - [ ] Best layout identified correctly

6. **Performance:**
   - [ ] 45-day simulation completes in < 500ms
   - [ ] Real-time metric updates don't lag interface
   - [ ] No memory leaks from repeated simulations

**Integration Steps:**

1. Import all Phase 2 modules in main.js
2. Initialize PsychModel and MissionParams on startup
3. Call `updatePsychMetrics()` from all layout change handlers
4. Add Phase 2 UI panels to index.html
5. Wire up all event handlers
6. Test with multiple layout configurations

---

## PROMPT 28: Documentation Updates

**Objective**: Update README.md, DEPLOYMENT.md, and create Phase 2 user guide.

**Update README.md:**

Add Phase 2 section:

```markdown
## 🧠 Phase 2: Psychological Simulation (NEW)

Habitat Harmony LS² now includes a **full psychological simulation engine** based on HERA facility data and the UND Lunar Daytime Behavioral Study.

### Psychological Metrics

**4 Core Metrics Tracked:**
1. **Stress** (0-100, lower is better)
2. **Mood** (0-100, higher is better)
3. **Sleep Quality** (0-100, higher is better)
4. **Team Cohesion** (0-100, higher is better)

**Psychological Health Index (PHI):** Composite score combining all 4 metrics.

### Mission Simulation

- **HERA-validated 45-day missions**
- **Daily time-step simulation** with autoregressive damping
- **8 design variables** from UND study:
  - Private Sleep Quarters ratio
  - Window Type (none/digital/physical)
  - Visual Order (layout cleanliness)
  - Lighting Schedule Compliance
  - Adjacency Compliance
  - Recreation Area ratio
  - Exercise Compliance
  - Circulation Pattern (tree/loop)

### Usage

1. **Configure Mission**: Set crew size, duration, window type, lighting/exercise compliance
2. **Build Layout**: Add/arrange modules as in Phase 1
3. **View Real-Time Metrics**: Psychological metrics update as you modify layout
4. **Run 45-Day Simulation**: Click "Run 45-Day Simulation" button
5. **Export CSV**: Download comprehensive metrics report
6. **Compare Layouts**: Save multiple designs and compare performance

### NASA Data Sources (Phase 2)

| Source | Application |
|--------|-------------|
| **HERA Facility 2019** | Mission parameters, baseline psychological trends |
| **UND LDT Study 2020** | Design variable weights and behavioral correlations |
| **NASA TP-2020-220505** | Volume/adjacency impact on crew psychology |

---

## 📊 CSV Export Format

Phase 2 exports include:

1. **Module Layout**: Dimensions, positions, rotations
2. **Design Variables**: All 8 UND variables with values
3. **NASA Compliance**: Constraint validation summary
4. **Daily Metrics**: All 45 days of psychological data
5. **Statistical Summary**: Mean, min, max, standard deviation

---

## 🎨 Stress Heatmap

Toggle stress visualization to see color-coded module overlays:
- **Green**: Low-stress zones (optimal)
- **Yellow**: Medium-stress zones (warning)
- **Red**: High-stress zones (critical)

Heatmap factors:
- Private sleep quarters
- Adjacency violations
- Module overlaps
- Visual disorder

---
```

**Create PHASE2_GUIDE.md:**

```markdown
# Phase 2 User Guide
# Psychological Simulation Layer

## Overview

Phase 2 adds a complete psychological simulation engine to Habitat Harmony LS², allowing you to evaluate **crew well-being over a 45-day HERA mission**.

## Getting Started

### 1. Mission Configuration

**Location**: Left sidebar → Mission Configuration panel

**Settings:**
- **Crew Size**: 2, 4 (HERA default), or 6
- **Mission Duration**: 30, 45 (HERA default), or 60 days
- **Window Type**: None, Digital (virtual), or Physical
- **Circulation Pattern**: Tree/Dead-end or Loop
- **Lighting Compliance**: 0-100% (circadian rhythm adherence)
- **Exercise Compliance**: 0-100% (daily exercise schedule)

### 2. Build Your Layout

Use Phase 1 tools to add and arrange modules:
- Click modules from catalog
- Drag to position
- Press R to rotate
- Press Delete to remove

### 3. View Real-Time Metrics

**Psychological Metrics Panel** updates automatically:
- **PHI** (Psychological Health Index): Composite score
- **Stress**: Lower is better (optimal: 20-40)
- **Mood**: Higher is better (optimal: 60-80)
- **Sleep Quality**: Higher is better (optimal: 60-80)
- **Cohesion**: Higher is better (optimal: 60-80)

**Color Coding:**
- 🟢 **Green**: Optimal
- 🟡 **Amber**: Warning
- 🔴 **Red**: Critical

### 4. Run 45-Day Simulation

**Steps:**
1. Finalize your layout
2. Click **"Run 45-Day Simulation"** button
3. Wait for simulation to complete (~500ms)
4. View Day 45 final metrics

**What Happens:**
- Simulates psychological metrics for each day (1-45)
- Applies HERA baseline trends (stress increases, mood decreases over time)
- Accounts for your layout's design variables
- Uses autoregressive damping (70% carryover day-to-day)

### 5. Export Metrics

**CSV Export includes:**
- Module layout data
- 8 design variables
- NASA compliance summary
- Daily metrics for all 45 days
- Statistical summary (mean, min, max, std dev)

**How to Export:**
1. Run 45-day simulation first
2. Click **"Export Metrics CSV"**
3. CSV file downloads automatically
4. Open in Excel/Google Sheets for analysis

### 6. Compare Layouts

**Comparison Mode:**
1. Click **"Show Comparison"** button
2. Build first layout and run simulation
3. Click **"Save Current Layout"** and name it
4. Clear layout and build second design
5. Run simulation and save again
6. View side-by-side comparison table

**Comparison shows:**
- PHI scores
- All 4 psychological metrics
- Key design variables
- Best layout highlighted

### 7. Stress Heatmap (Optional)

**Toggle stress visualization:**
1. Click **"Toggle Stress Heatmap"**
2. Modules change color based on stress contribution:
   - Green = low stress
   - Yellow = medium stress
   - Red = high stress

**Stress factors:**
- Adjacency violations (e.g., WCS near Galley)
- Module overlaps
- Lack of private sleep quarters
- Poor visual order

## Understanding the Model

### HERA Baseline Trends

Without any design interventions, HERA data shows:
- **Stress** drifts from 40 → 65 over 45 days
- **Mood** drifts from 70 → 50
- **Sleep Quality** drifts from 70 → 60
- **Cohesion** drifts from 70 → 55

**Your layout's design variables modify these trends!**

### Design Variables (UND Study)

Your layout automatically computes:

1. **Private Sleep Quarters (P)**
   - Formula: Crew Quarters count / Crew Size
   - Impact: Reduces stress, improves mood & sleep
   - Weight: High (α=10, β=8, γ=8)

2. **Window Type (W)**
   - User-configured: None (0), Digital (0.5), Physical (1.0)
   - Impact: Reduces stress, improves mood
   - Weight: Medium (α=6, β=6)

3. **Visual Order (V)**
   - Formula: 1 - (overlaps / possible pairs)
   - Impact: Reduces stress, improves cohesion
   - Weight: Medium (α=4, β=4, δ=3)

4. **Lighting Compliance (L)**
   - User-configured: 0-100%
   - Impact: Reduces stress, improves sleep
   - Weight: Medium (α=4, γ=6)

5. **Adjacency Compliance (A)**
   - From NASA constraints validator
   - Impact: Reduces stress, improves sleep & cohesion
   - Weight: Medium-High (α=6, γ=6, δ=3)

6. **Recreation Area (R)**
   - Formula: (Ward/Dining + Exercise area) / Total area
   - Impact: Improves mood & cohesion
   - Weight: Medium (β=3, δ=5)

7. **Exercise Compliance (E)**
   - User-configured: 0-100%
   - Impact: Improves mood & sleep
   - Weight: Medium (β=5, γ=3)

8. **Circulation Pattern (C)**
   - User-configured: Tree (0) or Loop (1)
   - Impact: Emergency response and interaction patterns
   - Note: Not directly in current model equations (future enhancement)

### Mathematical Model

**Daily Update Equations:**

```
Stress(t) = λ·Stress(t-1) + (1-λ)·[Baseline(t) + Δ(t)]

Baseline_Stress(t) = 40 + 25·(t/45)
Δ_Stress(t) = -(10P + 6W + 4V + 4L + 6A)

[Similar for Mood, Sleep, Cohesion]
```

**λ = 0.7** (damping factor, 70% carryover from previous day)

## Tips for Optimal Designs

### Maximize PHI

1. **Provide private sleep quarters** for each crew member
   - Add 4 Crew Quarters for 4-person crew
   - Place away from Exercise and WCS (noise)

2. **Respect NASA adjacency rules**
   - Keep WCS away from Galley
   - Separate Hygiene from Crew Quarters
   - Isolate Exercise from sleeping areas

3. **Create clean, organized layouts**
   - Avoid module overlaps
   - Maintain visual order
   - Use grid snapping

4. **Balance recreation and work**
   - Include Ward/Dining for social cohesion
   - Provide Exercise module
   - Allocate 20-30% of area to recreation

5. **Configure mission parameters**
   - Select Digital Windows (0.5) minimum
   - Set Lighting Compliance to 80%+
   - Enable Exercise Compliance 70%+
   - Use Loop circulation pattern

### Common Mistakes

❌ **Too few Crew Quarters**: Stress spikes without private sleep
❌ **Adjacency violations**: WCS near Galley tanks metrics
❌ **Overlapping modules**: Visual disorder increases stress
❌ **No recreation area**: Cohesion and mood suffer
❌ **Low lighting compliance**: Sleep quality degrades

## Troubleshooting

**Q: Metrics show "—" (empty)**
- A: Run 45-day simulation first, or adjust Current Day slider

**Q: PHI is very low (< 40)**
- A: Check for adjacency violations (yellow modules)
- Check private sleep quarters ratio
- Ensure no module overlaps

**Q: CSV export button grayed out**
- A: Must run full 45-day simulation before exporting

**Q: Heatmap shows everything red**
- A: Multiple violations detected (overlaps, adjacency, low privacy)
- Fix layout and toggle heatmap off/on to refresh

## NASA Source Citations

All Phase 2 features are traceable to:

1. **HERA Facility Documentation (2019)**
   - NASA Human Research Program
   - Mission parameters: 4 crew, 45 days, isolation protocols
   - Baseline psychological trends from analog data

2. **UND Lunar Daytime Behavioral Study (2020)**
   - University of North Dakota
   - Design variable weights (α, β, γ, δ coefficients)
   - Environmental manipulation methodology

3. **NASA/TP-2020-220505**
   - Deep Space Habitability Design Guidelines
   - Volume allocations and adjacency psychology

---

**For technical implementation details, see IMPLEMENTATION_PROMPTS_PHASE2.md**
```

---

## PROMPT 29: Final Phase 2 Build & Deployment

**Objective**: Complete production build with Phase 2 features and update deployment guide.

**Build Steps:**

1. **Test comprehensive Phase 2 integration:**

```bash
npm run dev
# Test all features:
# - Mission config updates
# - Real-time metric display
# - 45-day simulation
# - CSV export
# - Heatmap toggle
# - Comparison mode
```

2. **Production build:**

```bash
npm run build
```

3. **Verify bundle includes all Phase 2 code:**
   - psych-model-params.json in assets
   - PsychModel.js in bundle
   - MissionParams.js in bundle
   - CSVGenerator.js in bundle
   - WellbeingMap.js in bundle
   - ComparisonManager.js in bundle

4. **Test production build:**

```bash
npm run preview
# Navigate to http://localhost:4173
# Test all Phase 2 features in production mode
```

5. **Update DEPLOYMENT.md** with Phase 2 notes:

```markdown
## Phase 2 Deployment Notes

### Additional Assets

Phase 2 adds:
- `psych-model-params.json` (10 KB) - HERA/UND parameters
- Psychological simulation code (~25 KB additional bundle)

**Total Bundle Size (Phase 2):**
- ~175 KB gzipped (~625 KB uncompressed)
- Still acceptable for static hosting

### Environment Variables

No environment variables required. All NASA parameters are statically embedded.

### Browser Requirements

- **Minimum**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: ES2020+ support required
- **WebGL**: Required for 3D visualization
- **Local Storage**: Used for saved layouts (optional)

### Pre-Deployment Checklist (Phase 2)

- [ ] Run production build successfully
- [ ] Test 45-day simulation completes
- [ ] Verify CSV export downloads
- [ ] Test heatmap visualization
- [ ] Verify comparison mode works
- [ ] Check all mission config sliders functional
- [ ] Ensure metrics display with correct colors
- [ ] Test on multiple browsers
- [ ] Verify no console errors
```

6. **Create git commit with Phase 2 completion:**

```bash
git add .
git commit -m "Phase 2 complete: Full psychological simulation system

Implemented:
- HERA + UND psychological model (PsychModel.js)
- Mission configuration UI panel
- Daily time-step simulation (1-45 days)
- 4 psychological metrics (Stress, Mood, Sleep, Cohesion)
- Psychological Health Index (PHI) composite score
- CSV export with 5 comprehensive sections
- Stress heatmap visualization
- Layout comparison mode
- 8 design variables from UND study
- Complete documentation (PHASE2_GUIDE.md)

NASA data sources:
- HERA Facility Documentation (2019)
- UND Lunar Daytime Behavioral Study (2020)
- NASA TP-2020-220505 (psychological impact data)

Features:
✅ Real-time psychological metrics
✅ 45-day HERA mission simulation
✅ Autoregressive damping model
✅ Design variable computation
✅ Color-coded metric display
✅ Comprehensive CSV export
✅ Stress heatmap overlay
✅ Side-by-side layout comparison

18 of 18 Phase 2 prompts completed (100%)

🤖 Generated with Claude Code
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## PROMPT 30: Phase 2 Validation & Success Criteria

**Objective**: Final validation of Phase 2 implementation against NASA requirements and success metrics.

**Validation Checklist:**

### 1. NASA Data Fidelity
- [ ] All HERA parameters match official documentation
- [ ] UND design variable weights exactly as published
- [ ] Baseline trends align with HERA analog data
- [ ] Coefficient sources cited in code comments

### 2. Mathematical Correctness
- [ ] Daily update equations implemented correctly
- [ ] Damping factor (λ=0.7) applied properly
- [ ] Metrics bounded to [0, 100] range
- [ ] PHI calculation accurate (average of 4 metrics)

### 3. Performance Benchmarks
- [ ] 45-day simulation completes in < 500ms
- [ ] Real-time metric updates < 50ms
- [ ] No UI lag during interactions
- [ ] Memory stable after 100+ simulations

### 4. User Experience
- [ ] Mission config intuitive and clear
- [ ] Metrics display easy to understand
- [ ] Color coding follows conventions (green=good, red=bad)
- [ ] CSV export opens correctly in Excel/Sheets
- [ ] Comparison mode provides clear insights

### 5. Educational Value
- [ ] Users understand NASA constraints impact psychology
- [ ] Design variable relationships clear
- [ ] HERA mission context well explained
- [ ] UND study methodology accessible

### 6. Technical Quality
- [ ] All code follows ES6+ standards
- [ ] JSDoc comments comprehensive
- [ ] Error handling defensive
- [ ] No console warnings/errors
- [ ] Mobile responsive (bonus)

### Success Metrics

**Technical:**
- ✅ 100% NASA data traceability
- ✅ < 1% numerical error in model equations
- ✅ 60 FPS maintained during heatmap updates
- ✅ Full 45-day simulation in < 500ms

**Educational:**
- ✅ Users understand psychological impact of layout
- ✅ Design variables clearly mapped to features
- ✅ NASA source citations visible in UI

**Research:**
- ✅ CSV export format suitable for statistical analysis
- ✅ Model equations reproducible from documentation
- ✅ Comparison mode enables hypothesis testing

---

## Phase 2 Complete! 🎉

**What We Built:**

1. ✅ **Full HERA+UND Psychological Model**
   - 4 core metrics with NASA-validated equations
   - 45-day time-step simulation
   - 8 design variables from UND study

2. ✅ **Mission Configuration System**
   - Crew size, duration, habitat type
   - Window type, lighting, exercise compliance
   - Circulation pattern selection

3. ✅ **Real-Time Metrics Display**
   - Live PHI calculation
   - Color-coded status indicators
   - Updates on every layout change

4. ✅ **Comprehensive CSV Export**
   - 5 sections: layout, variables, compliance, daily metrics, statistics
   - Excel/Google Sheets compatible
   - Full mission data export

5. ✅ **Stress Heatmap Visualization**
   - Color-coded module overlays
   - Green→Yellow→Red gradient
   - Real-time stress hotspot detection

6. ✅ **Layout Comparison Mode**
   - Save multiple designs
   - Side-by-side metric comparison
   - Best layout identification

**Next Steps (Optional Phase 3):**

- VR walkthrough mode
- ECLSS/power overhead integration
- Community layout sharing
- Historical mission replay (Apollo, ISS)
- Multi-deck habitat support
- Advanced circulation path analysis

---

**Total Implementation:**
- **Phase 1**: 18 prompts (Core layout builder + NASA constraints)
- **Phase 2**: 12 prompts (Psychological simulation layer)
- **Combined**: 30 prompts for full Habitat Harmony LS² system

🌙 **"Design with empathy. Validate with NASA."**

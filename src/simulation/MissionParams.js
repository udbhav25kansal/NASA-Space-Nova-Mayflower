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

import * as THREE from 'three';

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
        constraintValidator.calculateAdjacencyCompliance(modules) : 0;

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
      // Get position from mesh
      const x = module.mesh?.position?.x || 0;
      const z = module.mesh?.position?.z || 0;

      // Get dimensions (accounting for rotation)
      const w = module.width || 1;
      const d = module.depth || 1;

      // For rotated modules, we need to compute the oriented bounding box
      // For simplicity, use the maximum extent
      const rotation = module.mesh?.rotation?.y || 0;
      const cos = Math.abs(Math.cos(rotation));
      const sin = Math.abs(Math.sin(rotation));

      const effectiveW = w * cos + d * sin;
      const effectiveD = w * sin + d * cos;

      return {
        minX: x - effectiveW / 2,
        maxX: x + effectiveW / 2,
        minZ: z - effectiveD / 2,
        maxZ: z + effectiveD / 2
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

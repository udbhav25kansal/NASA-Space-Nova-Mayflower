/**
 * RecreationValidator.js
 *
 * Mars-Sim inspired recreation capacity validation with NASA requirements
 *
 * Validates:
 * - Minimum recreation area per crew member
 * - Total social space threshold
 * - Recreation effectiveness ratio (Mars-Sim inspired)
 *
 * NASA Sources:
 * - AIAA 2022: Recreation area minimums (1.62 m² group activities)
 * - HERA Facility: Common area design for crew cohesion
 * - TP-2020-220505: Social interaction requirements
 */

export class RecreationValidator {
  constructor(constraints) {
    this.constraints = constraints;

    // Load recreation requirements from NASA constraints
    const recReq = constraints.recreation_requirements;
    this.minAreaPerCrew = recReq.min_area_per_crew_m2;
    this.recommendedAreaPerCrew = recReq.recommended_area_per_crew_m2;
    this.minTotalSocialSpace = recReq.total_social_space_min_m2;
  }

  /**
   * Validate recreation space adequacy for the layout
   * @param {Object} layout - Habitat layout with modules
   * @param {Number} crewSize - Number of crew members
   * @returns {Object} - Validation result with compliance status and details
   */
  validateRecreationSpace(layout, crewSize = 4) {
    const recreationModules = this.getRecreationModules(layout);
    const totalRecArea = this.calculateTotalRecreationArea(recreationModules);
    const areaPerCrew = totalRecArea / crewSize;

    const violations = [];
    const warnings = [];

    // Check 1: Minimum total social space (critical threshold)
    if (totalRecArea < this.minTotalSocialSpace) {
      violations.push({
        type: 'insufficient_total_social_space',
        severity: 'critical',
        current: totalRecArea.toFixed(2),
        required: this.minTotalSocialSpace,
        message: `Total social space (${totalRecArea.toFixed(2)} m²) below minimum ${this.minTotalSocialSpace} m² threshold`,
        impact: 'Significant team cohesion degradation expected',
        source: 'HERA common area design'
      });
    }

    // Check 2: Area per crew member (high priority)
    if (areaPerCrew < this.minAreaPerCrew) {
      violations.push({
        type: 'insufficient_recreation_per_crew',
        severity: 'high',
        current: areaPerCrew.toFixed(2),
        required: this.minAreaPerCrew,
        message: `Recreation area per crew (${areaPerCrew.toFixed(2)} m²) below minimum ${this.minAreaPerCrew} m²`,
        shortfall: ((this.minAreaPerCrew * crewSize) - totalRecArea).toFixed(2),
        recommendation: `Add ${((this.minAreaPerCrew * crewSize) - totalRecArea).toFixed(2)} m² recreation space`,
        source: 'AIAA-2022'
      });
    } else if (areaPerCrew < this.recommendedAreaPerCrew) {
      warnings.push({
        type: 'suboptimal_recreation_per_crew',
        severity: 'medium',
        current: areaPerCrew.toFixed(2),
        recommended: this.recommendedAreaPerCrew,
        message: `Recreation area per crew (${areaPerCrew.toFixed(2)} m²) below recommended ${this.recommendedAreaPerCrew} m²`,
        improvement: ((this.recommendedAreaPerCrew * crewSize) - totalRecArea).toFixed(2),
        recommendation: `Consider adding ${((this.recommendedAreaPerCrew * crewSize) - totalRecArea).toFixed(2)} m² for optimal cohesion`,
        source: 'HERA best practices'
      });
    }

    // Check 3: Recreation module availability
    if (recreationModules.length === 0) {
      violations.push({
        type: 'no_recreation_modules',
        severity: 'critical',
        message: 'No recreation modules found in layout',
        recommendation: 'Add at least one Ward/Dining or Recreation module',
        source: 'NASA habitability requirements'
      });
    }

    // Calculate effectiveness ratio (Mars-Sim inspired)
    const effectiveness = this.calculateRecreationEffectiveness(layout, crewSize, recreationModules);

    return {
      compliance: violations.length === 0,
      status: violations.length === 0 ? (warnings.length === 0 ? 'optimal' : 'acceptable') : 'non-compliant',
      metrics: {
        totalRecreationArea: totalRecArea.toFixed(2),
        areaPerCrew: areaPerCrew.toFixed(2),
        recreationModuleCount: recreationModules.length,
        effectiveness: effectiveness.toFixed(2)
      },
      violations: violations,
      warnings: warnings,
      recommendations: this.generateRecommendations(violations, warnings, totalRecArea, crewSize)
    };
  }

  /**
   * Get all recreation-type modules from layout
   * @param {Object} layout - Habitat layout
   * @returns {Array} - Array of recreation modules
   */
  getRecreationModules(layout) {
    if (!layout.modules) return [];

    const recreationTypes = ['Ward/Dining', 'Recreation', 'Exercise'];
    return layout.modules.filter(m => recreationTypes.includes(m.name));
  }

  /**
   * Calculate total recreation area
   * @param {Array} modules - Recreation modules
   * @returns {Number} - Total area in m²
   */
  calculateTotalRecreationArea(modules) {
    return modules.reduce((sum, module) => {
      const area = (module.dimensions?.w || 0) * (module.dimensions?.d || 0);
      return sum + area;
    }, 0);
  }

  /**
   * Calculate recreation effectiveness ratio
   * Mars-Sim inspired: Compares recreation capacity to crew demand
   *
   * @param {Object} layout - Habitat layout
   * @param {Number} crewSize - Number of crew members
   * @param {Array} recreationModules - Recreation modules
   * @returns {Number} - Effectiveness ratio (0-1+)
   */
  calculateRecreationEffectiveness(layout, crewSize, recreationModules) {
    if (recreationModules.length === 0 || crewSize === 0) return 0;

    // Supply: Number of recreation spaces
    const supply = recreationModules.length;

    // Demand: Crew size (baseline 1 space per 2 crew members)
    const demand = crewSize / 2;

    // Wear factor (assume good condition if not specified)
    const wearFactor = layout.averageModuleCondition !== undefined ?
      layout.averageModuleCondition : 1.0;

    // Effectiveness = (supply / demand) * wear factor
    // 1.0 = adequate, >1.0 = excellent, <1.0 = insufficient
    return (supply / demand) * wearFactor;
  }

  /**
   * Generate specific recommendations based on validation results
   * @param {Array} violations - Array of violations
   * @param {Array} warnings - Array of warnings
   * @param {Number} currentArea - Current total recreation area
   * @param {Number} crewSize - Crew size
   * @returns {Array} - Array of recommendation strings
   */
  generateRecommendations(violations, warnings, currentArea, crewSize) {
    const recommendations = [];

    // Priority 1: Critical violations
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      recommendations.push({
        priority: 'critical',
        action: 'Add recreation modules immediately',
        details: `Minimum ${this.minTotalSocialSpace} m² total social space required (HERA protocol)`,
        modules: this.suggestRecreationModules(currentArea, crewSize, 'critical')
      });
    }

    // Priority 2: High violations
    const highViolations = violations.filter(v => v.severity === 'high');
    if (highViolations.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Increase recreation area per crew member',
        details: `Each crew member needs at least ${this.minAreaPerCrew} m² recreation space (AIAA 2022)`,
        modules: this.suggestRecreationModules(currentArea, crewSize, 'high')
      });
    }

    // Priority 3: Warnings (optimization)
    if (warnings.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize recreation space for peak cohesion',
        details: `Target ${this.recommendedAreaPerCrew} m² per crew for optimal team dynamics`,
        modules: this.suggestRecreationModules(currentArea, crewSize, 'optimal')
      });
    }

    return recommendations;
  }

  /**
   * Suggest specific recreation modules to add
   * @param {Number} currentArea - Current recreation area
   * @param {Number} crewSize - Crew size
   * @param {String} level - 'critical', 'high', or 'optimal'
   * @returns {Array} - Array of module suggestions
   */
  suggestRecreationModules(currentArea, crewSize, level) {
    const suggestions = [];

    let targetArea;
    if (level === 'critical') {
      targetArea = Math.max(this.minTotalSocialSpace, this.minAreaPerCrew * crewSize);
    } else if (level === 'high') {
      targetArea = this.minAreaPerCrew * crewSize;
    } else {
      targetArea = this.recommendedAreaPerCrew * crewSize;
    }

    const shortage = Math.max(0, targetArea - currentArea);

    if (shortage > 0) {
      // Suggest Ward/Dining (1.3m × 1.3m = 1.69 m² from catalog)
      const wardDiningArea = 1.69;
      const wardDiningCount = Math.ceil(shortage / wardDiningArea);

      suggestions.push({
        moduleName: 'Ward/Dining',
        count: wardDiningCount,
        totalArea: (wardDiningCount * wardDiningArea).toFixed(2),
        rationale: 'Primary social and dining space for team cohesion'
      });

      // Alternative: Exercise module (1.5m × 1.0m = 1.5 m²)
      if (shortage > 3) {
        suggestions.push({
          moduleName: 'Exercise',
          count: 1,
          totalArea: '1.50',
          rationale: 'Dual purpose: recreation and required crew exercise'
        });
      }
    }

    return suggestions;
  }

  /**
   * Get recreation compliance percentage
   * @param {Object} layout - Habitat layout
   * @param {Number} crewSize - Crew size
   * @returns {Number} - Compliance percentage (0-100)
   */
  getCompliancePercentage(layout, crewSize = 4) {
    const result = this.validateRecreationSpace(layout, crewSize);

    if (result.compliance) {
      return 100;
    }

    const recreationModules = this.getRecreationModules(layout);
    const totalRecArea = this.calculateTotalRecreationArea(recreationModules);
    const requiredArea = this.minAreaPerCrew * crewSize;

    return Math.min(100, (totalRecArea / requiredArea) * 100);
  }
}

/**
 * PrivacyValidator.js
 *
 * Mars-Sim inspired privacy validation with NASA requirements
 *
 * Validates:
 * - Minimum sleep area per person (1.82 m²)
 * - Gender segregation in shared quarters (Mars-Sim logic)
 * - Privacy preference compliance
 *
 * NASA Sources:
 * - TP-2020-220505: Crew quarters privacy requirements
 * - AIAA 2022: 1.82 m² minimum sleep area
 * - HERA crew feedback: Individual privacy critical for psychological health
 */

export class PrivacyValidator {
  constructor(constraints) {
    this.constraints = constraints;

    // Load privacy requirements from NASA constraints
    const privReq = constraints.privacy_requirements;
    this.minSleepAreaPerPerson = privReq.min_sleep_area_per_person_m2;
    this.genderSegregationRequired = privReq.gender_segregation_required;
    this.privateQuartersPreferred = privReq.private_quarters_preferred;
    this.maxOccupantsPerSharedQuarters = privReq.max_occupants_per_shared_quarters;
  }

  /**
   * Validate crew quarters assignments for privacy compliance
   * @param {Object} layout - Habitat layout with modules and crew assignments
   * @param {Array} crew - Array of crew member objects with gender
   * @returns {Object} - Validation result with compliance status
   */
  validatePrivacy(layout, crew) {
    if (!layout.crewAssignments || !crew || crew.length === 0) {
      return {
        compliance: false,
        status: 'error',
        message: 'No crew assignments found',
        violations: [],
        warnings: []
      };
    }

    const violations = [];
    const warnings = [];

    // Get all crew quarters modules
    const crewQuarters = this.getCrewQuarters(layout);

    // Validate each quarters module
    for (const quarters of crewQuarters) {
      const occupants = this.getOccupants(quarters, layout, crew);

      // Check 1: Minimum area per person (CRITICAL)
      const areaPerPerson = this.calculateAreaPerPerson(quarters, occupants.length);
      if (areaPerPerson < this.minSleepAreaPerPerson) {
        violations.push({
          type: 'insufficient_sleep_area',
          severity: 'critical',
          moduleId: quarters.id,
          moduleName: quarters.name,
          current: areaPerPerson.toFixed(2),
          required: this.minSleepAreaPerPerson,
          occupants: occupants.length,
          message: `Sleep area per person (${areaPerPerson.toFixed(2)} m²) below NASA minimum ${this.minSleepAreaPerPerson} m²`,
          source: 'AIAA-2022',
          recommendation: 'Reduce occupants or increase module size'
        });
      }

      // Check 2: Gender segregation in shared quarters (Mars-Sim logic)
      if (occupants.length > 1 && this.genderSegregationRequired) {
        const genders = new Set(occupants.map(c => c.gender));
        if (genders.size > 1) {
          violations.push({
            type: 'mixed_gender_shared_quarters',
            severity: 'high',
            moduleId: quarters.id,
            moduleName: quarters.name,
            occupants: occupants.map(c => ({ name: c.name, gender: c.gender })),
            message: 'Mixed-gender shared quarters not permitted',
            source: 'TP-2020-220505 + NASA best practices',
            recommendation: 'Separate genders into different quarters or provide individual quarters'
          });
        }
      }

      // Check 3: Overcrowding (exceeds max occupants)
      if (occupants.length > this.maxOccupantsPerSharedQuarters) {
        violations.push({
          type: 'quarters_overcrowded',
          severity: 'high',
          moduleId: quarters.id,
          moduleName: quarters.name,
          occupants: occupants.length,
          maximum: this.maxOccupantsPerSharedQuarters,
          message: `Quarters overcrowded: ${occupants.length} occupants (max ${this.maxOccupantsPerSharedQuarters})`,
          source: 'NASA habitability guidelines',
          recommendation: 'Distribute crew across more quarters modules'
        });
      }

      // Check 4: Private quarters preferred (WARNING level)
      if (occupants.length > 1 && this.privateQuartersPreferred) {
        warnings.push({
          type: 'shared_quarters_suboptimal',
          severity: 'medium',
          moduleId: quarters.id,
          moduleName: quarters.name,
          occupants: occupants.length,
          message: 'Shared quarters suboptimal for psychological health',
          source: 'HERA crew feedback + UND study',
          impact: 'Reduced privacy increases stress and degrades sleep quality',
          recommendation: 'Provide individual quarters for optimal crew performance'
        });
      }
    }

    // Check 5: Crew without quarters assignment
    const unassignedCrew = this.getUnassignedCrew(crew, layout);
    if (unassignedCrew.length > 0) {
      violations.push({
        type: 'unassigned_crew',
        severity: 'critical',
        crew: unassignedCrew.map(c => c.name),
        message: `${unassignedCrew.length} crew member(s) without quarters assignment`,
        recommendation: 'Assign all crew members to crew quarters modules'
      });
    }

    // Calculate privacy metrics
    const privacyMetrics = this.calculatePrivacyMetrics(layout, crew);

    return {
      compliance: violations.length === 0,
      status: violations.length === 0 ? (warnings.length === 0 ? 'optimal' : 'acceptable') : 'non-compliant',
      metrics: privacyMetrics,
      violations: violations,
      warnings: warnings,
      recommendations: this.generateRecommendations(violations, warnings, crew.length)
    };
  }

  /**
   * Get all crew quarters modules from layout
   * @param {Object} layout - Habitat layout
   * @returns {Array} - Array of crew quarters modules
   */
  getCrewQuarters(layout) {
    if (!layout.modules) return [];
    return layout.modules.filter(m => m.name === 'Crew Quarters');
  }

  /**
   * Get occupants of a specific quarters module
   * @param {Object} quarters - Quarters module
   * @param {Object} layout - Habitat layout
   * @param {Array} crew - Array of crew members
   * @returns {Array} - Array of crew members assigned to this quarters
   */
  getOccupants(quarters, layout, crew) {
    return crew.filter(member => {
      const assignment = layout.crewAssignments[member.id];
      return assignment && assignment.moduleId === quarters.id;
    });
  }

  /**
   * Calculate area per person in a quarters module
   * @param {Object} quarters - Quarters module
   * @param {Number} occupantCount - Number of occupants
   * @returns {Number} - Area per person in m²
   */
  calculateAreaPerPerson(quarters, occupantCount) {
    if (occupantCount === 0) return 0;

    const area = (quarters.dimensions?.w || 0) * (quarters.dimensions?.d || 0);
    return area / occupantCount;
  }

  /**
   * Get crew members without quarters assignment
   * @param {Array} crew - Array of crew members
   * @param {Object} layout - Habitat layout
   * @returns {Array} - Unassigned crew members
   */
  getUnassignedCrew(crew, layout) {
    return crew.filter(member => {
      const assignment = layout.crewAssignments[member.id];
      if (!assignment) return true;

      const module = layout.modules?.find(m => m.id === assignment.moduleId);
      return !module || module.name !== 'Crew Quarters';
    });
  }

  /**
   * Calculate overall privacy metrics for the layout
   * @param {Object} layout - Habitat layout
   * @param {Array} crew - Array of crew members
   * @returns {Object} - Privacy metrics
   */
  calculatePrivacyMetrics(layout, crew) {
    const quarters = this.getCrewQuarters(layout);

    let privateCount = 0;
    let sharedCount = 0;
    let totalArea = 0;

    for (const q of quarters) {
      const occupants = this.getOccupants(q, layout, crew);
      const area = (q.dimensions?.w || 0) * (q.dimensions?.d || 0);

      if (occupants.length === 1) {
        privateCount++;
      } else if (occupants.length > 1) {
        sharedCount += occupants.length;
      }

      totalArea += area;
    }

    const assignedCrew = crew.length - this.getUnassignedCrew(crew, layout).length;
    const privacyFraction = assignedCrew > 0 ? privateCount / assignedCrew : 0;
    const avgAreaPerCrew = assignedCrew > 0 ? totalArea / assignedCrew : 0;

    return {
      totalQuarters: quarters.length,
      privateQuarters: privateCount,
      sharedQuarters: Math.ceil(sharedCount / 2),
      privacyFraction: privacyFraction.toFixed(2),
      averageAreaPerCrew: avgAreaPerCrew.toFixed(2),
      assignedCrew: assignedCrew,
      unassignedCrew: crew.length - assignedCrew
    };
  }

  /**
   * Generate recommendations based on validation results
   * @param {Array} violations - Array of violations
   * @param {Array} warnings - Array of warnings
   * @param {Number} crewSize - Number of crew members
   * @returns {Array} - Array of recommendation objects
   */
  generateRecommendations(violations, warnings, crewSize) {
    const recommendations = [];

    // Critical: Insufficient sleep area
    const areaViolations = violations.filter(v => v.type === 'insufficient_sleep_area');
    if (areaViolations.length > 0) {
      recommendations.push({
        priority: 'critical',
        action: 'Increase crew quarters size or reduce occupancy',
        details: `All crew members must have at least ${this.minSleepAreaPerPerson} m² sleep area (AIAA 2022)`,
        impact: 'Non-compliant quarters can cause physical discomfort and safety issues'
      });
    }

    // High: Mixed gender or overcrowding
    const genderViolations = violations.filter(v => v.type === 'mixed_gender_shared_quarters');
    const overcrowdViolations = violations.filter(v => v.type === 'quarters_overcrowded');

    if (genderViolations.length > 0 || overcrowdViolations.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Reconfigure crew quarters assignments',
        details: 'Implement gender-segregated shared quarters or provide individual quarters',
        modules: `Add ${Math.max(0, crewSize - (this.getQuartersCount(violations)))} additional Crew Quarters modules`
      });
    }

    // Critical: Unassigned crew
    const unassignedViolations = violations.filter(v => v.type === 'unassigned_crew');
    if (unassignedViolations.length > 0) {
      const unassignedCount = unassignedViolations.reduce((sum, v) => sum + v.crew.length, 0);
      recommendations.push({
        priority: 'critical',
        action: 'Assign all crew members to quarters',
        details: `${unassignedCount} crew member(s) need quarters assignment`,
        modules: `Add ${unassignedCount} Crew Quarters module(s)`
      });
    }

    // Medium: Optimization for private quarters
    if (warnings.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize for individual privacy',
        details: 'Provide private quarters for all crew members for optimal psychological health',
        benefit: 'Reduces stress by 20% and improves sleep quality by 30% (UND study)',
        modules: `Add quarters modules to achieve 1:1 crew-to-quarters ratio`
      });
    }

    return recommendations;
  }

  /**
   * Helper: Get total quarters count from violations
   */
  getQuartersCount(violations) {
    const moduleIds = new Set();
    violations.forEach(v => {
      if (v.moduleId) moduleIds.add(v.moduleId);
    });
    return moduleIds.size;
  }

  /**
   * Get privacy compliance percentage
   * @param {Object} layout - Habitat layout
   * @param {Array} crew - Array of crew members
   * @returns {Number} - Compliance percentage (0-100)
   */
  getCompliancePercentage(layout, crew) {
    const result = this.validatePrivacy(layout, crew);

    if (result.compliance) {
      return 100;
    }

    // Calculate based on severity
    let score = 100;
    result.violations.forEach(v => {
      if (v.severity === 'critical') score -= 25;
      else if (v.severity === 'high') score -= 15;
      else if (v.severity === 'medium') score -= 10;
    });

    return Math.max(0, score);
  }
}

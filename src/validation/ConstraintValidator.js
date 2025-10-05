/**
 * Constraint Validator - NASA Habitability Rules Validation
 *
 * Validates habitat layouts against NASA-derived constraints:
 * - Minimum area requirements (AIAA 2022 Tables 1 & 4)
 * - Adjacency rules (NASA TP-2020-220505)
 * - Translation path widths (≥1.0m)
 * - Clean/dirty zone separation
 * - Habitat shell boundaries
 *
 * All validation rules are traceable to NASA source documents.
 */

export default class ConstraintValidator {
  constructor(constraints) {
    this.constraints = constraints;

    // Parse constraint data
    this.pathMinWidth = constraints.global_circulation.crew_translation_path_min_width_m;
    this.adjacencyRules = constraints.adjacency_rules;
    this.zones = constraints.zones;
    this.combinedSpaces = new Map();

    // Build minimum area lookup
    constraints.combined_spaces_min_areas.forEach(space => {
      this.combinedSpaces.set(space.combined_space, {
        minArea: space.min_area_m2,
        minVolume: space.min_volume_m3
      });
    });

    console.log('✅ ConstraintValidator initialized');
    console.log(`   Path width requirement: ≥${this.pathMinWidth}m`);
    console.log(`   Adjacency rules: ${this.adjacencyRules.length}`);
  }

  /**
   * Validate minimum area requirement for a module
   * @param {HabitatModule} module - Module to validate
   * @returns {Object} {valid: boolean, message: string}
   */
  validateMinimumArea(module) {
    // Null check
    if (!module) {
      return {
        valid: false,
        message: 'Invalid module (null or undefined)',
        moduleId: 'unknown',
        moduleName: 'unknown',
        actualArea: 0,
        requiredArea: 0,
        source: 'validation'
      };
    }

    const actualArea = typeof module.getFootprint === 'function' ? module.getFootprint() : 0;
    const minArea = module.minArea || 0;

    const valid = actualArea >= minArea;
    const message = valid
      ? `${module.moduleName}: ${actualArea.toFixed(2)} m² ≥ ${minArea} m² ✓`
      : `${module.moduleName}: ${actualArea.toFixed(2)} m² < ${minArea} m² (NASA minimum) ✗`;

    return {
      valid,
      message,
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      actualArea,
      requiredArea: minArea,
      source: 'AIAA-2022'
    };
  }

  /**
   * Validate adjacency rules between all modules
   * @param {Array<HabitatModule>} modules - All modules in layout
   * @returns {Array} Array of violations
   */
  validateAdjacency(modules) {
    const violations = [];

    // Check each pair of modules
    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        const moduleA = modules[i];
        const moduleB = modules[j];

        // Check all adjacency rules
        this.adjacencyRules.forEach(rule => {
          if (rule.rule === 'separate_from') {
            // Check if these modules should be separated
            if (
              (rule.a === moduleA.moduleName && rule.b === moduleB.moduleName) ||
              (rule.a === moduleB.moduleName && rule.b === moduleA.moduleName)
            ) {
              // Check if they are too close or touching
              const distance = moduleA.getDistanceTo(moduleB);
              const minDistance = rule.min_distance_m || 1.0; // Default 1m separation

              if (distance < minDistance) {
                violations.push({
                  type: 'adjacency_separation',
                  rule: rule.rule,
                  moduleA: moduleA.moduleName,
                  moduleB: moduleB.moduleName,
                  severity: rule.severity,
                  rationale: rule.rationale,
                  actualDistance: distance.toFixed(2),
                  requiredDistance: minDistance,
                  source: rule.source,
                  message: `${moduleA.moduleName} and ${moduleB.moduleName} must be separated (${distance.toFixed(2)}m < ${minDistance}m)`
                });
              }
            }
          }

          if (rule.rule === 'noise_isolate') {
            // Check noise isolation requirements
            if (
              (rule.a === moduleA.moduleName && rule.b === moduleB.moduleName) ||
              (rule.a === moduleB.moduleName && rule.b === moduleA.moduleName)
            ) {
              const distance = moduleA.getDistanceTo(moduleB);
              const minDistance = rule.min_distance_m || 2.0; // Default 2m for noise isolation

              if (distance < minDistance) {
                violations.push({
                  type: 'noise_isolation',
                  rule: rule.rule,
                  moduleA: moduleA.moduleName,
                  moduleB: moduleB.moduleName,
                  severity: rule.severity,
                  rationale: rule.rationale,
                  actualDistance: distance.toFixed(2),
                  requiredDistance: minDistance,
                  source: rule.source,
                  message: `${moduleA.moduleName} must be noise-isolated from ${moduleB.moduleName} (${distance.toFixed(2)}m < ${minDistance}m)`
                });
              }
            }
          }
        });
      }
    }

    return violations;
  }

  /**
   * Validate path widths between modules
   * @param {Array<HabitatModule>} modules - All modules in layout
   * @returns {Object} {valid: boolean, violations: Array}
   */
  validatePathWidth(modules) {
    const violations = [];

    // Check spacing between adjacent modules
    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        const moduleA = modules[i];
        const moduleB = modules[j];

        const rectA = moduleA.getFloorRectangle();
        const rectB = moduleB.getFloorRectangle();

        // Calculate minimum gap in X and Z directions
        const gapX = Math.min(
          Math.abs(rectA.minX - rectB.maxX),
          Math.abs(rectA.maxX - rectB.minX)
        );

        const gapZ = Math.min(
          Math.abs(rectA.minZ - rectB.maxZ),
          Math.abs(rectA.maxZ - rectB.minZ)
        );

        // Check if modules are adjacent (not overlapping)
        const areAdjacent = gapX < this.pathMinWidth * 2 || gapZ < this.pathMinWidth * 2;

        if (areAdjacent) {
          const minGap = Math.min(gapX, gapZ);

          if (minGap < this.pathMinWidth && minGap > 0) {
            violations.push({
              type: 'path_width',
              moduleA: moduleA.moduleName,
              moduleB: moduleB.moduleName,
              actualWidth: minGap.toFixed(2),
              requiredWidth: this.pathMinWidth,
              severity: 'critical',
              source: 'AIAA-2022',
              message: `Path between ${moduleA.moduleName} and ${moduleB.moduleName} is ${minGap.toFixed(2)}m < ${this.pathMinWidth}m (NASA minimum)`
            });
          }
        }
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Validate clean/dirty zone separation
   * @param {Array<HabitatModule>} modules - All modules in layout
   * @returns {Array} Array of zone violations
   */
  validateZoneSeparation(modules) {
    const violations = [];

    // Get clean and dirty modules
    const cleanModules = modules.filter(m => m.zone === 'clean');
    const dirtyModules = modules.filter(m => m.zone === 'dirty');

    // Check if clean and dirty zones are too close
    cleanModules.forEach(cleanMod => {
      dirtyModules.forEach(dirtyMod => {
        const distance = cleanMod.getDistanceTo(dirtyMod);

        // Warn if clean and dirty zones are very close (< 0.5m)
        if (distance < 0.5) {
          violations.push({
            type: 'zone_proximity',
            moduleA: cleanMod.moduleName,
            moduleB: dirtyMod.moduleName,
            zoneA: 'clean',
            zoneB: 'dirty',
            distance: distance.toFixed(2),
            severity: 'medium',
            source: 'NASA-TP-2020-220505',
            message: `Clean zone (${cleanMod.moduleName}) very close to dirty zone (${dirtyMod.moduleName}): ${distance.toFixed(2)}m`
          });
        }
      });
    });

    return violations;
  }

  /**
   * Validate module is within habitat shell bounds
   * @param {HabitatModule} module - Module to validate
   * @param {Object} shellDimensions - {width, depth}
   * @returns {Object} {valid: boolean, message: string}
   */
  validateBounds(module, shellDimensions) {
    const valid = module.isWithinBounds(shellDimensions.width, shellDimensions.depth);

    const message = valid
      ? `${module.moduleName}: Within ${shellDimensions.width}m × ${shellDimensions.depth}m habitat shell ✓`
      : `${module.moduleName}: Outside habitat shell boundaries ✗`;

    return {
      valid,
      message,
      moduleId: module.moduleId,
      moduleName: module.moduleName
    };
  }

  /**
   * Check for module overlaps
   * @param {Array<HabitatModule>} modules - All modules in layout
   * @returns {Array} Array of overlap violations
   */
  checkOverlaps(modules) {
    const overlaps = [];

    if (!modules || modules.length < 2) {
      return overlaps;
    }

    for (let i = 0; i < modules.length; i++) {
      for (let j = i + 1; j < modules.length; j++) {
        // Null checks
        if (!modules[i] || !modules[j]) continue;
        if (typeof modules[i].checkOverlap !== 'function') continue;

        if (modules[i].checkOverlap(modules[j])) {
          overlaps.push({
            type: 'overlap',
            moduleA: modules[i].moduleName,
            moduleB: modules[j].moduleName,
            severity: 'critical',
            message: `${modules[i].moduleName} overlaps with ${modules[j].moduleName}`
          });
        }
      }
    }

    return overlaps;
  }

  /**
   * Validate complete layout
   * @param {Array<HabitatModule>} modules - All modules in layout
   * @param {Object} shellDimensions - {width, depth}
   * @returns {Object} Comprehensive validation report
   */
  validateLayout(modules, shellDimensions) {
    // Input validation
    if (!modules || !Array.isArray(modules)) {
      console.error('Invalid modules array');
      return {
        valid: false,
        error: 'Invalid modules array',
        timestamp: new Date().toISOString(),
        moduleCount: 0,
        violations: [],
        warnings: [],
        compliancePercentage: 0,
        totalFootprint: 0,
        metrics: {}
      };
    }

    if (!shellDimensions || !shellDimensions.width || !shellDimensions.depth) {
      console.error('Invalid shell dimensions');
      return {
        valid: false,
        error: 'Invalid shell dimensions',
        timestamp: new Date().toISOString(),
        moduleCount: modules.length,
        violations: [],
        warnings: [],
        compliancePercentage: 0,
        totalFootprint: 0,
        metrics: {}
      };
    }

    const report = {
      valid: true,
      timestamp: new Date().toISOString(),
      moduleCount: modules.length,
      violations: [],
      warnings: [],
      compliancePercentage: 100,
      totalFootprint: 0,
      metrics: {}
    };

    // Handle empty layout
    if (modules.length === 0) {
      return report;
    }

    // Calculate total footprint with error handling
    try {
      report.totalFootprint = modules.reduce((sum, m) => {
        if (m && typeof m.getFootprint === 'function') {
          return sum + m.getFootprint();
        }
        console.warn('Module missing getFootprint method:', m);
        return sum;
      }, 0);
    } catch (error) {
      console.error('Error calculating total footprint:', error);
      report.totalFootprint = 0;
    }

    // Track validation issues
    let totalChecks = 0;
    let failedChecks = 0;

    // 1. Validate minimum areas
    modules.forEach(module => {
      totalChecks++;
      const areaCheck = this.validateMinimumArea(module);
      if (!areaCheck.valid) {
        report.violations.push(areaCheck);
        failedChecks++;
      }
    });

    // 2. Validate bounds
    modules.forEach(module => {
      totalChecks++;
      const boundsCheck = this.validateBounds(module, shellDimensions);
      if (!boundsCheck.valid) {
        report.violations.push(boundsCheck);
        failedChecks++;
      }
    });

    // 3. Check overlaps
    const overlaps = this.checkOverlaps(modules);
    if (overlaps.length > 0) {
      totalChecks += overlaps.length;
      failedChecks += overlaps.length;
      report.violations.push(...overlaps);
    }

    // 4. Validate adjacency rules
    const adjacencyViolations = this.validateAdjacency(modules);
    if (adjacencyViolations.length > 0) {
      totalChecks += adjacencyViolations.length;
      failedChecks += adjacencyViolations.length;
      report.violations.push(...adjacencyViolations);
    }

    // 5. Validate path widths
    const pathCheck = this.validatePathWidth(modules);
    if (!pathCheck.valid) {
      totalChecks += pathCheck.violations.length;
      failedChecks += pathCheck.violations.length;
      report.violations.push(...pathCheck.violations);
    }

    // 6. Validate zone separation (warnings only)
    const zoneViolations = this.validateZoneSeparation(modules);
    if (zoneViolations.length > 0) {
      report.warnings.push(...zoneViolations);
    }

    // Calculate compliance percentage
    if (totalChecks > 0) {
      report.compliancePercentage = Math.round(((totalChecks - failedChecks) / totalChecks) * 100);
    }

    report.valid = failedChecks === 0;

    // Add metrics
    report.metrics = {
      totalChecks,
      failedChecks,
      cleanModules: modules.filter(m => m.zone === 'clean').length,
      dirtyModules: modules.filter(m => m.zone === 'dirty').length,
      averageFootprint: modules.length > 0 ? report.totalFootprint / modules.length : 0
    };

    return report;
  }

  /**
   * Get human-readable summary of validation report
   * @param {Object} report - Validation report
   * @returns {string} Summary text
   */
  getSummary(report) {
    let summary = `NASA Compliance: ${report.compliancePercentage}%\n`;
    summary += `Modules: ${report.moduleCount} (${report.metrics.cleanModules} clean, ${report.metrics.dirtyModules} dirty)\n`;
    summary += `Total Footprint: ${report.totalFootprint.toFixed(2)} m²\n`;
    summary += `Violations: ${report.violations.length}\n`;
    summary += `Warnings: ${report.warnings.length}\n`;

    if (report.valid) {
      summary += '\n✓ Layout meets all NASA habitability requirements';
    } else {
      summary += '\n✗ Layout has constraint violations';
    }

    return summary;
  }
}

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
   * @param {Array} modules - Habitat modules
   */
  updateHeatmap(globalStress, designVariables, modules) {
    try {
      if (!this.enabled) return;

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
    const violations = [
      ['Hygiene', 'Crew Quarters'],
      ['WCS', 'Galley'],
      ['Exercise', 'Crew Quarters'],
      ['WCS', 'Ward/Dining']
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
  toggle(modules) {
    this.enabled = !this.enabled;

    if (!this.enabled) {
      // Reset all module colors to original
      for (const module of modules) {
        if (module.mesh && module.mesh.material) {
          module.mesh.material.emissive = new THREE.Color(0x000000);
          module.mesh.material.emissiveIntensity = 0;
          // Don't reset color here - it's controlled by violations
        }
      }
    }

    return this.enabled;
  }
}

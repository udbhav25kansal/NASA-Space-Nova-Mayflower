/**
 * Module Catalog - Available Habitat Modules
 *
 * Defines all available habitat modules with NASA-validated dimensions
 * and constraints.
 *
 * Data Sources:
 * - NASA/TP-2020-220505: Deep Space Habitability Design Guidelines
 * - AIAA ASCEND 2022: Internal Layout of a Lunar Surface Habitat
 *   Tables 1 & 4: Atomic functional minima and combined spaces
 *
 * All dimensions in meters (SI units)
 * All modules meet or exceed NASA minimum area requirements
 */

const ModuleCatalog = [
  {
    name: 'Crew Quarters',
    w: 1.4,      // width in meters
    d: 1.35,     // depth in meters
    h: 2.4,      // height in meters (standard habitat ceiling)
    zone: 'clean',
    color: 0xbae6fd,  // Light blue for clean zones
    category: 'Crew Habitation',
    description: 'Private sleep accommodation for one crew member',
    minArea: 1.82,    // m² - NASA minimum from AIAA 2022
    actualArea: 1.89,  // m² - calculated (1.4 × 1.35)
    minVolume: 3.64,   // m³ - NASA minimum
    actualVolume: 4.54, // m³ - calculated
    nasaSource: 'AIAA-2022 Table 4',
    notes: 'Meets NASA TP-2020-220505 minimum internal dimensions (>30"×30"×78"). Private quarters recommended per UND behavioral study for stress reduction.'
  },
  {
    name: 'Hygiene',
    w: 1.2,
    d: 0.9,
    h: 2.4,
    zone: 'dirty',
    color: 0xfecaca,  // Light red for dirty zones
    category: 'Hygiene',
    description: 'Full body cleaning and personal hygiene station',
    minArea: 1.06,
    actualArea: 1.08,
    minVolume: 2.54,
    actualVolume: 2.59,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Must be separated from Crew Quarters per NASA TP-2020-220505 to prevent cross-contamination. Includes shower capability per HERA facility standards.'
  },
  {
    name: 'WCS',
    w: 1.1,
    d: 0.9,
    h: 2.4,
    zone: 'dirty',
    color: 0xfecaca,
    category: 'Human Waste Collection',
    description: 'Waste Collection System (toilet)',
    minArea: 0.91,
    actualArea: 0.99,
    minVolume: 2.18,
    actualVolume: 2.38,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Must be in separate compartment with rigid door and ventilation per NASA TP-2020-220505 Section 4. Critical separation from Galley required.'
  },
  {
    name: 'Exercise',
    w: 1.5,
    d: 1.0,
    h: 2.4,
    zone: 'dirty',
    color: 0xfecaca,
    category: 'Exercise',
    description: 'Resistive exercise equipment area',
    minArea: 1.50,
    actualArea: 1.50,
    minVolume: 3.60,
    actualVolume: 3.60,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Must be noise-isolated from Crew Quarters per NASA guidelines. HERA facility includes both aerobic and resistive exercise equipment.'
  },
  {
    name: 'Galley',
    w: 0.9,
    d: 0.7,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Meal Preparation',
    description: 'Food preparation and storage area',
    minArea: 0.56,
    actualArea: 0.63,
    minVolume: 1.35,
    actualVolume: 1.51,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Must be separated from WCS per NASA contamination control requirements. Includes food sorting and preparation functions.'
  },
  {
    name: 'Ward/Dining',
    w: 1.3,
    d: 1.3,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Group Socialization & Recreation',
    description: 'Full crew dining and socialization area',
    minArea: 1.62,
    actualArea: 1.69,
    minVolume: 3.89,
    actualVolume: 4.06,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Critical for team cohesion per HERA isolation studies. Supports full crew (4 person) dining and group activities.'
  },
  {
    name: 'Workstation',
    w: 1.2,
    d: 1.15,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Mission Planning',
    description: 'General work surface and computer station',
    minArea: 1.37,
    actualArea: 1.38,
    minVolume: 3.28,
    actualVolume: 3.31,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Supports mission planning, work surface access, and command/control interfaces per NASA habitability requirements.'
  }
];

/**
 * Get module definition by name
 * @param {string} name - Module name
 * @returns {Object|null} Module definition or null if not found
 */
export function getModuleByName(name) {
  return ModuleCatalog.find(m => m.name === name) || null;
}

/**
 * Get all modules in a specific zone
 * @param {string} zone - 'clean' or 'dirty'
 * @returns {Array} Array of module definitions
 */
export function getModulesByZone(zone) {
  return ModuleCatalog.filter(m => m.zone === zone);
}

/**
 * Get all module names
 * @returns {Array<string>} Array of module names
 */
export function getModuleNames() {
  return ModuleCatalog.map(m => m.name);
}

/**
 * Validate that a module meets NASA minimum requirements
 * @param {Object} module - Module definition
 * @returns {Object} Validation result {valid: boolean, issues: Array}
 */
export function validateModule(module) {
  const issues = [];

  if (module.actualArea < module.minArea) {
    issues.push(`Area ${module.actualArea.toFixed(2)} m² is below NASA minimum ${module.minArea} m²`);
  }

  if (module.actualVolume < module.minVolume) {
    issues.push(`Volume ${module.actualVolume.toFixed(2)} m³ is below NASA minimum ${module.minVolume} m³`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

// Default export
export default ModuleCatalog;

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
  },
  {
    name: 'Medical',
    w: 1.5,
    d: 1.3,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Medical Operations',
    description: 'Basic medical care and telemedicine station',
    minArea: 1.87,
    actualArea: 1.95,
    minVolume: 4.49,
    actualVolume: 4.68,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Basic Medical Care capability per NASA requirements. Supports autonomous ambulatory care and telemedicine operations.'
  },
  {
    name: 'EVA Prep',
    w: 1.4,
    d: 1.0,
    h: 2.4,
    zone: 'dirty',
    color: 0xfecaca,
    category: 'EVA Support',
    description: 'EVA suit test, repair, and preparation area',
    minArea: 1.37,
    actualArea: 1.40,
    minVolume: 3.28,
    actualVolume: 3.36,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Suit Component Test/Repair per NASA EVA Support requirements. Includes EVA planning and suit maintenance functions.'
  },
  {
    name: 'Airlock',
    w: 2.0,
    d: 1.5,
    h: 2.4,
    zone: 'dirty',
    color: 0xfecaca,
    category: 'EVA Support',
    description: 'Pressurized airlock for EVA ingress/egress',
    minArea: 3.0,
    actualArea: 3.0,
    minVolume: 7.2,
    actualVolume: 7.2,
    nasaSource: 'NASA-TP-2020-220505',
    notes: 'Airlock chamber for EVA operations. Sized for 2-person crew EVA with suit donning space. Includes temporary EVA items stowage.'
  },
  {
    name: 'Stowage',
    w: 1.5,
    d: 0.95,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Logistics',
    description: 'General cargo and inventory storage',
    minArea: 1.37,
    actualArea: 1.43,
    minVolume: 3.28,
    actualVolume: 3.42,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Packing & Inventory Management per NASA logistics requirements. Includes personal stowage access and cargo organization.'
  },
  {
    name: 'Window Station',
    w: 0.9,
    d: 0.65,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Monitoring & Commanding',
    description: 'Direct external viewing and observation port',
    minArea: 0.56,
    actualArea: 0.59,
    minVolume: 1.35,
    actualVolume: 1.41,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Direct Window Viewing per NASA monitoring requirements. Critical for crew psychological well-being and exterior observation.'
  },
  {
    name: 'Laboratory',
    w: 1.4,
    d: 1.2,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Science Operations',
    description: 'Science experiments and research workstation',
    minArea: 1.62,
    actualArea: 1.68,
    minVolume: 3.89,
    actualVolume: 4.03,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Work Surface Access for science operations. Supports sample analysis, experiments, and research documentation.'
  },
  {
    name: 'Communications',
    w: 1.5,
    d: 1.25,
    h: 2.4,
    zone: 'clean',
    color: 0xbae6fd,
    category: 'Monitoring & Commanding',
    description: 'Teleoperations and communications interface',
    minArea: 1.82,
    actualArea: 1.88,
    minVolume: 4.37,
    actualVolume: 4.50,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Teleop/Comms Interface per NASA command/control requirements. Supports crew-to-Earth communications and rover teleoperations.'
  },
  {
    name: 'IFM/Repair',
    w: 1.4,
    d: 1.0,
    h: 2.4,
    zone: 'dirty',
    color: 0xfecaca,
    category: 'Maintenance & Repair',
    description: 'In-Flight Maintenance and systems repair',
    minArea: 1.37,
    actualArea: 1.40,
    minVolume: 3.28,
    actualVolume: 3.36,
    nasaSource: 'AIAA-2022 Table 1',
    notes: 'Systems/Electronics Repair per NASA maintenance requirements. Includes diagnostics workstation and repair tools storage.'
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

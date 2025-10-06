# Missing Features Implementation Guide
## Habitat Harmony LS² - NASA Space Apps Challenge 2024

**Document Purpose:** Step-by-step implementation prompts for all unimplemented features identified in PROPOSAL_ACTUAL_STATE.md, aligned with NASA SPACE APPS CHALLENGE STATEMENT requirements.

**Challenge Requirements Mapping:**
1. ✅ Create overall habitat design - **PARTIALLY IMPLEMENTED** (fixed 12m×8m only)
2. ✅ Determine functional areas and placement - **IMPLEMENTED**
3. ⚠️ Try different options/scenarios - **SCAFFOLDED BUT DISABLED**

---

## Implementation Status Summary

### ✅ Fully Implemented (Phase 1 + Phase 2)
- Interactive 3D scene with Three.js
- 7 core modules with NASA constraints
- Drag-and-drop placement
- Real-time constraint validation
- Module-specific psychological impacts
- 45-day mission simulation
- AI crew with pathfinding
- CSV export
- Path measurement tool

### ❌ Scaffolded But Disabled (Need Re-enablement)
1. **Habitat Configurator** (HabitatConfigurator.js - 540 lines)
2. **Object Placement System** (ObjectCatalog.js)
3. **Mission Scenario Presets** (ScenarioLoader.js)

### ❌ Not Started (Challenge Requirements)
4. **Multiple Habitat Shapes** (Challenge Objective #1)
5. **Multi-Level Layouts** (Challenge Consideration)
6. **Launch Vehicle Constraints** (Challenge Consideration)
7. **Quantitative Volume Outputs** (Challenge Consideration)

---

## Feature #1: Habitat Configurator (Re-enablement)

### NASA Challenge Alignment
**Challenge Statement:** "Select habitat shapes and define dimensions. Consider different crew sizes, mission durations, and destinations."

**NASA Data Sources:**
- `habitat-types.json` - 4 NASA-validated habitat types
- IEEE TH-2023 Mars Transit Habitat specifications
- NASA TP-2020-220505 Deep Space Habitability Guidelines

### Current Status
- ✅ File exists: `src/ui/HabitatConfigurator.js` (540 lines)
- ✅ Data exists: `src/data/habitat-types.json` (314 lines)
- ❌ **Disabled:** Causing UI blocking issues
- ❌ Not integrated into main.js

### Implementation Steps

#### Step 1: Fix UI Blocking Issues
**Problem:** Configurator was blocking other UI elements and causing layout issues.

**Prompt for Claude:**
```
Read the file src/ui/HabitatConfigurator.js and identify why it was causing UI blocking issues. The file is currently disabled in main.js. Analyze the CSS positioning and DOM insertion logic (lines 66-77 and render methods). Fix the following issues:

1. z-index conflicts with existing HUD or Catalog panels
2. Improper positioning causing overlaps
3. Event listener conflicts with drag controls
4. Memory leaks from not cleaning up properly

Once issues are identified, create a fixed version that:
- Uses CSS Grid or Flexbox for proper layout
- Positions in left sidebar below existing panels
- Does not interfere with Three.js canvas raycasting
- Cleans up event listeners on destroy()

Maintain all existing functionality from the 540-line file.
```

#### Step 2: Implement Habitat Shape Changing
**Goal:** Allow users to switch between 4 NASA habitat types dynamically.

**Prompt for Claude:**
```
Implement the habitat shape changing functionality in HabitatConfigurator.js. When a user selects a different habitat type, the following must happen:

1. Update the habitat floor plate geometry in src/scene/GridSystem.js:
   - Read current habitat type from configurator
   - Calculate new floor dimensions based on habitat_types.json
   - Recreate floor mesh with new BoxGeometry
   - Update grid lines to match new dimensions
   - Preserve existing modules if they fit in new bounds

2. Update TileSystem.js pathfinding grid:
   - Recalculate tile count based on new dimensions
   - Clear existing tiles
   - Generate new 1m×1m tile grid
   - Rebuild walkable/blocked tile map

3. Validate all placed modules against new boundaries:
   - Check if modules fit within new habitat bounds
   - Move out-of-bounds modules to nearest valid position
   - Show toast notification if modules were moved
   - Trigger constraint re-validation

4. Update HUD to show current habitat type and dimensions

NASA constraints from habitat-types.json:
- hybrid_transhab: 8.0m diameter × 8.5m length (3 levels)
- rigid_cylinder: 4.5m diameter × 8.0m length (1 level)
- inflatable_beam: 6.0m diameter × 10.0m length (2 levels)
- modular_assembly: 4.5m diameter × 18.0m length (1 level)

Each habitat type has different volume, mass, and launch constraints. Display these in the configurator UI.
```

#### Step 3: Implement Dimension Customization Sliders
**Goal:** Allow users to adjust habitat dimensions within NASA-validated ranges.

**Prompt for Claude:**
```
Add dimension customization sliders to HabitatConfigurator.js based on habitat_customization_limits in habitat-types.json:

For each habitat type, create sliders for:
1. Diameter/Width (min/max/default from JSON)
2. Length (min/max/default from JSON)
3. Number of levels (if applicable)

Constraints:
- rigid_cylinder: diameter 3.0-5.0m, length 6.0-12.0m
- inflatable_beam: diameter 5.0-8.0m, length 8.0-12.0m
- hybrid_transhab: diameter 7.0-8.5m, length 7.0-10.0m
- modular_assembly: modules 2-5, module length 4.0-8.0m

Real-time updates:
1. Slider change → update currentConfig object
2. Recalculate total volume using formulas from JSON
3. Update floor plate geometry immediately
4. Show volume calculation: V = π × r² × L for cylinders
5. Display habitable volume per crew (compare to NASA minimum 25 m³)
6. Show compliance: Green if ≥50 m³/crew, Yellow if 25-50 m³/crew, Red if <25 m³/crew

Add visual feedback in configurator panel showing:
- Current dimensions (meters)
- Total pressurized volume (m³)
- Habitable volume per crew (m³/crew)
- NASA compliance indicator
```

#### Step 4: Implement Launch Vehicle Constraints Display
**Goal:** Show which launch vehicles can accommodate the current habitat design.

**Prompt for Claude:**
```
Add launch vehicle constraint checking to HabitatConfigurator.js using launch_vehicle_constraints from habitat-types.json:

Display a table showing compatibility with:
1. SLS Block 1 (8.4m fairing, 27,000 kg payload)
2. Falcon Heavy (5.2m fairing, 16,800 kg payload)
3. Starship HLS (9.0m fairing, 100,000 kg payload)

For each vehicle, show:
- ✅ Compatible (green) if habitat fits in fairing
- ⚠️ Requires folding (yellow) for inflatables
- ❌ Incompatible (red) if too large

Calculations:
- Check current habitat diameter ≤ fairing diameter
- Check current habitat length ≤ fairing height
- For inflatables, use stowed dimensions
- Calculate mass from habitat-types.json

Display in configurator panel below dimension sliders:
```
Launch Vehicle Compatibility
[SLS Block 1]       ✅ Compatible
[Falcon Heavy]      ❌ Diameter too large (5.5m > 5.2m)
[Starship HLS]      ✅ Compatible
```

Add tooltip on hover explaining why incompatible.
```

#### Step 5: Integration into main.js
**Goal:** Re-enable HabitatConfigurator in the application.

**Prompt for Claude:**
```
Re-enable HabitatConfigurator in src/main.js:

1. Import HabitatConfigurator at top of file
2. Initialize in init() method AFTER SceneManager but BEFORE module catalog
3. Pass callback function to handle habitat configuration changes:

```javascript
this.habitatConfigurator = new HabitatConfigurator((config) => {
  // Update scene with new habitat configuration
  this.sceneManager.gridSystem.updateHabitat(config);
  this.sceneManager.tileSystem.regenerateTiles(config.width, config.depth);
  this.validateAllModules();
  this.updateHUD();
});
```

4. Create configurator panel and append to left sidebar
5. Ensure configurator appears BELOW module catalog
6. Test that configurator does not block Three.js raycasting
7. Test that all UI elements are responsive and non-overlapping

Validate:
- Configurator loads without errors
- Habitat shape changes work
- Dimension sliders update scene in real-time
- Launch vehicle compatibility updates dynamically
- No z-index conflicts with other UI elements
```

---

## Feature #2: Object Placement System (Re-enablement)

### NASA Challenge Alignment
**Challenge Statement:** "Bring objects into the virtual environment and resize them (e.g., human models, spacesuits, stowage bags, plant growth facilities, a medical kit)."

**NASA Data Sources:**
- `object-catalog.json` - 17 objects from IEEE TH-2023 Master Equipment List
- ISS Heritage Equipment Database
- NASA-validated object masses and dimensions

### Current Status
- ✅ File exists: `src/ui/ObjectCatalog.js` (100+ lines)
- ✅ Data exists: `src/data/object-catalog.json` (300 lines, 17 objects)
- ✅ HabitatObject class exists: `src/entities/HabitatObject.js`
- ❌ **Disabled:** Not fully integrated
- ❌ No object placement controls

### Implementation Steps

#### Step 1: Complete ObjectCatalog UI
**Prompt for Claude:**
```
Complete the ObjectCatalog UI in src/ui/ObjectCatalog.js. The file currently has basic structure but needs full implementation.

Requirements:
1. Display all 17 objects from object-catalog.json organized by category:
   - Crew Support (4 objects)
   - Exercise & Health (3 objects)
   - Food & Galley (3 objects)
   - Science & Research (3 objects)
   - Stowage & Logistics (3 objects)
   - Workstations (2 objects)

2. For each object, show:
   - Icon/emoji (assigned based on category)
   - Name
   - Mass (kg)
   - Dimensions (W×D×H in meters)
   - Resizable indicator (if resizable: true)
   - Zone requirement (clean/dirty/null)

3. UI Layout (below module catalog):
   - Collapsible category sections
   - Object cards in 2-column grid
   - "Add Object" button per card
   - Mass budget tracker (used/total in kg)
   - Visual indicator when approaching mass limit

4. Mass Budget from object-catalog.json:
   - Total equipment mass limit: 2,850 kg (IEEE TH-2023)
   - Show current total mass
   - Warn when >80% (yellow)
   - Block when >100% (red)

Style to match existing Catalog.js aesthetic but use orange/amber colors to differentiate from modules (blue).
```

#### Step 2: Implement Object Placement Logic
**Prompt for Claude:**
```
Implement object placement logic in main.js and integrate with HabitatObject.js:

1. Add object placement to main.js:
```javascript
async addObject(objectId) {
  // Load object data from catalog
  const objectData = this.objectCatalog.getObject(objectId);

  // Create HabitatObject instance
  const habitatObject = new HabitatObject(objectData);

  // Check zone requirements
  if (objectData.zone_requirement) {
    // Must be placed in module of matching zone
    const validModules = this.modules.filter(m => m.zone === objectData.zone_requirement);
    if (validModules.length === 0) {
      Toast.show(`No ${objectData.zone_requirement} zone modules available`, 'warning');
      return;
    }
  }

  // Place at center of scene initially
  habitatObject.position.set(0, objectData.dimensions_m.height / 2, 0);

  // Add to scene
  this.sceneManager.scene.add(habitatObject);
  this.objects.push(habitatObject);

  // Make draggable
  this.dragControls.addObject(habitatObject);

  // Update mass budget
  this.objectCatalog.updateMass(objectData.mass_kg);
}
```

2. Extend DragControls.js to support objects:
   - Objects should snap to 0.1m grid like modules
   - Objects cannot overlap with modules
   - Objects should stay within habitat bounds
   - Objects respect zone requirements

3. Add object selection and deletion:
   - Click to select object (highlight in yellow)
   - Delete key removes selected object
   - Update mass budget when deleted

4. Validate object placement:
   - Check if object is inside a module or on floor
   - Ensure object respects zone requirements
   - Show warning if object in wrong zone
```

#### Step 3: Implement Object Resizing
**Prompt for Claude:**
```
Implement object resizing functionality for objects with resizable: true in object-catalog.json:

Resizable objects (8 total):
- Medical Kit (0.5x - 2.0x)
- Food Storage Bag (0.5x - 3.0x)
- Plant Growth Chamber (0.7x - 2.0x)
- Cargo Transfer Bag (0.5x - 2.5x)
- Tool Chest (0.6x - 1.8x)

1. Add resize controls when object is selected:
   - Show resize slider in HUD
   - Range: min_scale to max_scale from JSON
   - Real-time preview as slider moves
   - Update geometry dimensions
   - Update mass proportionally (mass ∝ scale³ for volume scaling)

2. UI for resize controls (appears in HUD when object selected):
```
Selected: Medical Kit
┌─────────────────────┐
│ Scale: [▓▓▓▓░░░] 1.2x │
│ Mass: 18.6 kg (scaled)│
│ Size: 0.6×0.48×0.36 m │
└─────────────────────┘
[Delete Object] [Reset Scale]
```

3. Visual feedback:
   - Resized object shows bounding box
   - Color changes if mass exceeds budget
   - Snap scale to 0.1x increments

4. Validation:
   - Prevent resize if it would exceed mass budget
   - Prevent resize if object would overlap module
   - Update collision detection with new size
```

#### Step 4: Add Object-Module Interaction
**Prompt for Claude:**
```
Implement object-module containment checking:

1. Determine if an object is inside a module:
   - Calculate object bounding box
   - Check if all corners are within module boundaries
   - Mark object as "contained" by that module

2. Visual indicators:
   - Contained objects: normal color
   - Uncontained objects: semi-transparent (needs placement)
   - Wrong zone objects: red outline (zone violation)

3. Add object count to modules:
   - Module shows "Contains: 3 objects (245 kg)"
   - Click module to highlight contained objects
   - Option to "Empty Module" (remove all objects)

4. Update ConstraintValidator.js:
   - Check zone requirements for all objects
   - Ensure clean zone objects not in dirty modules
   - Ensure dirty zone objects not in clean modules
   - Add to validation report

5. Psychological impact integration:
   - Objects in correct modules improve mood (+5)
   - Plant Growth Chamber provides +10 mood bonus
   - Exercise equipment provides stress relief when available
   - Update PsychModel.js to include object bonuses
```

#### Step 5: Add Object Export/Import
**Prompt for Claude:**
```
Extend LayoutExporter.js and CSVGenerator.js to include objects:

1. JSON Export (add to existing export):
```json
{
  "layout": {
    "modules": [...],
    "objects": [
      {
        "id": "medical_kit_1",
        "type": "medical_kit",
        "position": {"x": 2.5, "y": 0.15, "z": 3.0},
        "scale": 1.2,
        "mass_kg": 18.6,
        "contained_in_module": "module_medical_1",
        "zone_compliance": true
      }
    ]
  },
  "mass_budget": {
    "total_objects_mass_kg": 1245.5,
    "mass_limit_kg": 2850,
    "utilization_percent": 43.7
  }
}
```

2. CSV Export (new sheet "Objects"):
```
Object ID,Type,Category,Mass (kg),Scale,Position X,Position Y,Position Z,Module,Zone Compliance
medical_kit_1,Medical Kit,Exercise & Health,18.6,1.2,2.5,0.15,3.0,module_medical_1,TRUE
```

3. Import functionality:
   - Load objects from JSON
   - Recreate object instances
   - Apply saved positions and scales
   - Validate zone compliance
   - Update mass budget
```

---

## Feature #3: Mission Scenario Presets (Re-enablement)

### NASA Challenge Alignment
**Challenge Statement:** "Consider different crew sizes, mission durations, and destinations."

**NASA Data Sources:**
- `mission-scenarios.json` - 5 NASA mission scenarios
- Artemis Base Camp (30 days, 4 crew)
- HERA Analog (45 days, 4 crew)
- Mars Transit (180 days, 4 crew)
- Gateway Station (90 days, 4 crew)
- Mars Surface (500 days, 6 crew)

### Current Status
- ✅ File exists: `src/ui/ScenarioLoader.js` (134 lines)
- ✅ Data exists: `src/data/mission-scenarios.json` (276 lines)
- ❌ **Disabled:** Depends on habitat configurator
- ❌ Not integrated

### Implementation Steps

#### Step 1: Complete ScenarioLoader Integration
**Prompt for Claude:**
```
Complete the ScenarioLoader.js integration with main.js:

1. Initialize ScenarioLoader in main.js init():
```javascript
this.scenarioLoader = new ScenarioLoader((scenario) => {
  this.loadMissionScenario(scenario);
});
```

2. Implement loadMissionScenario() method in main.js:
```javascript
loadMissionScenario(scenario) {
  console.log('📋 Loading scenario:', scenario.name);

  // 1. Clear existing layout
  this.clearAllModules();
  this.clearAllObjects();

  // 2. Set habitat configuration
  if (this.habitatConfigurator) {
    this.habitatConfigurator.setConfiguration(scenario.habitat_config);
  }

  // 3. Set mission parameters
  this.missionParams.setParams({
    crewSize: scenario.crew_size,
    missionDuration: scenario.mission_duration_days,
    missionType: scenario.mission_type
  });

  // 4. Add required modules
  scenario.required_modules.forEach((moduleName, index) => {
    // Auto-place modules in grid pattern
    const module = this.addModuleFromCatalog(moduleName);
    this.autoPlaceModule(module, index);
  });

  // 5. Add recommended objects
  scenario.recommended_objects.forEach((objectId) => {
    this.addObject(objectId);
  });

  // 6. Run validation
  this.validateLayout();

  // 7. Show scenario info toast
  Toast.show(`Loaded: ${scenario.name} - ${scenario.crew_size} crew, ${scenario.mission_duration_days} days`, 'success', 5000);
}
```

3. Add clearAllModules() and clearAllObjects() helper methods
4. Add autoPlaceModule() to arrange modules in optimal layout
```

#### Step 2: Implement Auto-Layout Algorithm
**Prompt for Claude:**
```
Create an auto-layout algorithm in main.js to intelligently place modules from scenarios:

Requirements:
1. Read required_modules from scenario
2. Place modules to minimize adjacency violations
3. Maximize path widths (≥1.0m)
4. Respect clean/dirty zone separation
5. Create logical flow: Airlock → EVA Prep → Hygiene → Crew Quarters

Algorithm:
```javascript
autoPlaceModule(module, index) {
  // Zone-based placement strategy
  const zones = {
    clean: { x: 2, z: 2 },   // Top-right quadrant
    dirty: { x: -2, z: -2 }  // Bottom-left quadrant
  };

  const basePos = zones[module.zone] || { x: 0, z: 0 };

  // Grid placement with offset
  const gridSize = 2.5; // meters between modules
  const col = index % 3;
  const row = Math.floor(index / 3);

  module.position.set(
    basePos.x + (col * gridSize),
    0,
    basePos.z + (row * gridSize)
  );

  // Validate and adjust if out of bounds
  this.constrainToBounds(module);
}
```

Test with all 5 scenarios and ensure:
- No overlapping modules
- All within habitat bounds
- Clean/dirty zones separated
- Path widths ≥1.0m where possible
```

#### Step 3: Add Scenario Comparison Mode
**Prompt for Claude:**
```
Add scenario comparison feature to ScenarioLoader:

1. Add "Compare Scenarios" button to ScenarioLoader UI
2. When clicked, show comparison table:

| Metric | Artemis Base Camp | HERA Analog | Mars Transit | Gateway | Mars Surface |
|--------|-------------------|-------------|--------------|---------|--------------|
| Crew Size | 4 | 4 | 4 | 4 | 6 |
| Duration (days) | 30 | 45 | 180 | 90 | 500 |
| Habitat Type | Rigid | Rigid | Hybrid | Modular | Inflatable |
| Volume (m³) | 127 | 127 | 400 | 285 | 282 |
| Volume/Crew (m³) | 31.8 | 31.8 | 100 | 71.3 | 47 |
| Modules Required | 12 | 11 | 15 | 14 | 20 |
| EVAs/Week | 3 | 0 | 0 | 1 | 4 |
| Comm Delay (s) | 2.6 | 0 | 1200 | 2.6 | 1320 |
| Stressors | 3 | 4 | 5 | 4 | 5 |

3. Add export comparison as CSV
4. Highlight recommended scenario based on user's needs
5. Show psychological predictions for each scenario (if simulation run)
```

#### Step 4: Add Custom Scenario Creator
**Prompt for Claude:**
```
Add custom scenario creation to ScenarioLoader:

1. Add "Create Custom Scenario" button
2. Show modal/panel with inputs:
   - Scenario Name
   - Mission Type (dropdown: lunar_surface, mars_surface, deep_space_transit, etc.)
   - Crew Size (slider: 2-6)
   - Mission Duration (slider: 7-1000 days)
   - Habitat Type (dropdown from habitat-types.json)
   - Select Required Modules (multi-select from catalog)
   - Select Recommended Objects (multi-select from object catalog)

3. Save custom scenario to localStorage:
```javascript
{
  "custom_scenarios": [
    {
      "id": "custom_mission_1",
      "name": "Extended Lunar Outpost",
      "description": "User-created scenario",
      "mission_type": "lunar_surface",
      "crew_size": 6,
      "mission_duration_days": 90,
      ...
    }
  ]
}
```

4. Load custom scenarios alongside NASA scenarios
5. Allow editing and deleting custom scenarios
6. Export custom scenario as JSON file
```

---

## Feature #4: Multiple Habitat Shapes (New Implementation)

### NASA Challenge Alignment
**Challenge Statement:** "Create an overall habitat design given a variety of options."

**NASA Sources:** Already defined in habitat-types.json

### Implementation Steps

#### Step 1: Implement Cylindrical Habitat Geometry
**Prompt for Claude:**
```
Add cylindrical habitat geometry to GridSystem.js:

Currently, the floor plate is a flat rectangle (BoxGeometry). Add support for cylindrical habitats:

1. Modify GridSystem.js createFloorPlate():
```javascript
createFloorPlate(habitatConfig) {
  const { type, width, depth, height } = habitatConfig;

  let geometry;
  if (type === 'rigid_cylinder' || type === 'inflatable_beam') {
    // Cylindrical floor
    const radius = width / 2;
    geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 32);
    geometry.rotateX(Math.PI / 2); // Lay flat
  } else if (type === 'hybrid_transhab') {
    // Cylinder with toroidal ends (approximate as cylinder for now)
    const radius = width / 2;
    geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 32);
    geometry.rotateX(Math.PI / 2);
  } else {
    // Rectangular floor (current default)
    geometry = new THREE.BoxGeometry(width, 0.1, depth);
  }

  // ... rest of floor creation
}
```

2. Update grid lines to match cylinder:
   - Radial grid lines from center for cylinders
   - Rectangular grid for modular assemblies
   - Polar coordinates for angular placement

3. Update bounds checking:
   - Modules must fit within circular boundary
   - Distance from center ≤ radius for cylinders
```

#### Step 2: Implement Multi-Module Assembly Layout
**Prompt for Claude:**
```
Add support for modular_assembly habitat type (3-5 connected modules):

1. Create new file: src/habitat/ModularHabitat.js:
```javascript
export default class ModularHabitat extends THREE.Group {
  constructor(config) {
    super();

    this.moduleCount = config.modules || 3;
    this.moduleLength = config.module_length_range_m.default;
    this.moduleDiameter = config.module_diameter_m;

    // Create connected modules
    this.habitatModules = [];
    for (let i = 0; i < this.moduleCount; i++) {
      const module = this.createHabitatModule(i);
      this.add(module);
      this.habitatModules.push(module);
    }
  }

  createHabitatModule(index) {
    // Create cylindrical module segment
    const geometry = new THREE.CylinderGeometry(
      this.moduleDiameter / 2,
      this.moduleDiameter / 2,
      this.moduleLength,
      32
    );
    geometry.rotateZ(Math.PI / 2); // Orient horizontally

    const material = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = index * this.moduleLength;

    return mesh;
  }
}
```

2. Update GridSystem to show connected modules
3. Allow module placement across multiple segments
4. Show docking ports between modules
```

#### Step 3: Add Inflatable Habitat Visualization
**Prompt for Claude:**
```
Add visual distinction for inflatable habitats:

1. Create different material for inflatable_beam and hybrid_transhab:
```javascript
const inflatableMaterial = new THREE.MeshStandardMaterial({
  color: 0xf0f0f0,
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
  emissive: 0x3b82f6,
  emissiveIntensity: 0.1
});
```

2. Add animated "breathing" effect:
   - Slight pulsing opacity (0.2 - 0.3)
   - Simulate pressurization
   - Frequency: 0.5 Hz

3. Show restraint layer pattern:
   - Add texture or lines showing Vectran webbing
   - Vertical longerons (6 total for TransHab)
   - Hoop straps around circumference

4. Add metallic core for hybrid_transhab:
   - Solid cylinder in center (3m diameter)
   - Different material (metallic)
   - Shows structural support
```

---

## Feature #5: Multi-Level Layouts (New Implementation)

### NASA Challenge Alignment
**Challenge Statement:** "Will your tool offer options to create multiple levels within the habitat?"

**NASA Data:** `interior_layout_levels` in habitat-types.json

### Implementation Steps

#### Step 1: Add Level Selection UI
**Prompt for Claude:**
```
Add level selection to HabitatConfigurator:

1. Show available levels based on habitat type:
   - single_level: Diameter 3.0-4.0m → 1 level only
   - two_level: Diameter 4.5-6.5m → 1-2 levels
   - three_level: Diameter 7.0-8.5m → 1-3 levels (TransHab)

2. Add level selector buttons in configurator:
```
Layout Configuration
┌─────────────────────┐
│ Levels: [1] [2] [3] │  ← Enable based on diameter
│ Current: Level 1 ▼  │
└─────────────────────┘
```

3. Display level specifications from habitat-types.json:
   - Level 1: Floor at 0.0m, ceiling at 2.4m
   - Level 2: Floor at 2.5m, ceiling at 5.0m
   - Level 3: Floor at 5.6m, ceiling at 8.5m (TransHab only)

4. Show vertical cross-section diagram of habitat
```

#### Step 2: Implement Level Switching in Scene
**Prompt for Claude:**
```
Add level visualization to SceneManager:

1. Create level floor plates:
```javascript
createLevelFloors(habitatConfig) {
  const levels = habitatConfig.levels || 1;
  const levelData = this.getLevelData(habitatConfig.type, levels);

  this.levelFloors = [];

  for (let i = 0; i < levels; i++) {
    const floorGeometry = new THREE.CylinderGeometry(
      habitatConfig.width / 2,
      habitatConfig.width / 2,
      0.05,
      32
    );
    floorGeometry.rotateX(Math.PI / 2);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: i === this.currentLevel ? 0x94a3b8 : 0xe2e8f0,
      transparent: true,
      opacity: i === this.currentLevel ? 0.8 : 0.3
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = levelData[i].floor_height_m;
    floor.userData.level = i;

    this.scene.add(floor);
    this.levelFloors.push(floor);
  }
}
```

2. Add level switching controls:
   - Keyboard: 1, 2, 3 keys to switch levels
   - UI buttons: "Level 1" / "Level 2" / "Level 3"
   - Show only modules on current level
   - Dim modules on other levels (ghost view)

3. Update camera to focus on current level:
   - Adjust camera Y position to level height
   - Update orbit controls center point
```

#### Step 3: Add Stairs/Ladder Connections Between Levels
**Prompt for Claude:**
```
Add vertical circulation elements:

1. Create new module types for vertical circulation:
   - Ladder (0.5m × 0.5m footprint, height = level spacing)
   - Stairs (1.0m × 2.0m footprint, height = level spacing)
   - Elevator (1.0m × 1.0m footprint, for accessibility)

2. Add to ModuleCatalog.js:
```javascript
{
  name: 'Ladder',
  category: 'Circulation',
  dimensions: { w: 0.5, h: 2.5, d: 0.5 },
  color: 0x94a3b8,
  zone: 'neutral',
  connects_levels: true,
  vertical_span: 1  // Connects to level above
}
```

3. Validation rules:
   - Each level must have ≥1 connection to adjacent levels
   - Ladders/stairs must align vertically across levels
   - Show warning if level is inaccessible

4. Pathfinding update:
   - Crew can use ladders to move between levels
   - Update A* to support 3D pathfinding
   - Add climb animation for crew
```

#### Step 4: Update Module Placement for Multi-Level
**Prompt for Claude:**
```
Extend module placement to support multiple levels:

1. Add level property to Module.js:
```javascript
class Module extends THREE.Group {
  constructor(catalogItem, level = 0) {
    super();
    this.level = level;
    this.position.y = this.getLevelHeight(level);
    // ...
  }

  getLevelHeight(level) {
    // From habitat-types.json interior_layout_levels
    const heights = [0.0, 2.5, 5.6];
    return heights[level] || 0.0;
  }
}
```

2. Update DragControls:
   - Modules can only be dragged within their level
   - Y-position locked to level height
   - Show level indicator when dragging

3. Update validation:
   - Modules cannot overlap across levels (only within same level)
   - Each level must have adequate crew volume
   - Check total volume across all levels

4. Add "Copy to Level Above/Below" feature:
   - Right-click module → "Duplicate to Level 2"
   - Copies module to same X,Z position on different level
   - Useful for creating symmetric multi-level layouts
```

---

## Feature #6: Quantitative Volume Outputs (Enhancement)

### NASA Challenge Alignment
**Challenge Statement:** "Consider how your tool could provide quantitative outputs regarding the layout designed by the user, including floor area and volume of specific spaces."

### Implementation Steps

#### Step 1: Add Volume Calculation Engine
**Prompt for Claude:**
```
Create new file: src/validation/VolumeCalculator.js

Implement NASA-compliant volume calculations:

```javascript
export default class VolumeCalculator {
  constructor(habitatConfig, modules) {
    this.habitatConfig = habitatConfig;
    this.modules = modules;
  }

  calculateTotalHabitatVolume() {
    const { type, width, depth, height, levels } = this.habitatConfig;

    let volume = 0;

    switch(type) {
      case 'rigid_cylinder':
      case 'inflatable_beam':
        const radius = width / 2;
        volume = Math.PI * radius * radius * depth;
        break;

      case 'hybrid_transhab':
        // From IEEE TH-2023: 400 m³ total, 235 m³ habitable
        volume = this.calculateTransHabVolume();
        break;

      case 'modular_assembly':
        volume = this.calculateModularVolume();
        break;

      default:
        // Rectangular
        volume = width * depth * height;
    }

    return volume * (levels || 1);
  }

  calculateHabitableVolume() {
    // Subtract systems, stowage, voids per NASA standards
    const total = this.calculateTotalHabitatVolume();
    const habitableRatio = 0.65; // 65% habitable (NASA average)
    return total * habitableRatio;
  }

  calculateModuleVolumes() {
    // Individual module volumes
    return this.modules.map(module => ({
      name: module.name,
      footprint_m2: module.dimensions.w * module.dimensions.d,
      volume_m3: module.dimensions.w * module.dimensions.d * module.dimensions.h,
      meets_minimum: this.checkMinimumVolume(module)
    }));
  }

  calculateVolumePerCrew(crewSize) {
    const habitable = this.calculateHabitableVolume();
    return habitable / crewSize;
  }

  getNASACompliance(volumePerCrew) {
    // From nasa-constraints.json
    if (volumePerCrew >= 60) return { level: 'optimal', color: 'green' };
    if (volumePerCrew >= 50) return { level: 'recommended', color: 'green' };
    if (volumePerCrew >= 25) return { level: 'minimum', color: 'yellow' };
    return { level: 'insufficient', color: 'red' };
  }
}
```

Add to HUD display and CSV export.
```

#### Step 2: Add Visual Volume Indicators
**Prompt for Claude:**
```
Add volume visualization to HUD:

1. Create Volume Metrics Panel:
```
Volume Analysis (NASA TP-2020-220505)
┌─────────────────────────────────────┐
│ Total Pressurized:     400.0 m³     │
│ Habitable Volume:      235.0 m³     │
│ Systems/Stowage:       165.0 m³     │
│                                     │
│ Crew Size:             4 astronauts │
│ Volume per Crew:       58.8 m³/crew │
│ NASA Compliance:       ✅ Optimal   │
│                        (≥59 m³ per NASA-STD-3001)
└─────────────────────────────────────┘

Module Breakdown:
┌─────────────────────┬──────┬───────┐
│ Module              │ Area │ Vol   │
├─────────────────────┼──────┼───────┤
│ Crew Quarters (4x)  │ 7.3  │ 14.6  │
│ Exercise            │ 3.8  │ 7.5   │
│ Galley              │ 1.4  │ 2.8   │
│ Ward/Dining         │ 4.1  │ 8.1   │
│ ...                 │ ...  │ ...   │
└─────────────────────┴──────┴───────┘
Total Module Volume:    89.2 m³ (38% of habitable)
```

2. Color-code modules by volume compliance:
   - Green: Exceeds NASA minimum
   - Yellow: Meets minimum exactly
   - Red: Below minimum (critical violation)

3. Add volume heatmap view (optional toggle):
   - Overlay modules with gradient showing volume density
   - Darker = more volume allocated
```

#### Step 3: Export Volume Report
**Prompt for Claude:**
```
Add comprehensive volume report to CSVGenerator:

Create new CSV sheet "Volume Analysis":

```csv
Metric,Value,Unit,NASA Requirement,Compliance
Total Pressurized Volume,400.0,m³,N/A,N/A
Habitable Volume,235.0,m³,N/A,N/A
Systems Volume,30.0,m³,N/A,N/A
Stowage Volume,55.0,m³,N/A,N/A
Voids Volume,22.0,m³,N/A,N/A
Crew Size,4,persons,N/A,N/A
Volume per Crew,58.8,m³/crew,25.0 (min),PASS
Volume per Crew,58.8,m³/crew,50.0 (rec),PASS
Volume per Crew,58.8,m³/crew,60.0 (opt),NEAR

Module,Footprint (m²),Volume (m³),Min Required (m²),Compliance
Crew Quarters,1.85,3.70,1.82,PASS
Hygiene,1.10,2.64,1.06,PASS
WCS,0.95,2.28,0.91,PASS
Exercise,3.75,9.00,1.50,PASS
...
```

Add to existing export functionality.
```

---

## Feature #7: Enhanced UI/UX Features (Challenge Considerations)

### Implementation Steps

#### Step 1: Add Measurement Tools
**Prompt for Claude:**
```
Enhance existing PathMeasurement tool with additional measurement modes:

1. Area Measurement:
   - Click 3+ points to define polygon
   - Calculate enclosed area (m²)
   - Show if area meets NASA minimum for function

2. Volume Measurement:
   - Select a module
   - Show calculated volume
   - Compare to NASA requirement
   - Display deficit/surplus

3. Distance Measurement (existing):
   - Already implemented
   - Add "Save Measurement" to export with layout

4. UI for measurements:
```
Measurement Tools
┌─────────────────────┐
│ [Distance] [Area]   │
│ [Volume] [Clear]    │
└─────────────────────┘

Current: Distance
Points: 2
Distance: 3.45 m
NASA Path Width: ❌ Too narrow (<1.0m)
```
```

#### Step 2: Add Undo/Redo System
**Prompt for Claude:**
```
Implement undo/redo for layout changes:

1. Create LayoutHistory.js:
```javascript
export default class LayoutHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }

  pushState(layoutState) {
    // Remove any states after current index
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push(JSON.stringify(layoutState));
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return JSON.parse(this.history[this.currentIndex]);
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return JSON.parse(this.history[this.currentIndex]);
    }
    return null;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
}
```

2. Integrate in main.js:
   - Save state after every module add/move/delete
   - Ctrl+Z for undo
   - Ctrl+Y or Ctrl+Shift+Z for redo
   - Show undo/redo buttons in HUD (grayed when unavailable)

3. Track these actions:
   - Module placement
   - Module rotation
   - Module deletion
   - Object placement
   - Habitat configuration changes
```

#### Step 3: Add Tutorial/Onboarding
**Prompt for Claude:**
```
Create interactive tutorial for first-time users:

1. Create Tutorial.js with step-by-step guidance:
```javascript
const tutorialSteps = [
  {
    title: "Welcome to Habitat Harmony LS²",
    message: "Design NASA-compliant space habitats and predict crew well-being",
    highlight: null,
    action: null
  },
  {
    title: "Select a Habitat Type",
    message: "Choose from 4 NASA-validated habitat configurations",
    highlight: "#habitat-configurator",
    action: "wait_for_habitat_selection"
  },
  {
    title: "Add Modules",
    message: "Click on a module type to add it to your habitat",
    highlight: "#catalog",
    action: "wait_for_module_add"
  },
  {
    title: "Drag to Position",
    message: "Click and drag modules to arrange them. They snap to a 0.1m grid.",
    highlight: null,
    action: "wait_for_module_drag"
  },
  {
    title: "Validate Layout",
    message: "Watch the HUD for NASA compliance. Green = good, Red = violation.",
    highlight: "#hud",
    action: "wait_for_validation"
  },
  {
    title: "Run Simulation",
    message: "Click 'Run Simulation' to predict crew psychological health",
    highlight: "#run-simulation-button",
    action: "wait_for_simulation"
  },
  {
    title: "Export Results",
    message: "Export your layout and simulation data as JSON or CSV",
    highlight: "#export-section",
    action: "complete"
  }
];
```

2. Show tutorial on first visit (check localStorage)
3. Add "Show Tutorial" button in menu
4. Highlight UI elements with glowing outline
5. Block interaction until action completed (optional mode)
```

---

## Implementation Priority & Timeline

### High Priority (Complete for Competition)
1. ✅ **Feature #1: Habitat Configurator** - 4-6 hours
   - Most aligned with Challenge Objective #1
   - Enables habitat shape selection
   - Shows launch vehicle constraints

2. ✅ **Feature #2: Object Placement** - 3-4 hours
   - Directly requested in Challenge Statement
   - Adds realism and detail
   - Mass budget tracking educational

3. ✅ **Feature #3: Scenario Presets** - 2-3 hours
   - Enables quick prototyping (Challenge Objective #3)
   - Showcases NASA mission variety
   - Comparison mode is powerful demo

### Medium Priority (Post-Competition Enhancement)
4. **Feature #4: Multiple Habitat Shapes** - 6-8 hours
   - Requires significant Three.js geometry work
   - Nice-to-have but not critical for judging
   - Can demo with 1-2 shapes initially

5. **Feature #5: Multi-Level Layouts** - 5-7 hours
   - Impressive visually
   - Complex pathfinding updates
   - Good for final presentation

### Low Priority (Future Development)
6. **Feature #6: Volume Outputs** - 2-3 hours
   - Enhancement to existing validation
   - Good for technical audience

7. **Feature #7: UI/UX Features** - 3-5 hours
   - Polish and usability
   - Tutorial helpful for judges

---

## Testing & Validation Checklist

### For Each Feature
- [ ] Feature loads without errors
- [ ] No conflicts with existing features
- [ ] Performance: Maintains 60 FPS
- [ ] NASA data accuracy verified
- [ ] UI responsive and intuitive
- [ ] Export/import working
- [ ] Mobile-friendly (bonus)

### Integration Testing
- [ ] All features work together
- [ ] State management consistent
- [ ] No memory leaks
- [ ] Browser compatibility (Chrome, Firefox, Safari)

### NASA Compliance
- [ ] All constraints from nasa-constraints.json enforced
- [ ] Data citations accurate
- [ ] Calculations match NASA formulas
- [ ] Documentation references sources

---

## Success Metrics

### Technical
- ✅ All 7 features implemented without bugs
- ✅ <100ms response time for interactions
- ✅ 60 FPS rendering with 20+ modules
- ✅ Zero console errors

### Educational
- ✅ Users understand NASA habitat requirements
- ✅ Users see value of different habitat types
- ✅ Scenario comparison enlightens trade-offs

### Competition
- ✅ Demo showcases all features smoothly
- ✅ Unique value vs competitors clear
- ✅ NASA data validation evident
- ✅ Addresses all Challenge Statement objectives

---

## Final Notes

**Philosophy:** Implement features in order of:
1. **Challenge alignment** (does it address NASA's stated objectives?)
2. **Unique value** (does it differentiate from competitors?)
3. **Implementation effort** (can we do it well in time available?)

**Quality over Quantity:**
- Better to have 3 features working perfectly than 7 half-broken
- Focus on Features #1, #2, #3 first
- Polish the psychological simulation (already implemented and unique)
- Ensure all NASA data is accurate and cited

**Demo Preparation:**
- Create example layouts for each scenario
- Prepare comparison showing psychological impact differences
- Have CSV exports ready to show data export
- Practice explaining module-specific psychological impacts

---

**Document Version:** 1.0
**Created:** 2025-10-05
**For:** NASA Space Apps Challenge 2024 - Habitat Harmony LS²
**Author:** Implementation Guide for Claude Code

**Next Steps:**
1. Review this document with development team
2. Prioritize features based on time remaining
3. Begin with Feature #1 (Habitat Configurator)
4. Test each feature thoroughly before moving to next
5. Prepare final demo and presentation

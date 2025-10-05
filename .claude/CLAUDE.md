# Habitat Harmony: Lunar Stress Layout Simulator (LS²)

**"Design with empathy. Validate with NASA."**

A NASA-data-driven interactive Three.js simulator for evaluating psychological resilience in lunar habitat layouts.

---

## Project Overview

**NASA Space Apps Challenge Statement:**

Create an easy-to-use, accessible visual tool for creating and assessing space habitat layouts that enables users to:
1. Create an overall habitat design given a variety of options
2. Determine what functional areas will fit within the space and where
3. Quickly try out different options and approaches for various mission scenarios

**Our Niche Solution:**

How can **internal habitat layout and zoning** reduce **crew psychological stress** and improve **behavioral health** in long-duration lunar missions — within **NASA's volumetric and habitability constraints**?

This simulator maps spatial configuration to psychological performance using validated NASA analog and design data, addressing one of the most under-served challenges in lunar habitat design.

---

## Technology Stack

- **Three.js**: Core 3D rendering engine for habitat visualization
- **JavaScript (ES6 Modules)**: Primary programming language
- **WebGL**: Underlying graphics API for 3D rendering
- **HTML5 Canvas**: Rendering context
- **Vite**: Development server and build tool
- **lil-gui**: Parameter tweaking and mission configuration (optional Phase 2)
- **CSV Export**: Quantitative feedback generation (Phase 2)

---

## Project Structure

```
/
├── index.html               # Main HTML entry point
├── src/
│   ├── main.js              # Application entry point
│   ├── scene/
│   │   ├── SceneManager.js  # Three.js scene setup and rendering
│   │   └── GridSystem.js    # Grid and floor plate
│   ├── habitat/
│   │   ├── HabitatShell.js  # Pressure vessel geometry (12m x 8m)
│   │   ├── Module.js        # Individual room module class
│   │   └── ModuleCatalog.js # Available module definitions
│   ├── data/
│   │   ├── nasa-constraints.json  # NASA TP-2020-220505 & AIAA 2022 constraints
│   │   ├── adjacency-rules.json   # Room adjacency and isolation requirements
│   │   └── psych-model-params.json # HERA/UND mission parameters
│   ├── validation/
│   │   ├── ConstraintValidator.js # NASA constraint checking
│   │   └── AdjacencyChecker.js    # Adjacency rule validation
│   ├── controls/
│   │   ├── DragControls.js  # Custom drag-and-drop for modules
│   │   └── ModuleControls.js # Rotation and resize controls
│   ├── ui/
│   │   ├── HUD.js           # Dashboard and metrics display
│   │   ├── Catalog.js       # Module catalog UI
│   │   └── Toast.js         # Notification system
│   ├── simulation/          # Phase 2
│   │   ├── PsychModel.js    # Psychological stress calculation engine
│   │   └── MissionParams.js # HERA/UND mission parameter configs
│   └── export/              # Phase 2
│       └── CSVGenerator.js  # Quantitative output export
├── assets/                  # Future: textures, models
├── public/                  # Static files
├── package.json
├── vite.config.js
└── .gitignore
```

---

## NASA Data Foundations

### Primary Data Sources

| NASA Source | Application in Simulator |
|------------|-------------------------|
| **NASA/TP-2020-220505 — Deep Space Habitability Design Guidelines** | Quantitative volume allocations (m³ per function) and adjacency rules encoded as constraints |
| **AIAA ASCEND 2022 "Internal Layout of a Lunar Surface Habitat"** | Empirical area/volume tables: 1.82 m² sleep, 1.06 m² hygiene, etc. ([PDF](https://ntrs.nasa.gov/api/citations/20220013669/downloads/Internal%20Layout%20of%20a%20Lunar%20Surface%20Habitat.pdf)) |
| **HERA Facility Documentation (2019)** | Mission durations (30-45 days), crew size (4), lighting protocols, psychological stressor modeling |
| **UND Lunar Daytime Behavioral Study (2020)** | Behavioral metrics and flexibility parameters forming core psychometric calculations |
| **HDU / HERA Habitat Demonstration Unit (2013)** | Modular architecture validation and ergonomic flow for realistic rendering |
| **MMPACT / Moon-to-Mars Architecture (2024)** | Lunar surface construction context, power/logistics coupling |

### Key Design Constraints (NASA-Validated)

- **Minimum crew volume**: Per NASA TP-2020-220505
- **Translation path width**: ≥1.0 m (AIAA 2022)
- **Noise isolation**: Exercise ↔ Sleep separation
- **Privacy zones**: Individual crew quarters requirements (1.82 m² minimum)
- **Common areas**: Required for cohesion metrics
- **Functional adjacency**: Medical, EVA prep, hygiene, galley, waste management
- **Clean/Dirty separation**: WCS ↔ Galley must be separated; Hygiene separate from Crew Quarters

---

## Development Phases

### **Phase 1: Core Layout Builder** (MVP - Current Focus)

**Goal:** Interactive 2.5D habitat layout tool with NASA constraint validation

#### Features:
1. ✅ Three.js scene with orthographic 2.5D view
2. ✅ Grid system (0.1m minor, 1m major) in meters
3. ✅ Habitat shell outline (12m × 8m floor plate)
4. ✅ 7 essential module types:
   - Crew Quarters (1.82 m² min)
   - Hygiene (1.06 m² min)
   - WCS/Toilet (0.91 m² min)
   - Exercise (1.50 m² min)
   - Galley (0.56 m² min)
   - Ward/Dining (1.62 m² min)
   - Workstation (1.37 m² min)
5. ✅ Drag-and-drop module placement
6. ✅ Real-time NASA constraint validation:
   - Minimum area per function
   - Translation path width ≥1.0m
   - Adjacency rules (clean/dirty separation)
7. ✅ Visual feedback system:
   - Clean zones (blue: #e0f2fe)
   - Dirty zones (red: #fee2e2)
   - Flagged adjacencies (yellow: #fde68a)
8. ✅ HUD metrics:
   - Total footprint (m²)
   - Adjacency compliance (%)
   - Path width validation
9. ✅ Export/Import JSON layout files

#### Technical Components:
- `SceneManager.js`: Three.js setup, camera, lights, render loop
- `Module.js`: Individual room module with NASA constraints
- `nasa-constraints.json`: All constraint data from NASA sources
- `ConstraintValidator.js`: Real-time validation engine
- `DragControls.js`: Mouse-based module manipulation
- `HUD.js`: Live metrics display

---

### **Phase 2: Psychological Simulation** (Post-MVP)

**Goal:** Add HERA/UND psychological stress modeling

#### Features:
1. Mission configuration panel (duration, crew size, habitat type)
2. Psychological metrics calculation:
   - **Stress Level**: f(volume per crew, noise adjacency, lighting cycles, privacy index)
   - **Mood Score**: f(privacy availability, recreation access, window type)
   - **Team Cohesion**: f(common area sizing, circulation pattern)
   - **Sleep Quality**: f(privacy, adjacency compliance, lighting schedule)
3. Daily time-step simulation (45-day HERA mission)
4. Color-coded well-being heatmap visualization
5. CSV export of metrics
6. Comparison mode (multiple layouts side-by-side)

#### Mathematical Model:
```javascript
// HERA + UND Behavioral Model
stress_score = (
  αP * (1 - PrivateSleepQuarters) +
  αW * (1 - WindowType) +
  αV * (1 - VisualOrder) +
  αL * (1 - LightingScheduleCompliance) +
  αA * (1 - AdjacencyCompliance)
) * mission_duration_factor

// Where coefficients from UND study:
// αP=10, αW=6, αV=4, αL=4, αA=6
```

#### Technical Components:
- `PsychModel.js`: HERA/UND stress calculation engine
- `psych-model-params.json`: Baseline coefficients and weights
- `MissionParams.js`: Mission configuration (duration, crew, scenario)
- `WellbeingMap.js`: Heatmap visualization shader

---

### **Phase 3: Advanced Features** (Future)

1. Multiple habitat shapes (cylindrical, inflatable, modular)
2. Multi-level layouts (stacked decks)
3. ECLSS/power overhead calculations
4. Community sharing and leaderboard
5. Historical mission replay (Apollo, ISS analogs)
6. VR walkthrough mode

---

## Three.js Implementation Details

### Scene Architecture
- **Camera**: Orthographic (2.5D isometric view)
- **Grid**: Meters-based (1m major, 0.1m minor)
- **Modules**: BoxGeometry with color-coded materials
- **Controls**: OrbitControls for pan/zoom (rotation locked)
- **Raycasting**: For drag-and-drop interaction

### Key Code Patterns

```javascript
// Module creation
class HabitatModule extends THREE.Group {
  constructor(catalogItem, constraints) {
    super();
    this.name = catalogItem.name;
    this.dimensions = { w: catalogItem.w, d: catalogItem.d, h: catalogItem.h };
    this.zone = catalogItem.zone; // 'clean' or 'dirty'
    this.minArea = constraints.atomicMinArea.get(this.name);

    // Create 3D representation
    const geometry = new THREE.BoxGeometry(this.dimensions.w, this.dimensions.h, this.dimensions.d);
    const material = new THREE.MeshStandardMaterial({
      color: catalogItem.color,
      transparent: true,
      opacity: 0.85
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);
  }

  getFootprint() {
    return this.dimensions.w * this.dimensions.d;
  }

  checkAdjacency(neighbor) {
    // Validate against NASA adjacency rules
  }
}
```

### Controls Implementation
- **Drag**: Raycasting to floor plane + constraint snapping
- **Rotate**: Keyboard (R key) or button (15° increments)
- **Delete**: Keyboard (Delete/Backspace) or button

---

## Data Files Structure

### nasa-constraints.json
```json
{
  "unit_system": "SI",
  "global_circulation": {
    "crew_translation_path_min_width_m": 1.00
  },
  "atomic_functional_minima": [
    { "category": "Crew Habitation", "function": "Sleep Accommodation", "min_volume_m3": 3.64, "min_area_m2": 1.82 },
    { "category": "Hygiene", "function": "Full Body Cleaning", "min_volume_m3": 2.54, "min_area_m2": 1.06 },
    { "category": "Human Waste Collection", "function": "Solid Waste", "min_volume_m3": 2.18, "min_area_m2": 0.91 },
    { "category": "Exercise", "function": "Resistive Exercise", "min_volume_m3": 3.60, "min_area_m2": 1.50 }
  ],
  "adjacency_rules": [
    { "rule": "separate_from", "a": "Hygiene", "b": "Crew Quarters", "rationale": "Prevent cross-contamination" },
    { "rule": "separate_from", "a": "WCS", "b": "Galley", "rationale": "Reduce cross-contamination with food prep" },
    { "rule": "noise_isolate", "a": "Crew Quarters", "b": "Exercise", "rationale": "Sleep area isolation" }
  ],
  "zones": {
    "clean": ["Crew Quarters", "Galley", "Ward/Dining", "Workstation", "Medical"],
    "dirty": ["WCS", "Hygiene", "IFM/Repair", "Trash", "Exercise"]
  }
}
```

### psych-model-params.json (Phase 2)
```json
{
  "hera_context": {
    "crew_size": 4,
    "mission_days": 45,
    "isolation_protocol": "restricted_personal_comms_weekly_family_conf",
    "capabilities": {
      "adjustable_led_lighting": true,
      "virtual_window_views": true,
      "exercise_equipment": true
    }
  },
  "model_params": {
    "baselines": { "s0": 40, "s1": 25, "m0": 70, "m1": 20 },
    "damping": { "lambdaS": 0.7, "lambdaM": 0.7 },
    "weights": {
      "alphaP": 10, "alphaW": 6, "alphaV": 4, "alphaL": 4, "alphaA": 6
    }
  }
}
```

---

## Development Guidelines

### NASA Compliance
- ✅ All constraints traced to NASA documents (cite source)
- ✅ Real-time validation with educational tooltips
- ✅ Flag violations before simulation runs
- ✅ Export includes compliance report

### Code Organization
- **Modular architecture**: Separate concerns (scene, data, validation, UI)
- **Data-driven**: All constraints externalized to JSON
- **Event-driven**: User input → validation → UI update
- **Performance**: Instance geometries, dispose properly

### Performance Targets
- 60 FPS on mid-range hardware
- <100ms validation time per layout change
- Support 20+ modules in a single layout
- Smooth drag-and-drop interaction

---

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev              # Starts Vite dev server at http://localhost:5173

# Build for production
npm run build            # Outputs to /dist

# Preview production build
npm run preview
```

---

## Phase 1 Implementation Checklist

### Foundation Layer
- [ ] Project setup (Vite + Three.js)
- [ ] Basic HTML structure with grid layout
- [ ] Three.js scene initialization
- [ ] Orthographic camera setup (2.5D view)
- [ ] Grid system (meters-based)
- [ ] Floor plate (12m × 8m habitat outline)

### Data Layer
- [ ] Create `nasa-constraints.json` with all constraint data
- [ ] Create `ModuleCatalog.js` with 7 module definitions
- [ ] Validate data against NASA sources (TP-2020-220505, AIAA 2022)

### Module System
- [ ] `Module.js` class with NASA constraints
- [ ] Visual representation (BoxGeometry + colored materials)
- [ ] Module placement system
- [ ] Module selection state

### Validation Engine
- [ ] `ConstraintValidator.js` class
- [ ] Minimum area validation
- [ ] Path width calculation
- [ ] Adjacency rule checking
- [ ] Clean/dirty zone validation

### Controls
- [ ] Raycasting for mouse interaction
- [ ] Drag-and-drop module placement
- [ ] Rotate module (15° increments)
- [ ] Delete module
- [ ] Grid snapping (0.1m precision)

### UI Components
- [ ] HUD with live metrics
- [ ] Module catalog panel
- [ ] Add module buttons
- [ ] Export/Import JSON
- [ ] Toast notifications
- [ ] Error display panel

### Visual Feedback
- [ ] Color-coded modules (clean=blue, dirty=red)
- [ ] Flagged adjacencies (yellow highlight)
- [ ] Selected module outline
- [ ] Compliance indicators

---

## Success Metrics

**Technical (Phase 1):**
- ✅ 100% NASA constraint data accuracy
- ✅ Real-time validation (<100ms)
- ✅ 60 FPS rendering
- ✅ Export/Import working

**Educational:**
- ✅ Users understand NASA volume requirements
- ✅ Users see impact of adjacency rules
- ✅ Tool is intuitive and accessible

**Research (Phase 2):**
- ✅ Accurate HERA/UND model implementation
- ✅ Generates meaningful psychological metrics
- ✅ Useful for preliminary habitat design validation

---

## Resources

### Three.js
- Documentation: https://threejs.org/docs/
- Examples: https://threejs.org/examples/
- Three.js Fundamentals: https://threejs.org/manual/

### NASA Resources
- NASA Technical Reports Server (NTRS): https://ntrs.nasa.gov/
- AIAA 2022 Layout Paper: https://ntrs.nasa.gov/api/citations/20220013669/downloads/Internal%20Layout%20of%20a%20Lunar%20Surface%20Habitat.pdf
- HERA Facility: https://www.nasa.gov/analogs/hera
- Moon to Mars Architecture: https://www.nasa.gov/moon-to-mars/

### Human Factors
- NASA Human Integration Design Handbook (HIDH)
- Spacecraft Habitability Design Guidelines
- Behavioral Health and Performance (BHP) Resources

---

## Notes for Claude

### Project-Specific Guidance
- **All design decisions must trace back to NASA data sources** — cite document and section
- **Phase 1 is layout + validation only** — no psychological simulation yet
- **Educational value is paramount** — explain NASA constraints in tooltips
- **Accessibility matters** — must work on mid-range laptops
- **Use ES6 modules** — no build complexity, clean imports
- **Meters everywhere** — SI units throughout (NASA standard)

### Three.js Best Practices
- Use **OrthographicCamera** for 2.5D view
- Use **BoxGeometry** for modules (simple, performant)
- **Raycasting** against floor plane for drag-and-drop
- **Dispose geometries/materials** when removing modules
- **Color-coded materials** for clean/dirty zones
- Keep scene simple — this is layout, not rendering showcase

### Data Handling
- All NASA constraints in **nasa-constraints.json**
- Module definitions in **ModuleCatalog.js**
- No hardcoded values — everything configurable
- JSON exports include metadata (date, NASA doc versions)

### Coordinate System
- **X/Z**: Horizontal plane (habitat floor)
- **Y**: Vertical (habitat height)
- **Origin**: Center of habitat floor plate
- **Units**: Meters (SI)

### UI/UX Priorities
- **Immediate feedback** on constraint violations
- **Visual clarity** over visual fidelity
- **Educational tooltips** on hover
- **Keyboard shortcuts** for power users
- **Touch-friendly** controls (future mobile support)

---

## License & Attribution

**Open Source** (MIT License recommended)

**Mandatory Attribution:**
- NASA Technical Reports (TP-2020-220505, AIAA 2022, HERA, etc.)
- UND Lunar Daytime Behavioral Study
- Moon-to-Mars Architecture Documentation

---

**Tagline:**
> *The first open simulator translating spatial design into crew well-being — built solely on NASA analog and habitability data.*

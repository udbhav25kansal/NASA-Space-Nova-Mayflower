# Habitat Harmony LS²: Lunar Stress Layout Simulator

**"Design with empathy. Validate with NASA."**

A NASA-data-driven interactive Three.js simulator for evaluating psychological resilience in lunar habitat layouts. Built for the NASA Space Apps Challenge 2024.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![NASA Data](https://img.shields.io/badge/NASA%20Data-Validated-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 🚀 Overview

Habitat Harmony LS² is an interactive 3D layout simulator that helps designers create lunar habitat configurations while validating them against **real NASA habitability constraints**. The tool addresses a critical challenge in space habitat design: **how can internal layout and zoning reduce crew psychological stress** while maintaining compliance with NASA's volumetric and safety requirements?

### Key Features

✅ **7 NASA-Validated Module Types**
- Crew Quarters, Hygiene, WCS, Exercise, Galley, Ward/Dining, Workstation
- Each with custom 3D visualization and minimum area requirements

✅ **Real-Time NASA Constraint Validation**
- Minimum area requirements (AIAA 2022 Tables 1 & 4)
- Adjacency rules (NASA TP-2020-220505)
- Translation path width ≥1.0m
- Clean/dirty zone separation
- 12m × 8m habitat shell boundaries

✅ **Interactive 3D Layout Builder**
- Drag-and-drop module placement
- Grid snapping (0.1m precision)
- Rotate modules (R key or button)
- Delete modules (Delete key or button)
- Visual violation highlighting

✅ **Export/Import System**
- Save layouts as JSON
- Load previous configurations
- Include validation reports
- NASA source citations

---

## 📊 NASA Data Sources

All constraints are traceable to validated NASA research:

| Source | Application |
|--------|-------------|
| **NASA/TP-2020-220505** | Deep Space Habitability Design Guidelines - Volume allocations and adjacency rules |
| **AIAA ASCEND 2022** | Internal Layout of a Lunar Surface Habitat - Empirical area/volume tables |
| **HERA Facility 2019** | Mission durations, crew size, isolation protocols |
| **UND Lunar Study 2020** | Behavioral metrics and flexibility parameters |
| **HDU Documentation 2013** | Modular architecture validation |

---

## 🛠️ Installation

### Prerequisites

- Node.js 16+ and npm
- Modern web browser with WebGL support

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/habitat-harmony-ls2.git
cd habitat-harmony-ls2

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎮 Usage Guide

### Getting Started

1. **Add Modules**: Click any module tile in the left sidebar to add it to the habitat
2. **Position Modules**: Click and drag modules to move them around the 12m × 8m habitat floor
3. **Rotate**: Select a module and press `R` or click the "Rotate" button
4. **Delete**: Select a module and press `Delete` or click the "Delete" button
5. **Validate**: Real-time validation updates as you work - check the HUD for compliance

### Keyboard Controls

| Key | Action |
|-----|--------|
| `Click` | Select module |
| `Drag` | Move module |
| `R` | Rotate selected module 90° |
| `Delete` / `Backspace` | Delete selected module |
| `Esc` | Deselect module |

### Mouse Controls

- **Left Click + Drag on Canvas**: Rotate camera view
- **Scroll Wheel**: Zoom in/out
- **Left Click on Module**: Select/deselect

### Reading the HUD

The HUD (top-left panel) shows real-time metrics:

- **Total Footprint**: Sum of all module areas (m²)
- **Module Count**: Number of modules in layout
- **Adjacency Compliance**: Percentage of adjacency rules satisfied
- **Path Width ≥1.0m**: Whether all pathways meet NASA minimum width

### Understanding Violations

Modules that violate constraints are highlighted in **yellow**. Common violations:

- **Overlap**: Two modules occupy the same space
- **Out of Bounds**: Module extends beyond 12m × 8m habitat shell
- **Adjacency Violation**: Incompatible modules too close (e.g., WCS near Galley)
- **Path Width**: Gap between modules < 1.0m

---

## 🏗️ Architecture

### Project Structure

```
/
├── index.html              # Main HTML with inline styles
├── src/
│   ├── main.js            # Application entry point
│   ├── scene/
│   │   ├── SceneManager.js    # Three.js scene setup
│   │   └── GridSystem.js      # Grid and floor plate
│   ├── habitat/
│   │   ├── Module.js          # Individual module class
│   │   └── ModuleCatalog.js   # Module definitions
│   ├── validation/
│   │   └── ConstraintValidator.js  # NASA validation engine
│   ├── controls/
│   │   ├── DragControls.js    # Mouse interaction
│   │   └── ModuleControls.js  # Keyboard controls
│   ├── ui/
│   │   ├── HUD.js            # Metrics dashboard
│   │   ├── Catalog.js        # Module catalog UI
│   │   └── Toast.js          # Notifications
│   ├── export/
│   │   └── LayoutExporter.js # JSON export/import
│   └── data/
│       └── nasa-constraints.json  # NASA constraint data
├── package.json
└── vite.config.js
```

### Technology Stack

- **Three.js**: 3D rendering engine (v0.180.0)
- **Vite**: Development server and build tool (v6.3.6)
- **ES6 Modules**: Modern JavaScript architecture
- **WebGL**: Hardware-accelerated 3D graphics

### Coordinate System

- **X/Z Plane**: Horizontal floor (meters)
- **Y Axis**: Vertical height (meters)
- **Origin**: Center of habitat floor plate (0, 0, 0)
- **Units**: SI meters throughout

---

## 🔬 NASA Constraint Details

### Minimum Area Requirements (AIAA 2022)

| Module | Min Area (m²) | Min Volume (m³) | Source |
|--------|---------------|-----------------|--------|
| Crew Quarters | 1.82 | 3.64 | Table 1 |
| Hygiene | 1.06 | 2.54 | Table 1 |
| WCS | 0.91 | 2.18 | Table 1 |
| Exercise | 1.50 | 3.60 | Table 1 |
| Galley | 0.56 | 1.35 | Table 4 |
| Ward/Dining | 1.62 | 3.89 | Table 4 |
| Workstation | 1.37 | 3.29 | Table 4 |

### Adjacency Rules (NASA TP-2020-220505)

1. **Hygiene ↔ Crew Quarters**: Separate to prevent cross-contamination
2. **WCS ↔ Galley**: Separate to reduce contamination with food prep
3. **Crew Quarters ↔ Exercise**: Noise isolation for sleep area
4. **WCS ↔ Ward/Dining**: Odor and contamination separation
5. **Exercise ↔ Medical**: Noise isolation for medical procedures

### Global Requirements

- **Path Width**: All crew translation paths ≥ 1.0m
- **Habitat Shell**: 12m × 8m footprint (fixed)
- **Zone Separation**: Clean zones (living, food) vs dirty zones (waste, exercise)

---

## 🎨 Module Catalog

### Clean Zone Modules (Blue: #bae6fd)

1. **Crew Quarters** (1.4m × 1.35m)
   - Private sleep accommodation
   - Bed, pillow, storage compartment
   - Min area: 1.82 m²

2. **Galley** (0.8m × 0.7m)
   - Food preparation and warming
   - Counter, oven, water dispenser
   - Min area: 0.56 m²

3. **Ward/Dining** (1.35m × 1.2m)
   - Communal eating and meeting
   - Table with 4 chairs, display screen
   - Min area: 1.62 m²

4. **Workstation** (1.2m × 1.15m)
   - Science and mission operations
   - Desk, computer, chair
   - Min area: 1.37 m²

### Dirty Zone Modules (Red: #fecaca)

5. **Hygiene** (1.1m × 1.0m)
   - Full body cleaning
   - Shower stall, sink, faucet
   - Min area: 1.06 m²

6. **WCS** (1.0m × 0.95m)
   - Waste collection system
   - Toilet with seat, privacy panel
   - Min area: 0.91 m²

7. **Exercise** (1.3m × 1.2m)
   - Resistive exercise equipment
   - Dumbbells, mat, pull-up bar
   - Min area: 1.50 m²

---

## 🧪 Development

### Running Tests

```bash
# Currently no automated tests - manual testing via browser
npm run dev
```

### Code Style

- ES6+ JavaScript with modules
- Comprehensive JSDoc comments
- Defensive programming (null checks, try-catch)
- NASA constraint traceability in comments

### Adding New Modules

1. Add definition to `src/habitat/ModuleCatalog.js`
2. Create custom 3D mesh in `Module.js` (`create[ModuleName]Mesh()`)
3. Add constraint data to `src/data/nasa-constraints.json`
4. Cite NASA source document in comments

### Performance Optimization

- Instanced geometries for repeated shapes
- Proper disposal of Three.js objects
- Grid snapping reduces validation calls
- Event handler binding for cleanup

---

## 📝 License

MIT License - See LICENSE file for details

**Mandatory Attribution:**
- NASA Technical Reports (TP-2020-220505, AIAA 2022, etc.)
- Three.js library
- Habitat Harmony development team

---

## 🙏 Acknowledgments

- **NASA** for comprehensive habitability research and open data
- **AIAA** for empirical lunar habitat layout studies
- **Three.js** community for excellent 3D rendering framework
- **NASA Space Apps Challenge** for the opportunity

---

## 📞 Contact

For questions, issues, or contributions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/habitat-harmony-ls2/issues)
- NASA Space Apps 2024: [Challenge Page](https://www.spaceappschallenge.org/)

---

## 🧠 Phase 2: Psychological Simulation (IMPLEMENTED)

Phase 2 adds a **complete psychological simulation engine** based on HERA facility data and the UND Lunar Daytime Behavioral Study.

### Psychological Metrics

**4 Core Metrics Tracked:**
1. **Stress** (0-100, lower is better) - Based on privacy, adjacency, visual order
2. **Mood** (0-100, higher is better) - Influenced by recreation, windows, exercise
3. **Sleep Quality** (0-100, higher is better) - Affected by privacy, lighting, noise isolation
4. **Team Cohesion** (0-100, higher is better) - Driven by common areas, visual order

**Psychological Health Index (PHI):** Composite score averaging all 4 metrics (inverted stress)

### Mission Simulation

- ✅ **HERA-validated 45-day missions** with daily time-step simulation
- ✅ **8 design variables** from UND study automatically computed from layout
- ✅ **Autoregressive damping** (λ=0.7) for realistic day-to-day psychological trends
- ✅ **Baseline isolation effects** from HERA analog data

### Design Variables

| Variable | Description | Impact |
|----------|-------------|--------|
| **P** - Private Sleep Quarters | Crew Quarters / Crew Size | ⬇️ Stress, ⬆️ Mood, ⬆️ Sleep |
| **W** - Window Type | None / Digital / Physical | ⬇️ Stress, ⬆️ Mood |
| **V** - Visual Order | Layout cleanliness (no overlaps) | ⬇️ Stress, ⬆️ Cohesion |
| **L** - Lighting Compliance | Circadian rhythm adherence | ⬇️ Stress, ⬆️ Sleep |
| **A** - Adjacency Compliance | NASA adjacency rules met | ⬇️ Stress, ⬆️ Sleep, ⬆️ Cohesion |
| **R** - Recreation Area | Dining + Exercise / Total Area | ⬆️ Mood, ⬆️ Cohesion |
| **E** - Exercise Compliance | Daily HERA schedule adherence | ⬆️ Mood, ⬆️ Sleep |
| **C** - Circulation Pattern | Tree vs Loop configuration | Emergency response |

### Usage

1. **Configure Mission**: Set crew size (2/4/6), duration (30/45/60 days), window type, lighting/exercise compliance
2. **Build Layout**: Add and arrange modules using Phase 1 tools
3. **View Real-Time Metrics**: PHI and 4 psychological metrics update automatically
4. **Run 45-Day Simulation**: Click "Run 45-Day Simulation" for complete mission analysis
5. **Export CSV**: Download comprehensive metrics with 5 sections (layout, variables, daily metrics, statistics, NASA compliance)
6. **Toggle Heatmap**: Visualize stress hotspots with color-coded module overlays

### CSV Export Format

- **Section 1**: Module layout (positions, rotations, dimensions)
- **Section 2**: All 8 design variables with values and ranges
- **Section 3**: NASA compliance summary
- **Section 4**: Daily psychological metrics for all 45 days
- **Section 5**: Statistical summary (mean, min, max, std dev, final values)

### Additional NASA Data Sources (Phase 2)

| Source | Application |
|--------|-------------|
| **HERA Facility 2019** | Mission parameters, baseline psychological trends (stress 40→65, mood 70→50) |
| **UND LDT Study 2020** | Design variable weights (αP=10, αW=6, etc.) and behavioral correlations |
| **NASA TP-2020-220505** | Psychological impact of volume allocations and adjacency |

---

## 🔮 Future Enhancements (Phase 3)

Planned features for future development:

- **Layout Comparison Mode**: Save and compare multiple designs side-by-side
- **Multiple Habitat Shapes**: Cylindrical, inflatable, modular configurations
- **ECLSS Integration**: Life support system overhead calculations
- **Mission Scenarios**: Predefined lunar campaign templates (Foundational/Sustained)
- **Community Sharing**: Upload and compare layouts with leaderboard
- **VR Walkthrough**: Immersive habitat exploration with psychological annotations

---

**Built with ❤️ for NASA Space Apps Challenge 2024**

🌙 *Design habitats that help humans thrive on the Moon.*

/**
 * Habitat Harmony LS² - Main Application Entry Point
 *
 * NASA Space Apps Challenge 2024
 * Data Sources: NASA TP-2020-220505, AIAA ASCEND 2022
 *
 * Integrates all components:
 * - Three.js scene and rendering
 * - Module catalog and placement
 * - NASA constraint validation
 * - User interface and controls
 */

import SceneManager from './scene/SceneManager.js';
import GridSystem from './scene/GridSystem.js';
import TileSystem from './scene/TileSystem.js';
import ModuleCatalog from './habitat/ModuleCatalog.js';
import HabitatModule from './habitat/Module.js';
import ConstraintValidator from './validation/ConstraintValidator.js';
import DragControls from './controls/DragControls.js';
import ModuleControls from './controls/ModuleControls.js';
import HUD from './ui/HUD.js';
import Catalog from './ui/Catalog.js';
import Toast from './ui/Toast.js';
import LayoutExporter from './export/LayoutExporter.js';

// Phase 2: Psychological Simulation
import { PsychModel } from './simulation/PsychModel.js';
import { MissionParams } from './simulation/MissionParams.js';
import { WellbeingMap } from './visualization/WellbeingMap.js';
import { CSVGenerator } from './export/CSVGenerator.js';

// CorsixTH Integration: Pathfinding & Character Movement
import Pathfinder from './simulation/Pathfinder.js';
import SimulationTime from './simulation/SimulationTime.js';
import CrewMember from './entities/CrewMember.js';
import WalkAction from './entities/actions/WalkAction.js';
import IdleAction from './entities/actions/IdleAction.js';
import UseObjectAction from './entities/actions/UseObjectAction.js';
import EnterModuleAction from './entities/actions/EnterModuleAction.js';
import TileVisualization from './scene/TileVisualization.js';

// Objects
import ExerciseEquipment from './entities/objects/ExerciseEquipment.js';
import Workstation from './entities/objects/Workstation.js';
import SleepPod from './entities/objects/SleepPod.js';
import GalleyStation from './entities/objects/GalleyStation.js';

// Main Application Class
class HabitatHarmonyApp {
  constructor() {
    this.sceneManager = null;
    this.gridSystem = null;
    this.modules = [];
    this.constraints = null;
    this.validator = null;
    this.dragControls = null;
    this.moduleControls = null;
    this.hud = null;
    this.catalog = null;
    this.exporter = null;

    this.moduleIdCounter = 0;

    // Phase 2: Psychological Simulation
    this.psychModel = null;
    this.missionParams = null;
    this.wellbeingMap = null;
    this.currentDayMetrics = null;
    this.fullMissionResults = null;

    // CorsixTH Integration: Tile-based system & Pathfinding
    this.tileSystem = null;
    this.pathfinder = null;
    this.simulationTime = null;      // Simulation time system
    this.crewMembers = [];
    this.tileVisualization = null;
    this.objects = [];               // All objects in habitat
    this.objectIdCounter = 0;        // For generating unique object IDs

    // Action classes (exposed to crew members via world reference)
    this.WalkAction = WalkAction;
    this.IdleAction = IdleAction;
    this.UseObjectAction = UseObjectAction;
    this.EnterModuleAction = EnterModuleAction;

    // Object classes (exposed for spawning)
    this.ExerciseEquipment = ExerciseEquipment;
    this.Workstation = Workstation;
    this.SleepPod = SleepPod;
    this.GalleyStation = GalleyStation;
  }

  /**
   * Initialize the application
   */
  async init() {
    console.log('🚀 Habitat Harmony LS² - Initializing...');
    console.log('📊 NASA Data Sources:');
    console.log('   - NASA/TP-2020-220505: Deep Space Habitability Design Guidelines');
    console.log('   - AIAA ASCEND 2022: Internal Layout of a Lunar Surface Habitat');
    console.log('   - HERA Facility Documentation (2019)');

    try {
      // Load NASA constraints
      await this.loadConstraints();

      // Initialize Three.js scene
      this.initScene();

      // Initialize UI components
      this.initUI();

      // Initialize controls
      this.initControls();

      // Setup export/import
      this.setupExportImport();

      // Phase 2: Initialize psychological simulation
      await this.initPhase2();

      // Spawn initial crew members (CorsixTH integration)
      this.spawnCrewMembers(4);

      // Hide loading screen
      this.hideLoading();

      console.log('✅ Application initialized successfully');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.showError('Failed to initialize application: ' + error.message);
    }
  }

  /**
   * Load NASA constraints data
   */
  async loadConstraints() {
    try {
      const response = await fetch('/src/data/nasa-constraints.json');
      if (!response.ok) {
        throw new Error(`Failed to load NASA constraints: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Validate loaded data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid constraints data format');
      }

      this.constraints = data;
      this.validator = new ConstraintValidator(this.constraints);

      console.log('✅ NASA constraints loaded');

    } catch (error) {
      console.error('Failed to load constraints:', error);
      Toast.error('Failed to load NASA constraints');
      throw error;
    }
  }

  /**
   * Initialize Three.js scene
   */
  initScene() {
    const canvas = document.getElementById('c');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Create scene manager
    this.sceneManager = new SceneManager(canvas);
    this.sceneManager.init();

    // Create tile-based coordinate system (CorsixTH integration)
    // 12 tiles × 8 tiles at 1.0m per tile = 12m × 8m habitat
    this.tileSystem = new TileSystem(12, 8, 1.0);
    window.tileSystem = this.tileSystem; // For debugging

    // Create pathfinder for crew navigation
    this.pathfinder = new Pathfinder(this.tileSystem);
    window.pathfinder = this.pathfinder; // For debugging

    // Create simulation time system
    this.simulationTime = new SimulationTime();
    window.simulationTime = this.simulationTime; // For debugging

    console.log('✅ Tile system initialized (12×8 grid, 1m tiles)');
    console.log('✅ A* pathfinder initialized');
    console.log('✅ Simulation time system initialized');

    // Create tile visualization overlay
    this.tileVisualization = new TileVisualization(this.tileSystem);
    this.sceneManager.addObject(this.tileVisualization);
    window.tileViz = this.tileVisualization; // For debugging

    // Create and add grid system
    this.gridSystem = new GridSystem();
    const gridGroup = this.gridSystem.create();
    this.sceneManager.addObject(gridGroup);

    // Set update callback for crew members
    this.sceneManager.setUpdateCallback((deltaTime) => {
      this.updateCrewMembers(deltaTime);
    });

    console.log('✅ Three.js scene initialized');
  }

  /**
   * Initialize UI components
   */
  initUI() {
    // Initialize Toast notifications
    Toast.init();

    // Initialize HUD
    this.hud = new HUD(this.validator);

    // Initialize Catalog
    this.catalog = new Catalog(ModuleCatalog, (catalogItem) => {
      this.addModule(catalogItem);
    });
    this.catalog.render();

    // Setup tile visualization toggle button
    this.setupTileVisualizationToggle();

    console.log('✅ UI components initialized');
  }

  /**
   * Setup tile visualization toggle button
   */
  setupTileVisualizationToggle() {
    const tileVizBtn = document.getElementById('tileVizBtn');
    if (!tileVizBtn) return;

    tileVizBtn.addEventListener('click', () => {
      const enabled = this.tileVisualization.toggle();

      if (enabled) {
        tileVizBtn.textContent = '✅ Hide Tiles';
        tileVizBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        tileVizBtn.style.color = '#ffffff';
        Toast.show('Tile visualization enabled', 2000);
      } else {
        tileVizBtn.textContent = '🔲 Show Tiles';
        tileVizBtn.style.background = '';
        tileVizBtn.style.color = '';
        Toast.show('Tile visualization disabled', 2000);
      }
    });
  }

  /**
   * Initialize controls
   */
  initControls() {
    const scene = this.sceneManager.getScene();
    const camera = this.sceneManager.getCamera();
    const canvas = document.getElementById('c');

    // Module controls (rotate/delete)
    this.moduleControls = new ModuleControls(
      this.modules,
      scene,
      () => this.updateLayout()
    );

    // Drag controls with selection change callback and tile system
    this.dragControls = new DragControls(
      camera,
      scene,
      canvas,
      this.modules,
      this.validator,
      this.gridSystem,
      () => this.updateLayout(),
      (selectedModule) => {
        // Sync selection to ModuleControls
        this.moduleControls.setSelectedModule(selectedModule);
      },
      this.tileSystem  // Pass tile system for tile snapping
    );

    console.log('✅ Controls initialized');
  }

  /**
   * Setup export/import functionality
   */
  setupExportImport() {
    this.exporter = new LayoutExporter();

    // Setup export button
    const exportBtn = document.getElementById('exportBtn');
    this.exporter.setupExportButton(exportBtn, () => {
      const shellDims = this.gridSystem.getHabitatDimensions();
      const report = this.hud.getLastReport() || this.validator.validateLayout(this.modules, shellDims);

      return {
        modules: this.modules,
        validationReport: report,
        shellDimensions: shellDims
      };
    });

    // Setup import file input
    const importFile = document.getElementById('importFile');
    this.exporter.setupFileInput(
      importFile,
      (data) => this.importLayout(data),
      (error) => console.error('Import error:', error)
    );

    console.log('✅ Export/Import setup complete');
  }

  /**
   * Add a module to the layout
   * @param {Object} catalogItem - Module definition from catalog
   */
  addModule(catalogItem) {
    try {
      if (!catalogItem) {
        console.error('Invalid catalog item');
        Toast.error('Cannot add module: Invalid item');
        return;
      }

      // Generate unique ID
      const id = `module_${this.moduleIdCounter++}`;

      // Create module (with tile system support)
      const module = new HabitatModule(catalogItem, id, this.constraints, this.tileSystem);

      if (!module) {
        throw new Error('Failed to create module');
      }

      // Add to scene
      this.sceneManager.addObject(module);

      // Add to modules array
      this.modules.push(module);

      // Populate module with appropriate objects
      this.populateModuleObjects(module);

      // Update drag controls with new modules array
      if (this.dragControls) {
        this.dragControls.setModules(this.modules);

        // Select the new module
        this.dragControls.selectModule(module);
      }

      if (this.moduleControls) {
        this.moduleControls.setSelectedModule(module);
      }

      // Update layout
      this.updateLayout();

      Toast.success(`Added ${catalogItem.name || 'Module'}`);
      console.log(`➕ Added module: ${catalogItem.name || 'Unknown'} (ID: ${id})`);
    } catch (error) {
      console.error('Error adding module:', error);
      Toast.error('Failed to add module');
    }
  }

  /**
   * Import layout from JSON data
   * @param {Object} data - Imported layout data
   */
  importLayout(data) {
    // Clear existing modules
    this.clearLayout();

    // Recreate modules from data
    data.modules.forEach(moduleData => {
      // Find catalog item by name
      const catalogItem = ModuleCatalog.find(c => c.name === moduleData.name);

      if (!catalogItem) {
        console.warn(`Unknown module type: ${moduleData.name}`);
        return;
      }

      // Create module (with tile system support)
      const module = new HabitatModule(catalogItem, moduleData.id, this.constraints, this.tileSystem);

      // Set position
      module.updatePosition(
        moduleData.position.x,
        moduleData.position.y,
        moduleData.position.z
      );

      // Set rotation
      const targetRotation = moduleData.rotation || 0;
      while (module.rotationAngle !== targetRotation) {
        module.rotate90();
      }

      // Add to scene and array
      this.sceneManager.addObject(module);
      this.modules.push(module);
    });

    // Update controls and layout
    this.dragControls.setModules(this.modules);
    this.updateLayout();

    console.log(`📥 Imported ${data.modules.length} modules`);
  }

  /**
   * Clear all modules from layout
   */
  clearLayout() {
    // Remove all modules
    this.modules.forEach(module => {
      this.sceneManager.removeObject(module);
      module.dispose();
    });

    this.modules = [];
    this.dragControls.setModules(this.modules);
    this.moduleControls.setSelectedModule(null);

    this.updateLayout();

    console.log('🗑️ Layout cleared');
  }

  /**
   * Update layout validation and UI
   */
  updateLayout() {
    const shellDims = this.gridSystem.getHabitatDimensions();

    // Update HUD with validation
    this.hud.update(this.modules, shellDims);

    // Update catalog counts
    this.catalog.updateCounts(this.modules);

    // Update tile visualization
    if (this.tileVisualization) {
      this.tileVisualization.update();
    }

    // Update all module violation states based on validation
    const report = this.hud.getLastReport();
    if (report) {
      // Clear all violation states
      this.modules.forEach(m => m.setViolating(false));

      // Set violation states for modules involved in violations
      report.violations.forEach(violation => {
        const moduleA = this.modules.find(m => m.moduleName === violation.moduleA);
        const moduleB = this.modules.find(m => m.moduleName === violation.moduleB);

        if (moduleA) moduleA.setViolating(true);
        if (moduleB) moduleB.setViolating(true);
      });
    }

    // Phase 2: Update psychological metrics when layout changes
    if (this.psychModel && this.missionParams) {
      this.updatePsychMetrics();
    }
  }

  /**
   * Hide loading screen
   */
  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      setTimeout(() => {
        loading.classList.add('hidden');
      }, 500);
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `<div style="color: #dc2626;">${message}</div>`;
    }
    console.error(message);
  }

  /**
   * Spawn crew members in the habitat
   */
  spawnCrewMembers(count = 4) {
    console.log(`👨‍🚀 Spawning ${count} crew members...`);

    const names = ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis', 'Finley'];

    for (let i = 0; i < count; i++) {
      const name = names[i] || `Crew ${i + 1}`;

      // Find a random passable tile
      const passableTiles = this.tileSystem.getPassableTiles();

      if (passableTiles.length === 0) {
        console.warn('No passable tiles available for crew spawn');
        return;
      }

      const randomTile = passableTiles[Math.floor(Math.random() * passableTiles.length)];

      // Create crew member
      const crewMember = new CrewMember(this, name, randomTile.x, randomTile.y);

      // Add to scene
      this.sceneManager.addObject(crewMember);

      // Add to crew array
      this.crewMembers.push(crewMember);

      console.log(`✅ Spawned ${name} at tile (${randomTile.x}, ${randomTile.y})`);
    }
  }

  /**
   * Update crew members (called each frame)
   */
  updateCrewMembers(deltaTime) {
    // Update simulation time
    if (this.simulationTime) {
      this.simulationTime.update(deltaTime);
    }

    // Update crew members
    this.crewMembers.forEach(crewMember => {
      crewMember.update(deltaTime);
    });
  }

  /**
   * Get object by ID (for UseObjectAction)
   */
  getObjectById(objectId) {
    return this.objects.find(obj => obj.objectId === objectId) || null;
  }

  /**
   * Get module by ID (for EnterModuleAction)
   */
  getModuleById(moduleId) {
    return this.modules.find(m => m.moduleId === moduleId) || null;
  }

  /**
   * Spawn object in module
   * @param {string} objectType - Type of object ('exercise_equipment', 'workstation', etc.)
   * @param {HabitatModule} module - Module to place object in
   * @param {number} tileX - Tile X position (relative to module)
   * @param {number} tileY - Tile Y position (relative to module)
   */
  spawnObject(objectType, module, tileX, tileY) {
    const objectId = `obj_${this.objectIdCounter++}`;
    let object;

    switch (objectType) {
      case 'exercise_equipment':
        object = new ExerciseEquipment(objectId, tileX, tileY, module.moduleId);
        break;
      case 'workstation':
        object = new Workstation(objectId, tileX, tileY, module.moduleId);
        break;
      case 'sleep_pod':
        object = new SleepPod(objectId, tileX, tileY, module.moduleId);
        break;
      case 'galley_station':
        object = new GalleyStation(objectId, tileX, tileY, module.moduleId);
        break;
      default:
        console.warn(`Unknown object type: ${objectType}`);
        return null;
    }

    // Store module reference
    object.module = module;

    // Position object in world
    if (module.tileSystem) {
      const worldTileX = module.tileX + tileX;
      const worldTileY = module.tileY + tileY;
      const worldPos = module.tileSystem.tileToWorld(worldTileX, worldTileY);
      object.position.set(worldPos.x, 0, worldPos.z);
    }

    // Add to module
    module.add(object);
    module.objects.push(object);

    // Add to global objects array
    this.objects.push(object);

    console.log(`✅ Spawned ${objectType} in ${module.moduleName} at tile (${tileX}, ${tileY})`);
    return object;
  }

  /**
   * Populate a single module with appropriate objects
   * @param {HabitatModule} module - Module to populate
   */
  populateModuleObjects(module) {
    if (!module || !module.tileSystem) return;

    const moduleName = module.moduleName;
    const centerTile = module.getCenterTile();

    // Add objects based on module type
    if (moduleName === 'Exercise') {
      this.spawnObject('exercise_equipment', module, centerTile.x, centerTile.y);
    } else if (moduleName === 'Crew Quarters') {
      this.spawnObject('sleep_pod', module, centerTile.x, centerTile.y);
    } else if (moduleName === 'Workstation') {
      this.spawnObject('workstation', module, centerTile.x, centerTile.y);
    } else if (moduleName === 'Galley') {
      this.spawnObject('galley_station', module, centerTile.x, centerTile.y);
    }

    console.log(`✅ Populated ${moduleName} with objects`);
  }

  /**
   * Auto-populate all modules with appropriate objects
   */
  autoPopulateObjects() {
    this.modules.forEach(module => {
      this.populateModuleObjects(module);
    });

    console.log(`✅ Auto-populated ${this.objects.length} objects`);
  }

  /**
   * Phase 2: Initialize psychological simulation system
   */
  async initPhase2() {
    console.log('🧠 Initializing Phase 2: Psychological Simulation...');

    try {
      // Load psych model parameters
      const response = await fetch('/src/data/psych-model-params.json');
      if (!response.ok) {
        throw new Error(`Failed to load psych model params: ${response.status}`);
      }
      const psychModelParams = await response.json();

      // Initialize PsychModel with HERA+UND parameters
      this.psychModel = new PsychModel(psychModelParams);
      this.missionParams = new MissionParams();
      this.wellbeingMap = new WellbeingMap(this.sceneManager);
    } catch (error) {
      console.error('Failed to initialize Phase 2:', error);
      Toast.error('Failed to load psychological model parameters');
      throw error;
    }

    // Setup event handlers for mission config controls
    this.setupMissionConfigHandlers();

    // Initialize with default metrics
    this.updatePsychMetrics();

    console.log('✅ Phase 2 initialized successfully');
  }

  /**
   * Setup event handlers for mission configuration UI
   */
  setupMissionConfigHandlers() {
    // Crew size
    const crewSizeEl = document.getElementById('crewSize');
    if (crewSizeEl) {
      crewSizeEl.addEventListener('change', (e) => {
        this.missionParams.updateConfig({ crewSize: parseInt(e.target.value) });
        this.updatePsychMetrics();
      });
    }

    // Mission days
    const missionDaysEl = document.getElementById('missionDays');
    if (missionDaysEl) {
      missionDaysEl.addEventListener('change', (e) => {
        const days = parseInt(e.target.value);
        this.missionParams.updateConfig({ missionDays: days });

        // Update current day slider max
        const currentDayEl = document.getElementById('currentDay');
        if (currentDayEl) {
          currentDayEl.max = days;
          if (parseInt(currentDayEl.value) > days) {
            currentDayEl.value = days;
            document.getElementById('currentDayVal').textContent = `Day ${days}`;
          }
        }

        this.updatePsychMetrics();
      });
    }

    // Window type
    const windowTypeEl = document.getElementById('windowType');
    if (windowTypeEl) {
      windowTypeEl.addEventListener('change', (e) => {
        this.missionParams.updateConfig({ windowType: parseFloat(e.target.value) });
        this.updatePsychMetrics();
      });
    }

    // Circulation pattern
    const circulationEl = document.getElementById('circulationPattern');
    if (circulationEl) {
      circulationEl.addEventListener('change', (e) => {
        this.missionParams.updateConfig({ circulationPattern: parseInt(e.target.value) });
        this.updatePsychMetrics();
      });
    }

    // Lighting compliance slider
    const lightingEl = document.getElementById('lightingCompliance');
    const lightingValEl = document.getElementById('lightingComplianceVal');
    if (lightingEl && lightingValEl) {
      lightingEl.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        lightingValEl.textContent = Math.round(val * 100) + '%';
        this.missionParams.updateConfig({ lightingCompliance: val });
        this.updatePsychMetrics();
      });
    }

    // Exercise compliance slider
    const exerciseEl = document.getElementById('exerciseCompliance');
    const exerciseValEl = document.getElementById('exerciseComplianceVal');
    if (exerciseEl && exerciseValEl) {
      exerciseEl.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        exerciseValEl.textContent = Math.round(val * 100) + '%';
        this.missionParams.updateConfig({ exerciseCompliance: val });
        this.updatePsychMetrics();
      });
    }

    // Current day slider
    const currentDayEl = document.getElementById('currentDay');
    const currentDayValEl = document.getElementById('currentDayVal');
    if (currentDayEl && currentDayValEl) {
      currentDayEl.addEventListener('input', (e) => {
        const day = parseInt(e.target.value);
        currentDayValEl.textContent = `Day ${day}`;
        this.updatePsychMetrics();
      });
    }

    // Run simulation button
    const runSimBtn = document.getElementById('runSimulationBtn');
    if (runSimBtn) {
      runSimBtn.addEventListener('click', () => {
        this.runFullMissionSimulation();
      });
    }

    // Export CSV button
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        this.exportMetricsCSV();
      });
    }

    // Heatmap toggle button
    const heatmapBtn = document.getElementById('heatmapToggle');
    if (heatmapBtn) {
      heatmapBtn.addEventListener('click', () => {
        const enabled = this.wellbeingMap.toggle(this.modules);

        if (enabled && this.currentDayMetrics) {
          const designVars = this.missionParams.computeDesignVariables(
            this.modules,
            this.validator
          );
          this.wellbeingMap.updateHeatmap(
            this.currentDayMetrics.stress,
            designVars,
            this.modules
          );
          Toast.show('Stress Heatmap enabled', 2000);
        } else {
          Toast.show('Stress Heatmap disabled', 2000);
        }
      });
    }
  }

  /**
   * Update psychological metrics for current layout and mission day
   */
  updatePsychMetrics() {
    try {
      const currentDay = parseInt(document.getElementById('currentDay')?.value || 15);

      // Compute design variables from current layout
      const designVars = this.missionParams.computeDesignVariables(
        this.modules,
        this.validator
      );

      // Simulate up to current day (with damping)
      let previousMetrics = null;
      for (let day = 1; day <= currentDay; day++) {
        this.currentDayMetrics = this.psychModel.simulateDay(
          designVars,
          day,
          previousMetrics
        );
        previousMetrics = this.currentDayMetrics;
      }

      // Calculate PHI
      const phi = this.psychModel.calculatePHI(this.currentDayMetrics);

      // Update UI
      this.updateMetricsDisplay(this.currentDayMetrics, phi);

    } catch (error) {
      console.error('Error updating psychological metrics:', error);
    }
  }

  /**
   * Update metrics display in UI
   */
  updateMetricsDisplay(metrics, phi) {
    try {
      // PHI
      const phiEl = document.getElementById('phi');
      if (phiEl) {
        phiEl.textContent = phi.toFixed(1);
        phiEl.style.color = this.getPHIColor(phi);
      }

      // Stress
      const stressEl = document.getElementById('stressVal');
      if (stressEl) {
        stressEl.textContent = metrics.stress.toFixed(1);
        stressEl.style.color = this.getStressColor(metrics.stress);
      }

      // Mood
      const moodEl = document.getElementById('moodVal');
      if (moodEl) {
        moodEl.textContent = metrics.mood.toFixed(1);
        moodEl.style.color = this.getMoodColor(metrics.mood);
      }

      // Sleep Quality
      const sleepEl = document.getElementById('sleepQualityVal');
      if (sleepEl) {
        sleepEl.textContent = metrics.sleepQuality.toFixed(1);
        sleepEl.style.color = this.getSleepColor(metrics.sleepQuality);
      }

      // Cohesion
      const cohesionEl = document.getElementById('cohesionVal');
      if (cohesionEl) {
        cohesionEl.textContent = metrics.cohesion.toFixed(1);
        cohesionEl.style.color = this.getCohesionColor(metrics.cohesion);
      }

    } catch (error) {
      console.error('Error updating metrics display:', error);
    }
  }

  /**
   * Run full 45-day mission simulation
   */
  runFullMissionSimulation() {
    try {
      Toast.show('Running 45-day simulation...', 1500);

      // Compute design variables
      const designVars = this.missionParams.computeDesignVariables(
        this.modules,
        this.validator
      );

      // Run full simulation
      this.fullMissionResults = this.psychModel.simulateMission(designVars);

      // Update UI to show day 45 results
      const currentDayEl = document.getElementById('currentDay');
      const currentDayValEl = document.getElementById('currentDayVal');
      if (currentDayEl && currentDayValEl) {
        currentDayEl.value = this.missionParams.missionDays;
        currentDayValEl.textContent = `Day ${this.missionParams.missionDays}`;
      }

      // Get final day metrics
      this.currentDayMetrics = this.fullMissionResults[this.fullMissionResults.length - 1];
      const phi = this.currentDayMetrics.psychHealthIndex;

      this.updateMetricsDisplay(this.currentDayMetrics, phi);

      Toast.show(`Simulation complete! Final PHI: ${phi.toFixed(1)}`, 3000);

    } catch (error) {
      console.error('Error running mission simulation:', error);
      Toast.show('Simulation failed. Check console for errors.', 3000);
    }
  }

  /**
   * Color coding functions for metrics
   */
  getPHIColor(phi) {
    if (phi >= 65) return '#059669'; // Green (optimal)
    if (phi >= 50) return '#d97706'; // Amber (warning)
    return '#dc2626'; // Red (critical)
  }

  getStressColor(stress) {
    if (stress <= 40) return '#059669'; // Low stress = good
    if (stress <= 60) return '#d97706'; // Medium stress = warning
    return '#dc2626'; // High stress = critical
  }

  getMoodColor(mood) {
    if (mood >= 60) return '#059669'; // High mood = good
    if (mood >= 40) return '#d97706'; // Medium mood = warning
    return '#dc2626'; // Low mood = critical
  }

  getSleepColor(sleep) {
    if (sleep >= 60) return '#059669';
    if (sleep >= 40) return '#d97706';
    return '#dc2626';
  }

  getCohesionColor(cohesion) {
    if (cohesion >= 60) return '#059669';
    if (cohesion >= 40) return '#d97706';
    return '#dc2626';
  }

  /**
   * Export metrics to CSV
   */
  exportMetricsCSV() {
    try {
      // Check if simulation has been run
      if (!this.fullMissionResults || this.fullMissionResults.length === 0) {
        Toast.show('Please run 45-day simulation first!', 3000);
        return;
      }

      // Gather all data
      const designVars = this.missionParams.computeDesignVariables(
        this.modules,
        this.validator
      );

      // Get constraint report from HUD
      const hudReport = this.hud.getLastReport();
      const constraintReport = {
        adjacencyCompliance: designVars.adjacencyCompliance,
        pathWidthOk: hudReport?.pathWidthOk !== false
      };

      // Generate CSV
      const csv = CSVGenerator.generateCSV(
        this.modules,
        designVars,
        this.fullMissionResults,
        constraintReport
      );

      if (csv) {
        // Download
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `habitat-harmony-${timestamp}.csv`;
        CSVGenerator.downloadCSV(csv, filename);

        Toast.show(`Exported metrics to ${filename}`, 3000);
      } else {
        Toast.show('CSV export failed. Check console for errors.', 3000);
      }

    } catch (error) {
      console.error('Error exporting CSV:', error);
      Toast.show('CSV export failed. Check console for errors.', 3000);
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new HabitatHarmonyApp();
  await app.init();

  // Expose app to window for debugging
  window.habitatApp = app;
});

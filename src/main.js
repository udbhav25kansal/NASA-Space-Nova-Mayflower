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

import * as THREE from 'three';
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
import HabitatConfigurator from './ui/HabitatConfigurator.js';
import ObjectCatalog from './ui/ObjectCatalog.js';
import PathMeasurement from './ui/PathMeasurement.js';
import ScenarioLoader from './ui/ScenarioLoader.js';
import LayoutExporter from './export/LayoutExporter.js';

// Phase 2: Psychological Simulation
import { PsychModel } from './simulation/PsychModel.js';
import { MissionParams } from './simulation/MissionParams.js';
import { WellbeingMap } from './visualization/WellbeingMap.js';
import { CSVGenerator } from './export/CSVGenerator.js';

// Mars-Sim Integration: NASA-Validated Psychological Features
import { SleepModel } from './simulation/SleepModel.js';
import { MissionSimulator } from './simulation/MissionSimulator.js';
import { RecreationValidator } from './validation/RecreationValidator.js';
import { PrivacyValidator } from './validation/PrivacyValidator.js';

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
    this.habitatConfigurator = null;
    this.objectCatalog = null;
    this.pathMeasurement = null;
    this.scenarioLoader = null;
    this.exporter = null;

    this.moduleIdCounter = 0;

    // Phase 2: Psychological Simulation
    this.psychModel = null;
    this.missionParams = null;
    this.wellbeingMap = null;
    this.currentDayMetrics = null;
    this.fullMissionResults = null;

    // Mars-Sim Components (NASA-validated psychological features)
    this.sleepModel = null;
    this.missionSimulator = null;
    this.recreationValidator = null;
    this.privacyValidator = null;
    this.crew = []; // Separate from crewMembers (pathfinding)
    this.crewAssignments = {}; // Maps crew ID to module ID

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

    // Habitat Configurator temporarily disabled
    // this.habitatConfigurator = new HabitatConfigurator((config) => {
    //   this.updateHabitatConfiguration(config);
    // });
    // this.habitatConfigurator.render();

    // Initialize Catalog
    this.catalog = new Catalog(ModuleCatalog, (catalogItem) => {
      this.addModule(catalogItem);
    });
    this.catalog.render();

    // Initialize Path Measurement
    this.pathMeasurement = new PathMeasurement(
      this.sceneManager,
      this.sceneManager.getCamera(),
      this.tileSystem,
      this.validator
    );

    // Advanced features temporarily disabled for stability
    // this.objectCatalog = new ObjectCatalog((objectDef) => { this.addObject(objectDef); });
    // this.scenarioLoader = new ScenarioLoader(...);

    // Setup tile visualization toggle button
    this.setupTileVisualizationToggle();

    // Setup path measurement button
    this.setupPathMeasurementButton();

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
   * Setup path measurement toggle button
   */
  setupPathMeasurementButton() {
    const pathBtn = document.getElementById('pathMeasureBtn');
    if (!pathBtn) return;

    pathBtn.addEventListener('click', () => {
      const enabled = this.pathMeasurement.toggle();

      if (enabled) {
        pathBtn.textContent = '📏 Measuring...';
        pathBtn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        pathBtn.style.color = '#ffffff';
        Toast.show('Click points to measure path', 3000);
      } else {
        pathBtn.textContent = '📏 Measure Path';
        pathBtn.style.background = '';
        pathBtn.style.color = '';
      }
    });

    // ESC key to clear path
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.pathMeasurement.isActive) {
        this.pathMeasurement.clear();
      }
    });

    // Click to add path points
    const canvas = document.getElementById('c');
    canvas.addEventListener('click', (e) => {
      if (!this.pathMeasurement.isActive) return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.sceneManager.getCamera());

      // Raycast to floor
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(floorPlane, intersection);

      if (intersection) {
        this.pathMeasurement.addPoint(intersection);
      }
    });
  }

  /**
   * Update habitat configuration (Gap #1: Habitat customization)
   * @param {Object} config - Habitat configuration from HabitatConfigurator
   */
  updateHabitatConfiguration(config) {
    console.log('🏗️ Updating habitat configuration:', config);

    // Update grid system dimensions
    this.gridSystem.updateHabitatSize(config);

    // Update tile system dimensions (width and depth in tiles)
    const widthTiles = Math.round(config.width / this.tileSystem.tileSize);
    const depthTiles = Math.round(config.depth / this.tileSystem.tileSize);
    this.tileSystem.resize(widthTiles, depthTiles);

    // Update pathfinder with new tile system
    this.pathfinder = new Pathfinder(this.tileSystem);
    window.pathfinder = this.pathfinder;

    // Update tile visualization
    this.sceneManager.removeObject(this.tileVisualization);
    this.tileVisualization = new TileVisualization(this.tileSystem);
    this.sceneManager.addObject(this.tileVisualization);
    window.tileViz = this.tileVisualization;

    // Revalidate all modules with new dimensions
    this.updateLayout();

    // Show notification
    const habitatType = this.habitatConfigurator?.currentConfig?.type || 'custom';
    Toast.show(`Habitat updated: ${config.width}m × ${config.depth}m (${habitatType})`, 3000);

    console.log(`✅ Habitat configuration updated`);
    console.log(`   Dimensions: ${config.width}m × ${config.depth}m × ${config.height}m`);
    console.log(`   Levels: ${config.levels}`);
    console.log(`   Tiles: ${widthTiles} × ${depthTiles}`);
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
   * Add an object to the habitat (Gap #3: Object placement)
   * @param {Object} objectDef - Object definition from catalog
   */
  addObject(objectDef) {
    try {
      if (!objectDef) {
        console.error('Invalid object definition');
        Toast.error('Cannot add object: Invalid definition');
        return;
      }

      // Generate unique ID
      const id = `object_${this.objectIdCounter++}`;

      // Create Three.js mesh for the object
      const geometry = new THREE.BoxGeometry(
        objectDef.dimensions_m.width,
        objectDef.dimensions_m.height,
        objectDef.dimensions_m.depth
      );

      const material = new THREE.MeshStandardMaterial({
        color: 0xffa500,  // Orange for objects
        transparent: true,
        opacity: 0.7
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Position at center initially (user will drag)
      mesh.position.set(0, objectDef.dimensions_m.height / 2, 0);

      // Add custom properties
      mesh.userData = {
        id,
        type: 'placeable_object',
        objectDef,
        mass_kg: objectDef.mass_kg,
        resizable: objectDef.resizable || false,
        currentScale: 1.0
      };

      // Add to scene
      this.sceneManager.addObject(mesh);

      // Add to objects array
      this.objects.push(mesh);

      Toast.success(`Added ${objectDef.name} (${objectDef.mass_kg} kg)`);
      console.log(`➕ Added object: ${objectDef.name} (ID: ${id})`);

    } catch (error) {
      console.error('Error adding object:', error);
      Toast.error('Failed to add object');
    }
  }

  /**
   * Load a mission scenario preset (Gap #5: Mission scenarios)
   * @param {Object} scenario - Scenario definition
   */
  loadMissionScenario(scenario) {
    console.log('🎯 Loading mission scenario:', scenario.name);

    // Clear current layout
    this.clearLayout();

    // Apply habitat configuration
    if (this.habitatConfigurator && scenario.habitat_config) {
      this.habitatConfigurator.currentConfig = scenario.habitat_config;
      this.updateHabitatConfiguration(scenario.habitat_config);
    }

    // Add required modules (with small delay for visual effect)
    scenario.required_modules.forEach((moduleName, index) => {
      setTimeout(() => {
        const catalogItem = ModuleCatalog.find(m => m.name === moduleName);
        if (catalogItem) {
          this.addModule(catalogItem);
        }
      }, index * 100);
    });

    // Show notification
    Toast.show(`Loaded: ${scenario.name} (${scenario.crew_size} crew, ${scenario.mission_duration_days} days)`, 4000);
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

    // NEW Mars-Sim Validations
    if (this.recreationValidator && this.privacyValidator && this.crew.length > 0) {
      this.autoAssignCrew();

      const layout = this.getLayoutForValidation();

      // Privacy validation
      const privacyResult = this.privacyValidator.validatePrivacy(layout, this.crew);

      // Recreation validation
      const recreationResult = this.recreationValidator.validateRecreationSpace(
        layout,
        this.crew.length
      );

      // Log compliance status (optional - add to HUD display later)
      console.log('Privacy Compliance:', privacyResult.compliance ? '✅' : '❌');
      console.log('Recreation Compliance:', recreationResult.compliance ? '✅' : '❌');
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

    // Position object RELATIVE to module (since it will be added as a child)
    // tileX and tileY are relative to module's bottom-left corner
    if (module.tileSystem) {
      const tileSize = module.tileSystem.tileSize;
      // Convert relative tile coordinates to relative world position
      const relativeX = (tileX - module.tileWidth / 2) * tileSize;
      const relativeZ = (tileY - module.tileHeight / 2) * tileSize;
      object.position.set(relativeX, 0, relativeZ);
    }

    // Add to module (as a child, so position is relative to module)
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

    // Calculate RELATIVE center tile (relative to module's bottom-left corner)
    const relativeCenterX = Math.floor(module.tileWidth / 2);
    const relativeCenterY = Math.floor(module.tileHeight / 2);

    // Add objects based on module type
    if (moduleName === 'Exercise') {
      this.spawnObject('exercise_equipment', module, relativeCenterX, relativeCenterY);
    } else if (moduleName === 'Crew Quarters') {
      this.spawnObject('sleep_pod', module, relativeCenterX, relativeCenterY);
    } else if (moduleName === 'Workstation') {
      this.spawnObject('workstation', module, relativeCenterX, relativeCenterY);
    } else if (moduleName === 'Galley') {
      this.spawnObject('galley_station', module, relativeCenterX, relativeCenterY);
    }

    console.log(`✅ Populated ${moduleName} with objects at relative tile (${relativeCenterX}, ${relativeCenterY})`);
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
   * Initialize default crew (HERA baseline: 4 crew)
   */
  initializeCrew() {
    const defaultCrew = this.constraints.crew_configuration_defaults.standard_crew;

    this.crew = defaultCrew.composition.map((member, index) => ({
      id: `crew-${index + 1}`,
      name: member.role,
      role: member.role,
      gender: member.gender,
      state: {
        stress: 40,
        mood: 70,
        sleepQuality: 70,
        cohesion: 70,
        performance: 1.0
      }
    }));

    console.log(`👥 Initialized ${this.crew.length} crew members for psychological simulation`);
  }

  /**
   * Auto-assign crew to available crew quarters
   */
  autoAssignCrew() {
    this.crewAssignments = {};

    const crewQuarters = this.modules.filter(m => m.moduleName === 'Crew Quarters');

    if (crewQuarters.length === 0) {
      console.warn('No crew quarters available for assignment');
      return;
    }

    // Assign crew to quarters (1 per quarters ideally, 2 max)
    let quarterIndex = 0;
    let occupancyCount = {};

    for (const member of this.crew) {
      if (quarterIndex >= crewQuarters.length) {
        quarterIndex = 0; // Start sharing quarters
      }

      const quarters = crewQuarters[quarterIndex];
      occupancyCount[quarters.id] = (occupancyCount[quarters.id] || 0) + 1;

      this.crewAssignments[member.id] = {
        moduleId: quarters.id,
        moduleName: quarters.moduleName
      };

      // Move to next quarters if this one has 2 occupants
      if (occupancyCount[quarters.id] >= 2) {
        quarterIndex++;
      }
    }

    console.log('🛏️ Crew auto-assigned to quarters');
  }

  /**
   * Create layout object for validators and simulator
   */
  getLayoutForValidation() {
    return {
      modules: this.modules.map(m => ({
        id: m.id,
        name: m.moduleName,
        dimensions: {
          w: m.width,
          d: m.depth,
          h: m.height
        },
        position: {
          x: m.mesh.position.x,
          z: m.mesh.position.z
        },
        zone: m.zone
      })),
      crewAssignments: this.crewAssignments,
      windowType: this.missionParams?.windowType || 0.5,
      visualOrder: 0.8,
      lightingScheduleCompliance: this.missionParams?.lightingCompliance || 0.8,
      exerciseCompliance: this.missionParams?.exerciseCompliance || 0.7,
      adjacencyCompliance: this.validator.calculateAdjacencyCompliance(this.modules)
    };
  }

  /**
   * Phase 2: Initialize psychological simulation system
   */
  async initPhase2() {
    console.log('🧠 Initializing Phase 2: Psychological Simulation with Mars-Sim enhancements...');

    try {
      // Load psych model parameters
      const response = await fetch('/src/data/psych-model-params.json');
      if (!response.ok) {
        throw new Error(`Failed to load psych model params: ${response.status}`);
      }
      const psychModelParams = await response.json();

      // Load module psychological impacts
      const impactsResponse = await fetch('/src/data/module-psychological-impacts.json');
      if (impactsResponse.ok) {
        this.moduleImpacts = await impactsResponse.json();
        console.log('✅ Module psychological impacts loaded');
      } else {
        console.warn('⚠️ Could not load module impacts, using defaults');
        this.moduleImpacts = null;
      }

      // Initialize EXISTING PsychModel with HERA+UND parameters
      this.psychModel = new PsychModel(psychModelParams);
      this.missionParams = new MissionParams();
      this.wellbeingMap = new WellbeingMap(this.sceneManager);

      // NEW Mars-Sim Components
      this.sleepModel = new SleepModel(this.constraints);
      this.recreationValidator = new RecreationValidator(this.constraints);
      this.privacyValidator = new PrivacyValidator(this.constraints);

      // Initialize default crew (4 person HERA baseline)
      this.initializeCrew();

      console.log('✅ Mars-Sim components initialized');
    } catch (error) {
      console.error('Failed to initialize Phase 2:', error);
      Toast.error('Failed to load psychological model parameters');
      throw error;
    }

    // Setup event handlers for mission config controls
    this.setupMissionConfigHandlers();

    // Initialize with default metrics
    this.updatePsychMetrics();

    console.log('✅ Phase 2 initialized successfully with Mars-Sim features');
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
   * Run full mission simulation (Mars-Sim Enhanced)
   */
  runFullMissionSimulation() {
    try {
      Toast.show('Running enhanced mission simulation...', 2000);

      // Get mission parameters directly from missionParams
      const { crewSize, missionDays } = this.missionParams;

      // Auto-assign crew to quarters
      this.autoAssignCrew();

      // Validate privacy and recreation
      const layout = this.getLayoutForValidation();
      const privacyResult = this.privacyValidator.validatePrivacy(layout, this.crew);
      const recreationResult = this.recreationValidator.validateRecreationSpace(layout, this.crew.length);

      // Show validation warnings
      if (!privacyResult.compliance) {
        Toast.show(`⚠️ Privacy violations: ${privacyResult.violations.length}`, 3000);
      }
      if (!recreationResult.compliance) {
        Toast.show(`⚠️ Recreation space insufficient`, 3000);
      }

      // Create Mission Simulator with Mars-Sim features + Module Impacts
      this.missionSimulator = new MissionSimulator(
        layout,
        {
          crewSize: crewSize,
          missionDays: missionDays,
          names: this.crew.map(c => c.name),
          roles: this.crew.map(c => c.role),
          genders: this.crew.map(c => c.gender)
        },
        this.constraints,
        this.psychModel.params,
        this.moduleImpacts  // Pass module impacts
      );

      // Run simulation
      console.log('🚀 Starting 45-day mission simulation...');
      const results = this.missionSimulator.run();
      this.fullMissionResults = results.dailyMetrics;
      console.log(`✅ Simulation complete! Processed ${results.dailyMetrics.length} days`);

      // Update UI to show final day results
      const currentDayEl = document.getElementById('currentDay');
      const currentDayValEl = document.getElementById('currentDayVal');
      if (currentDayEl && currentDayValEl) {
        currentDayEl.value = missionDays;
        currentDayValEl.textContent = `Day ${missionDays}`;
      }

      // Get final day metrics
      const finalDay = results.dailyMetrics[results.dailyMetrics.length - 1];
      this.currentDayMetrics = finalDay.teamAverage;

      // Calculate PHI
      const phi = this.psychModel.calculatePHI(this.currentDayMetrics);
      console.log(`📊 Final PHI: ${phi.toFixed(1)}/100`);
      console.log('  - Stress:', this.currentDayMetrics.stress.toFixed(1));
      console.log('  - Mood:', this.currentDayMetrics.mood.toFixed(1));
      console.log('  - Sleep Quality:', this.currentDayMetrics.sleepQuality.toFixed(1));
      console.log('  - Cohesion:', this.currentDayMetrics.cohesion.toFixed(1));

      // Update display AFTER calculations
      this.updateMetricsDisplay(this.currentDayMetrics, phi);

      // Show completion toast
      Toast.show(`✅ Simulation complete! Final PHI: ${phi.toFixed(1)}/100`, 4000);

      // Show recommendations
      if (results.recommendations.length > 0) {
        console.log('📋 NASA Recommendations:', results.recommendations);
      }

    } catch (error) {
      console.error('Error running mission simulation:', error);
      Toast.show('❌ Simulation failed. Check console for errors.', 3000);
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
   * Export metrics to CSV (Mars-Sim Enhanced)
   */
  exportMetricsCSV() {
    try {
      console.log('📊 Starting CSV export...');

      // Check if simulation has been run
      if (!this.fullMissionResults || this.fullMissionResults.length === 0) {
        Toast.show('⚠️ Please run simulation first!', 3000);
        console.warn('Export failed: No simulation results available');
        return;
      }

      console.log(`  - Mission results: ${this.fullMissionResults.length} days`);
      console.log(`  - Modules to export: ${this.modules.length}`);

      // Get layout for validation
      const layout = this.getLayoutForValidation();

      // Compute design variables
      console.log('  - Computing design variables...');
      const designVars = this.missionParams.computeDesignVariables(
        this.modules,
        this.validator
      );
      console.log('  - Design variables computed:', designVars);

      // Get constraint report
      const hudReport = this.hud.getLastReport();
      const constraintReport = {
        adjacencyCompliance: designVars.adjacencyCompliance,
        pathWidthOk: hudReport?.pathWidthOk !== false
      };

      // Get full simulation report
      console.log('  - Generating simulation report...');
      const simulationReport = this.missionSimulator ?
        this.missionSimulator.generateReport() : null;

      // Generate CSV (Mars-Sim Enhanced)
      console.log('  - Generating CSV content...');
      const csv = CSVGenerator.generateCSV(
        this.modules,
        designVars,
        this.fullMissionResults,
        constraintReport,
        simulationReport  // NEW: Includes per-crew data
      );

      if (csv) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `habitat-harmony-mars-sim-${timestamp}.csv`;
        CSVGenerator.downloadCSV(csv, filename);

        console.log(`✅ CSV exported successfully: ${filename}`);
        Toast.show(`📊 Exported to ${filename}`, 3000);
      } else {
        console.error('❌ CSV generation returned null/empty');
        Toast.show('❌ CSV export failed - empty result', 3000);
      }

    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      console.error('Stack trace:', error.stack);
      Toast.show(`❌ CSV export failed: ${error.message}`, 4000);
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

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
import ModuleCatalog from './habitat/ModuleCatalog.js';
import HabitatModule from './habitat/Module.js';
import ConstraintValidator from './validation/ConstraintValidator.js';
import DragControls from './controls/DragControls.js';
import ModuleControls from './controls/ModuleControls.js';
import HUD from './ui/HUD.js';
import Catalog from './ui/Catalog.js';
import Toast from './ui/Toast.js';
import LayoutExporter from './export/LayoutExporter.js';

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
        throw new Error('Failed to load NASA constraints');
      }

      this.constraints = await response.json();
      this.validator = new ConstraintValidator(this.constraints);

      console.log('✅ NASA constraints loaded');

    } catch (error) {
      console.error('Failed to load constraints:', error);
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

    // Create and add grid system
    this.gridSystem = new GridSystem();
    const gridGroup = this.gridSystem.create();
    this.sceneManager.addObject(gridGroup);

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

    console.log('✅ UI components initialized');
  }

  /**
   * Initialize controls
   */
  initControls() {
    const scene = this.sceneManager.getScene();
    const camera = this.sceneManager.getCamera();
    const canvas = document.getElementById('c');

    // Drag controls
    this.dragControls = new DragControls(
      camera,
      scene,
      canvas,
      this.modules,
      this.validator,
      this.gridSystem,
      () => this.updateLayout()
    );

    // Module controls (rotate/delete)
    this.moduleControls = new ModuleControls(
      this.modules,
      scene,
      () => this.updateLayout()
    );

    // Sync selection between drag and module controls
    this.setupControlsSync();

    console.log('✅ Controls initialized');
  }

  /**
   * Setup synchronization between DragControls and ModuleControls
   */
  setupControlsSync() {
    // Store original onMouseDown to wrap it
    const originalOnMouseDown = this.dragControls.onMouseDown.bind(this.dragControls);

    this.dragControls.onMouseDown = (event) => {
      originalOnMouseDown(event);
      // Sync selected module to ModuleControls
      const selected = this.dragControls.getSelectedModule();
      this.moduleControls.setSelectedModule(selected);
    };
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
    // Generate unique ID
    const id = `module_${this.moduleIdCounter++}`;

    // Create module
    const module = new HabitatModule(catalogItem, id, this.constraints);

    // Add to scene
    this.sceneManager.addObject(module);

    // Add to modules array
    this.modules.push(module);

    // Update drag controls with new modules array
    this.dragControls.setModules(this.modules);

    // Select the new module
    this.dragControls.selectModule(module);
    this.moduleControls.setSelectedModule(module);

    // Update layout
    this.updateLayout();

    Toast.success(`Added ${catalogItem.name}`);
    console.log(`➕ Added module: ${catalogItem.name} (ID: ${id})`);
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

      // Create module
      const module = new HabitatModule(catalogItem, moduleData.id, this.constraints);

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
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new HabitatHarmonyApp();
  await app.init();

  // Expose app to window for debugging
  window.habitatApp = app;
});

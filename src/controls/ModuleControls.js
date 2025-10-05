/**
 * Module Controls - Keyboard and Button Controls for Module Operations
 *
 * Handles:
 * - Module rotation (R key or button)
 * - Module deletion (Delete/Backspace key or button)
 * - Module deselection (Escape key)
 * - Button state management (enable/disable based on selection)
 *
 * Validates operations to maintain NASA constraints.
 */

import Toast from '../ui/Toast.js';

export default class ModuleControls {
  constructor(modules, scene, onUpdate) {
    this.modules = modules;
    this.scene = scene;
    this.onUpdate = onUpdate;

    // DOM elements
    this.rotateBtn = document.getElementById('rotateBtn');
    this.deleteBtn = document.getElementById('deleteBtn');

    // Currently selected module (managed by DragControls)
    this.selectedModule = null;

    // Event handlers (bound for removal)
    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onRotateClickBound = this.onRotateClick.bind(this);
    this.onDeleteClickBound = this.onDeleteClick.bind(this);

    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    // Keyboard controls
    document.addEventListener('keydown', this.onKeyDownBound);

    // Button controls
    if (this.rotateBtn) {
      this.rotateBtn.addEventListener('click', this.onRotateClickBound);
    }

    if (this.deleteBtn) {
      this.deleteBtn.addEventListener('click', this.onDeleteClickBound);
    }

    // Initialize button states (disabled)
    this.updateButtonStates(null);

    console.log('✅ ModuleControls initialized');
    console.log('   Keyboard: R = Rotate, Delete = Delete, Esc = Deselect');
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event
   */
  onKeyDown(event) {
    if (!this.selectedModule) return;

    const key = event.key.toLowerCase();

    switch (key) {
      case 'r':
        this.rotateModule(this.selectedModule);
        event.preventDefault();
        break;

      case 'delete':
      case 'backspace':
        this.deleteModule(this.selectedModule);
        event.preventDefault();
        break;

      case 'escape':
        this.deselectModule();
        event.preventDefault();
        break;
    }
  }

  /**
   * Handle rotate button click
   */
  onRotateClick() {
    if (this.selectedModule) {
      this.rotateModule(this.selectedModule);
    }
  }

  /**
   * Handle delete button click
   */
  onDeleteClick() {
    if (this.selectedModule) {
      this.deleteModule(this.selectedModule);
    }
  }

  /**
   * Rotate module 90 degrees clockwise
   * @param {HabitatModule} module - Module to rotate
   */
  rotateModule(module) {
    if (!module) return;

    try {
      // Verify module has required methods
      if (typeof module.rotate90 !== 'function') {
        console.error('Module missing rotate90 method');
        Toast.error('Cannot rotate module');
        return;
      }

      // Store original dimensions
      const originalDims = {
        w: module.dimensions ? module.dimensions.w : 0,
        d: module.dimensions ? module.dimensions.d : 0
      };

      // Rotate the module (this swaps w and d)
      module.rotate90();

      // Check if new orientation is valid
      const isValid = this.checkModulePlacement(module);

      if (!isValid) {
        // Revert rotation
        module.rotate90();
        module.rotate90();
        module.rotate90(); // Back to original (4 * 90 = 360)

        Toast.error('Cannot rotate: Would violate constraints');
        console.log('⚠️ Rotation blocked: Would cause overlap or go out of bounds');
      } else {
        const newDims = module.dimensions || { w: 0, d: 0 };
        Toast.success(`Rotated ${module.moduleName}`);
        console.log(`🔄 Rotated: ${module.moduleName} (${originalDims.w}×${originalDims.d} → ${newDims.w}×${newDims.d})`);

        // Update validation
        if (typeof this.onUpdate === 'function') {
          this.onUpdate();
        }
      }
    } catch (error) {
      console.error('Error rotating module:', error);
      Toast.error('Failed to rotate module');
    }
  }

  /**
   * Delete module from layout
   * @param {HabitatModule} module - Module to delete
   */
  deleteModule(module) {
    if (!module) return;

    try {
      const moduleName = module.moduleName || 'Unknown Module';
      const moduleId = module.moduleId || 'unknown';

      // Remove from modules array
      if (this.modules && Array.isArray(this.modules)) {
        const index = this.modules.indexOf(module);
        if (index > -1) {
          this.modules.splice(index, 1);
        }
      }

      // Remove from scene
      if (this.scene && typeof this.scene.remove === 'function') {
        this.scene.remove(module);
      }

      // Dispose resources
      if (typeof module.dispose === 'function') {
        module.dispose();
      }

    // Clear selection
    this.selectedModule = null;
    this.updateButtonStates(null);

      Toast.success(`Deleted ${moduleName}`);
      console.log(`🗑️ Deleted: ${moduleName} (ID: ${moduleId})`);

      // Update validation
      if (typeof this.onUpdate === 'function') {
        this.onUpdate();
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      Toast.error('Failed to delete module');
    }
  }

  /**
   * Deselect current module
   */
  deselectModule() {
    if (this.selectedModule) {
      this.selectedModule.setSelected(false);
      this.selectedModule = null;
      this.updateButtonStates(null);

      console.log('⭕ Deselected module');
    }
  }

  /**
   * Set selected module (called by DragControls)
   * @param {HabitatModule|null} module
   */
  setSelectedModule(module) {
    this.selectedModule = module;
    this.updateButtonStates(module);
  }

  /**
   * Update button states based on selection
   * @param {HabitatModule|null} module
   */
  updateButtonStates(module) {
    const hasSelection = module !== null;

    if (this.rotateBtn) {
      this.rotateBtn.disabled = !hasSelection;
    }

    if (this.deleteBtn) {
      this.deleteBtn.disabled = !hasSelection;
    }
  }

  /**
   * Check if module placement is valid after rotation
   * @param {HabitatModule} module
   * @returns {boolean}
   */
  checkModulePlacement(module) {
    if (!module) return false;

    try {
      // Check bounds (assuming habitat is 12m × 8m)
      const habitatWidth = 12.0;
      const habitatDepth = 8.0;

      if (typeof module.isWithinBounds !== 'function') {
        console.error('Module missing isWithinBounds method');
        return false;
      }

      if (!module.isWithinBounds(habitatWidth, habitatDepth)) {
        return false;
      }

      // Check overlaps with other modules
      if (!this.modules || !Array.isArray(this.modules)) {
        return true;
      }

      for (const other of this.modules) {
        if (!other || other === module) continue;
        if (typeof module.checkOverlap !== 'function') continue;

        if (module.checkOverlap(other)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking module placement:', error);
      return false;
    }
  }

  /**
   * Get currently selected module
   * @returns {HabitatModule|null}
   */
  getSelectedModule() {
    return this.selectedModule;
  }

  /**
   * Dispose of resources and remove event listeners
   */
  dispose() {
    document.removeEventListener('keydown', this.onKeyDownBound);

    if (this.rotateBtn) {
      this.rotateBtn.removeEventListener('click', this.onRotateClickBound);
    }

    if (this.deleteBtn) {
      this.deleteBtn.removeEventListener('click', this.onDeleteClickBound);
    }

    console.log('🗑️ ModuleControls disposed');
  }
}

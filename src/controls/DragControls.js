/**
 * Drag Controls - Mouse Interaction for Module Manipulation
 *
 * Handles:
 * - Module selection (click)
 * - Module dragging (click and drag)
 * - Grid snapping (0.1m precision)
 * - Bounds checking (habitat shell limits)
 * - Live validation during drag
 * - Visual feedback (valid/invalid placement)
 *
 * Uses Three.js Raycaster to project mouse position onto floor plane.
 */

import * as THREE from 'three';
import Toast from '../ui/Toast.js';

export default class DragControls {
  constructor(camera, scene, canvas, modules, validator, gridSystem, onUpdate, onSelectionChange = null, tileSystem = null) {
    this.camera = camera;
    this.scene = scene;
    this.canvas = canvas;
    this.modules = modules;
    this.validator = validator;
    this.gridSystem = gridSystem;
    this.onUpdate = onUpdate;
    this.onSelectionChange = onSelectionChange; // Callback when selection changes
    this.tileSystem = tileSystem; // Tile system for snapping

    // State
    this.selectedModule = null;
    this.isDragging = false;
    this.dragOffset = new THREE.Vector3();
    this.dragStartTile = { x: 0, y: 0 }; // Track starting tile position

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // XZ plane at Y=0

    // Event handlers (bound for removal)
    this.onMouseDownBound = this.onMouseDown.bind(this);
    this.onMouseMoveBound = this.onMouseMove.bind(this);
    this.onMouseUpBound = this.onMouseUp.bind(this);

    this.init();
  }

  /**
   * Initialize event listeners
   */
  init() {
    this.canvas.addEventListener('mousedown', this.onMouseDownBound);
    this.canvas.addEventListener('mousemove', this.onMouseMoveBound);
    this.canvas.addEventListener('mouseup', this.onMouseUpBound);

    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    console.log('✅ DragControls initialized');
  }

  /**
   * Handle mouse down - select or start dragging
   * @param {MouseEvent} event
   */
  onMouseDown(event) {
    try {
      // Update mouse coordinates
      this.updateMouseCoords(event);

      // Raycast to find intersected module
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Get all module meshes (with null checks)
      if (!this.modules || this.modules.length === 0) {
        return;
      }

      const meshes = this.modules
        .filter(m => m && m.mesh)
        .map(m => m.mesh);

      if (meshes.length === 0) {
        return;
      }

      const intersects = this.raycaster.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        // Get the module from the intersected mesh
        const mesh = intersects[0].object;
        const module = mesh.userData.module;

        if (module) {
          // Select this module
          this.selectModule(module);

          // Start dragging
          this.isDragging = true;

          // Store starting tile position if tile system available
          if (this.tileSystem && module.tileSystem) {
            this.dragStartTile.x = module.tileX;
            this.dragStartTile.y = module.tileY;
          }

          // Calculate offset from module center to intersection point
          const intersectPoint = intersects[0].point;
          this.dragOffset.copy(module.position).sub(intersectPoint);
          this.dragOffset.y = 0; // Only care about XZ offset

          event.preventDefault();
        }
      } else {
        // Clicked on empty space - deselect
        this.deselectAll();
        if (typeof this.onUpdate === 'function') {
          this.onUpdate();
        }
      }
    } catch (error) {
      console.error('Error in onMouseDown:', error);
      Toast.error('Interaction error occurred');
    }
  }

  /**
   * Handle mouse move - drag module if dragging
   * @param {MouseEvent} event
   */
  onMouseMove(event) {
    if (!this.isDragging || !this.selectedModule) return;

    // Update mouse coordinates
    this.updateMouseCoords(event);

    // Raycast to drag plane
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersectPoint = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectPoint)) {
      // Add offset
      intersectPoint.add(this.dragOffset);

      // Use tile snapping if tile system available
      if (this.tileSystem && this.selectedModule.tileSystem) {
        // Convert world position to tile coordinates
        const { tileX, tileY } = this.tileSystem.worldToTile(
          intersectPoint.x,
          intersectPoint.z
        );

        // Check if placement is valid at this tile
        const isValid = this.selectedModule.canPlaceAt(tileX, tileY);

        if (isValid) {
          // Preview placement at this tile (visual update only)
          const tileWorldPos = this.tileSystem.tileToWorld(tileX, tileY);
          this.selectedModule.position.x = tileWorldPos.x;
          this.selectedModule.position.z = tileWorldPos.z;
          this.selectedModule.setViolating(false);
        } else {
          // Invalid placement - show at tile position but mark as violating
          const tileWorldPos = this.tileSystem.tileToWorld(tileX, tileY);
          this.selectedModule.position.x = tileWorldPos.x;
          this.selectedModule.position.z = tileWorldPos.z;
          this.selectedModule.setViolating(true);
        }
      } else {
        // Fall back to grid snapping (0.1m precision)
        const snappedX = this.gridSystem.snapToGrid(intersectPoint.x, 0.1);
        const snappedZ = this.gridSystem.snapToGrid(intersectPoint.z, 0.1);

        // Update module position (preview)
        this.selectedModule.position.x = snappedX;
        this.selectedModule.position.z = snappedZ;

        // Check if placement is valid
        const isValid = this.checkPlacement(this.selectedModule);

        // Visual feedback
        if (isValid) {
          this.selectedModule.setViolating(false);
        } else {
          this.selectedModule.setViolating(true);
        }
      }
    }

    event.preventDefault();
  }

  /**
   * Handle mouse up - finish dragging
   * @param {MouseEvent} event
   */
  onMouseUp(event) {
    if (!this.isDragging) return;

    this.isDragging = false;

    if (this.selectedModule) {
      // Use tile-based placement if available
      if (this.tileSystem && this.selectedModule.tileSystem) {
        // Get current position as tile coordinates
        const { tileX, tileY } = this.tileSystem.worldToTile(
          this.selectedModule.position.x,
          this.selectedModule.position.z
        );

        // Try to place at tile
        const success = this.selectedModule.placeAtTile(tileX, tileY);

        if (!success) {
          // Placement failed - revert to start position
          Toast.error('Invalid placement: Reverting to previous position');
          this.selectedModule.placeAtTile(this.dragStartTile.x, this.dragStartTile.y);
          this.selectedModule.setViolating(false);
        } else {
          // Placement successful
          this.selectedModule.setViolating(false);
          console.log(`📍 Module placed at tile (${tileX}, ${tileY})`);
        }
      } else {
        // Fall back to validation without tile placement
        const isValid = this.checkPlacement(this.selectedModule);

        if (!isValid) {
          // Show error
          Toast.error('Invalid placement: Check constraints');
          this.selectedModule.setViolating(true);
        } else {
          this.selectedModule.setViolating(false);
        }
      }

      // Update layout
      this.onUpdate();
    }

    event.preventDefault();
  }

  /**
   * Update mouse coordinates from event
   * @param {MouseEvent} event
   */
  updateMouseCoords(event) {
    try {
      if (!this.canvas || !event) return;

      const rect = this.canvas.getBoundingClientRect();

      // Prevent division by zero
      const width = rect.width || 1;
      const height = rect.height || 1;

      // Normalize to -1 to +1
      this.mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    } catch (error) {
      console.error('Error updating mouse coordinates:', error);
    }
  }

  /**
   * Check if module placement is valid
   * @param {HabitatModule} module - Module to check
   * @returns {boolean} True if valid
   */
  checkPlacement(module) {
    if (!module) return false;

    try {
      const habitatDims = this.gridSystem.getHabitatDimensions();

      // Validate dimensions
      if (!habitatDims || !habitatDims.width || !habitatDims.depth) {
        console.error('Invalid habitat dimensions');
        return false;
      }

      // Check bounds
      if (typeof module.isWithinBounds !== 'function') {
        console.error('Module missing isWithinBounds method');
        return false;
      }

      if (!module.isWithinBounds(habitatDims.width, habitatDims.depth)) {
        return false;
      }

      // Check overlaps with other modules
      if (!this.modules || this.modules.length === 0) {
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
      console.error('Error checking placement:', error);
      return false;
    }
  }

  /**
   * Select a module
   * @param {HabitatModule} module
   */
  selectModule(module) {
    // Deselect previous
    this.deselectAll();

    // Select new
    this.selectedModule = module;
    module.setSelected(true);

    console.log(`✓ Selected: ${module.moduleName}`);

    // Notify selection change callback
    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(this.selectedModule);
    }
  }

  /**
   * Deselect all modules
   */
  deselectAll() {
    const wasSelected = this.selectedModule !== null;

    if (this.selectedModule) {
      this.selectedModule.setSelected(false);
      this.selectedModule.setViolating(false);
      this.selectedModule = null;
    }

    // Deselect any other selected modules
    this.modules.forEach(m => {
      m.setSelected(false);
      m.setViolating(false);
    });

    // Notify selection change callback if something was deselected
    if (wasSelected && typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(null);
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
   * Set modules array (when modules are added/removed)
   * @param {Array<HabitatModule>} modules
   */
  setModules(modules) {
    this.modules = modules;
  }

  /**
   * Dispose of resources and remove event listeners
   */
  dispose() {
    this.canvas.removeEventListener('mousedown', this.onMouseDownBound);
    this.canvas.removeEventListener('mousemove', this.onMouseMoveBound);
    this.canvas.removeEventListener('mouseup', this.onMouseUpBound);

    console.log('🗑️ DragControls disposed');
  }
}

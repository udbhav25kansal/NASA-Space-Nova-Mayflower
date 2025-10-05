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
  constructor(camera, scene, canvas, modules, validator, gridSystem, onUpdate) {
    this.camera = camera;
    this.scene = scene;
    this.canvas = canvas;
    this.modules = modules;
    this.validator = validator;
    this.gridSystem = gridSystem;
    this.onUpdate = onUpdate;

    // State
    this.selectedModule = null;
    this.isDragging = false;
    this.dragOffset = new THREE.Vector3();

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
    // Update mouse coordinates
    this.updateMouseCoords(event);

    // Raycast to find intersected module
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Get all module meshes
    const meshes = this.modules.map(m => m.mesh).filter(m => m);

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

        // Calculate offset from module center to intersection point
        const intersectPoint = intersects[0].point;
        this.dragOffset.copy(module.position).sub(intersectPoint);
        this.dragOffset.y = 0; // Only care about XZ offset

        event.preventDefault();
      }
    } else {
      // Clicked on empty space - deselect
      this.deselectAll();
      this.onUpdate();
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

      // Snap to grid (0.1m precision)
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
      // Final validation
      const isValid = this.checkPlacement(this.selectedModule);

      if (!isValid) {
        // Show error
        Toast.error('Invalid placement: Check constraints');
        this.selectedModule.setViolating(true);
      } else {
        this.selectedModule.setViolating(false);
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
    const rect = this.canvas.getBoundingClientRect();

    // Normalize to -1 to +1
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Check if module placement is valid
   * @param {HabitatModule} module - Module to check
   * @returns {boolean} True if valid
   */
  checkPlacement(module) {
    const habitatDims = this.gridSystem.getHabitatDimensions();

    // Check bounds
    if (!module.isWithinBounds(habitatDims.width, habitatDims.depth)) {
      return false;
    }

    // Check overlaps with other modules
    for (const other of this.modules) {
      if (other !== module && module.checkOverlap(other)) {
        return false;
      }
    }

    return true;
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
  }

  /**
   * Deselect all modules
   */
  deselectAll() {
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

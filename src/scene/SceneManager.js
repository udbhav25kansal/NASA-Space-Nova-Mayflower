/**
 * Scene Manager - Three.js Scene Setup and Management
 *
 * Handles all Three.js scene setup, camera, renderer, lighting, and animation loop.
 * Configured for 2.5D isometric view of lunar habitat layouts.
 *
 * Camera: OrthographicCamera for precise measurements and 2.5D view
 * Coordinate System:
 *   X/Z: Horizontal plane (habitat floor)
 *   Y: Vertical (habitat height)
 *   Origin: Center of habitat floor plate
 *   Units: Meters (SI)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class SceneManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;

    // Scene objects
    this.objects = [];

    // Update callback and timing
    this.updateCallback = null;
    this.lastTime = 0;
  }

  /**
   * Initialize the Three.js scene, camera, renderer, and controls
   */
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // Setup camera (Orthographic for 2.5D view)
    this.setupCamera();

    // Setup renderer
    this.setupRenderer();

    // Setup controls
    this.setupControls();

    // Setup lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(), false);

    // Start animation loop
    this.animate();

    console.log('✅ SceneManager initialized');
    console.log('📐 Camera: Orthographic 2.5D view');
    console.log('🎯 Coordinate system: X/Z horizontal, Y vertical, units in meters');
  }

  /**
   * Setup orthographic camera for 2.5D isometric view
   */
  setupCamera() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const aspect = width / height;

    // View size (world units shown vertically) - smaller = more zoomed in
    const viewSize = 6;

    // Create orthographic camera
    // Parameters: left, right, top, bottom, near, far
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect,  // left
      viewSize * aspect,   // right
      viewSize,            // top
      -viewSize,           // bottom
      0.1,                 // near
      100                  // far
    );

    // Position camera for 2.5D isometric view
    // Looking down at the habitat floor from an angle
    this.camera.position.set(10, 12, 10);
    this.camera.lookAt(0, 0, 0);

    // Store view size for resize handling
    this.viewSize = viewSize;
  }

  /**
   * Setup WebGL renderer
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });

    // Set pixel ratio (limit to 2 for performance)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Set size
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.renderer.setSize(width, height, false);

    // Enable shadows (optional, for future enhancement)
    this.renderer.shadowMap.enabled = false;
  }

  /**
   * Setup OrbitControls for camera manipulation
   * Pan and zoom enabled, rotation disabled for 2.5D view
   */
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Enable pan and zoom
    this.controls.enablePan = true;
    this.controls.enableZoom = true;

    // Disable rotation to maintain 2.5D view
    this.controls.enableRotate = false;

    // Configure zoom
    this.controls.zoomSpeed = 1.0;
    this.controls.minZoom = 0.5;
    this.controls.maxZoom = 3.0;

    // Configure pan
    this.controls.panSpeed = 1.0;
    this.controls.screenSpacePanning = true;

    // Damping for smooth controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  /**
   * Setup scene lighting
   * Using HemisphereLight for even, shadowless illumination
   */
  setupLighting() {
    // Hemisphere light: sky color, ground color, intensity
    const hemiLight = new THREE.HemisphereLight(
      0xffffff,  // sky color (white)
      0xcccccc,  // ground color (light gray)
      1.0        // intensity
    );
    this.scene.add(hemiLight);

    // Optional: Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
  }

  /**
   * Animation loop
   */
  animate(currentTime = 0) {
    this.animationId = requestAnimationFrame((time) => this.animate(time));

    // Calculate delta time (in seconds)
    const deltaTime = this.lastTime === 0 ? 0 : (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Call update callback if provided
    if (this.updateCallback && typeof this.updateCallback === 'function') {
      this.updateCallback(deltaTime);
    }

    // Update controls (needed for damping)
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Set update callback for custom logic each frame
   * @param {Function} callback - Callback function(deltaTime)
   */
  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const aspect = width / height;

    // Update camera
    this.camera.left = -this.viewSize * aspect;
    this.camera.right = this.viewSize * aspect;
    this.camera.top = this.viewSize;
    this.camera.bottom = -this.viewSize;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height, false);
  }

  /**
   * Add object to scene
   * @param {THREE.Object3D} object - Object to add
   */
  addObject(object) {
    this.scene.add(object);
    this.objects.push(object);
  }

  /**
   * Remove object from scene
   * @param {THREE.Object3D} object - Object to remove
   */
  removeObject(object) {
    this.scene.remove(object);
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
  }

  /**
   * Get the scene
   * @returns {THREE.Scene}
   */
  getScene() {
    return this.scene;
  }

  /**
   * Get the camera
   * @returns {THREE.OrthographicCamera}
   */
  getCamera() {
    return this.camera;
  }

  /**
   * Get the renderer
   * @returns {THREE.WebGLRenderer}
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * Get the controls
   * @returns {OrbitControls}
   */
  getControls() {
    return this.controls;
  }

  /**
   * Clear all objects from scene
   */
  clear() {
    this.objects.forEach(obj => {
      this.scene.remove(obj);
    });
    this.objects = [];
  }

  /**
   * Dispose of resources and stop animation
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.controls.dispose();
    this.renderer.dispose();

    window.removeEventListener('resize', () => this.onWindowResize());

    console.log('🗑️ SceneManager disposed');
  }
}

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

    // Lunar space background (dark with stars)
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Add starfield
    this.addStarfield();

    // Setup camera (Orthographic for 2.5D view)
    this.setupCamera();

    // Setup renderer
    this.setupRenderer();

    // Setup controls
    this.setupControls();

    // Setup lighting (harsh lunar sun)
    this.setupLighting();

    // Add lunar surface floor
    this.addLunarSurface();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(), false);

    // Start animation loop
    this.animate();

    console.log('✅ SceneManager initialized');
    console.log('🌙 Lunar environment with low-gravity feel');
    console.log('📐 Camera: Orthographic with full rotation');
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
   * Pan, zoom, and rotation all enabled for full 3D navigation
   */
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Enable pan, zoom, and rotate for full 3D control
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;  // ✅ ENABLED for user rotation

    // Configure zoom
    this.controls.zoomSpeed = 1.0;
    this.controls.minZoom = 0.3;  // Allow zooming out further
    this.controls.maxZoom = 5.0;  // Allow zooming in closer

    // Configure pan
    this.controls.panSpeed = 1.0;
    this.controls.screenSpacePanning = true;

    // Configure rotation
    this.controls.rotateSpeed = 0.5;
    this.controls.minPolarAngle = Math.PI / 6;  // Limit rotation (30° from top)
    this.controls.maxPolarAngle = Math.PI / 2.2; // Don't allow looking from below

    // Damping for smooth, floaty controls (lunar low-gravity feel)
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;  // Slower damping = floaty feel
  }

  /**
   * Setup scene lighting
   * Harsh directional sunlight to simulate lunar environment (no atmosphere)
   */
  setupLighting() {
    // Harsh sun (directional light from above-left)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(-10, 20, 10);
    sunLight.castShadow = false;  // Disabled for performance
    this.scene.add(sunLight);

    // Minimal ambient light (lunar shadows are very dark)
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    this.scene.add(ambientLight);

    // Add subtle hemisphere for earth-shine (from above)
    const hemiLight = new THREE.HemisphereLight(
      0x87ceeb,  // sky color (slight blue from Earth)
      0x2a2a2a,  // ground color (dark lunar surface)
      0.3        // low intensity
    );
    this.scene.add(hemiLight);
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
   * Add starfield background for lunar space environment
   */
  addStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      // Random position in sphere around scene
      positions[i] = (Math.random() - 0.5) * 200;     // x
      positions[i + 1] = Math.random() * 100 + 20;    // y (above horizon)
      positions[i + 2] = (Math.random() - 0.5) * 200; // z
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      sizeAttenuation: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  }

  /**
   * Add lunar surface floor with crater-like details
   */
  addLunarSurface() {
    // Large lunar ground plane
    const groundSize = 50;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 64, 64);

    // Add crater-like deformations
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);  // Note: PlaneGeometry Y is our Z

      // Create crater bumps using noise-like function
      const crater1 = Math.exp(-((x - 10) ** 2 + (z - 10) ** 2) / 8) * -0.5;
      const crater2 = Math.exp(-((x + 8) ** 2 + (z + 5) ** 2) / 12) * -0.3;
      const crater3 = Math.exp(-((x - 5) ** 2 + (z - 15) ** 2) / 6) * -0.4;

      // Small random surface noise
      const noise = (Math.random() - 0.5) * 0.05;

      // Set height (y becomes z in our coordinate system)
      positions.setZ(i, crater1 + crater2 + crater3 + noise);
    }

    groundGeometry.computeVertexNormals();

    // Lunar regolith material (gray-brown with slight texture)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b8680,  // Lunar gray
      roughness: 0.95,
      metalness: 0.0,
      flatShading: false
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;  // Rotate to be horizontal
    ground.position.y = -0.1;  // Slightly below origin
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add subtle grid helper for reference (very faint)
    const gridHelper = new THREE.GridHelper(20, 40, 0x444444, 0x222222);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);
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

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
   * Add realistic lunar surface with beautiful craters
   * Inspired by real Moon surface photos - multiple crater sizes and details
   */
  addLunarSurface() {
    // Create detailed ground mesh
    const groundSize = 60;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 128, 128);

    // Create realistic crater field
    const positions = groundGeometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    // Define multiple craters with varying sizes and depths
    const craters = [
      // Large craters
      { x: 12, z: 15, radius: 8, depth: 1.2 },
      { x: -15, z: -10, radius: 10, depth: 1.5 },
      { x: 20, z: -18, radius: 6, depth: 0.9 },

      // Medium craters
      { x: -8, z: 12, radius: 4, depth: 0.6 },
      { x: 5, z: -5, radius: 3.5, depth: 0.5 },
      { x: -20, z: 8, radius: 5, depth: 0.7 },
      { x: 15, z: 8, radius: 3, depth: 0.4 },

      // Small craters
      { x: 0, z: 20, radius: 2, depth: 0.3 },
      { x: -5, z: -20, radius: 1.8, depth: 0.25 },
      { x: 8, z: -12, radius: 2.2, depth: 0.35 },
      { x: -12, z: 18, radius: 1.5, depth: 0.2 },
      { x: 18, z: 5, radius: 1.6, depth: 0.22 },
      { x: -18, z: -5, radius: 1.4, depth: 0.18 },
    ];

    // Apply crater deformations and color variations
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i);
      let height = 0;
      let brightness = 1.0;

      // Apply each crater's influence
      for (const crater of craters) {
        const dx = x - crater.x;
        const dz = z - crater.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < crater.radius) {
          // Crater bowl shape with raised rim
          const normalized = dist / crater.radius;

          // Create rim (raised edge)
          const rim = Math.exp(-Math.pow((normalized - 0.8), 2) / 0.02) * crater.depth * 0.3;

          // Create bowl (depression)
          const bowl = -crater.depth * (1 - Math.pow(normalized, 2.5));

          height += bowl + rim;

          // Darken crater interior, brighten rim
          if (normalized < 0.6) {
            brightness *= 0.7; // Dark crater floor
          } else if (normalized > 0.75 && normalized < 0.95) {
            brightness *= 1.3; // Bright crater rim
          }
        }
      }

      // Add fine surface texture (regolith)
      const fineNoise = (Math.sin(x * 0.5) * Math.cos(z * 0.5) +
                        Math.sin(x * 1.2) * Math.cos(z * 0.8)) * 0.03;
      const randomNoise = (Math.random() - 0.5) * 0.02;

      height += fineNoise + randomNoise;

      // Set vertex height
      positions.setZ(i, height);

      // Set vertex color based on brightness
      const baseColor = { r: 0.54, g: 0.53, b: 0.50 }; // Lunar gray
      colors[i * 3] = baseColor.r * brightness;
      colors[i * 3 + 1] = baseColor.g * brightness;
      colors[i * 3 + 2] = baseColor.b * brightness;
    }

    groundGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    groundGeometry.computeVertexNormals();

    // Create beautiful lunar surface material
    const groundMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.98,
      metalness: 0.02,
      emissive: 0x1a1a1a,
      emissiveIntensity: 0.1,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;
    ground.castShadow = false;
    this.scene.add(ground);

    // Add very subtle grid for reference
    const gridHelper = new THREE.GridHelper(20, 40, 0x404040, 0x202020);
    gridHelper.position.y = 0;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    this.scene.add(gridHelper);

    console.log('🌙 Lunar surface created with', craters.length, 'craters');
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

/**
 * Habitat Module - Individual Room Module Class
 *
 * Represents a single habitat module (room) with 3D visualization,
 * NASA constraints, and validation.
 *
 * Each module:
 * - Has defined dimensions (w, d, h in meters)
 * - Belongs to a zone (clean/dirty)
 * - Has minimum area requirements (NASA validated)
 * - Can be selected, moved, rotated
 * - Validates against adjacency rules
 *
 * Coordinate System:
 * - Position: (x, y, z) where y=height/2 (center of module)
 * - Rotation: Around Y axis (vertical)
 * - Dimensions: BoxGeometry uses (width, height, depth) = (w, h, d)
 */

import * as THREE from 'three';

export default class HabitatModule extends THREE.Group {
  constructor(catalogItem, id, constraints) {
    super();

    // Module properties from catalog
    this.moduleId = id;
    this.moduleName = catalogItem.name;
    this.dimensions = {
      w: catalogItem.w,  // width (X axis)
      d: catalogItem.d,  // depth (Z axis)
      h: catalogItem.h   // height (Y axis)
    };
    this.zone = catalogItem.zone;
    this.color = catalogItem.color;
    this.category = catalogItem.category;
    this.minArea = catalogItem.minArea;
    this.minVolume = catalogItem.minVolume;
    this.description = catalogItem.description;

    // State
    this.isSelected = false;
    this.isViolating = false;
    this.rotationAngle = 0; // In degrees

    // Store constraints reference
    this.constraints = constraints;

    // Create visual representation
    this.createMesh();
    this.createOutline();
    this.createLabel();

    // Set name for Three.js
    this.name = `Module_${this.moduleName}_${this.moduleId}`;

    // Position at origin initially (will be moved by user)
    this.position.set(0, this.dimensions.h / 2, 0);
  }

  /**
   * Create the main mesh for the module
   * Creates distinctive 3D models for each module type
   */
  createMesh() {
    // Create a group to hold all mesh components
    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'ModuleMesh';
    this.meshGroup.userData.module = this;

    // Base material with zone-based color
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.85,
      metalness: 0.3,
      roughness: 0.7
    });

    // Accent material (darker version for details)
    const accentColor = new THREE.Color(this.color).multiplyScalar(0.7);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.9,
      metalness: 0.5,
      roughness: 0.6
    });

    // Create module-specific geometry
    switch (this.moduleName) {
      case 'Crew Quarters':
        this.createCrewQuartersMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Hygiene':
        this.createHygieneMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'WCS':
        this.createWCSMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Exercise':
        this.createExerciseMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Galley':
        this.createGalleyMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Ward/Dining':
        this.createDiningMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Workstation':
        this.createWorkstationMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      default:
        // Fallback to basic box
        this.createBasicMesh(this.meshGroup, baseMaterial);
    }

    // Store reference for raycasting (pick the first child)
    this.mesh = this.meshGroup.children[0];
    this.mesh.userData.module = this;

    this.add(this.meshGroup);
  }

  /**
   * Create Crew Quarters mesh (bed with pillow)
   */
  createCrewQuartersMesh(group, baseMat, accentMat) {
    const w = this.dimensions.w;
    const h = this.dimensions.h;
    const d = this.dimensions.d;

    // Floor/base
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, d),
      baseMat
    );
    floor.position.y = -h/2 + 0.025;
    group.add(floor);

    // Bed frame
    const bedW = w * 0.7;
    const bedD = d * 0.8;
    const bedH = 0.15;
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(bedW, bedH, bedD),
      accentMat
    );
    bed.position.set(0, -h/2 + bedH/2 + 0.05, 0);
    group.add(bed);

    // Mattress
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(bedW * 0.95, 0.1, bedD * 0.95),
      baseMat
    );
    mattress.position.set(0, -h/2 + bedH + 0.1, 0);
    group.add(mattress);

    // Pillow
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(bedW * 0.3, 0.08, bedD * 0.25),
      new THREE.MeshStandardMaterial({ color: 0xffffff, opacity: 0.9, transparent: true })
    );
    pillow.position.set(0, -h/2 + bedH + 0.15, -bedD * 0.3);
    group.add(pillow);

    // Storage compartment
    const storage = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.3, h * 0.6, d * 0.2),
      accentMat
    );
    storage.position.set(w * 0.3, 0, -d * 0.35);
    group.add(storage);
  }

  /**
   * Create Hygiene mesh (shower/sink)
   */
  createHygieneMesh(group, baseMat, accentMat) {
    const w = this.dimensions.w;
    const h = this.dimensions.h;
    const d = this.dimensions.d;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, d),
      baseMat
    );
    floor.position.y = -h/2 + 0.025;
    group.add(floor);

    // Shower stall
    const showerW = w * 0.5;
    const showerD = d * 0.6;
    const showerH = h * 0.9;

    // Shower walls (3 sides)
    const wallThickness = 0.03;
    const wall1 = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, showerH, showerD),
      accentMat
    );
    wall1.position.set(-showerW/2, -h/2 + showerH/2, 0);
    group.add(wall1);

    const wall2 = new THREE.Mesh(
      new THREE.BoxGeometry(showerW, showerH, wallThickness),
      accentMat
    );
    wall2.position.set(0, -h/2 + showerH/2, -showerD/2);
    group.add(wall2);

    const wall3 = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, showerH, showerD),
      accentMat
    );
    wall3.position.set(showerW/2, -h/2 + showerH/2, 0);
    group.add(wall3);

    // Shower head
    const showerHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 })
    );
    showerHead.position.set(0, h/2 - 0.2, -showerD/2 + 0.1);
    group.add(showerHead);

    // Sink
    const sink = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.35, 0.1, d * 0.25),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.6 })
    );
    sink.position.set(w * 0.25, -h/2 + h * 0.4, d * 0.25);
    group.add(sink);

    // Faucet
    const faucet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 })
    );
    faucet.position.set(w * 0.25, -h/2 + h * 0.5, d * 0.25);
    group.add(faucet);
  }

  /**
   * Create WCS mesh (toilet)
   */
  createWCSMesh(group, baseMat, accentMat) {
    const w = this.dimensions.w;
    const h = this.dimensions.h;
    const d = this.dimensions.d;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, d),
      baseMat
    );
    floor.position.y = -h/2 + 0.025;
    group.add(floor);

    // Toilet base
    const toiletBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3 })
    );
    toiletBase.position.set(0, -h/2 + 0.15, 0);
    group.add(toiletBase);

    // Toilet bowl
    const toiletBowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4 })
    );
    toiletBowl.position.set(0, -h/2 + 0.25, 0);
    group.add(toiletBowl);

    // Toilet seat
    const seatGeometry = new THREE.TorusGeometry(0.2, 0.03, 16, 32, Math.PI * 2);
    const seat = new THREE.Mesh(
      seatGeometry,
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.3 })
    );
    seat.rotation.x = Math.PI / 2;
    seat.position.set(0, -h/2 + 0.4, 0);
    group.add(seat);

    // Tank/system box
    const tank = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.4, 0.15),
      accentMat
    );
    tank.position.set(0, -h/2 + 0.6, -0.25);
    group.add(tank);

    // Privacy panel
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, h * 0.7, 0.02),
      accentMat
    );
    panel.position.set(0, -h/2 + h * 0.45, -d/2 + 0.01);
    group.add(panel);
  }

  /**
   * Create Exercise mesh (dumbbells and equipment)
   */
  createExerciseMesh(group, baseMat, accentMat) {
    const w = this.dimensions.w;
    const h = this.dimensions.h;
    const d = this.dimensions.d;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, d),
      baseMat
    );
    floor.position.y = -h/2 + 0.025;
    group.add(floor);

    // Exercise mat
    const mat = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, 0.03, d * 0.8),
      new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.9 })
    );
    mat.position.set(0, -h/2 + 0.05, 0);
    group.add(mat);

    // Dumbbell 1 (left)
    this.createDumbbell(group, -w * 0.25, -h/2 + 0.15, -d * 0.2, 0.15);

    // Dumbbell 2 (right)
    this.createDumbbell(group, w * 0.25, -h/2 + 0.15, -d * 0.2, 0.15);

    // Resistance band attachment
    const bandMount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, h * 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.7 })
    );
    bandMount.position.set(-w * 0.35, -h/2 + h * 0.3, d * 0.3);
    group.add(bandMount);

    // Exercise equipment base
    const equipBase = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.4, 0.3, d * 0.3),
      accentMat
    );
    equipBase.position.set(w * 0.2, -h/2 + 0.35, d * 0.25);
    group.add(equipBase);

    // Pull-up bar
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, w * 0.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.8 })
    );
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, h/2 - 0.15, 0);
    group.add(bar);
  }

  /**
   * Helper: Create a dumbbell
   */
  createDumbbell(group, x, y, z, size) {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.8, roughness: 0.3 });

    // Bar
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(size * 0.15, size * 0.15, size * 2, 16),
      metalMat
    );
    bar.rotation.z = Math.PI / 2;
    bar.position.set(x, y, z);
    group.add(bar);

    // Weight 1
    const weight1 = new THREE.Mesh(
      new THREE.CylinderGeometry(size * 0.6, size * 0.6, size * 0.4, 16),
      metalMat
    );
    weight1.rotation.z = Math.PI / 2;
    weight1.position.set(x - size, y, z);
    group.add(weight1);

    // Weight 2
    const weight2 = new THREE.Mesh(
      new THREE.CylinderGeometry(size * 0.6, size * 0.6, size * 0.4, 16),
      metalMat
    );
    weight2.rotation.z = Math.PI / 2;
    weight2.position.set(x + size, y, z);
    group.add(weight2);
  }

  /**
   * Create Galley mesh (kitchen counter)
   */
  createGalleyMesh(group, baseMat, accentMat) {
    const w = this.dimensions.w;
    const h = this.dimensions.h;
    const d = this.dimensions.d;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, d),
      baseMat
    );
    floor.position.y = -h/2 + 0.025;
    group.add(floor);

    // Counter
    const counterH = h * 0.4;
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, counterH, d * 0.5),
      accentMat
    );
    counter.position.set(0, -h/2 + counterH/2, 0);
    group.add(counter);

    // Counter top
    const counterTop = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.85, 0.05, d * 0.55),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.5 })
    );
    counterTop.position.set(0, -h/2 + counterH + 0.025, 0);
    group.add(counterTop);

    // Food warmer/oven
    const oven = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.35, counterH * 0.6, d * 0.35),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.6 })
    );
    oven.position.set(-w * 0.2, -h/2 + counterH * 0.3, 0);
    group.add(oven);

    // Storage compartments
    const storage1 = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.3, counterH * 0.5, d * 0.35),
      accentMat
    );
    storage1.position.set(w * 0.25, -h/2 + counterH * 0.25, 0);
    group.add(storage1);

    // Dispenser/water system
    const dispenser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.7 })
    );
    dispenser.position.set(w * 0.15, -h/2 + counterH + 0.2, d * 0.15);
    group.add(dispenser);

    // Overhead storage
    const overhead = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, h * 0.25, d * 0.3),
      accentMat
    );
    overhead.position.set(0, h/2 - h * 0.15, 0);
    group.add(overhead);
  }

  /**
   * Create Ward/Dining mesh (table with chairs)
   */
  createDiningMesh(group, baseMat, accentMat) {
    const w = this.dimensions.w;
    const h = this.dimensions.h;
    const d = this.dimensions.d;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, d),
      baseMat
    );
    floor.position.y = -h/2 + 0.025;
    group.add(floor);

    // Table
    const tableH = h * 0.35;
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.7, 0.05, d * 0.7),
      accentMat
    );
    tableTop.position.set(0, -h/2 + tableH, 0);
    group.add(tableTop);

    // Table legs
    const legR = 0.03;
    const legH = tableH - 0.05;
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.6 });

    const positions = [
      [-w * 0.3, -h/2 + legH/2, -d * 0.3],
      [w * 0.3, -h/2 + legH/2, -d * 0.3],
      [-w * 0.3, -h/2 + legH/2, d * 0.3],
      [w * 0.3, -h/2 + legH/2, d * 0.3]
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(legR, legR, legH, 8),
        legMat
      );
      leg.position.set(...pos);
      group.add(leg);
    });

    // Chairs (simplified)
    this.createChair(group, -w * 0.25, -h/2, -d * 0.35, 0.25, baseMat);
    this.createChair(group, w * 0.25, -h/2, -d * 0.35, 0.25, baseMat);
    this.createChair(group, -w * 0.25, -h/2, d * 0.35, 0.25, baseMat);
    this.createChair(group, w * 0.25, -h/2, d * 0.35, 0.25, baseMat);

    // Display/screen on wall
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.6, h * 0.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.7, emissive: 0x1a4d7a, emissiveIntensity: 0.2 })
    );
    screen.position.set(0, -h/2 + h * 0.6, -d/2 + 0.025);
    group.add(screen);
  }

  /**
   * Helper: Create a chair
   */
  createChair(group, x, y, z, size, material) {
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(size, size * 0.15, size),
      material
    );
    seat.position.set(x, y + size * 0.5, z);
    group.add(seat);

    // Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(size, size * 0.8, size * 0.1),
      material
    );
    back.position.set(x, y + size * 0.9, z - size * 0.45);
    group.add(back);

    // Legs (simplified as single support)
    const legSupport = new THREE.Mesh(
      new THREE.CylinderGeometry(size * 0.15, size * 0.2, size * 0.5, 8),
      material
    );
    legSupport.position.set(x, y + size * 0.25, z);
    group.add(legSupport);
  }

  /**
   * Create Workstation mesh (desk with computer)
   */
  createWorkstationMesh(group, baseMat, accentMat) {
    const w = this.dimensions.w;
    const h = this.dimensions.h;
    const d = this.dimensions.d;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.05, d),
      baseMat
    );
    floor.position.y = -h/2 + 0.025;
    group.add(floor);

    // Desk
    const deskH = h * 0.35;
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.8, deskH, d * 0.6),
      accentMat
    );
    desk.position.set(0, -h/2 + deskH/2, 0);
    group.add(desk);

    // Desk top
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.85, 0.05, d * 0.65),
      new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.4 })
    );
    deskTop.position.set(0, -h/2 + deskH + 0.025, 0);
    group.add(deskTop);

    // Computer monitor
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.4, h * 0.25, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.7, emissive: 0x2563eb, emissiveIntensity: 0.3 })
    );
    monitor.position.set(0, -h/2 + deskH + h * 0.2, -d * 0.15);
    monitor.rotation.x = -0.1;
    group.add(monitor);

    // Monitor stand
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.08, 0.15, 8),
      new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.6 })
    );
    stand.position.set(0, -h/2 + deskH + 0.1, -d * 0.15);
    group.add(stand);

    // Keyboard
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.3, 0.02, d * 0.15),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.5 })
    );
    keyboard.position.set(0, -h/2 + deskH + 0.06, d * 0.05);
    group.add(keyboard);

    // Chair
    this.createChair(group, 0, -h/2, d * 0.3, 0.3, baseMat);

    // Storage drawer
    const drawer = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.3, deskH * 0.4, d * 0.5),
      accentMat
    );
    drawer.position.set(w * 0.25, -h/2 + deskH * 0.2, 0);
    group.add(drawer);
  }

  /**
   * Fallback: Create basic box mesh
   */
  createBasicMesh(group, baseMat) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(this.dimensions.w, this.dimensions.h, this.dimensions.d),
      baseMat
    );
    group.add(box);
  }

  /**
   * Create selection outline (edges)
   */
  createOutline() {
    const geometry = new THREE.BoxGeometry(
      this.dimensions.w,
      this.dimensions.h,
      this.dimensions.d
    );

    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color: 0x111827,
      linewidth: 2
    });

    this.outline = new THREE.LineSegments(edges, material);
    this.outline.visible = false; // Only show when selected
    this.outline.name = 'ModuleOutline';

    this.add(this.outline);
  }

  /**
   * Create label showing module name
   */
  createLabel() {
    // Create canvas for text texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    // Draw background
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = 'Bold 20px Arial';
    context.fillStyle = '#111827';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(this.moduleName, canvas.width / 2, canvas.height / 2);

    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });

    // Create sprite
    this.label = new THREE.Sprite(material);
    this.label.scale.set(1.5, 0.375, 1);
    this.label.position.y = this.dimensions.h / 2 + 0.5;
    this.label.name = 'ModuleLabel';

    this.add(this.label);
  }

  /**
   * Get module footprint area (m²)
   * @returns {number} Area in square meters
   */
  getFootprint() {
    return this.dimensions.w * this.dimensions.d;
  }

  /**
   * Get module volume (m³)
   * @returns {number} Volume in cubic meters
   */
  getVolume() {
    return this.dimensions.w * this.dimensions.d * this.dimensions.h;
  }

  /**
   * Get bounding box in world coordinates
   * @returns {THREE.Box3}
   */
  getBoundingBox() {
    const box = new THREE.Box3();
    box.setFromObject(this.mesh);
    return box;
  }

  /**
   * Get floor rectangle (for overlap detection)
   * @returns {Object} {minX, maxX, minZ, maxZ}
   */
  getFloorRectangle() {
    const halfW = this.dimensions.w / 2;
    const halfD = this.dimensions.d / 2;
    const pos = this.position;

    return {
      minX: pos.x - halfW,
      maxX: pos.x + halfW,
      minZ: pos.z - halfD,
      maxZ: pos.z + halfD
    };
  }

  /**
   * Set selected state
   * @param {boolean} selected - Selection state
   */
  setSelected(selected) {
    this.isSelected = selected;
    this.outline.visible = selected;

    // Change opacity when selected
    if (selected) {
      this.mesh.material.opacity = 1.0;
    } else {
      this.mesh.material.opacity = 0.85;
    }
  }

  /**
   * Set violation state (for visual feedback)
   * @param {boolean} violating - Violation state
   */
  setViolating(violating) {
    this.isViolating = violating;

    if (violating) {
      // Yellow highlight for violations
      this.mesh.material.emissive = new THREE.Color(0xfde68a);
      this.mesh.material.emissiveIntensity = 0.5;
    } else {
      this.mesh.material.emissive = new THREE.Color(0x000000);
      this.mesh.material.emissiveIntensity = 0;
    }
  }

  /**
   * Update module position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate (optional, defaults to height/2)
   * @param {number} z - Z coordinate
   */
  updatePosition(x, y = null, z) {
    const newY = y !== null ? y : this.dimensions.h / 2;
    this.position.set(x, newY, z);
  }

  /**
   * Rotate module 90 degrees around Y axis
   * Swaps width and depth dimensions
   */
  rotate90() {
    // Swap dimensions
    const temp = this.dimensions.w;
    this.dimensions.w = this.dimensions.d;
    this.dimensions.d = temp;

    // Update rotation angle
    this.rotationAngle = (this.rotationAngle + 90) % 360;
    this.rotation.y = THREE.MathUtils.degToRad(this.rotationAngle);

    // Recreate mesh, outline, and label with new dimensions
    if (this.meshGroup) this.remove(this.meshGroup);
    if (this.outline) this.remove(this.outline);
    if (this.label) this.remove(this.label);

    this.createMesh();
    this.createOutline();
    this.createLabel();

    // Restore selection state
    if (this.isSelected) {
      this.outline.visible = true;
    }
  }

  /**
   * Check if this module overlaps with another
   * @param {HabitatModule} otherModule - Module to check against
   * @returns {boolean} True if modules overlap
   */
  checkOverlap(otherModule) {
    const thisRect = this.getFloorRectangle();
    const otherRect = otherModule.getFloorRectangle();

    // Check for overlap on XZ plane
    const overlapX = thisRect.minX < otherRect.maxX && thisRect.maxX > otherRect.minX;
    const overlapZ = thisRect.minZ < otherRect.maxZ && thisRect.maxZ > otherRect.minZ;

    return overlapX && overlapZ;
  }

  /**
   * Get distance to another module (center to center)
   * @param {HabitatModule} otherModule - Module to measure distance to
   * @returns {number} Distance in meters
   */
  getDistanceTo(otherModule) {
    const dx = this.position.x - otherModule.position.x;
    const dz = this.position.z - otherModule.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Check if module is within habitat bounds
   * @param {number} maxWidth - Habitat width
   * @param {number} maxDepth - Habitat depth
   * @returns {boolean} True if within bounds
   */
  isWithinBounds(maxWidth, maxDepth) {
    const rect = this.getFloorRectangle();
    const halfWidth = maxWidth / 2;
    const halfDepth = maxDepth / 2;

    return (
      rect.minX >= -halfWidth &&
      rect.maxX <= halfWidth &&
      rect.minZ >= -halfDepth &&
      rect.maxZ <= halfDepth
    );
  }

  /**
   * Export module state to JSON
   * @returns {Object} Module data
   */
  toJSON() {
    return {
      id: this.moduleId,
      name: this.moduleName,
      zone: this.zone,
      category: this.category,
      dimensions: {
        w: this.dimensions.w,
        d: this.dimensions.d,
        h: this.dimensions.h
      },
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      },
      rotation: this.rotationAngle,
      footprint: this.getFootprint(),
      volume: this.getVolume()
    };
  }

  /**
   * Dispose of module resources
   */
  dispose() {
    // Dispose mesh group and all children
    if (this.meshGroup) {
      this.meshGroup.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    // Dispose outline
    if (this.outline) {
      this.outline.geometry.dispose();
      this.outline.material.dispose();
    }

    // Dispose label
    if (this.label) {
      if (this.label.material.map) {
        this.label.material.map.dispose();
      }
      this.label.material.dispose();
    }

    // Remove from parent
    if (this.parent) {
      this.parent.remove(this);
    }
  }
}

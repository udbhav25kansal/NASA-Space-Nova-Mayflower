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
import Door from './Door.js';

export default class HabitatModule extends THREE.Group {
  constructor(catalogItem, id, constraints, tileSystem = null) {
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

    // Tile-based positioning (CorsixTH integration)
    this.tileSystem = tileSystem;
    this.tileX = 0;
    this.tileY = 0;

    if (tileSystem) {
      this.tileWidth = Math.ceil(catalogItem.w / tileSystem.tileSize);
      this.tileHeight = Math.ceil(catalogItem.d / tileSystem.tileSize);
    } else {
      this.tileWidth = Math.ceil(catalogItem.w);
      this.tileHeight = Math.ceil(catalogItem.d);
    }

    // Interior objects and crew
    this.objects = [];      // Equipment/furniture placed inside
    this.crew = [];         // Crew members currently in this module
    this.door = null;       // Door/airlock reference

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
      case 'Medical':
        this.createMedicalMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'EVA Prep':
        this.createEVAPrepMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Airlock':
        this.createAirlockMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Stowage':
        this.createStowageMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Window Station':
        this.createWindowStationMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Laboratory':
        this.createLaboratoryMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'Communications':
        this.createCommunicationsMesh(this.meshGroup, baseMaterial, accentMaterial);
        break;
      case 'IFM/Repair':
        this.createIFMRepairMesh(this.meshGroup, baseMaterial, accentMaterial);
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
   * Medical Module: Medical bed + equipment cabinet + vital signs monitor
   */
  createMedicalMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Medical bed frame
    const bedFrameGeo = new THREE.BoxGeometry(w * 0.4, h * 0.08, d * 0.6);
    const bedFrame = new THREE.Mesh(bedFrameGeo, new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.6 }));
    bedFrame.position.set(-w * 0.2, -h/2 + h * 0.04, 0);
    group.add(bedFrame);

    // Mattress
    const mattressGeo = new THREE.BoxGeometry(w * 0.38, h * 0.06, d * 0.58);
    const mattress = new THREE.Mesh(mattressGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    mattress.position.set(-w * 0.2, -h/2 + h * 0.11, 0);
    group.add(mattress);

    // Medical equipment cabinet
    const cabinetGeo = new THREE.BoxGeometry(w * 0.25, h * 0.5, d * 0.3);
    const cabinet = new THREE.Mesh(cabinetGeo, new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.3 }));
    cabinet.position.set(w * 0.25, -h/2 + h * 0.25, d * 0.25);
    group.add(cabinet);

    // Red cross symbol on cabinet
    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.04, h * 0.15, d * 0.02),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    crossV.position.set(w * 0.37, -h/2 + h * 0.25, d * 0.25);
    group.add(crossV);

    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.12, h * 0.05, d * 0.02),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    crossH.position.set(w * 0.37, -h/2 + h * 0.25, d * 0.25);
    group.add(crossH);

    // Vital signs monitor
    const monitorGeo = new THREE.BoxGeometry(w * 0.15, h * 0.12, d * 0.03);
    const monitor = new THREE.Mesh(monitorGeo, new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3
    }));
    monitor.position.set(w * 0.25, -h/2 + h * 0.55, -d * 0.2);
    group.add(monitor);

    // Monitor stand
    const standGeo = new THREE.CylinderGeometry(w * 0.02, w * 0.02, h * 0.3);
    const stand = new THREE.Mesh(standGeo, new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 }));
    stand.position.set(w * 0.25, -h/2 + h * 0.35, -d * 0.2);
    group.add(stand);
  }

  /**
   * EVA Prep Module: Spacesuit rack + helmet storage + tools
   */
  createEVAPrepMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Spacesuit rack (vertical pole)
    const rackGeo = new THREE.CylinderGeometry(w * 0.03, w * 0.03, h * 0.7);
    const rack = new THREE.Mesh(rackGeo, new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8 }));
    rack.position.set(-w * 0.3, -h/2 + h * 0.35, 0);
    group.add(rack);

    // Spacesuit torso (upper body)
    const torsoGeo = new THREE.BoxGeometry(w * 0.25, h * 0.35, d * 0.2);
    const torso = new THREE.Mesh(torsoGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
    torso.position.set(-w * 0.3, -h/2 + h * 0.5, 0);
    group.add(torso);

    // Helmet on shelf
    const helmetGeo = new THREE.SphereGeometry(w * 0.08, 16, 16);
    const helmet = new THREE.Mesh(helmetGeo, new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      metalness: 0.5
    }));
    helmet.position.set(w * 0.25, -h/2 + h * 0.6, d * 0.2);
    group.add(helmet);

    // Helmet shelf
    const shelfGeo = new THREE.BoxGeometry(w * 0.3, h * 0.02, d * 0.25);
    const shelf = new THREE.Mesh(shelfGeo, new THREE.MeshStandardMaterial({ color: 0x888888 }));
    shelf.position.set(w * 0.25, -h/2 + h * 0.52, d * 0.2);
    group.add(shelf);

    // Tool cabinet
    const toolBoxGeo = new THREE.BoxGeometry(w * 0.2, h * 0.25, d * 0.2);
    const toolBox = new THREE.Mesh(toolBoxGeo, new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.4 }));
    toolBox.position.set(w * 0.25, -h/2 + h * 0.15, -d * 0.25);
    group.add(toolBox);

    // Glove storage hooks
    for (let i = 0; i < 3; i++) {
      const hookGeo = new THREE.CylinderGeometry(w * 0.01, w * 0.01, d * 0.08);
      const hook = new THREE.Mesh(hookGeo, new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 }));
      hook.rotation.x = Math.PI / 2;
      hook.position.set(w * 0.1 * i - w * 0.1, -h/2 + h * 0.35, -d * 0.4);
      group.add(hook);
    }
  }

  /**
   * Airlock Module: Circular hatch + pressure gauges + control panel
   */
  createAirlockMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Circular hatch door
    const hatchGeo = new THREE.CylinderGeometry(w * 0.35, w * 0.35, d * 0.08, 32);
    const hatch = new THREE.Mesh(hatchGeo, new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.9, roughness: 0.2 }));
    hatch.rotation.x = Math.PI / 2;
    hatch.position.set(0, 0, -d * 0.35);
    group.add(hatch);

    // Hatch wheel (outer ring)
    const wheelGeo = new THREE.TorusGeometry(w * 0.25, w * 0.03, 16, 32);
    const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.8 }));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(0, 0, -d * 0.3);
    group.add(wheel);

    // Wheel spokes
    for (let i = 0; i < 6; i++) {
      const spokeGeo = new THREE.BoxGeometry(w * 0.03, d * 0.02, w * 0.25);
      const spoke = new THREE.Mesh(spokeGeo, new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.8 }));
      spoke.rotation.y = (Math.PI / 3) * i;
      spoke.position.set(0, 0, -d * 0.3);
      group.add(spoke);
    }

    // Pressure gauge panel (left side)
    const panelGeo = new THREE.BoxGeometry(w * 0.15, h * 0.2, d * 0.05);
    const panel = new THREE.Mesh(panelGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
    panel.position.set(-w * 0.35, -h/2 + h * 0.5, d * 0.3);
    group.add(panel);

    // Pressure gauges (3 circular dials)
    for (let i = 0; i < 3; i++) {
      const gaugeGeo = new THREE.CylinderGeometry(w * 0.04, w * 0.04, d * 0.02, 32);
      const gauge = new THREE.Mesh(gaugeGeo, new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 0.4
      }));
      gauge.rotation.x = Math.PI / 2;
      gauge.position.set(-w * 0.35, -h/2 + h * 0.35 + i * h * 0.15, d * 0.33);
      group.add(gauge);
    }

    // Warning stripes on floor
    for (let i = 0; i < 4; i++) {
      const stripeGeo = new THREE.BoxGeometry(w * 0.1, h * 0.01, d * 0.8);
      const stripe = new THREE.Mesh(stripeGeo, new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xffff00 : 0x000000 }));
      stripe.position.set(-w * 0.4 + i * w * 0.12, -h/2 + h * 0.01, 0);
      group.add(stripe);
    }
  }

  /**
   * Stowage Module: Shelving racks + storage bags + labeled containers
   */
  createStowageMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Storage rack frame (left side)
    const rackFrameGeo = new THREE.BoxGeometry(w * 0.35, h * 0.8, d * 0.05);
    const rackFrame = new THREE.Mesh(rackFrameGeo, new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.6 }));
    rackFrame.position.set(-w * 0.25, -h/2 + h * 0.4, d * 0.35);
    group.add(rackFrame);

    // Shelves (4 horizontal shelves)
    for (let i = 0; i < 4; i++) {
      const shelfGeo = new THREE.BoxGeometry(w * 0.35, h * 0.02, d * 0.3);
      const shelf = new THREE.Mesh(shelfGeo, new THREE.MeshStandardMaterial({ color: 0x888888 }));
      shelf.position.set(-w * 0.25, -h/2 + h * 0.15 + i * h * 0.2, d * 0.2);
      group.add(shelf);

      // Storage containers on shelves
      for (let j = 0; j < 2; j++) {
        const containerGeo = new THREE.BoxGeometry(w * 0.12, h * 0.08, d * 0.12);
        const container = new THREE.Mesh(containerGeo, new THREE.MeshStandardMaterial({
          color: [0x3366cc, 0x66cc33, 0xcc6633, 0xcc33cc][i],
          roughness: 0.6
        }));
        container.position.set(-w * 0.35 + j * w * 0.2, -h/2 + h * 0.19 + i * h * 0.2, d * 0.2);
        group.add(container);
      }
    }

    // Storage bags (right side - soft goods)
    for (let i = 0; i < 3; i++) {
      const bagGeo = new THREE.SphereGeometry(w * 0.08, 8, 8);
      bagGeo.scale(1, 0.7, 1.2); // Squash to look like bags
      const bag = new THREE.Mesh(bagGeo, new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.8
      }));
      bag.position.set(w * 0.25, -h/2 + h * 0.25 + i * h * 0.2, -d * 0.2);
      group.add(bag);
    }

    // Cargo net
    const netGeo = new THREE.PlaneGeometry(w * 0.3, h * 0.6);
    const net = new THREE.Mesh(netGeo, new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    }));
    net.position.set(w * 0.25, -h/2 + h * 0.4, -d * 0.15);
    group.add(net);
  }

  /**
   * Window Station Module: Window frame + observation chair + camera/telescope
   */
  createWindowStationMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Window frame (outer bezel)
    const frameGeo = new THREE.BoxGeometry(w * 0.5, h * 0.4, d * 0.05);
    const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 }));
    frame.position.set(0, -h/2 + h * 0.5, -d * 0.4);
    group.add(frame);

    // Window glass (transparent with blue tint)
    const glassGeo = new THREE.BoxGeometry(w * 0.45, h * 0.35, d * 0.02);
    const glass = new THREE.Mesh(glassGeo, new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.4,
      metalness: 0.9,
      roughness: 0.1
    }));
    glass.position.set(0, -h/2 + h * 0.5, -d * 0.38);
    group.add(glass);

    // Stars visible through window (small emissive dots)
    for (let i = 0; i < 8; i++) {
      const starGeo = new THREE.SphereGeometry(w * 0.01, 8, 8);
      const star = new THREE.Mesh(starGeo, new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.8
      }));
      star.position.set(
        (Math.random() - 0.5) * w * 0.4,
        -h/2 + h * 0.4 + Math.random() * h * 0.3,
        -d * 0.37
      );
      group.add(star);
    }

    // Observation chair
    const seatGeo = new THREE.BoxGeometry(w * 0.2, h * 0.05, d * 0.2);
    const seat = new THREE.Mesh(seatGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    seat.position.set(0, -h/2 + h * 0.25, 0);
    group.add(seat);

    const backrestGeo = new THREE.BoxGeometry(w * 0.2, h * 0.2, d * 0.05);
    const backrest = new THREE.Mesh(backrestGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    backrest.position.set(0, -h/2 + h * 0.35, d * 0.075);
    group.add(backrest);

    // Camera/telescope on tripod
    const tripodGeo = new THREE.CylinderGeometry(w * 0.01, w * 0.02, h * 0.3);
    const tripod = new THREE.Mesh(tripodGeo, new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 }));
    tripod.position.set(w * 0.3, -h/2 + h * 0.15, d * 0.2);
    group.add(tripod);

    const cameraGeo = new THREE.CylinderGeometry(w * 0.04, w * 0.04, w * 0.15);
    const camera = new THREE.Mesh(cameraGeo, new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6 }));
    camera.rotation.z = Math.PI / 4;
    camera.position.set(w * 0.3, -h/2 + h * 0.35, d * 0.2);
    group.add(camera);

    // Lens (emissive blue)
    const lensGeo = new THREE.CylinderGeometry(w * 0.03, w * 0.03, w * 0.02);
    const lens = new THREE.Mesh(lensGeo, new THREE.MeshStandardMaterial({
      color: 0x0066ff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.5
    }));
    lens.rotation.z = Math.PI / 4;
    lens.position.set(w * 0.3 + w * 0.08, -h/2 + h * 0.35 + w * 0.08, d * 0.2);
    group.add(lens);
  }

  /**
   * Laboratory Module: Microscope + sample containers + analysis equipment
   */
  createLaboratoryMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Lab bench/counter
    const benchGeo = new THREE.BoxGeometry(w * 0.7, h * 0.05, d * 0.4);
    const bench = new THREE.Mesh(benchGeo, new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.3 }));
    bench.position.set(0, -h/2 + h * 0.35, 0);
    group.add(bench);

    // Microscope base
    const microBaseGeo = new THREE.CylinderGeometry(w * 0.06, w * 0.08, h * 0.08);
    const microBase = new THREE.Mesh(microBaseGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.7 }));
    microBase.position.set(-w * 0.2, -h/2 + h * 0.42, 0);
    group.add(microBase);

    // Microscope arm
    const armGeo = new THREE.CylinderGeometry(w * 0.015, w * 0.015, h * 0.25);
    const arm = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 }));
    arm.position.set(-w * 0.2, -h/2 + h * 0.58, 0);
    group.add(arm);

    // Microscope eyepiece
    const eyepieceGeo = new THREE.CylinderGeometry(w * 0.025, w * 0.025, h * 0.08);
    const eyepiece = new THREE.Mesh(eyepieceGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6 }));
    eyepiece.rotation.x = Math.PI / 6;
    eyepiece.position.set(-w * 0.2, -h/2 + h * 0.72, -d * 0.05);
    group.add(eyepiece);

    // Sample containers (petri dishes)
    for (let i = 0; i < 4; i++) {
      const dishGeo = new THREE.CylinderGeometry(w * 0.04, w * 0.04, h * 0.01, 32);
      const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({
        color: 0xaaffaa,
        transparent: true,
        opacity: 0.6
      }));
      dish.position.set(w * 0.1 + (i % 2) * w * 0.12, -h/2 + h * 0.38, -d * 0.1 + Math.floor(i / 2) * d * 0.15);
      group.add(dish);
    }

    // Sample storage freezer
    const freezerGeo = new THREE.BoxGeometry(w * 0.25, h * 0.3, d * 0.25);
    const freezer = new THREE.Mesh(freezerGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5 }));
    freezer.position.set(w * 0.25, -h/2 + h * 0.5, d * 0.15);
    group.add(freezer);

    // Freezer display (blue emissive)
    const displayGeo = new THREE.BoxGeometry(w * 0.1, h * 0.05, d * 0.01);
    const display = new THREE.Mesh(displayGeo, new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.4
    }));
    display.position.set(w * 0.25, -h/2 + h * 0.62, d * 0.28);
    group.add(display);

    // Test tubes in rack
    for (let i = 0; i < 6; i++) {
      const tubeGeo = new THREE.CylinderGeometry(w * 0.008, w * 0.008, h * 0.08);
      const tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({
        color: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff][i],
        transparent: true,
        opacity: 0.7
      }));
      tube.position.set(-w * 0.05 + (i % 3) * w * 0.05, -h/2 + h * 0.42, d * 0.15 + Math.floor(i / 3) * d * 0.08);
      group.add(tube);
    }
  }

  /**
   * Communications Module: Telephone with wire + antenna dish + control panel with buttons
   */
  createCommunicationsMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Main communications console
    const consoleGeo = new THREE.BoxGeometry(w * 0.4, h * 0.5, d * 0.3);
    const console = new THREE.Mesh(consoleGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6 }));
    console.position.set(-w * 0.2, -h/2 + h * 0.25, 0);
    group.add(console);

    // Control panel screen (emissive green)
    const screenGeo = new THREE.BoxGeometry(w * 0.3, h * 0.2, d * 0.02);
    const screen = new THREE.Mesh(screenGeo, new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    }));
    screen.position.set(-w * 0.2, -h/2 + h * 0.4, d * 0.16);
    group.add(screen);

    // Control buttons (grid of 6 buttons)
    for (let i = 0; i < 6; i++) {
      const buttonGeo = new THREE.CylinderGeometry(w * 0.02, w * 0.02, h * 0.02, 16);
      const button = new THREE.Mesh(buttonGeo, new THREE.MeshStandardMaterial({
        color: i === 0 ? 0xff0000 : 0x00ff00,
        emissive: i === 0 ? 0xff0000 : 0x00ff00,
        emissiveIntensity: 0.3
      }));
      button.rotation.x = Math.PI / 2;
      button.position.set(
        -w * 0.3 + (i % 3) * w * 0.1,
        -h/2 + h * 0.2 - Math.floor(i / 3) * h * 0.08,
        d * 0.16
      );
      group.add(button);
    }

    // Vintage telephone handset
    const handsetBodyGeo = new THREE.CylinderGeometry(w * 0.025, w * 0.025, w * 0.15, 16);
    const handsetBody = new THREE.Mesh(handsetBodyGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4 }));
    handsetBody.rotation.z = Math.PI / 4;
    handsetBody.position.set(w * 0.15, -h/2 + h * 0.35, -d * 0.15);
    group.add(handsetBody);

    // Telephone earpiece (sphere)
    const earpieceGeo = new THREE.SphereGeometry(w * 0.04, 16, 16);
    const earpiece = new THREE.Mesh(earpieceGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 }));
    earpiece.position.set(w * 0.22, -h/2 + h * 0.42, -d * 0.22);
    group.add(earpiece);

    // Telephone mouthpiece (sphere)
    const mouthpieceGeo = new THREE.SphereGeometry(w * 0.04, 16, 16);
    const mouthpiece = new THREE.Mesh(mouthpieceGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 }));
    mouthpiece.position.set(w * 0.08, -h/2 + h * 0.28, -d * 0.08);
    group.add(mouthpiece);

    // Curly telephone wire (spiral path)
    const wireMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 });
    const wireSegments = 20;
    for (let i = 0; i < wireSegments; i++) {
      const t = i / wireSegments;
      const wireGeo = new THREE.CylinderGeometry(w * 0.005, w * 0.005, w * 0.015);
      const wireSeg = new THREE.Mesh(wireGeo, wireMaterial);

      // Spiral path from handset to console
      const angle = t * Math.PI * 4; // 4 coils
      const spiralRadius = w * 0.05;
      wireSeg.position.set(
        w * 0.08 + t * (w * 0.07) + Math.cos(angle) * spiralRadius,
        -h/2 + h * 0.28 - t * h * 0.05,
        -d * 0.08 + Math.sin(angle) * spiralRadius
      );
      wireSeg.rotation.z = angle;
      group.add(wireSeg);
    }

    // Antenna dish (parabolic)
    const dishGeo = new THREE.SphereGeometry(w * 0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide
    }));
    dish.rotation.x = Math.PI;
    dish.position.set(w * 0.25, -h/2 + h * 0.6, d * 0.2);
    group.add(dish);

    // Antenna feed (center point)
    const feedGeo = new THREE.CylinderGeometry(w * 0.01, w * 0.01, h * 0.08);
    const feed = new THREE.Mesh(feedGeo, new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.8 }));
    feed.position.set(w * 0.25, -h/2 + h * 0.64, d * 0.2);
    group.add(feed);

    // Antenna mount arm
    const armGeo = new THREE.CylinderGeometry(w * 0.015, w * 0.015, h * 0.15);
    const arm = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.7 }));
    arm.position.set(w * 0.25, -h/2 + h * 0.52, d * 0.2);
    group.add(arm);
  }

  /**
   * IFM/Repair Module: Tool bench + spare parts + diagnostic equipment
   */
  createIFMRepairMesh(group, baseMat, accentMat) {
    const { w, h, d } = this.dimensions;

    // Work bench
    const benchGeo = new THREE.BoxGeometry(w * 0.6, h * 0.05, d * 0.4);
    const bench = new THREE.Mesh(benchGeo, new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 }));
    bench.position.set(0, -h/2 + h * 0.3, 0);
    group.add(bench);

    // Tool pegboard (back wall)
    const pegboardGeo = new THREE.BoxGeometry(w * 0.5, h * 0.5, d * 0.02);
    const pegboard = new THREE.Mesh(pegboardGeo, new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.9 }));
    pegboard.position.set(0, -h/2 + h * 0.55, -d * 0.35);
    group.add(pegboard);

    // Tools hanging on pegboard (wrenches, screwdrivers)
    const toolPositions = [
      [-w*0.15, h*0.65, -d*0.34], [-w*0.05, h*0.65, -d*0.34], [w*0.05, h*0.65, -d*0.34], [w*0.15, h*0.65, -d*0.34],
      [-w*0.15, h*0.5, -d*0.34], [-w*0.05, h*0.5, -d*0.34], [w*0.05, h*0.5, -d*0.34], [w*0.15, h*0.5, -d*0.34]
    ];

    toolPositions.forEach((pos, i) => {
      const toolGeo = i % 2 === 0
        ? new THREE.BoxGeometry(w * 0.03, h * 0.08, d * 0.01) // Wrench
        : new THREE.CylinderGeometry(w * 0.005, w * 0.005, h * 0.08); // Screwdriver
      const tool = new THREE.Mesh(toolGeo, new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x888888 : 0xff6600,
        metalness: 0.8
      }));
      tool.position.set(pos[0], -h/2 + pos[1], pos[2]);
      group.add(tool);
    });

    // Toolbox on bench (red)
    const toolboxGeo = new THREE.BoxGeometry(w * 0.25, h * 0.12, d * 0.18);
    const toolbox = new THREE.Mesh(toolboxGeo, new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.4 }));
    toolbox.position.set(-w * 0.2, -h/2 + h * 0.39, 0);
    group.add(toolbox);

    // Toolbox handle
    const handleGeo = new THREE.TorusGeometry(w * 0.06, w * 0.008, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 }));
    handle.rotation.x = Math.PI / 2;
    handle.position.set(-w * 0.2, -h/2 + h * 0.48, 0);
    group.add(handle);

    // Spare parts bins (stackable containers)
    for (let i = 0; i < 3; i++) {
      const binGeo = new THREE.BoxGeometry(w * 0.15, h * 0.08, d * 0.15);
      const bin = new THREE.Mesh(binGeo, new THREE.MeshStandardMaterial({
        color: [0x3366cc, 0x66cc33, 0xcccc33][i],
        transparent: true,
        opacity: 0.7
      }));
      bin.position.set(w * 0.25, -h/2 + h * 0.35 + i * h * 0.09, d * 0.15);
      group.add(bin);
    }

    // Diagnostic tablet/device on bench
    const tabletGeo = new THREE.BoxGeometry(w * 0.12, h * 0.01, d * 0.18);
    const tablet = new THREE.Mesh(tabletGeo, new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      emissive: 0x0066ff,
      emissiveIntensity: 0.3
    }));
    tablet.rotation.x = -Math.PI / 6;
    tablet.position.set(w * 0.1, -h/2 + h * 0.34, -d * 0.1);
    group.add(tablet);

    // Vise grip on bench edge
    const viseBaseGeo = new THREE.BoxGeometry(w * 0.08, h * 0.06, d * 0.08);
    const viseBase = new THREE.Mesh(viseBaseGeo, new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 }));
    viseBase.position.set(-w * 0.25, -h/2 + h * 0.3, -d * 0.15);
    group.add(viseBase);

    const viseJawGeo = new THREE.BoxGeometry(w * 0.02, h * 0.08, d * 0.08);
    const viseJaw = new THREE.Mesh(viseJawGeo, new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.9 }));
    viseJaw.position.set(-w * 0.21, -h/2 + h * 0.34, -d * 0.15);
    group.add(viseJaw);

    // Wire spool
    const spoolGeo = new THREE.CylinderGeometry(w * 0.04, w * 0.04, d * 0.06, 16);
    const spool = new THREE.Mesh(spoolGeo, new THREE.MeshStandardMaterial({ color: 0xff6600 }));
    spool.rotation.z = Math.PI / 2;
    spool.position.set(w * 0.15, -h/2 + h * 0.35, -d * 0.15);
    group.add(spool);
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

    // Swap tile dimensions if tile system available
    if (this.tileSystem) {
      const tempTile = this.tileWidth;
      this.tileWidth = this.tileHeight;
      this.tileHeight = tempTile;

      // Update tile occupancy
      this.tileSystem.clearModuleOccupancy(this.moduleId);
      this.tileSystem.markModuleOccupancy(
        this.tileX, this.tileY,
        this.tileWidth, this.tileHeight,
        this.moduleId, this.zone
      );
    }

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

    // Recreate door with new orientation
    this.createDoor();

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
   * Place module at tile coordinates
   * CorsixTH-inspired tile-based placement
   *
   * @param {number} tileX - Tile X coordinate
   * @param {number} tileY - Tile Y coordinate
   * @returns {boolean} True if placement successful
   */
  placeAtTile(tileX, tileY) {
    if (!this.tileSystem) {
      console.warn('Module has no tile system reference');
      return false;
    }

    // Validate placement
    if (!this.canPlaceAt(tileX, tileY)) {
      console.warn(`Cannot place ${this.moduleName} at tile (${tileX}, ${tileY})`);
      return false;
    }

    // Clear previous position if already placed
    if (this.tileX !== 0 || this.tileY !== 0) {
      this.tileSystem.clearModuleOccupancy(this.moduleId);
    }

    // Set new tile position
    this.tileX = tileX;
    this.tileY = tileY;

    // Update Three.js world position
    const worldPos = this.tileSystem.tileToWorld(tileX, tileY);
    this.position.set(worldPos.x, this.dimensions.h / 2, worldPos.z);

    // Mark tiles as occupied in tile system
    this.tileSystem.markModuleOccupancy(
      tileX, tileY,
      this.tileWidth, this.tileHeight,
      this.moduleId, this.zone
    );

    // Create/update door
    this.createDoor();

    return true;
  }

  /**
   * Create or update door for this module
   */
  createDoor() {
    if (!this.tileSystem) return;

    // Remove existing door if any
    if (this.door) {
      this.tileSystem.clearDoorTile(this.door.tileX, this.door.tileY);
      this.remove(this.door);
      this.door.dispose();
      this.door = null;
    }

    // Determine door position based on rotation
    const doorInfo = this.getDoorPosition();

    if (!doorInfo) {
      console.warn(`Cannot determine door position for ${this.moduleName}`);
      return;
    }

    // Create door
    this.door = new Door(this, doorInfo.tileX, doorInfo.tileY, doorInfo.direction);

    // Position door in 3D space
    const doorWorldPos = this.tileSystem.tileToWorld(doorInfo.tileX, doorInfo.tileY);
    this.door.position.set(
      doorWorldPos.x - this.position.x,
      0 - this.position.y + this.dimensions.h / 2,
      doorWorldPos.z - this.position.z
    );

    // Mark tile as door in tile system
    this.tileSystem.markDoorTile(doorInfo.tileX, doorInfo.tileY, this.moduleId);

    // Add door to module
    this.add(this.door);

    console.log(`✅ Door created for ${this.moduleName} at tile (${doorInfo.tileX}, ${doorInfo.tileY}) facing ${doorInfo.direction}`);
  }

  /**
   * Get door position based on module dimensions and rotation
   * @returns {{tileX: number, tileY: number, direction: string}|null}
   */
  getDoorPosition() {
    if (!this.tileSystem) return null;

    let doorTileX = this.tileX;
    let doorTileY = this.tileY;
    let direction = 'south';

    // Calculate door position based on rotation
    // Door is always at the "front" (south side before rotation)
    const centerX = Math.floor(this.tileWidth / 2);
    const centerY = Math.floor(this.tileHeight / 2);

    switch (this.rotationAngle) {
      case 0: // South-facing
        doorTileX = this.tileX + centerX;
        doorTileY = this.tileY + this.tileHeight - 1;
        direction = 'south';
        break;
      case 90: // West-facing
        doorTileX = this.tileX;
        doorTileY = this.tileY + centerY;
        direction = 'west';
        break;
      case 180: // North-facing
        doorTileX = this.tileX + centerX;
        doorTileY = this.tileY;
        direction = 'north';
        break;
      case 270: // East-facing
        doorTileX = this.tileX + this.tileWidth - 1;
        doorTileY = this.tileY + centerY;
        direction = 'east';
        break;
    }

    return { tileX: doorTileX, tileY: doorTileY, direction };
  }

  /**
   * Check if module can be placed at given tile position
   *
   * @param {number} tileX - Tile X coordinate
   * @param {number} tileY - Tile Y coordinate
   * @returns {boolean} True if placement is valid
   */
  canPlaceAt(tileX, tileY) {
    if (!this.tileSystem) return false;

    // Check bounds
    if (tileX < 0 || tileY < 0) return false;
    if (tileX + this.tileWidth > this.tileSystem.width) return false;
    if (tileY + this.tileHeight > this.tileSystem.height) return false;

    // Check tile occupancy
    for (let dy = 0; dy < this.tileHeight; dy++) {
      for (let dx = 0; dx < this.tileWidth; dx++) {
        const tile = this.tileSystem.getTile(tileX + dx, tileY + dy);
        if (!tile) return false;

        // Tile is occupied by a different module
        if (tile.occupied && tile.moduleId !== this.moduleId) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get all tiles occupied by this module
   *
   * @returns {Array<Object>} Array of tile objects
   */
  getOccupiedTiles() {
    if (!this.tileSystem) return [];

    return this.tileSystem.getTilesInRect(
      this.tileX, this.tileY,
      this.tileWidth, this.tileHeight
    );
  }

  /**
   * Get tile coordinates of module center
   *
   * @returns {{x: number, y: number}} Center tile position
   */
  getCenterTile() {
    return {
      x: this.tileX + Math.floor(this.tileWidth / 2),
      y: this.tileY + Math.floor(this.tileHeight / 2)
    };
  }

  /**
   * Remove module from tile system
   */
  removeTileOccupancy() {
    if (!this.tileSystem) return;
    this.tileSystem.clearModuleOccupancy(this.moduleId);
  }

  /**
   * Get module entrance tile (next to door)
   * For crew pathfinding
   *
   * @param {boolean} inside - If true, get tile inside module; else outside
   * @returns {{x: number, y: number}|null} Entrance tile coordinates
   */
  getEntranceTile(inside = false) {
    if (!this.door) {
      // Default to center front if no door
      const centerX = this.tileX + Math.floor(this.tileWidth / 2);
      const frontY = inside ? this.tileY : this.tileY - 1;
      return { x: centerX, y: frontY };
    }

    // Use door position
    if (inside) {
      return this.door.getInsideTile();
    } else {
      return this.door.getOutsideTile();
    }
  }

  /**
   * Dispose of module resources
   */
  dispose() {
    // Clear tile occupancy
    this.removeTileOccupancy();

    // Dispose door
    if (this.door && this.tileSystem) {
      this.tileSystem.clearDoorTile(this.door.tileX, this.door.tileY);
      this.door.dispose();
      this.door = null;
    }

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

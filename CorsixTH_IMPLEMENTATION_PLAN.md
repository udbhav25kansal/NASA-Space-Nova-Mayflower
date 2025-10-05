# CorsixTH Feature Integration Plan
## Habitat Harmony LS²: Character Movement & Enhanced Simulation

**Analysis Source:** CorsixTH Repository (https://github.com/CorsixTH/CorsixTH.git)
**Target Project:** NASA Space Apps - Lunar Habitat Simulator

---

## Executive Summary

This document provides a step-by-step implementation plan for integrating Theme Hospital (CorsixTH) inspired features into the NASA Lunar Habitat Simulator, focusing on:

1. **Tile-Based Layout System** - Grid-based module placement
2. **Character/Crew Movement** - Astronaut simulation with pathfinding
3. **Object Placement System** - Interior equipment and furniture
4. **Action Queue Architecture** - Crew behavior and activities
5. **Door & Navigation** - Room access and queuing

**Key Adaptations:**
- CorsixTH uses Lua + C++; we'll implement in JavaScript + Three.js
- Hospital theme → Lunar habitat theme
- Patients/Staff → Astronaut crew members
- Rooms → Habitat modules
- Medical equipment → Life support / research equipment

---

## CorsixTH Architecture Analysis

### Core Systems Studied

#### 1. **Tile-Based Map System** (`map.lua`)
- 128×128 tile grid
- World-to-screen coordinate transform (isometric)
- Tile flags: passable, roomId, occupied
- Screen coords: `(32*(x-y), 16*(x+y-2))`

**Adaptation for Habitat:**
- 12×8 meter grid (12 tiles × 8 tiles at 1m/tile)
- Orthographic (not isometric) for simplicity
- Tile properties: module assignment, crew accessibility

#### 2. **Room System** (`room.lua`)
- Rectangular footprints (x, y, width, height)
- Door placement at boundaries
- Required vs optional objects
- Staff/Patient occupancy tracking

**Adaptation for Habitat:**
- Habitat modules = rooms
- Door system for airlock/access control
- Required equipment per module type
- Crew tracking within modules

#### 3. **Entity System** (`entities/humanoid.lua`)
- Base Humanoid class
- Animation-driven movement
- 8-directional sprites (walk_north, walk_east, etc.)
- Action queue pattern

**Adaptation for Habitat:**
- CrewMember base class
- Simple 3D capsules or sprite billboards
- 4-directional movement (N/E/S/W)
- Activity scheduling system

#### 4. **Pathfinding** (`th_pathfind.cpp`)
- A* algorithm in C++
- Heap-based open set
- Manhattan heuristic
- Door/obstacle handling

**Adaptation for Habitat:**
- JavaScript A* implementation
- Tile-based navigation
- Module boundary detection
- Emergency path routing

#### 5. **Action Queue** (`humanoid_action.lua`, `humanoid_actions/*.lua`)
- WalkAction, UseObjectAction, IdleAction, QueueAction
- Timer-based execution
- Interrupt handling
- Callbacks for completion

**Adaptation for Habitat:**
- CrewAction base class
- Walk, Work, Exercise, Sleep, Eat actions
- Task prioritization
- Psychological state updates

#### 6. **Object System** (`entities/object.lua`)
- Footprint (tile occupancy)
- Orientation (north/east/south/west)
- Idle animations
- User interaction points

**Adaptation for Habitat:**
- Equipment objects (bunks, consoles, exercise equipment)
- Required per NASA constraints
- Orientation matters for pathfinding
- Crew usage tracking

---

## Implementation Phases

### **Phase A: Foundation (Prompts 1-8)**
Core systems needed before any character movement

### **Phase B: Character System (Prompts 9-16)**
Crew members, movement, and basic AI

### **Phase C: Advanced Simulation (Prompts 17-23)**
Time progression, tasks, and full simulation loop

---

# PHASE A: FOUNDATION

---

## Prompt 1: Tile-Based Coordinate System

**Objective:** Replace continuous Three.js positioning with discrete tile-based system.

**Why This Matters:**
- Enables predictable pathfinding
- Simplifies collision detection
- Aligns with NASA's 1m grid requirement
- Matches CorsixTH architecture

### Implementation

**File:** `src/scene/TileSystem.js`

```javascript
/**
 * Tile-Based Coordinate System
 * Inspired by CorsixTH's map system
 *
 * Grid: 12 tiles (X) × 8 tiles (Y)
 * Tile size: 1.0 meters (NASA standard)
 * Coordinate origin: Center of habitat floor
 */

class TileSystem {
  constructor(width = 12, height = 8, tileSize = 1.0) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;

    // 2D tile array
    this.tiles = this.initializeTiles();
  }

  initializeTiles() {
    const tiles = [];
    for (let y = 0; y < this.height; y++) {
      tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        tiles[y][x] = {
          // Position
          x, y,

          // Occupancy
          occupied: false,
          moduleId: null,
          objectId: null,

          // Navigation
          passable: true,
          pathCost: 1.0,

          // Room assignment
          roomId: null,
          doorTile: false,

          // NASA zones
          zone: null,  // 'clean' or 'dirty'

          // Pathfinding (populated during search)
          gScore: Infinity,
          fScore: Infinity,
          cameFrom: null,
        };
      }
    }
    return tiles;
  }

  /**
   * Convert tile coordinates to Three.js world coordinates
   * @param {number} tileX - Tile X coordinate
   * @param {number} tileY - Tile Y coordinate
   * @returns {{x: number, y: number, z: number}}
   */
  tileToWorld(tileX, tileY) {
    // Origin at center, so offset by half dimensions
    const worldX = (tileX - this.width / 2 + 0.5) * this.tileSize;
    const worldZ = (tileY - this.height / 2 + 0.5) * this.tileSize;

    return { x: worldX, y: 0, z: worldZ };
  }

  /**
   * Convert Three.js world coordinates to tile coordinates
   * @param {number} worldX - World X coordinate
   * @param {number} worldZ - World Z coordinate
   * @returns {{tileX: number, tileY: number}}
   */
  worldToTile(worldX, worldZ) {
    const tileX = Math.floor((worldX / this.tileSize) + (this.width / 2));
    const tileY = Math.floor((worldZ / this.tileSize) + (this.height / 2));

    return { tileX, tileY };
  }

  /**
   * Check if tile coordinates are within bounds
   */
  isValidTile(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Get tile object at coordinates
   */
  getTile(x, y) {
    if (!this.isValidTile(x, y)) return null;
    return this.tiles[y][x];
  }

  /**
   * Get neighboring tiles (4-directional)
   * @returns {Array<{tile, direction}>}
   */
  getNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1, dir: 'north' },
      { dx: 1, dy: 0, dir: 'east' },
      { dx: 0, dy: 1, dir: 'south' },
      { dx: -1, dy: 0, dir: 'west' }
    ];

    for (const { dx, dy, dir } of directions) {
      const tile = this.getTile(x + dx, y + dy);
      if (tile) {
        neighbors.push({ tile, direction: dir });
      }
    }

    return neighbors;
  }

  /**
   * Mark rectangular area as occupied by module
   */
  markModuleOccupancy(x, y, width, height, moduleId, zone) {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        if (tile) {
          tile.occupied = true;
          tile.moduleId = moduleId;
          tile.roomId = moduleId;
          tile.zone = zone;
          tile.passable = false;  // Inside module = not passable
        }
      }
    }
  }

  /**
   * Clear module occupancy
   */
  clearModuleOccupancy(moduleId) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        if (tile.moduleId === moduleId) {
          tile.occupied = false;
          tile.moduleId = null;
          tile.roomId = null;
          tile.zone = null;
          tile.passable = true;
        }
      }
    }
  }

  /**
   * Mark door tiles (passable entrances to modules)
   */
  markDoorTile(x, y, moduleId) {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.doorTile = true;
      tile.passable = true;
      tile.roomId = moduleId;
    }
  }

  /**
   * Get all tiles in a rectangular area
   */
  getTilesInRect(x, y, width, height) {
    const tiles = [];
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tile = this.getTile(x + dx, y + dy);
        if (tile) tiles.push(tile);
      }
    }
    return tiles;
  }

  /**
   * Reset pathfinding data (call before each search)
   */
  resetPathfindingData() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        tile.gScore = Infinity;
        tile.fScore = Infinity;
        tile.cameFrom = null;
      }
    }
  }
}

export default TileSystem;
```

**Testing:**
```javascript
// In browser console
const tileSystem = new TileSystem(12, 8, 1.0);

// Test coordinate conversion
const world = tileSystem.tileToWorld(6, 4);
console.log('Center tile world position:', world);

const tile = tileSystem.worldToTile(0, 0);
console.log('World origin tile:', tile);

// Should be reciprocal
const roundTrip = tileSystem.tileToWorld(tile.tileX, tile.tileY);
console.log('Round trip:', roundTrip);
```

**Integration:**
Update `src/main.js`:

```javascript
import TileSystem from './scene/TileSystem.js';

// Initialize tile system
const tileSystem = new TileSystem(12, 8, 1.0);
window.tileSystem = tileSystem;  // For debugging
```

---

## Prompt 2: Update Module Class for Tile Placement

**Objective:** Modify Module class to use tile coordinates instead of continuous positioning.

**File:** `src/habitat/Module.js`

Add tile-based properties:

```javascript
class HabitatModule extends THREE.Group {
  constructor(catalogItem, constraints, tileSystem) {
    super();

    // ... existing properties ...

    // Tile-based positioning
    this.tileSystem = tileSystem;
    this.tileX = 0;
    this.tileY = 0;
    this.tileWidth = Math.ceil(catalogItem.w / tileSystem.tileSize);
    this.tileHeight = Math.ceil(catalogItem.d / tileSystem.tileSize);

    // Track interior objects
    this.objects = [];

    // Door reference
    this.door = null;
  }

  /**
   * Place module at tile coordinates
   */
  placeAtTile(tileX, tileY) {
    // Validate placement
    if (!this.canPlaceAt(tileX, tileY)) {
      console.warn('Cannot place module at', tileX, tileY);
      return false;
    }

    // Clear previous position
    if (this.tileX !== 0 || this.tileY !== 0) {
      this.tileSystem.clearModuleOccupancy(this.id);
    }

    // Set new position
    this.tileX = tileX;
    this.tileY = tileY;

    // Update Three.js position
    const worldPos = this.tileSystem.tileToWorld(tileX, tileY);
    this.position.set(worldPos.x, worldPos.y, worldPos.z);

    // Mark tiles as occupied
    this.tileSystem.markModuleOccupancy(
      tileX, tileY,
      this.tileWidth, this.tileHeight,
      this.id, this.zone
    );

    return true;
  }

  /**
   * Check if module can be placed at tile position
   */
  canPlaceAt(tileX, tileY) {
    // Check bounds
    if (tileX < 0 || tileY < 0) return false;
    if (tileX + this.tileWidth > this.tileSystem.width) return false;
    if (tileY + this.tileHeight > this.tileSystem.height) return false;

    // Check tile occupancy
    for (let dy = 0; dy < this.tileHeight; dy++) {
      for (let dx = 0; dx < this.tileWidth; dx++) {
        const tile = this.tileSystem.getTile(tileX + dx, tileY + dy);
        if (!tile || (tile.occupied && tile.moduleId !== this.id)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get all tiles occupied by this module
   */
  getOccupiedTiles() {
    return this.tileSystem.getTilesInRect(
      this.tileX, this.tileY,
      this.tileWidth, this.tileHeight
    );
  }

  /**
   * Get tile coordinates of module center
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
    this.tileSystem.clearModuleOccupancy(this.id);
  }
}
```

**Update DragControls:**

```javascript
// In DragControls.js
// Replace continuous drag with tile snapping

onMouseMove(event) {
  // ... raycasting code ...

  if (this.selectedModule && intersection) {
    const worldX = intersection.point.x;
    const worldZ = intersection.point.z;

    // Convert to tile coordinates
    const { tileX, tileY } = this.tileSystem.worldToTile(worldX, worldZ);

    // Attempt to place at tile
    this.selectedModule.placeAtTile(tileX, tileY);
  }
}
```

---

## Prompt 3: Enhanced Grid Visualization

**Objective:** Create visual grid showing tile boundaries and occupancy states.

**File:** `src/scene/GridSystem.js` (update)

```javascript
class GridSystem extends THREE.Group {
  constructor(tileSystem) {
    super();
    this.tileSystem = tileSystem;

    this.createTileGrid();
    this.createBoundaryLines();

    // Store tile meshes for dynamic updates
    this.tileMeshes = [];
  }

  createTileGrid() {
    const { width, height, tileSize } = this.tileSystem;

    // Create individual tile planes
    for (let y = 0; y < height; y++) {
      this.tileMeshes[y] = [];

      for (let x = 0; x < width; x++) {
        const geometry = new THREE.PlaneGeometry(tileSize * 0.95, tileSize * 0.95);
        const material = new THREE.MeshBasicMaterial({
          color: 0x334155,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0.005;

        const worldPos = this.tileSystem.tileToWorld(x, y);
        mesh.position.x = worldPos.x;
        mesh.position.z = worldPos.z;

        mesh.userData = { tileX: x, tileY: y };

        this.add(mesh);
        this.tileMeshes[y][x] = mesh;
      }
    }
  }

  createBoundaryLines() {
    // Major grid lines at tile boundaries
    const { width, height, tileSize } = this.tileSystem;
    const material = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.4
    });

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const points = [];
      const worldX = (x - width / 2) * tileSize;
      points.push(new THREE.Vector3(worldX, 0.01, -height / 2 * tileSize));
      points.push(new THREE.Vector3(worldX, 0.01, height / 2 * tileSize));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.add(line);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      const points = [];
      const worldZ = (y - height / 2) * tileSize;
      points.push(new THREE.Vector3(-width / 2 * tileSize, 0.01, worldZ));
      points.push(new THREE.Vector3(width / 2 * tileSize, 0.01, worldZ));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);
      this.add(line);
    }
  }

  /**
   * Update tile colors based on occupancy
   */
  updateTileVisuals() {
    for (let y = 0; y < this.tileSystem.height; y++) {
      for (let x = 0; x < this.tileSystem.width; x++) {
        const tile = this.tileSystem.getTile(x, y);
        const mesh = this.tileMeshes[y][x];

        if (!mesh || !tile) continue;

        // Color based on tile state
        if (tile.occupied) {
          mesh.material.color.setHex(0xef4444);  // Red = occupied
          mesh.material.opacity = 0.2;
        } else if (!tile.passable) {
          mesh.material.color.setHex(0xf59e0b);  // Amber = blocked
          mesh.material.opacity = 0.15;
        } else if (tile.doorTile) {
          mesh.material.color.setHex(0x3b82f6);  // Blue = door
          mesh.material.opacity = 0.2;
        } else {
          mesh.material.color.setHex(0x334155);  // Gray = empty
          mesh.material.opacity = 0.1;
        }
      }
    }
  }

  /**
   * Highlight path for debugging
   */
  highlightPath(path) {
    if (!path) return;

    for (const tile of path) {
      const mesh = this.tileMeshes[tile.y][tile.x];
      if (mesh) {
        mesh.material.color.setHex(0x10b981);  // Green = path
        mesh.material.opacity = 0.4;
      }
    }

    // Clear after 2 seconds
    setTimeout(() => this.updateTileVisuals(), 2000);
  }
}
```

**Integration:**

```javascript
// In main.js
const gridSystem = new GridSystem(tileSystem);
scene.add(gridSystem);

// Update grid when modules change
function onModulePlaced() {
  gridSystem.updateTileVisuals();
}
```

---

*[Prompts 4-8 continue with: Door System, Object Catalog, Placeable Objects, Object Placement UI, Save/Load with Tiles]*

---

# PHASE B: CHARACTER SYSTEM

---

## Prompt 9: CrewMember Entity Class

**Objective:** Create astronaut/crew entity system inspired by CorsixTH humanoids.

**Reference:** `CorsixTH/Lua/entities/humanoid.lua`

**File:** `src/entities/CrewMember.js`

```javascript
import * as THREE from 'three';

/**
 * CrewMember - Astronaut entity
 * Inspired by CorsixTH Humanoid class
 *
 * Capabilities:
 * - Tile-based movement
 * - Action queue execution
 * - Directional facing
 * - Mood/attribute tracking
 */

class CrewMember extends THREE.Group {
  constructor(world, crewData) {
    super();

    this.world = world;
    this.id = `crew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Crew attributes
    this.name = crewData.name || 'Astronaut';
    this.role = crewData.role || 'Engineer';  // Commander, Engineer, Scientist, Medical

    // Position (tile-based)
    this.tileX = 0;
    this.tileY = 0;
    this.targetTile = null;

    // Movement
    this.speed = 2.0;  // tiles per second
    this.isMoving = false;
    this.facingDirection = 'south';  // north, east, south, west

    // Animation state
    this.animationState = 'idle';  // idle, walking, working, sleeping
    this.animationTime = 0;

    // Action queue (CorsixTH pattern)
    this.actionQueue = [];
    this.currentAction = null;

    // Current assignment
    this.assignedModule = null;
    this.assignedObject = null;

    // Attributes (for Phase 2 psychological model)
    this.stress = 20;
    this.mood = 70;
    this.fatigue = 10;
    this.health = 100;
    this.hunger = 20;

    this.createVisuals();
    this.createNameLabel();
    this.createMoodIndicator();
  }

  createVisuals() {
    // Simple capsule representing astronaut
    // TODO: Replace with sprite billboard or 3D model
    const bodyGeometry = new THREE.CapsuleGeometry(0.25, 1.5, 8, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.getRoleColor(),
      metalness: 0.4,
      roughness: 0.6
    });

    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.y = 0.875;
    this.body.castShadow = true;
    this.body.receiveShadow = true;

    this.add(this.body);

    // Helmet (sphere)
    const helmetGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const helmetMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });

    this.helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    this.helmet.position.y = 1.8;
    this.add(this.helmet);
  }

  getRoleColor() {
    const colors = {
      'Commander': 0xffd700,
      'Engineer': 0x0ea5e9,
      'Scientist': 0x10b981,
      'Medical': 0xef4444
    };
    return colors[this.role] || 0xcccccc;
  }

  createNameLabel() {
    // Canvas-based name sprite
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, 512, 128);

    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });

    this.nameLabel = new THREE.Sprite(material);
    this.nameLabel.scale.set(2, 0.5, 1);
    this.nameLabel.position.y = 2.5;
    this.add(this.nameLabel);
  }

  createMoodIndicator() {
    // Floating icon above head
    const geometry = new THREE.SphereGeometry(0.15, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: this.getMoodColor(),
      transparent: true,
      opacity: 0.8
    });

    this.moodIndicator = new THREE.Mesh(geometry, material);
    this.moodIndicator.position.y = 3.0;
    this.add(this.moodIndicator);
  }

  getMoodColor() {
    if (this.stress > 70) return 0xff0000;      // High stress = red
    if (this.stress > 40) return 0xff6600;      // Medium stress = orange
    if (this.mood > 60) return 0x00ff00;        // Happy = green
    return 0xffff00;                             // Neutral = yellow
  }

  /**
   * Set tile position (instant, no animation)
   */
  setTilePosition(tileX, tileY) {
    this.tileX = tileX;
    this.tileY = tileY;

    const worldPos = this.world.tileSystem.tileToWorld(tileX, tileY);
    this.position.set(worldPos.x, 0, worldPos.z);
  }

  /**
   * Queue an action for execution
   */
  queueAction(action) {
    this.actionQueue.push(action);

    if (!this.currentAction) {
      this.processNextAction();
    }
  }

  /**
   * Process next action in queue
   */
  processNextAction() {
    if (this.actionQueue.length === 0) {
      this.currentAction = null;
      this.animationState = 'idle';
      return;
    }

    this.currentAction = this.actionQueue.shift();
    this.currentAction.start(this);
  }

  /**
   * Finish current action and move to next
   */
  finishAction() {
    this.currentAction = null;
    this.processNextAction();
  }

  /**
   * Clear all queued actions
   */
  clearActions() {
    this.actionQueue = [];
    if (this.currentAction) {
      this.currentAction.interrupt();
    }
    this.currentAction = null;
    this.animationState = 'idle';
  }

  /**
   * Update loop (called each frame)
   */
  update(deltaTime) {
    // Update current action
    if (this.currentAction) {
      this.currentAction.update(this, deltaTime);
    }

    // Update facing direction visual
    this.updateFacingDirection();

    // Update mood indicator
    this.moodIndicator.material.color.setHex(this.getMoodColor());

    // Animate mood indicator bobbing
    this.moodIndicator.position.y = 3.0 + Math.sin(this.animationTime * 2) * 0.1;

    this.animationTime += deltaTime;
  }

  updateFacingDirection() {
    // Rotate body to face direction
    const rotations = {
      north: 0,
      east: Math.PI / 2,
      south: Math.PI,
      west: -Math.PI / 2
    };

    this.body.rotation.y = rotations[this.facingDirection] || 0;
    this.helmet.rotation.y = rotations[this.facingDirection] || 0;
  }

  /**
   * Get crew status for UI
   */
  getStatus() {
    return {
      name: this.name,
      role: this.role,
      position: `(${this.tileX}, ${this.tileY})`,
      action: this.currentAction ? this.currentAction.type : 'idle',
      stress: this.stress.toFixed(0),
      mood: this.mood.toFixed(0),
      fatigue: this.fatigue.toFixed(0)
    };
  }

  /**
   * Dispose of resources
   */
  dispose() {
    this.clearActions();
    this.body.geometry.dispose();
    this.body.material.dispose();
    this.helmet.geometry.dispose();
    this.helmet.material.dispose();
    this.moodIndicator.geometry.dispose();
    this.moodIndicator.material.dispose();
    this.nameLabel.material.map.dispose();
    this.nameLabel.material.dispose();
  }
}

export default CrewMember;
```

---

## Prompt 10: Action Queue System

**Objective:** Implement CorsixTH-style action queue for crew behaviors.

**Reference:** `CorsixTH/Lua/humanoid_action.lua`, `CorsixTH/Lua/humanoid_actions/walk.lua`

**File:** `src/entities/actions/Action.js`

```javascript
/**
 * Base CrewAction class
 * Inspired by CorsixTH HumanoidAction
 */

class CrewAction {
  constructor(type) {
    this.type = type;
    this.isComplete = false;
    this.priority = 0;  // Higher = more important
    this.canInterrupt = true;
  }

  /**
   * Called when action starts
   * @param {CrewMember} crewMember
   */
  start(crewMember) {
    // Override in subclasses
  }

  /**
   * Called each frame while action is active
   * @param {CrewMember} crewMember
   * @param {number} deltaTime
   * @returns {boolean} true if action is complete
   */
  update(crewMember, deltaTime) {
    // Override in subclasses
    return false;
  }

  /**
   * Called when action is interrupted
   */
  interrupt() {
    // Override in subclasses
  }

  /**
   * Get action description for UI
   */
  getDescription() {
    return this.type;
  }
}

export default CrewAction;
```

**File:** `src/entities/actions/WalkAction.js`

```javascript
import CrewAction from './Action.js';

/**
 * WalkAction - Move crew member along a path
 * Inspired by CorsixTH walk.lua
 */

class WalkAction extends CrewAction {
  constructor(targetTileX, targetTileY) {
    super('walk');

    this.targetTileX = targetTileX;
    this.targetTileY = targetTileY;
    this.path = null;
    this.pathIndex = 0;
    this.moveProgress = 0;
    this.currentTile = null;
    this.nextTile = null;
  }

  start(crewMember) {
    // Calculate path using A* pathfinder
    this.path = crewMember.world.pathfinder.findPath(
      crewMember.tileX,
      crewMember.tileY,
      this.targetTileX,
      this.targetTileY
    );

    if (!this.path || this.path.length === 0) {
      console.warn(`No path found from (${crewMember.tileX},${crewMember.tileY}) to (${this.targetTileX},${this.targetTileY})`);
      this.isComplete = true;
      return;
    }

    this.pathIndex = 0;
    this.moveProgress = 0;
    this.currentTile = this.path[0];
    this.nextTile = this.path[1] || this.currentTile;

    crewMember.isMoving = true;
    crewMember.animationState = 'walking';
  }

  update(crewMember, deltaTime) {
    if (this.isComplete || !this.path) {
      crewMember.isMoving = false;
      crewMember.animationState = 'idle';
      return true;
    }

    // Check if reached destination
    if (this.pathIndex >= this.path.length - 1) {
      crewMember.setTilePosition(this.targetTileX, this.targetTileY);
      crewMember.isMoving = false;
      crewMember.animationState = 'idle';
      this.isComplete = true;
      return true;
    }

    // Move towards next tile
    this.currentTile = this.path[this.pathIndex];
    this.nextTile = this.path[this.pathIndex + 1];

    if (!this.nextTile) {
      this.isComplete = true;
      return true;
    }

    // Interpolate position
    this.moveProgress += deltaTime * crewMember.speed;

    if (this.moveProgress >= 1.0) {
      // Reached next tile
      crewMember.tileX = this.nextTile.x;
      crewMember.tileY = this.nextTile.y;
      this.pathIndex++;
      this.moveProgress = 0;

      // Update facing direction
      this.updateFacingDirection(crewMember, this.currentTile, this.nextTile);
    } else {
      // Smooth interpolation
      const currentWorld = crewMember.world.tileSystem.tileToWorld(
        this.currentTile.x, this.currentTile.y
      );
      const nextWorld = crewMember.world.tileSystem.tileToWorld(
        this.nextTile.x, this.nextTile.y
      );

      const lerp = (a, b, t) => a + (b - a) * t;

      crewMember.position.x = lerp(currentWorld.x, nextWorld.x, this.moveProgress);
      crewMember.position.z = lerp(currentWorld.z, nextWorld.z, this.moveProgress);
    }

    return false;
  }

  updateFacingDirection(crewMember, from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      crewMember.facingDirection = dx > 0 ? 'east' : 'west';
    } else {
      crewMember.facingDirection = dy > 0 ? 'south' : 'north';
    }
  }

  interrupt() {
    this.isComplete = true;
  }

  getDescription() {
    return `Walking to (${this.targetTileX}, ${this.targetTileY})`;
  }
}

export default WalkAction;
```

**File:** `src/entities/actions/IdleAction.js`

```javascript
import CrewAction from './Action.js';

class IdleAction extends CrewAction {
  constructor(duration = 1.0) {
    super('idle');
    this.duration = duration;
    this.elapsed = 0;
  }

  start(crewMember) {
    crewMember.animationState = 'idle';
  }

  update(crewMember, deltaTime) {
    this.elapsed += deltaTime;

    if (this.elapsed >= this.duration) {
      this.isComplete = true;
      return true;
    }

    return false;
  }

  getDescription() {
    return `Idling (${(this.duration - this.elapsed).toFixed(1)}s)`;
  }
}

export default IdleAction;
```

**File:** `src/entities/actions/UseObjectAction.js`

```javascript
import CrewAction from './Action.js';

/**
 * UseObjectAction - Interact with equipment
 */

class UseObjectAction extends CrewAction {
  constructor(object, duration = 5.0) {
    super('use_object');
    this.object = object;
    this.duration = duration;
    this.elapsed = 0;
  }

  start(crewMember) {
    crewMember.animationState = 'working';
    crewMember.assignedObject = this.object;

    // Face the object
    const dx = this.object.position.x - crewMember.position.x;
    const dz = this.object.position.z - crewMember.position.z;

    if (Math.abs(dx) > Math.abs(dz)) {
      crewMember.facingDirection = dx > 0 ? 'east' : 'west';
    } else {
      crewMember.facingDirection = dz > 0 ? 'south' : 'north';
    }
  }

  update(crewMember, deltaTime) {
    this.elapsed += deltaTime;

    // TODO: Trigger object-specific animations/effects

    if (this.elapsed >= this.duration) {
      crewMember.assignedObject = null;
      this.isComplete = true;
      return true;
    }

    return false;
  }

  interrupt() {
    // Cleanup
    this.isComplete = true;
  }

  getDescription() {
    return `Using ${this.object.name} (${(this.duration - this.elapsed).toFixed(1)}s)`;
  }
}

export default UseObjectAction;
```

---

*[Prompts 11-16 continue with: A* Pathfinder, Crew Spawning, Crew AI Behaviors, Activity Scheduling, Crew Needs System, Animation System]*

---

# PHASE C: ADVANCED SIMULATION

---

## Prompt 17: Time Simulation & Day/Night Cycle

## Prompt 18: Crew Task Assignment

## Prompt 19: Integration with Psychological Model

## Prompt 20: Performance Optimization

## Prompt 21: Sprite-Based Graphics (Optional)

## Prompt 22: Advanced Crew AI

## Prompt 23: Full Simulation Loop

---

## Summary Implementation Order

### Quick Start Path (Most Important First):

1. **Prompt 1** - Tile System (foundation for everything)
2. **Prompt 2** - Update Module for tiles
3. **Prompt 9** - Crew Member class
4. **Prompt 10** - Action Queue System
5. **Prompt 11** - A* Pathfinding (see next prompt)
6. **Test Movement** - Get basic crew walking working
7. **Prompt 3** - Grid Visualization (helps debugging)
8. **Remaining prompts** - Add as needed

### Parallel Development:
- Grid visualization + Pathfinding can be built simultaneously
- Object placement can happen while crew system is in progress
- UI elements can be added incrementally

---

## Key Differences from CorsixTH

| CorsixTH | Habitat Simulator |
|----------|-------------------|
| Isometric 2D | Orthographic 3D |
| Lua + C++ | JavaScript + Three.js |
| Hospital theme | Lunar habitat |
| Patients/Staff | Astronauts |
| 128×128 tiles | 12×8 tiles |
| Sprite-based | 3D capsules → optional sprites |
| Medical equipment | Life support equipment |

---

## Expected Results

After full implementation:

✅ **Tile-based layout system**
- Modules snap to 1m grid
- Clean coordinate system
- Easy collision detection

✅ **Crew movement**
- 4 astronauts walking around habitat
- A* pathfinding between modules
- Smooth tile-to-tile transitions
- Door navigation

✅ **Object interaction**
- Crew uses equipment (bunks, consoles, exercise)
- Task queuing and scheduling
- Activity animations

✅ **Full simulation**
- Time progression
- Crew needs (sleep, food, exercise)
- Psychological state updates
- NASA compliance maintained

---

## Performance Targets

- **60 FPS** with 4 crew members moving
- **<50ms** per pathfinding calculation
- **<5ms** per frame for all crew updates
- **Smooth animations** with no stuttering

---

## Testing Strategy

1. **Unit Tests** - Each component in isolation
2. **Integration Tests** - Crew + modules + pathfinding
3. **Stress Tests** - Multiple crew, long paths
4. **Visual Tests** - Ensure animations look good
5. **Performance Tests** - Frame rate monitoring

---

## Next Steps After Implementation

**Potential Phase 3 Enhancements:**
- VR first-person walkthrough
- Crew social interactions
- Emergency scenarios (depressurization, fire)
- Equipment failures and repairs
- Research/experiment tasks
- Multiple habitat floors
- EVA (spacewalk) activities

---

**End of CorsixTH Integration Plan**

This plan provides complete guidance for adding Theme Hospital-inspired simulation features while maintaining the NASA scientific integrity of the Lunar Habitat Simulator project.

---

**Repository References:**
- CorsixTH: https://github.com/CorsixTH/CorsixTH
- Key files analyzed:
  - `CorsixTH/Lua/map.lua`
  - `CorsixTH/Lua/room.lua`
  - `CorsixTH/Lua/entities/humanoid.lua`
  - `CorsixTH/Lua/humanoid_actions/walk.lua`
  - `CorsixTH/Src/th_pathfind.cpp`

---

*Generated by Claude Code based on comprehensive analysis of CorsixTH codebase*

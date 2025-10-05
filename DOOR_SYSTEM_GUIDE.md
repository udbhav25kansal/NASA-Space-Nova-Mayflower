# Door System Guide

**Date:** 2025-10-04
**Status:** Complete and Ready to Use

---

## ✅ What's Been Implemented

### Door System Features
- Automatic door creation for all modules
- Door position based on module rotation
- Inside/outside tile calculation
- Visual 3D door frames (blue)
- Door tile marking in TileSystem
- Integration with tile visualization (blue tiles)
- Usage tracking for statistics

---

## 🚪 How Doors Work

### Automatic Creation

**When a module is placed:**
1. Module determines door position based on rotation
2. Creates Door object at calculated position
3. Marks door tile in TileSystem
4. Adds visual 3D door frame to module

**Door Position Logic:**
- Door is placed at the "front" of the module
- Front = center tile of the facing edge
- Direction changes with module rotation:
  - **0° (South-facing)**: Door at bottom edge, center
  - **90° (West-facing)**: Door at left edge, center
  - **180° (North-facing)**: Door at top edge, center
  - **270° (East-facing)**: Door at right edge, center

### Door Tiles

**Three important tiles per door:**
1. **Door Tile** - The tile the door occupies
2. **Inside Tile** - One tile inward from door (inside module)
3. **Outside Tile** - One tile outward from door (outside module)

**Example (South-facing module at tile (5,5), 2×2 size):**
```
Module occupies: (5,5), (6,5), (5,6), (6,6)
Door position: (5,6) - center of south edge
Inside tile: (5,5) - one tile north (inside)
Outside tile: (5,7) - one tile south (outside)
```

---

## 🎨 Visual Representation

### 3D Door Frame

**Geometry:**
- Left frame: Vertical box (0.1m × 2.0m × 1.0m)
- Right frame: Vertical box (0.1m × 2.0m × 1.0m)
- Top frame: Horizontal box (1.0m × 0.1m × 1.0m)

**Material:**
- Color: Blue (#3b82f6)
- Metalness: 0.6
- Roughness: 0.4

**Rotation:**
- Door automatically rotates to face correct direction
- Matches module rotation

### Tile Visualization

**When tile visualization is enabled:**
- Door tiles appear **blue** (#3b82f6)
- Opacity: 0.5 (more opaque than passable tiles)
- Easily distinguish from occupied (red) and passable (green) tiles

---

## 🧪 Testing the Door System

### Test 1: Visual Verification

**Steps:**
1. Open `http://localhost:5176`
2. Enable tile visualization ("🔲 Show Tiles" button)
3. Add a module (e.g., Crew Quarters)
4. Look for blue door tile and 3D door frame

**Expected Results:**
- ✅ Blue door tile at module front edge
- ✅ Blue 3D door frame visible on module
- ✅ Console: `✅ Door created for [Module Name] at tile (x, y) facing [direction]`

### Test 2: Door Rotation

**Steps:**
1. Add a module
2. Enable tile visualization
3. Note door position
4. Press 'R' to rotate module
5. Observe door movement

**Expected Results:**
- ✅ Door tile clears from old position
- ✅ New blue door tile appears at new position
- ✅ 3D door frame rotates with module
- ✅ Door direction updates (north/south/east/west)

**Try rotating 4 times (full circle):**
```javascript
const module = habitatApp.modules[0]
// Rotate and check door each time
for (let i = 0; i < 4; i++) {
  module.rotate90()
  console.log(module.door.getInfo())
}
```

### Test 3: Inspect Door Object

**Steps:**
```javascript
// Get first module
const module = habitatApp.modules[0]

// Get door
const door = module.door

// View door info
console.log(door.getInfo())
```

**Expected Output:**
```javascript
{
  module: "Crew Quarters",
  tile: { x: 5, y: 6 },
  direction: "south",
  inside: { x: 5, y: 5 },
  outside: { x: 5, y: 7 },
  usageCount: 0
}
```

### Test 4: Door Tile Methods

**Steps:**
```javascript
const module = habitatApp.modules[0]
const door = module.door

// Get tiles
const insideTile = door.getInsideTile()
const outsideTile = door.getOutsideTile()

console.log('Inside:', insideTile)   // Tile inside module
console.log('Outside:', outsideTile) // Tile outside module

// Check if crew can use door
const crew = habitatApp.crewMembers[0]
const canUse = door.canUse(crew.tileX, crew.tileY)
console.log('Crew can use door:', canUse)
```

### Test 5: Module Entrance Method

**Steps:**
```javascript
const module = habitatApp.modules[0]

// Get entrance tiles
const insideEntrance = module.getEntranceTile(true)
const outsideEntrance = module.getEntranceTile(false)

console.log('Inside entrance:', insideEntrance)
console.log('Outside entrance:', outsideEntrance)

// These should match door inside/outside tiles
console.log('Match inside:',
  insideEntrance.x === module.door.getInsideTile().x &&
  insideEntrance.y === module.door.getInsideTile().y
)
```

### Test 6: Door Tile Visualization

**Steps:**
1. Enable tile visualization
2. Add 3-4 modules
3. Rotate some modules
4. Observe door tiles

**Expected Results:**
- ✅ Each module has exactly 1 blue door tile
- ✅ Door tiles are at module edges (not corners)
- ✅ Door tiles are passable (crew can walk on them)
- ✅ Rotating module moves the blue door tile

---

## 🔧 Developer API

### Door Class Methods

```javascript
// Door constructor
new Door(module, tileX, tileY, direction)

// Get inside tile (one tile inward)
door.getInsideTile()
// Returns: { x: number, y: number }

// Get outside tile (one tile outward)
door.getOutsideTile()
// Returns: { x: number, y: number }

// Check if crew can use door
door.canUse(crewTileX, crewTileY)
// Returns: boolean

// Use door (increment usage counter)
door.use()

// Get door information
door.getInfo()
// Returns: { module, tile, direction, inside, outside, usageCount }

// Dispose door
door.dispose()
```

### Module Class Door Methods

```javascript
// Get entrance tile
module.getEntranceTile(inside = false)
// Returns: { x: number, y: number }

// Create/update door (automatic)
module.createDoor()

// Get door position info
module.getDoorPosition()
// Returns: { tileX, tileY, direction }

// Door reference
module.door  // Door object or null
```

### TileSystem Door Methods

```javascript
// Mark tile as door
tileSystem.markDoorTile(x, y, moduleId)

// Clear door marker
tileSystem.clearDoorTile(x, y)

// Check if tile is door
const tile = tileSystem.getTile(x, y)
if (tile.isDoor) {
  console.log('This is a door tile')
}
```

---

## 📊 Door Position Calculation

### Algorithm

```javascript
// Module at tile (tileX, tileY)
// Size: tileWidth × tileHeight
// Rotation: 0°, 90°, 180°, or 270°

const centerX = Math.floor(tileWidth / 2)
const centerY = Math.floor(tileHeight / 2)

switch (rotationAngle) {
  case 0:   // South-facing
    doorX = tileX + centerX
    doorY = tileY + tileHeight - 1
    direction = 'south'
    break

  case 90:  // West-facing
    doorX = tileX
    doorY = tileY + centerY
    direction = 'west'
    break

  case 180: // North-facing
    doorX = tileX + centerX
    doorY = tileY
    direction = 'north'
    break

  case 270: // East-facing
    doorX = tileX + tileWidth - 1
    doorY = tileY + centerY
    direction = 'east'
    break
}
```

### Examples

**2×3 Module at (5,5), South-facing (0°):**
```
Module tiles: (5,5), (6,5), (5,6), (6,6), (5,7), (6,7)
centerX = 0, centerY = 1
Door: (5,7) - leftmost tile of bottom edge
Direction: south
```

**3×2 Module at (3,3), East-facing (270°):**
```
Module tiles: (3,3), (4,3), (5,3), (3,4), (4,4), (5,4)
centerX = 1, centerY = 0
Door: (5,3) - rightmost tile of top edge
Direction: east
```

---

## 🎯 Use Cases

### 1. Crew Pathfinding to Modules

```javascript
// Crew wants to enter Crew Quarters
const crewQuarters = habitatApp.modules[0]
const entrance = crewQuarters.getEntranceTile(false) // outside

// Walk to entrance
const crew = habitatApp.crewMembers[0]
crew.walkTo(entrance.x, entrance.y)

// Future: Add EnterModuleAction to walk through door
```

### 2. Door Usage Statistics

```javascript
// Track door usage
const door = module.door

// When crew uses door
door.use()

// Later, check statistics
console.log(`Door used ${door.usageCount} times`)

// Find most-used door
const mostUsed = habitatApp.modules
  .map(m => m.door)
  .filter(d => d)
  .sort((a, b) => b.usageCount - a.usageCount)[0]

console.log('Most used door:', mostUsed.getInfo())
```

### 3. Validate Door Accessibility

```javascript
// Check if door is accessible
const door = module.door
const outside = door.getOutsideTile()

// Check if outside tile is passable
const outsideTile = tileSystem.getTile(outside.x, outside.y)
if (!outsideTile.passable) {
  console.warn('Door blocked! Outside tile not passable')
}

// Check if path exists to door
const path = pathfinder.findPath(
  crew.tileX, crew.tileY,
  outside.x, outside.y
)
if (!path) {
  console.warn('No path to door!')
}
```

---

## 🐛 Known Issues & Limitations

### Expected Behavior (Not Bugs):

1. **One door per module** - Modules only have one entrance
2. **Door always at front** - Cannot customize door position
3. **No door animations** - Doors don't open/close (future feature)
4. **No collision detection** - Crew can walk through doors freely (Phase B)
5. **Door tiles count as module tiles** - Door is part of module footprint

### Actual Bugs to Watch For:

- ❌ Door not appearing after placing module
- ❌ Door not moving when module rotates
- ❌ Blue door tile not showing in visualization
- ❌ Door tile blocking pathfinding
- ❌ Multiple doors on single module
- ❌ Door facing wrong direction

---

## 📈 Future Enhancements

### Phase B Additions:

1. **EnterModuleAction** (Prompt 11)
   - Crew action to walk through door
   - Door usage increment
   - Inside/outside detection

2. **Door Animations**
   - Open/close when crew approaches
   - Sliding door effect
   - Sound effects

3. **Multiple Doors**
   - Larger modules get multiple entrances
   - Emergency exits
   - Configurable door positions

4. **Airlocks**
   - Special door type for EVA modules
   - Two-door system
   - Pressure validation

5. **Door Constraints**
   - NASA requirements for door width
   - Accessibility compliance
   - Emergency egress validation

---

## ✅ Testing Checklist

- [ ] Door appears when module placed ✓
- [ ] Door has blue 3D frame ✓
- [ ] Door tile marked blue in visualization ✓
- [ ] Door rotates with module ✓
- [ ] getInsideTile() returns correct tile ✓
- [ ] getOutsideTile() returns correct tile ✓
- [ ] getEntranceTile() uses door position ✓
- [ ] Door disposes correctly ✓
- [ ] Door info shows correct data ✓
- [ ] No console errors ✓

---

## 🔗 Related Systems

**Dependencies:**
- `TileSystem.js` - Door tile marking
- `Module.js` - Door creation and management
- `TileVisualization.js` - Blue door visualization

**Used By:**
- Crew pathfinding (entrance points)
- Module accessibility validation
- Future: EnterModuleAction
- Future: Crew AI (autonomous door usage)

---

## 📝 Code Examples

### Example 1: Find All Doors

```javascript
// Get all doors in habitat
const doors = habitatApp.modules
  .map(m => m.door)
  .filter(d => d !== null)

console.log(`Found ${doors.length} doors`)

// Print door info
doors.forEach(door => {
  console.log(door.getInfo())
})
```

### Example 2: Crew Walk to Door

```javascript
// Get module and its door
const module = habitatApp.modules[0]
const door = module.door

// Get crew member
const crew = habitatApp.crewMembers[0]

// Walk to outside of door
const outside = door.getOutsideTile()
crew.walkTo(outside.x, outside.y)

console.log(`${crew.name} walking to ${module.moduleName} door`)
```

### Example 3: Validate All Doors

```javascript
// Check if all doors are accessible
habitatApp.modules.forEach(module => {
  if (!module.door) return

  const outside = module.door.getOutsideTile()
  const tile = tileSystem.getTile(outside.x, outside.y)

  if (!tile || !tile.passable) {
    console.warn(`⚠️ ${module.moduleName} door is blocked!`)
  } else {
    console.log(`✅ ${module.moduleName} door is accessible`)
  }
})
```

---

## 🚀 Quick Start

**View doors in your habitat:**
1. Click "🔲 Show Tiles" to enable visualization
2. Add modules - each gets a blue door tile
3. Rotate modules (R key) - watch doors move
4. Open console: `habitatApp.modules[0].door.getInfo()`

**Test crew pathfinding to door:**
```javascript
const crew = habitatApp.crewMembers[0]
const module = habitatApp.modules[0]
const entrance = module.getEntranceTile(false)
crew.walkTo(entrance.x, entrance.y)
```

---

**Generated:** 2025-10-04
**Integration Status:** Complete ✅
**Next Steps:** Crew AI & Enter Module Action (Phase B)

# Crew Member System Testing Guide

**Date:** 2025-10-04
**Status:** Ready for Testing

---

## ✅ What's Been Implemented

### CrewMember Entity System
- 3D astronaut visualization (spacesuit + helmet)
- Action queue pattern from CorsixTH
- A* pathfinding integration
- Tile-based movement with smooth interpolation
- Psychological attributes (stress, mood, fatigue)
- Name labels for identification

### Action Types
1. **WalkAction** - Move to target tile using A* pathfinding
2. **IdleAction** - Wait/rest for duration
3. **UseObjectAction** - Interact with equipment (ready for Phase B)

### Integration
- 4 crew members spawn automatically on app load
- Update loop runs at 60 FPS
- Crew visible in 3D scene

---

## 🧪 Testing Steps

### Test 1: Visual Verification

**Steps:**
1. Open browser to `http://localhost:5176`
2. Wait for app to load
3. Look for 4 astronaut figures in the scene

**Expected Results:**
- ✅ 4 white capsule-shaped astronauts with blue helmets
- ✅ Name labels above each astronaut (Alex, Blake, Casey, Drew)
- ✅ Astronauts positioned at random tiles in the grid
- ✅ Console shows: `✅ Spawned [name] at tile (x, y)`

**Screenshot:**
```
Grid with 4 astronauts scattered across habitat floor
Each has white body, blue helmet, name label
```

---

### Test 2: Console Verification

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for initialization messages

**Expected Output:**
```
🚀 Habitat Harmony LS² - Initializing...
✅ NASA constraints loaded
✅ Tile system initialized (12×8 grid, 1m tiles)
✅ A* pathfinder initialized
✅ Three.js scene initialized
👨‍🚀 Spawning 4 crew members...
✅ Spawned Alex at tile (3, 2)
✅ Spawned Blake at tile (8, 5)
✅ Spawned Casey at tile (1, 6)
✅ Spawned Drew at tile (10, 3)
✅ Application initialized successfully
```

---

### Test 3: Inspect Crew Members

**Steps:**
1. Open Console
2. Type: `habitatApp.crewMembers`
3. Expand the array to see crew objects

**Expected:**
```javascript
Array(4) [
  CrewMember {
    name: "Alex",
    tileX: 3, tileY: 2,
    actionQueue: [],
    currentAction: null,
    stress: 40, mood: 70, fatigue: 30,
    // ... more properties
  },
  // ... 3 more crew members
]
```

---

### Test 4: Manual Pathfinding Test

**Steps:**
1. Open Console
2. Get first crew member:
   ```javascript
   const alex = habitatApp.crewMembers[0]
   ```
3. Make Alex walk to a new location:
   ```javascript
   alex.walkTo(6, 4)  // Walk to center of habitat
   ```
4. Watch the 3D scene

**Expected Results:**
- ✅ Console shows: `Alex walking from (x,y) to (6,4) - N steps`
- ✅ Alex smoothly moves tile-by-tile to destination
- ✅ Alex rotates to face movement direction
- ✅ When arrived: `Alex arrived at (6,4)`
- ✅ Alex's animation state changes (walking → idle)

**Troubleshooting:**
- If Alex doesn't move, check path exists: `pathfinder.findPath(alex.tileX, alex.tileY, 6, 4)`
- Should return array of {x, y} coordinates

---

### Test 5: Action Queue

**Steps:**
1. Queue multiple actions:
   ```javascript
   const blake = habitatApp.crewMembers[1]
   blake.walkTo(2, 2)   // Walk to corner
   blake.idle(3.0)      // Wait 3 seconds
   blake.walkTo(10, 6)  // Walk to opposite corner
   ```
2. Watch Blake execute actions sequentially

**Expected Results:**
- ✅ Blake walks to (2, 2)
- ✅ Blake stops and waits (idle animation)
- ✅ After 3 seconds, Blake walks to (10, 6)
- ✅ Actions execute in order
- ✅ Console shows each action starting/completing

---

### Test 6: Get Crew Status

**Steps:**
```javascript
habitatApp.crewMembers.forEach(crew => {
  console.log(crew.getStatus())
})
```

**Expected Output:**
```javascript
{
  name: "Alex",
  position: "(6, 4)",
  action: "Idle",
  queueLength: 0,
  stress: 40,
  mood: 70,
  fatigue: 30
}
// ... for each crew member
```

---

### Test 7: Pathfinding with Obstacles

**Steps:**
1. Add some modules to the habitat (click catalog items)
2. Place modules between two tiles
3. Command crew to walk through that area:
   ```javascript
   const casey = habitatApp.crewMembers[2]
   casey.walkTo(oppositeX, oppositeY)  // Across habitat
   ```

**Expected Results:**
- ✅ Pathfinder finds route around modules
- ✅ Casey walks around obstacles
- ✅ Path avoids occupied tiles
- ✅ If no path exists: `No path found` warning in console

**Verify Pathfinding:**
```javascript
// Visualize ASCII grid showing occupied tiles
console.log(tileSystem.toASCII())
// █ = occupied, . = passable
```

---

### Test 8: Multiple Crew Movement

**Steps:**
```javascript
// Make all crew walk to center
habitatApp.crewMembers.forEach(crew => {
  crew.walkTo(6, 4)
})
```

**Expected Results:**
- ✅ All 4 crew members start walking
- ✅ Each finds their own path
- ✅ All converge on center tile
- ✅ No collisions (they can overlap for now - collision detection is Phase B)

---

## 🐛 Known Issues & Limitations

### Expected Behavior (Not Bugs):

1. **Crew can overlap** - Collision avoidance not yet implemented (Prompt 12)
2. **No autonomous AI** - Crew only move when commanded (Prompts 11-13)
3. **Objects don't exist yet** - UseObjectAction will fail (Prompt 11)
4. **No animations** - Just rotation, no walk cycle (future enhancement)
5. **Name labels always face camera** - They're sprites (expected)

### Actual Bugs to Watch For:

- ❌ Crew members not spawning
- ❌ Movement glitches or teleporting
- ❌ Path not found errors when path should exist
- ❌ Crew members stuck in walking state
- ❌ Console errors about undefined properties

---

## 📊 Performance Checks

### Frame Rate Test:

**Steps:**
1. Open DevTools → Performance tab
2. Start recording
3. Command all crew to move around
4. Stop recording after 10 seconds

**Expected:**
- ✅ 60 FPS maintained
- ✅ No frame drops
- ✅ Update loop: <1ms per frame
- ✅ Path calculation: <5ms per search

### Memory Test:

**Steps:**
1. DevTools → Memory tab
2. Take heap snapshot
3. Search for "CrewMember"

**Expected:**
- ✅ 4 CrewMember instances
- ✅ Each ~2-5 KB
- ✅ No memory leaks after crew removal

---

## 🔧 Debug Tools

### Available Console Commands:

```javascript
// Access app
habitatApp

// Access crew
habitatApp.crewMembers

// Access tile system
tileSystem.getStatistics()
tileSystem.toASCII()  // Visual grid

// Access pathfinder
pathfinder.findPath(x1, y1, x2, y2)

// Spawn more crew (test stress)
habitatApp.spawnCrewMembers(10)  // Spawn 10 more

// Clear all crew
habitatApp.crewMembers.forEach(c => habitatApp.sceneManager.removeObject(c))
habitatApp.crewMembers = []
```

---

## ✅ Success Criteria

**All tests pass if:**

1. ✅ 4 crew members visible in scene
2. ✅ Crew can walk to commanded tiles
3. ✅ Pathfinding avoids obstacles
4. ✅ Action queue executes sequentially
5. ✅ Smooth tile-to-tile movement
6. ✅ Facing direction updates correctly
7. ✅ No console errors
8. ✅ 60 FPS maintained
9. ✅ getStatus() returns correct data
10. ✅ Multiple crew can move simultaneously

---

## 📝 Testing Checklist

- [ ] Test 1: Visual Verification ✓
- [ ] Test 2: Console Verification ✓
- [ ] Test 3: Inspect Crew Members ✓
- [ ] Test 4: Manual Pathfinding ✓
- [ ] Test 5: Action Queue ✓
- [ ] Test 6: Get Crew Status ✓
- [ ] Test 7: Pathfinding with Obstacles ✓
- [ ] Test 8: Multiple Crew Movement ✓
- [ ] Performance: 60 FPS ✓
- [ ] Performance: No memory leaks ✓

---

## 🚀 Next Steps After Testing

If all tests pass:

1. **Prompt 3** - Enhanced grid visualization (show tile states)
2. **Prompt 4** - Door system (module access points)
3. **Prompt 11** - Object system (interior equipment)
4. **Prompt 12** - Crew AI (autonomous behavior)
5. **Prompt 13** - Full simulation loop

---

**Generated:** 2025-10-04
**CorsixTH Integration Status:** Character System Complete ✅

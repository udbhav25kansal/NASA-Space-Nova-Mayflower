# Phase B Roadmap: Character System & Simulation

**Date:** 2025-10-04
**Prerequisites:** ✅ Phase A Complete (All 8 Foundation Tasks)

---

## 🎯 Phase B Overview

**Goal:** Transform the tile-based foundation into a fully autonomous crew simulation with AI behaviors, object interactions, and time-based activities.

**Estimated Tasks:** 8-10 prompts
**Expected Duration:** 3-4 hours
**Complexity:** Medium-High

---

## 📋 Task List

### Task 1: Module Tile Snapping (Prompt 5)
**Priority:** High
**Estimated Time:** 30 minutes

**Objective:** Update DragControls to snap modules to tile grid instead of continuous positioning.

**Files to Modify:**
- `src/controls/DragControls.js`

**Implementation:**
```javascript
// In DragControls.js onDrag event:
const { tileX, tileY } = tileSystem.worldToTile(
  intersection.point.x,
  intersection.point.z
)

// Snap to tile
if (selectedModule.canPlaceAt(tileX, tileY)) {
  selectedModule.placeAtTile(tileX, tileY)
}
```

**Success Criteria:**
- ✅ Modules snap to 1m grid when dragged
- ✅ No more continuous positioning
- ✅ Visual feedback during drag
- ✅ Invalid placement prevented

---

### Task 2: Object/Equipment System (Prompt 11)
**Priority:** High
**Estimated Time:** 1 hour

**Objective:** Create interior objects (furniture, equipment) that crew can interact with.

**Files to Create:**
- `src/entities/Object.js` - Base object class
- `src/entities/objects/ExerciseEquipment.js`
- `src/entities/objects/Workstation.js`
- `src/entities/objects/SleepPod.js`
- `src/entities/objects/GalleyStation.js`

**Implementation:**
```javascript
class HabitatObject extends THREE.Group {
  constructor(type, tileX, tileY, moduleId) {
    super()
    this.type = type
    this.tileX = tileX
    this.tileY = tileY
    this.moduleId = moduleId
    this.inUse = false
    this.currentUser = null
    this.usageHistory = []
  }

  canUse(crewMember) {
    return !this.inUse && this.isAccessible(crewMember)
  }

  use(crewMember) {
    this.inUse = true
    this.currentUser = crewMember
    this.usageHistory.push({
      user: crewMember.name,
      startTime: Date.now()
    })
  }
}
```

**Success Criteria:**
- ✅ Objects placed inside modules
- ✅ Objects at specific tile positions
- ✅ Objects have 3D visual representation
- ✅ Object usage tracking
- ✅ Integration with UseObjectAction

---

### Task 3: Enter Module Action (Prompt 12)
**Priority:** High
**Estimated Time:** 45 minutes

**Objective:** Create action for crew to walk through doors and enter modules.

**Files to Create:**
- `src/entities/actions/EnterModuleAction.js`

**Implementation:**
```javascript
class EnterModuleAction extends CrewAction {
  constructor(module, targetObjectId = null) {
    super('enter_module')
    this.module = module
    this.targetObjectId = targetObjectId
    this.stage = 'walk_to_door'  // walk_to_door, enter, walk_to_object
  }

  start(crewMember) {
    // Get door entrance
    const entrance = this.module.getEntranceTile(false)

    // Walk to door
    const walkAction = new WalkAction(entrance.x, entrance.y)
    crewMember.queueAction(walkAction)
  }

  update(crewMember, deltaTime) {
    switch (this.stage) {
      case 'walk_to_door':
        // Check if at door
        if (crewMember.tileX === door.tileX && crewMember.tileY === door.tileY) {
          this.stage = 'enter'
          door.use()
        }
        break

      case 'enter':
        // Walk inside
        const inside = this.module.getEntranceTile(true)
        crewMember.walkTo(inside.x, inside.y)
        this.stage = 'walk_to_object'
        break

      case 'walk_to_object':
        // If target object, walk to it
        if (this.targetObjectId) {
          const object = world.getObjectById(this.targetObjectId)
          crewMember.walkTo(object.tileX, object.tileY)
        }
        this.isComplete = true
        break
    }
  }
}
```

**Success Criteria:**
- ✅ Crew walks to door
- ✅ Door usage tracked
- ✅ Crew walks inside module
- ✅ Optional object targeting
- ✅ Visual feedback (crew inside module)

---

### Task 4: Crew Needs System (Prompt 13)
**Priority:** Medium
**Estimated Time:** 45 minutes

**Objective:** Implement crew psychological and physical needs that drive behavior.

**Files to Create:**
- `src/entities/CrewNeeds.js`

**Implementation:**
```javascript
class CrewNeeds {
  constructor(crewMember) {
    this.crewMember = crewMember

    // Physical needs (0-100, 100 = critical)
    this.hunger = 30
    this.fatigue = 30
    this.hygiene = 20
    this.exercise = 40

    // Psychological needs (0-100, 100 = critical)
    this.stress = 40
    this.socialNeed = 50
    this.recreationNeed = 30

    // Decay rates (per minute)
    this.decayRates = {
      hunger: 1.5,
      fatigue: 1.0,
      hygiene: 0.5,
      exercise: 0.3,
      stress: 0.8,
      socialNeed: 1.2,
      recreationNeed: 0.7
    }
  }

  update(deltaTime) {
    // Increase needs over time
    this.hunger += this.decayRates.hunger * (deltaTime / 60)
    this.fatigue += this.decayRates.fatigue * (deltaTime / 60)
    // ... etc

    // Cap at 100
    this.hunger = Math.min(100, this.hunger)
    this.fatigue = Math.min(100, this.fatigue)
  }

  getMostUrgentNeed() {
    const needs = {
      hunger: this.hunger,
      fatigue: this.fatigue,
      hygiene: this.hygiene,
      exercise: this.exercise,
      stress: this.stress,
      socialNeed: this.socialNeed,
      recreationNeed: this.recreationNeed
    }

    return Object.entries(needs)
      .sort((a, b) => b[1] - a[1])[0]
  }
}
```

**Success Criteria:**
- ✅ Needs increase over time
- ✅ getMostUrgentNeed() returns highest priority
- ✅ Needs capped at 100
- ✅ Integration with crew members

---

### Task 5: Crew AI Decision Making (Prompt 14)
**Priority:** High
**Estimated Time:** 1 hour

**Objective:** Autonomous crew behavior based on needs and available facilities.

**Files to Create:**
- `src/entities/CrewAI.js`

**Implementation:**
```javascript
class CrewAI {
  constructor(crewMember) {
    this.crewMember = crewMember
    this.currentGoal = null
    this.thinkInterval = 5.0  // Think every 5 seconds
    this.timeSinceThink = 0
  }

  update(deltaTime) {
    this.timeSinceThink += deltaTime

    if (this.timeSinceThink >= this.thinkInterval) {
      this.think()
      this.timeSinceThink = 0
    }
  }

  think() {
    // Skip if busy
    if (this.crewMember.actionQueue.length > 0) return

    // Get most urgent need
    const [need, value] = this.crewMember.needs.getMostUrgentNeed()

    // Find appropriate module/object
    const target = this.findModuleForNeed(need)

    if (target) {
      // Create action sequence
      this.crewMember.queueAction(
        new EnterModuleAction(target.module, target.objectId)
      )
      this.crewMember.queueAction(
        new UseObjectAction(target.objectId, this.getDuration(need))
      )

      this.currentGoal = { need, target }
    } else {
      // No facility available, wander
      this.wander()
    }
  }

  findModuleForNeed(need) {
    const moduleMap = {
      hunger: 'Galley',
      fatigue: 'Crew Quarters',
      hygiene: 'Hygiene',
      exercise: 'Exercise'
    }

    const moduleName = moduleMap[need]
    const module = world.findModuleByName(moduleName)

    if (module) {
      const object = module.objects.find(o => !o.inUse)
      return { module, objectId: object?.id }
    }

    return null
  }

  wander() {
    // Random tile
    const tiles = tileSystem.getPassableTiles()
    const random = tiles[Math.floor(Math.random() * tiles.length)]
    this.crewMember.walkTo(random.x, random.y)
    this.crewMember.queueAction(new IdleAction(5.0))
  }
}
```

**Success Criteria:**
- ✅ Crew makes decisions every 5 seconds
- ✅ Decisions based on highest need
- ✅ Finds appropriate modules
- ✅ Creates action sequences
- ✅ Falls back to wandering if no facilities

---

### Task 6: Time System (Prompt 15)
**Priority:** Medium
**Estimated Time:** 30 minutes

**Objective:** Implement day/night cycles and mission time tracking.

**Files to Create:**
- `src/simulation/TimeSystem.js`

**Implementation:**
```javascript
class TimeSystem {
  constructor() {
    this.missionDay = 1
    this.hour = 8  // Start at 08:00
    this.minute = 0
    this.timeScale = 60  // 60 seconds real = 1 hour sim
    this.isPaused = false
  }

  update(deltaTime) {
    if (this.isPaused) return

    // Advance time
    const minutesElapsed = (deltaTime / this.timeScale) * 60
    this.minute += minutesElapsed

    if (this.minute >= 60) {
      this.hour += Math.floor(this.minute / 60)
      this.minute = this.minute % 60
    }

    if (this.hour >= 24) {
      this.missionDay++
      this.hour = this.hour % 24
    }
  }

  getTimeOfDay() {
    if (this.hour >= 6 && this.hour < 12) return 'morning'
    if (this.hour >= 12 && this.hour < 18) return 'afternoon'
    if (this.hour >= 18 && this.hour < 22) return 'evening'
    return 'night'
  }

  getFormattedTime() {
    return `Day ${this.missionDay}, ${String(Math.floor(this.hour)).padStart(2, '0')}:${String(Math.floor(this.minute)).padStart(2, '0')}`
  }
}
```

**Success Criteria:**
- ✅ Time advances at configurable rate
- ✅ Day/night cycles
- ✅ Mission day tracking
- ✅ Pause/resume
- ✅ UI display

---

### Task 7: Crew Schedules (Prompt 16)
**Priority:** Low
**Estimated Time:** 45 minutes

**Objective:** Define daily schedules for crew activities.

**Files to Create:**
- `src/simulation/CrewSchedule.js`

**Implementation:**
```javascript
class CrewSchedule {
  constructor() {
    this.schedule = [
      { time: 8, duration: 1, activity: 'breakfast', module: 'Galley' },
      { time: 9, duration: 4, activity: 'work', module: 'Workstation' },
      { time: 13, duration: 1, activity: 'lunch', module: 'Galley' },
      { time: 14, duration: 3, activity: 'work', module: 'Workstation' },
      { time: 17, duration: 1, activity: 'exercise', module: 'Exercise' },
      { time: 18, duration: 1, activity: 'dinner', module: 'Galley' },
      { time: 19, duration: 3, activity: 'recreation', module: 'Ward/Dining' },
      { time: 22, duration: 1, activity: 'hygiene', module: 'Hygiene' },
      { time: 23, duration: 8, activity: 'sleep', module: 'Crew Quarters' }
    ]
  }

  getCurrentActivity(hour) {
    return this.schedule.find(s =>
      hour >= s.time && hour < s.time + s.duration
    )
  }

  getNextActivity(hour) {
    return this.schedule.find(s => s.time > hour)
  }
}
```

**Success Criteria:**
- ✅ 24-hour schedule defined
- ✅ Activities mapped to modules
- ✅ getCurrentActivity() works
- ✅ AI uses schedule for decisions

---

### Task 8: Activity Automation (Prompt 17)
**Priority:** Medium
**Estimated Time:** 30 minutes

**Objective:** Crew automatically performs scheduled activities.

**Integration in CrewAI:**
```javascript
think() {
  const timeOfDay = world.timeSystem.getTimeOfDay()
  const hour = world.timeSystem.hour

  // Check schedule first
  const scheduledActivity = this.crewMember.schedule.getCurrentActivity(hour)

  if (scheduledActivity && !this.isDoingActivity(scheduledActivity)) {
    // Perform scheduled activity
    this.performActivity(scheduledActivity)
    return
  }

  // Fall back to need-based behavior
  const [need, value] = this.crewMember.needs.getMostUrgentNeed()
  // ... existing need-based logic
}
```

**Success Criteria:**
- ✅ Crew follows schedule
- ✅ Schedule overrides need-based behavior
- ✅ Crew transitions between activities
- ✅ Visual feedback (crew in correct modules)

---

## 🎯 Success Metrics

### Technical Goals:
- ✅ Crew autonomously navigates habitat
- ✅ Needs drive behavior realistically
- ✅ Objects provide need satisfaction
- ✅ Time system tracks mission progress
- ✅ 60 FPS maintained with AI active

### NASA Compliance:
- ✅ Crew activities match NASA HERA schedules
- ✅ Module usage reflects NASA requirements
- ✅ Psychological model based on UND study
- ✅ Daily routines follow space mission norms

### User Experience:
- ✅ Watch crew operate autonomously
- ✅ Observe need-based decisions
- ✅ See time progression
- ✅ Understand crew behavior through UI

---

## 📊 Estimated Totals

**New Files:** 10-12
**Lines of Code:** ~1,500
**Documentation:** 3-4 guides
**Time Investment:** 3-4 hours
**Complexity:** Medium-High

---

## 🔗 Dependencies

**Phase A Prerequisites (All Complete):**
- ✅ TileSystem
- ✅ Pathfinder
- ✅ CrewMember
- ✅ Action Queue
- ✅ Door System
- ✅ Tile Visualization

**Phase B Internal Dependencies:**
```
Task 1 (Tile Snapping) ← Independent
Task 2 (Objects) ← Independent
Task 3 (Enter Module) ← Requires: Objects
Task 4 (Needs) ← Independent
Task 5 (AI) ← Requires: Needs, Objects, Enter Module
Task 6 (Time) ← Independent
Task 7 (Schedule) ← Requires: Time
Task 8 (Automation) ← Requires: AI, Schedule
```

**Recommended Order:**
1. Tile Snapping (UI improvement)
2. Objects (foundation for interaction)
3. Needs (drives behavior)
4. Enter Module (enables module access)
5. AI (brings crew to life)
6. Time (adds progression)
7. Schedule (structures activities)
8. Automation (completes simulation)

---

## 🧪 Testing Strategy

### After Each Task:
1. Console verification
2. Visual observation
3. Performance check
4. Integration test

### Full Phase B Test:
1. Spawn 4 crew members
2. Enable tile visualization
3. Place required modules (Galley, Crew Quarters, Exercise, Hygiene)
4. Add objects to modules
5. Enable AI
6. Watch crew operate autonomously
7. Verify needs decrease when satisfied
8. Check time progression
9. Observe schedule adherence

---

## 🚀 Getting Started

**To begin Phase B:**

1. **Commit Phase A Progress:**
```bash
git add .
git commit -m "Phase A Complete: CorsixTH Foundation (8/8 tasks)"
```

2. **Start with Task 1 (Tile Snapping):**
```javascript
// Update DragControls.js
// Make modules snap to grid
```

3. **Test Each Feature:**
```javascript
// Console commands for testing
habitatApp.modules[0].placeAtTile(3, 3)
```

4. **Document Progress:**
- Update IMPLEMENTATION_PROGRESS.md
- Create task-specific guides as needed

---

## 📝 Quick Reference

**Phase B Goals:**
- Autonomous crew simulation
- AI-driven behavior
- Object interactions
- Time progression
- Scheduled activities

**Key Files to Create:**
- Object.js, EnterModuleAction.js
- CrewNeeds.js, CrewAI.js
- TimeSystem.js, CrewSchedule.js

**Success = Fully Autonomous Habitat Simulation!** 🚀

---

**Status:** 📋 Planned
**Prerequisites:** ✅ Phase A Complete
**Next Task:** Tile Snapping (30 min)
**Generated:** 2025-10-04

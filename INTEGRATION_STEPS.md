# Integration Steps: Mars-Sim Features

## Step 1: Update main.js Imports

Add these imports at the top of `src/main.js`:

```javascript
// EXISTING Phase 2 imports:
import { PsychModel } from './simulation/PsychModel.js';
import { MissionParams } from './simulation/MissionParams.js';
import { WellbeingMap } from './visualization/WellbeingMap.js';
import { CSVGenerator } from './export/CSVGenerator.js';

// NEW Mars-Sim inspired imports:
import { SleepModel } from './simulation/SleepModel.js';
import { MissionSimulator } from './simulation/MissionSimulator.js';
import { RecreationValidator } from './validation/RecreationValidator.js';
import { PrivacyValidator } from './validation/PrivacyValidator.js';
import { MissionConfigPanel } from './ui/MissionConfigPanel.js';
```

---

## Step 2: Add New Properties to HabitatHarmonyApp Constructor

In the `constructor()` method, add:

```javascript
constructor() {
  // ... existing properties ...

  // Phase 2: Psychological Simulation (EXISTING)
  this.psychModel = null;
  this.missionParams = null;
  this.wellbeingMap = null;
  this.currentDayMetrics = null;
  this.fullMissionResults = null;

  // NEW Mars-Sim Components
  this.sleepModel = null;
  this.missionSimulator = null;
  this.recreationValidator = null;
  this.privacyValidator = null;
  this.missionConfigPanel = null;

  // NEW Crew state
  this.crew = [];
  this.crewAssignments = {}; // Maps crew ID to module ID
}
```

---

## Step 3: Update initPhase2() Method

Replace the existing `initPhase2()` method:

```javascript
/**
 * Phase 2: Initialize psychological simulation system
 */
async initPhase2() {
  console.log('🧠 Initializing Phase 2: Psychological Simulation with Mars-Sim enhancements...');

  try {
    // Load psych model parameters
    const response = await fetch('/src/data/psych-model-params.json');
    if (!response.ok) {
      throw new Error(`Failed to load psych model params: ${response.status}`);
    }
    const psychModelParams = await response.json();

    // Initialize EXISTING PsychModel with HERA+UND parameters
    this.psychModel = new PsychModel(psychModelParams);
    this.missionParams = new MissionParams();
    this.wellbeingMap = new WellbeingMap(this.sceneManager);

    // NEW Mars-Sim Components
    this.sleepModel = new SleepModel(this.constraints);
    this.recreationValidator = new RecreationValidator(this.constraints);
    this.privacyValidator = new PrivacyValidator(this.constraints);

    // Initialize default crew (4 person HERA baseline)
    this.initializeCrew();

    // Setup Mission Configuration Panel (replaces old UI handlers)
    this.setupMissionConfigPanel();

    // Initialize with default metrics
    this.updatePsychMetrics();

    console.log('✅ Phase 2 initialized successfully with Mars-Sim features');

  } catch (error) {
    console.error('Failed to initialize Phase 2:', error);
    Toast.error('Failed to load psychological model parameters');
    throw error;
  }
}
```

---

## Step 4: Add New Methods for Crew Management

Add these new methods to HabitatHarmonyApp class:

```javascript
/**
 * Initialize default crew (HERA baseline: 4 crew)
 */
initializeCrew() {
  const defaultCrew = this.constraints.crew_configuration_defaults.standard_crew;

  this.crew = defaultCrew.composition.map((member, index) => ({
    id: `crew-${index + 1}`,
    name: member.role,
    role: member.role,
    gender: member.gender,
    state: {
      stress: 40,
      mood: 70,
      sleepQuality: 70,
      cohesion: 70,
      performance: 1.0
    }
  }));

  console.log(`👥 Initialized ${this.crew.length} crew members`);
}

/**
 * Auto-assign crew to available crew quarters
 */
autoAssignCrew() {
  this.crewAssignments = {};

  const crewQuarters = this.modules.filter(m => m.moduleName === 'Crew Quarters');

  if (crewQuarters.length === 0) {
    console.warn('No crew quarters available for assignment');
    return;
  }

  // Assign crew to quarters (1 per quarters ideally, 2 max)
  let quarterIndex = 0;
  let occupancyCount = {};

  for (const member of this.crew) {
    if (quarterIndex >= crewQuarters.length) {
      quarterIndex = 0; // Start sharing quarters
    }

    const quarters = crewQuarters[quarterIndex];
    occupancyCount[quarters.id] = (occupancyCount[quarters.id] || 0) + 1;

    this.crewAssignments[member.id] = {
      moduleId: quarters.id,
      moduleName: quarters.moduleName
    };

    // Move to next quarters if this one has 2 occupants
    if (occupancyCount[quarters.id] >= 2) {
      quarterIndex++;
    }
  }

  console.log('🛏️ Crew auto-assigned to quarters');
}

/**
 * Create layout object for validators and simulator
 */
getLayoutForValidation() {
  return {
    modules: this.modules.map(m => ({
      id: m.id,
      name: m.moduleName,
      dimensions: {
        w: m.width,
        d: m.depth,
        h: m.height
      },
      position: {
        x: m.mesh.position.x,
        z: m.mesh.position.z
      },
      zone: m.zone
    })),
    crewAssignments: this.crewAssignments,
    windowType: this.missionParams?.config?.windowType || 0.5,
    visualOrder: 0.8,
    lightingScheduleCompliance: this.missionParams?.config?.lightingCompliance || 0.8,
    exerciseCompliance: this.missionParams?.config?.exerciseCompliance || 0.7,
    adjacencyCompliance: this.validator.getAdjacencyCompliance(this.modules)
  };
}
```

---

## Step 5: Setup Mission Config Panel

Replace `setupMissionConfigHandlers()` with this:

```javascript
/**
 * Setup Mission Configuration Panel (NEW)
 */
setupMissionConfigPanel() {
  const container = document.getElementById('missionConfigContainer');

  if (!container) {
    console.warn('Mission config container not found in HTML');
    return;
  }

  this.missionConfigPanel = new MissionConfigPanel(this.constraints);

  this.missionConfigPanel.render(container, {
    onConfigChange: (config) => {
      // Update mission params
      this.missionParams.updateConfig(config);

      // Update crew if size changed
      if (config.crewSize !== this.crew.length) {
        this.crew = config.crewProfiles;
        this.autoAssignCrew();
      }

      // Update crew profiles
      this.crew = config.crewProfiles;

      // Recalculate metrics
      this.updatePsychMetrics();
    },

    onRunSimulation: (config) => {
      this.runFullMissionSimulation();
    }
  });

  console.log('✅ Mission Config Panel initialized');
}
```

---

## Step 6: Update runFullMissionSimulation() Method

Replace the existing method with this Mars-Sim enhanced version:

```javascript
/**
 * Run full mission simulation (Mars-Sim Enhanced)
 */
runFullMissionSimulation() {
  try {
    Toast.show('Running enhanced mission simulation...', 2000);

    // Get current mission config
    const config = this.missionConfigPanel.getConfig();

    // Auto-assign crew to quarters
    this.autoAssignCrew();

    // Validate privacy and recreation
    const layout = this.getLayoutForValidation();
    const privacyResult = this.privacyValidator.validatePrivacy(layout, this.crew);
    const recreationResult = this.recreationValidator.validateRecreationSpace(layout, this.crew.length);

    // Show validation warnings
    if (!privacyResult.compliance) {
      Toast.show(`⚠️ Privacy violations detected: ${privacyResult.violations.length}`, 3000);
    }
    if (!recreationResult.compliance) {
      Toast.show(`⚠️ Recreation space insufficient`, 3000);
    }

    // Create Mission Simulator with Mars-Sim features
    this.missionSimulator = new MissionSimulator(
      layout,
      {
        crewSize: config.crewSize,
        missionDays: config.missionDays,
        names: config.crewProfiles.map(c => c.name),
        roles: config.crewProfiles.map(c => c.role),
        genders: config.crewProfiles.map(c => c.gender)
      },
      this.constraints,
      this.psychModel.params
    );

    // Show progress
    this.missionConfigPanel.showProgress(0);

    // Run simulation (this is fast, so we'll fake the progress)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      this.missionConfigPanel.showProgress(progress);

      if (progress >= 90) {
        clearInterval(progressInterval);
      }
    }, 100);

    // Run simulation
    setTimeout(() => {
      const results = this.missionSimulator.run();
      this.fullMissionResults = results.dailyMetrics;

      // Complete progress
      clearInterval(progressInterval);
      this.missionConfigPanel.showProgress(100);

      // Update display
      const finalDay = results.dailyMetrics[results.dailyMetrics.length - 1];
      this.currentDayMetrics = finalDay.teamAverage;

      // Calculate PHI
      const phi = this.psychModel.calculatePHI(this.currentDayMetrics);

      this.updateMetricsDisplay(this.currentDayMetrics, phi);

      // Show results
      setTimeout(() => {
        this.missionConfigPanel.hideProgress();

        Toast.show(`✅ Simulation complete! Final PHI: ${phi.toFixed(1)}`, 3000);

        // Show recommendations
        if (results.recommendations.length > 0) {
          console.log('NASA Recommendations:', results.recommendations);
        }
      }, 500);

    }, 1000);

  } catch (error) {
    console.error('Error running mission simulation:', error);
    this.missionConfigPanel.hideProgress();
    Toast.show('❌ Simulation failed. Check console for errors.', 3000);
  }
}
```

---

## Step 7: Update exportMetricsCSV() Method

Replace the existing method:

```javascript
/**
 * Export metrics to CSV (Mars-Sim Enhanced)
 */
exportMetricsCSV() {
  try {
    // Check if simulation has been run
    if (!this.fullMissionResults || this.fullMissionResults.length === 0) {
      Toast.show('Please run simulation first!', 3000);
      return;
    }

    // Get layout for validation
    const layout = this.getLayoutForValidation();

    // Compute design variables
    const designVars = this.missionParams.computeDesignVariables(
      this.modules,
      this.validator
    );

    // Get constraint report
    const hudReport = this.hud.getLastReport();
    const constraintReport = {
      adjacencyCompliance: designVars.adjacencyCompliance,
      pathWidthOk: hudReport?.pathWidthOk !== false
    };

    // Get full simulation report
    const simulationReport = this.missionSimulator ?
      this.missionSimulator.generateReport() : null;

    // Generate CSV (Mars-Sim Enhanced)
    const csv = CSVGenerator.generateCSV(
      this.modules,
      designVars,
      this.fullMissionResults,
      constraintReport,
      simulationReport  // NEW: Includes per-crew data
    );

    if (csv) {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `habitat-harmony-mars-sim-${timestamp}.csv`;
      CSVGenerator.downloadCSV(csv, filename);

      Toast.show(`📊 Exported to ${filename}`, 3000);
    } else {
      Toast.show('CSV export failed', 3000);
    }

  } catch (error) {
    console.error('Error exporting CSV:', error);
    Toast.show('CSV export failed', 3000);
  }
}
```

---

## Step 8: Update updateLayout() Method

Add validation calls:

```javascript
/**
 * Update layout validation and UI
 */
updateLayout() {
  const shellDims = this.gridSystem.getHabitatDimensions();

  // Update HUD with validation
  this.hud.update(this.modules, shellDims);

  // Update catalog counts
  this.catalog.updateCounts(this.modules);

  // Update module violation states
  const report = this.hud.getLastReport();
  if (report) {
    this.modules.forEach(m => m.setViolating(false));

    report.violations.forEach(violation => {
      const moduleA = this.modules.find(m => m.moduleName === violation.moduleA);
      const moduleB = this.modules.find(m => m.moduleName === violation.moduleB);

      if (moduleA) moduleA.setViolating(true);
      if (moduleB) moduleB.setViolating(true);
    });
  }

  // NEW Mars-Sim Validations
  if (this.recreationValidator && this.privacyValidator) {
    this.autoAssignCrew();

    const layout = this.getLayoutForValidation();

    // Privacy validation
    const privacyResult = this.privacyValidator.validatePrivacy(layout, this.crew);

    // Recreation validation
    const recreationResult = this.recreationValidator.validateRecreationSpace(
      layout,
      this.crew.length
    );

    // Update HUD with additional info (optional - add to HUD display)
    console.log('Privacy Compliance:', privacyResult.compliance ? '✅' : '❌');
    console.log('Recreation Compliance:', recreationResult.compliance ? '✅' : '❌');
  }

  // Update psychological metrics
  if (this.psychModel && this.missionParams) {
    this.updatePsychMetrics();
  }
}
```

---

## Step 9: Update index.html UI Structure

Add this container in your left sidebar (inside `#left` div):

```html
<!-- Mission Configuration Panel Container (NEW) -->
<div id="missionConfigContainer"></div>
```

This should go after your existing HUD and before the catalog.

---

## Step 10: Test the Integration

Run these commands in the browser console:

```javascript
// Test 1: Check imports loaded
console.log('SleepModel:', window.habitatApp.sleepModel);
console.log('MissionSimulator:', window.habitatApp.missionSimulator);
console.log('RecreationValidator:', window.habitatApp.recreationValidator);
console.log('PrivacyValidator:', window.habitatApp.privacyValidator);

// Test 2: Check crew initialized
console.log('Crew:', window.habitatApp.crew);

// Test 3: Run privacy validation
const layout = window.habitatApp.getLayoutForValidation();
const result = window.habitatApp.privacyValidator.validatePrivacy(layout, window.habitatApp.crew);
console.log('Privacy Result:', result);

// Test 4: Run recreation validation
const recResult = window.habitatApp.recreationValidator.validateRecreationSpace(layout, 4);
console.log('Recreation Result:', recResult);
```

---

## Integration Checklist

- [ ] Step 1: Add imports to main.js
- [ ] Step 2: Add properties to constructor
- [ ] Step 3: Update initPhase2()
- [ ] Step 4: Add crew management methods
- [ ] Step 5: Setup mission config panel
- [ ] Step 6: Update runFullMissionSimulation()
- [ ] Step 7: Update exportMetricsCSV()
- [ ] Step 8: Update updateLayout()
- [ ] Step 9: Add HTML container
- [ ] Step 10: Test in browser

---

## Expected Results

After integration, you'll have:

✅ **Enhanced Sleep Quality** - Mars-Sim sleep debt tracking
✅ **Performance Degradation** - Tiered stress impact on crew
✅ **45-Day Simulation** - Per-crew daily metrics
✅ **Privacy Validation** - Gender-aware bed assignments
✅ **Recreation Validation** - Social space compliance
✅ **Mission Config UI** - Crew roster editor with presets
✅ **Enhanced CSV Export** - Per-crew performance data

---

## Troubleshooting

**Issue**: Module not found errors
- **Fix**: Check file paths in imports (should be relative: `./simulation/...`)

**Issue**: MissionConfigPanel not rendering
- **Fix**: Ensure `<div id="missionConfigContainer"></div>` exists in HTML

**Issue**: Crew assignment errors
- **Fix**: Add at least 1 Crew Quarters module before running simulation

**Issue**: CSV export shows old format
- **Fix**: Ensure you're passing `simulationReport` as 5th parameter to CSVGenerator

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/main.js` | Added Mars-Sim imports, methods, enhanced simulation |
| `index.html` | Added mission config panel container |

## Files Created (Already Done)

✅ `src/simulation/SleepModel.js`
✅ `src/simulation/MissionSimulator.js`
✅ `src/validation/RecreationValidator.js`
✅ `src/validation/PrivacyValidator.js`
✅ `src/ui/MissionConfigPanel.js`
✅ `src/data/nasa-constraints.json` (updated)
✅ `src/export/CSVGenerator.js` (updated)
✅ `MARS_SIM_INTEGRATION.md` (documentation)

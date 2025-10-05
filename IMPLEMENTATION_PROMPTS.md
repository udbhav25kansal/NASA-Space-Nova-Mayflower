# Phase 1 Implementation Prompts
## Habitat Harmony LS² - Sequential Execution Plan

**Purpose:** This document contains a series of prompts to execute sequentially to build the Phase 1 MVP of the Habitat Harmony simulator.

**Instructions:**
- Execute these prompts in order
- Each prompt builds on previous work
- Test functionality after each major step
- Don't skip steps even if they seem simple

---

## PROMPT 1: Project Foundation Setup

```
Initialize the Habitat Harmony project with Vite and Three.js:

1. Create a new Vite project in the current directory
2. Install dependencies:
   - three (latest)
   - vite (dev dependency)
3. Create the basic project structure:
   - /src directory with subdirectories: scene, habitat, data, validation, controls, ui
   - /public directory for static assets
   - /assets directory for future textures/models
4. Create package.json with proper scripts:
   - "dev": vite dev server
   - "build": production build
   - "preview": preview production build
5. Create vite.config.js with proper configuration
6. Create .gitignore for node_modules, dist, .env files
7. Create a basic index.html with:
   - Proper HTML5 structure
   - Canvas element with id="c"
   - Two-column grid layout (left sidebar 320px, right main area)
   - Header bar across top
   - CSS styling matching the design system:
     - Clean zones: #e0f2fe (light blue)
     - Dirty zones: #fee2e2 (light red)
     - Flagged adjacencies: #fde68a (yellow)
     - Dark buttons: #111827
     - Border colors: #e5e7eb
     - Background: #f9fafb for HUD

Make sure to set up ES6 module imports properly.
Test that the dev server runs successfully.
```

---

## PROMPT 2: NASA Constraints Data File

```
Create the comprehensive NASA constraints data file at src/data/nasa-constraints.json

Use the data from the NASA Space Apps proposal which includes:
- Global circulation constraints (translation path width ≥1.0m from AIAA 2022)
- Atomic functional minima for all 7 module types (area and volume from AIAA 2022 Tables 1 & 4)
- Adjacency rules (separate_from, co_locate_with, noise_isolate)
- Zone definitions (clean vs dirty)
- Structural clearances from NASA TP-2020-220505

The file must include:
1. Unit system declaration (SI)
2. Source citations for each constraint
3. All 7 module types we're implementing:
   - Crew Quarters: 1.82 m² minimum
   - Hygiene: 1.06 m² minimum
   - WCS (Toilet): 0.91 m² minimum
   - Exercise: 1.50 m² minimum
   - Galley: 0.56 m² minimum
   - Ward/Dining: 1.62 m² minimum
   - Workstation: 1.37 m² minimum

4. Adjacency rules including:
   - Hygiene separate from Crew Quarters
   - WCS separate from Galley
   - Exercise noise-isolated from Crew Quarters
   - WCS separate from Hygiene

5. Clean zone list: Crew Quarters, Galley, Ward/Dining, Workstation, Medical
6. Dirty zone list: WCS, Hygiene, IFM/Repair, Trash, Exercise

Format as valid JSON with clear structure and comments in "notes" fields.
```

---

## PROMPT 3: Module Catalog Definition

```
Create src/habitat/ModuleCatalog.js that exports the catalog of all available habitat modules.

For each of the 7 module types, define:
- name (string)
- w (width in meters)
- d (depth in meters)
- h (height in meters, for 3D extrusion - use 2.4m standard)
- zone ('clean' or 'dirty')
- color (hex number matching the design system)
- category (NASA category from constraints)
- description (brief description for UI tooltips)

Use these dimensions (designed to meet NASA minimum areas with realistic proportions):
- Crew Quarters: 1.4m × 1.35m × 2.4m (1.89 m² > 1.82 m² min) - clean - #bae6fd
- Hygiene: 1.2m × 0.9m × 2.4m (1.08 m² > 1.06 m² min) - dirty - #fecaca
- WCS: 1.1m × 0.9m × 2.4m (0.99 m² > 0.91 m² min) - dirty - #fecaca
- Exercise: 1.5m × 1.0m × 2.4m (1.50 m² = 1.50 m² min) - dirty - #fecaca
- Galley: 0.9m × 0.7m × 2.4m (0.63 m² > 0.56 m² min) - clean - #bae6fd
- Ward/Dining: 1.3m × 1.3m × 2.4m (1.69 m² > 1.62 m² min) - clean - #bae6fd
- Workstation: 1.2m × 1.15m × 2.4m (1.38 m² > 1.37 m² min) - clean - #bae6fd

Export as a default array of module definition objects.
Include a comment header citing AIAA 2022 and NASA TP-2020-220505 as sources.
```

---

## PROMPT 4: Three.js Scene Manager

```
Create src/scene/SceneManager.js that sets up the Three.js scene:

1. Export a SceneManager class that handles:
   - Scene creation and setup
   - Orthographic camera (2.5D isometric view)
   - Renderer setup with proper pixel ratio
   - OrbitControls (pan and zoom enabled, rotation DISABLED)
   - Lighting (HemisphereLight for even illumination)
   - Animation loop
   - Window resize handling

2. Camera configuration:
   - OrthographicCamera positioned at (10, 12, 10) looking at origin
   - View size of 10 world units vertically
   - Proper aspect ratio calculation
   - Near: 0.1, Far: 100

3. Renderer configuration:
   - Antialias enabled
   - Pixel ratio limited to max 2
   - Background color: white (#ffffff)

4. Methods to include:
   - constructor(canvasElement)
   - init()
   - animate() - call requestAnimationFrame
   - onWindowResize()
   - getScene() - returns scene for adding objects
   - getCamera() - returns camera
   - getRenderer() - returns renderer

5. Set up HemisphereLight with sky color white, ground color light gray

Use ES6 class syntax and proper imports from Three.js.
Add comments explaining the 2.5D setup for future developers.
```

---

## PROMPT 5: Grid System Component

```
Create src/scene/GridSystem.js that creates the grid and floor plate:

1. Export a GridSystem class that creates:
   - Major grid lines (1m spacing) in color #9ca3af with lighter lines #e5e7eb
   - Minor grid lines (0.1m spacing) in very light gray #f3f4f6
   - Floor plate representing the habitat shell (12m × 8m rectangle)

2. Grid specifications:
   - Total grid size: 40m × 40m (covers large area for planning)
   - Major grid: 40 divisions (1m each)
   - Minor grid: 400 divisions (0.1m each)
   - Rotate grids 90° to lie on XZ plane (floor)

3. Floor plate specifications:
   - 12m × 8m PlaneGeometry (represents habitat footprint)
   - Material: light gray/blue (#f8fafc), double-sided
   - Position at Y=0
   - Add subtle border/outline to show habitat boundary

4. Class methods:
   - constructor()
   - createGrids() - returns THREE.Group with both grids
   - createFloorPlate() - returns THREE.Mesh
   - getGroup() - returns everything as a group to add to scene

5. Add the grid and floor to a THREE.Group for easy management

Include comments citing the 12m × 8m dimensions as representative of NASA habitat concepts.
Use proper Three.js mesh construction.
```

---

## PROMPT 6: Habitat Module Class

```
Create src/habitat/Module.js - the core module class:

1. Export a HabitatModule class extending THREE.Group:

2. Constructor parameters:
   - catalogItem (from ModuleCatalog)
   - id (unique identifier)
   - constraints (from nasa-constraints.json)

3. Properties to store:
   - name, dimensions {w, d, h}, zone, color
   - minArea (from constraints)
   - position, rotation
   - isSelected (boolean for selection state)
   - userData for Three.js

4. Create visual representation:
   - BoxGeometry(w, h, d) - note Three.js box order
   - MeshStandardMaterial with:
     - Color from catalog
     - Transparent: true
     - Opacity: 0.85
     - Metalness: 0.1
     - Roughness: 0.8
   - Add mesh to group

5. Add selection outline:
   - BoxHelper or EdgesGeometry
   - Only visible when isSelected = true
   - Color: #111827 (dark)
   - LineBasicMaterial with linewidth 2

6. Methods:
   - getFootprint() - returns w × d in m²
   - getBoundingBox() - returns THREE.Box3
   - setSelected(bool) - toggles selection state
   - updatePosition(x, y, z) - updates position
   - rotate90() - rotates 90° around Y axis
   - dispose() - cleanup geometries/materials
   - checkOverlap(otherModule) - returns boolean
   - toJSON() - exports module state

7. Add label above module (TextSprite or HTML overlay) showing module name

Include detailed comments about NASA constraints for each module.
```

---

## PROMPT 7: Constraint Validator

```
Create src/validation/ConstraintValidator.js:

1. Export a ConstraintValidator class that validates layouts against NASA rules:

2. Constructor:
   - Takes constraints object (from nasa-constraints.json)
   - Stores constraint rules, min areas, path widths

3. Core validation methods:

   validateMinimumArea(module):
   - Checks if module footprint >= minimum required area
   - Returns {valid: boolean, message: string}

   validateAdjacency(modules):
   - Checks all module pairs against adjacency rules
   - Detects violations of separate_from, noise_isolate rules
   - Returns array of violations with details
   - Each violation: {moduleA, moduleB, rule, severity}

   validatePathWidth(modules, targetWidth = 1.0):
   - Calculates distances between modules
   - Ensures minimum 1.0m spacing for translation paths
   - Returns {valid: boolean, violations: array}

   validateZoneSeparation(modules):
   - Checks clean/dirty zone violations
   - Ensures proper separation per NASA guidelines
   - Returns violations array

   validateBounds(module, shellDimensions):
   - Checks if module fits within habitat shell (12m × 8m)
   - Returns {valid: boolean, message: string}

   validateLayout(modules):
   - Runs all validations
   - Returns comprehensive report:
     {
       valid: boolean,
       compliancePercentage: number,
       violations: array,
       warnings: array,
       totalFootprint: number
     }

4. Helper methods:
   - getDistance(moduleA, moduleB) - 2D distance on floor
   - checkOverlap(moduleA, moduleB) - bounding box intersection
   - getModulesByZone(modules, zone) - filter by clean/dirty

Include extensive comments citing NASA TP-2020-220505 and AIAA 2022.
```

---

## PROMPT 8: UI Components - HUD

```
Create src/ui/HUD.js for the heads-up display metrics:

1. Export a HUD class that manages the metrics dashboard:

2. HTML elements to update:
   - #areaTotal - total footprint in m²
   - #adjComp - adjacency compliance percentage
   - #pathOk - path width validation status (OK / FAIL)
   - #moduleCount - number of modules placed
   - #violations - list of current violations

3. Methods:

   constructor(validator):
   - Takes ConstraintValidator instance
   - Caches DOM element references
   - Sets up update interval

   update(modules):
   - Calculates total footprint
   - Runs validation
   - Updates all display elements
   - Shows/hides violation warnings

   updateFootprint(modules):
   - Sum all module footprints
   - Display with 2 decimal precision

   updateCompliance(validationReport):
   - Extract compliance percentage
   - Update display
   - Color code: green >90%, yellow 70-90%, red <70%

   updatePathStatus(validationReport):
   - Check path width validation
   - Display OK or FAIL with color coding

   showViolations(violations):
   - Populate #errors div
   - List each violation with clear description
   - Color code by severity

   clear():
   - Reset all metrics to zero/empty

4. Add helper methods:
   - formatArea(num) - format to 2 decimals + " m²"
   - formatPercentage(num) - format to 0 decimals + "%"
   - getComplianceColor(percent) - returns CSS color

Use vanilla JavaScript DOM manipulation (no framework).
Include comments about NASA compliance thresholds.
```

---

## PROMPT 9: UI Components - Catalog Panel

```
Create src/ui/Catalog.js for the module catalog sidebar:

1. Export a Catalog class that manages the module selection UI:

2. Constructor parameters:
   - catalogData (from ModuleCatalog.js)
   - onAddModule (callback function)

3. Methods:

   render():
   - Create catalog tile for each module type
   - Each tile shows:
     - Module name
     - Dimensions (w × d meters)
     - Color swatch (zone indicator)
     - "Add" button
   - Insert into #catalog container

   createTile(moduleItem):
   - Return HTML element for one module
   - Structure:
     <div class="tile">
       <div class="info">
         <strong>{name}</strong>
         <small>{w}×{d} m</small>
         <span class="zone-badge">{zone}</span>
       </div>
       <button class="btn secondary">Add</button>
     </div>
   - Attach click handler to button

   handleAddClick(moduleItem):
   - Call onAddModule callback with module data
   - Show toast notification
   - Optional: animate button feedback

   updateAvailability(modules):
   - Optional: show count of each module type placed
   - Disable buttons if limits reached (future feature)

4. Styling considerations:
   - Use flexbox for tile layout
   - Zone badge colors match module colors
   - Hover effects on tiles
   - Clear visual hierarchy

5. Include tooltips showing:
   - NASA minimum area requirement
   - Zone type (clean/dirty)
   - Adjacency restrictions

Use vanilla JavaScript with template literals for HTML generation.
```

---

## PROMPT 10: UI Components - Toast Notifications

```
Create src/ui/Toast.js for user feedback:

1. Export a Toast class for temporary notifications:

2. Methods:

   static show(message, duration = 1400):
   - Display message in #toast element
   - Auto-hide after duration
   - Queue multiple messages if needed

   static success(message):
   - Show success message (green background)
   - Example: "Module added successfully"

   static error(message):
   - Show error message (red background)
   - Example: "Cannot place module: overlaps existing module"

   static warning(message):
   - Show warning message (yellow background)
   - Example: "Adjacency rule violation detected"

   static info(message):
   - Show info message (blue background)
   - Example: "Exported layout to downloads"

3. Implementation:
   - Use CSS transitions for smooth show/hide
   - Position: absolute top-right
   - Z-index above all other content
   - Dismiss on click
   - Auto-dismiss timer

4. CSS classes to add:
   - .toast-success (green)
   - .toast-error (red)
   - .toast-warning (yellow)
   - .toast-info (blue)

Keep it simple - no external dependencies.
```

---

## PROMPT 11: Drag Controls System

```
Create src/controls/DragControls.js for module manipulation:

1. Export a DragControls class handling mouse interactions:

2. Constructor parameters:
   - camera (Three.js camera)
   - scene (Three.js scene)
   - canvas (DOM canvas element)
   - modules (array of HabitatModule instances)
   - validator (ConstraintValidator instance)
   - onUpdate (callback when module moved)

3. State tracking:
   - selectedModule (currently selected module)
   - isDragging (boolean)
   - dragPlane (THREE.Plane for raycasting)
   - raycaster (THREE.Raycaster)
   - mouse (THREE.Vector2 for mouse coords)

4. Core methods:

   init():
   - Set up event listeners (mousedown, mousemove, mouseup)
   - Create drag plane (XZ plane at Y=0)
   - Initialize raycaster

   onMouseDown(event):
   - Convert screen coords to normalized device coords
   - Raycast to find intersected module
   - If hit, set selectedModule and isDragging=true
   - Store offset from module center
   - Deselect other modules

   onMouseMove(event):
   - If isDragging:
     - Raycast to drag plane
     - Calculate new position
     - Apply grid snapping (0.1m increments)
     - Check bounds (12m × 8m habitat shell)
     - Update module position
     - Run live validation
     - Show visual feedback for violations

   onMouseUp(event):
   - Set isDragging = false
   - Validate final placement
   - If invalid, show error and revert
   - Call onUpdate callback
   - Keep module selected

   snapToGrid(value, gridSize = 0.1):
   - Round to nearest grid increment
   - Return snapped value

   checkPlacement(module, newPosition):
   - Validate against all constraints
   - Check overlaps with other modules
   - Check bounds
   - Return {valid, violations}

5. Selection management:
   - Highlight selected module
   - Show bounding box
   - Enable keyboard controls (R for rotate, Delete for remove)

6. Visual feedback during drag:
   - Valid position: green tint
   - Invalid position: red tint
   - Show ghost outline at target position

Include detailed comments about raycasting math and coordinate transforms.
```

---

## PROMPT 12: Module Controls (Rotate & Delete)

```
Create src/controls/ModuleControls.js for module operations:

1. Export a ModuleControls class for module manipulation:

2. Constructor parameters:
   - modules (array of HabitatModule instances)
   - onUpdate (callback after operations)

3. Keyboard controls:

   setupKeyboardControls():
   - Listen for keydown events
   - 'R' or 'r': rotate selected module 90° clockwise
   - 'Delete' or 'Backspace': delete selected module
   - 'Escape': deselect module
   - Arrow keys: nudge module by 0.1m (optional)

4. Rotation method:

   rotateModule(module, degrees = 90):
   - Rotate module around Y axis
   - Swap dimensions if needed (w ↔ d for 90° rotation)
   - Validate new orientation
   - If invalid (overlaps/bounds), show error and revert
   - Update visual representation
   - Call onUpdate callback

5. Deletion method:

   deleteModule(module):
   - Show confirmation (optional for MVP)
   - Remove from modules array
   - Remove from scene
   - Dispose geometries and materials
   - Update validation
   - Call onUpdate callback
   - Show toast: "Module deleted"

6. UI button controls:

   createControlButtons(container):
   - Add Rotate button
   - Add Delete button
   - Enable/disable based on selection
   - Attach click handlers

   updateButtonStates(selectedModule):
   - Enable buttons if module selected
   - Disable if no selection

7. Helper methods:
   - getSelectedModule() - returns currently selected module or null
   - selectModule(module) - sets module as selected
   - deselectAll() - clears all selections

Include comments about maintaining NASA constraints during operations.
```

---

## PROMPT 13: Export/Import System

```
Create src/export/LayoutExporter.js for saving/loading layouts:

1. Export a LayoutExporter class:

2. Export method:

   exportLayout(modules, validationReport):
   - Create JSON structure:
     {
       version: "1.0",
       exportDate: ISO timestamp,
       nasaSources: ["TP-2020-220505", "AIAA 2022"],
       habitatShell: {width: 12, depth: 8, units: "meters"},
       modules: [
         {
           id, name, zone,
           dimensions: {w, d, h},
           position: {x, y, z},
           rotation: degrees
         }
       ],
       validation: {
         totalFootprint: number,
         compliancePercentage: number,
         violations: array
       },
       metadata: {
         moduleCount: number,
         cleanModules: number,
         dirtyModules: number
       }
     }
   - Return JSON string

   downloadJSON(jsonString, filename):
   - Create Blob with JSON data
   - Create download link
   - Trigger download
   - Default filename: "habitat-layout-YYYY-MM-DD.json"
   - Show toast: "Layout exported"

3. Import method:

   importLayout(jsonString, onSuccess, onError):
   - Parse JSON
   - Validate structure and version
   - Check NASA source citations present
   - Return parsed data
   - Call onSuccess with data
   - If error, call onError with message

   loadFromFile(file, onSuccess, onError):
   - Read file using FileReader
   - Parse JSON
   - Validate format
   - Call importLayout

4. Validation:

   validateImportData(data):
   - Check required fields
   - Validate module definitions
   - Check position values are numbers
   - Verify dimensions match catalog
   - Return {valid: boolean, errors: array}

5. Wire up UI:
   - #exportBtn click → export current layout
   - #importFile change → load selected file
   - Show errors in toast if import fails

Include version compatibility checks for future updates.
Add comments about NASA data provenance in exports.
```

---

## PROMPT 14: Main Application Integration

```
Create src/main.js - the main application entry point:

1. Import all components:
   - SceneManager
   - GridSystem
   - ModuleCatalog
   - HabitatModule
   - ConstraintValidator
   - DragControls
   - ModuleControls
   - HUD
   - Catalog
   - Toast
   - LayoutExporter

2. Load NASA constraints:
   - Fetch nasa-constraints.json
   - Parse and validate
   - Initialize ConstraintValidator

3. Initialize application:

   class App:

   constructor():
   - Create SceneManager
   - Create GridSystem and add to scene
   - Initialize modules array (empty)
   - Set up validator with constraints
   - Initialize UI components
   - Set up controls
   - Set up event handlers

   init():
   - Load constraints data
   - Initialize scene
   - Create grid and floor
   - Set up catalog panel
   - Initialize HUD
   - Set up drag controls
   - Set up module controls
   - Set up export/import
   - Start render loop

   addModule(catalogItem):
   - Create new HabitatModule instance
   - Assign unique ID
   - Position at origin (or smart placement)
   - Add to scene
   - Add to modules array
   - Select new module
   - Update validation
   - Show toast

   removeModule(module):
   - Remove from scene
   - Remove from array
   - Dispose resources
   - Update validation
   - Update HUD

   updateLayout():
   - Run validation on all modules
   - Update HUD metrics
   - Update visual feedback
   - Check for violations

   handleModuleMoved(module):
   - Update validation
   - Update HUD
   - Save state (for undo - future feature)

4. Set up animation loop:
   - Render scene
   - Update controls
   - Request next frame

5. Error handling:
   - Catch constraint loading errors
   - Handle invalid operations
   - Show user-friendly error messages

6. Initialize on DOMContentLoaded:
   - Create App instance
   - Call init()
   - Show loading indicator until ready

Add comprehensive error handling and loading states.
Include startup console log with NASA citations.
```

---

## PROMPT 15: HTML Structure & Styling

```
Complete the index.html with full structure and styling:

1. HTML structure:

   <div id="app">
     <header>
       <h1>LS² Layout Builder — NASA Habitability Rules</h1>
       <div class="header-info">
         <span>Units: meters (SI)</span>
         <span>Sources: NASA TP-2020-220505, AIAA 2022</span>
       </div>
     </header>

     <aside id="left">
       <!-- HUD metrics -->
       <div id="hud">
         <div class="row">
           <span>Total Footprint:</span>
           <strong><span id="areaTotal">0.00</span> m²</strong>
         </div>
         <div class="row">
           <span>Module Count:</span>
           <strong id="moduleCount">0</strong>
         </div>
         <div class="row">
           <span>Adjacency Compliance:</span>
           <strong id="adjComp">100%</strong>
         </div>
         <div class="row">
           <span>Path Width ≥1.0m:</span>
           <strong id="pathOk">OK</strong>
         </div>
       </div>

       <!-- Legend -->
       <div class="legend">
         <h3>Zone Legend</h3>
         <div class="item">
           <span class="swatch" style="background:#bae6fd"></span>
           <span>Clean zone (Crew, Galley, Work)</span>
         </div>
         <div class="item">
           <span class="swatch" style="background:#fecaca"></span>
           <span>Dirty zone (WCS, Hygiene, Exercise)</span>
         </div>
         <div class="item">
           <span class="swatch" style="background:#fde68a"></span>
           <span>Violation flagged</span>
         </div>
       </div>

       <!-- Tools -->
       <div id="tools">
         <h3>Module Controls</h3>
         <button class="btn" id="rotateBtn" disabled>Rotate (R)</button>
         <button class="btn" id="deleteBtn" disabled>Delete (Del)</button>
         <button class="btn outline" id="exportBtn">Export JSON</button>
         <label class="btn outline">
           Import JSON
           <input id="importFile" type="file" accept=".json" style="display:none" />
         </label>
       </div>

       <!-- Module Catalog -->
       <div id="catalogSection">
         <h3>Module Catalog</h3>
         <div id="catalog"></div>
       </div>

       <!-- Errors -->
       <div id="errors"></div>
     </aside>

     <main id="right">
       <div id="toast"></div>
       <canvas id="c"></canvas>
       <div id="instructions">
         <p>Click a module to select • Drag to move • R to rotate • Del to delete</p>
       </div>
     </main>
   </div>

2. Complete CSS styling:
   - Responsive grid layout
   - Proper spacing and typography
   - Button styles (primary, secondary, outline)
   - HUD card styling
   - Catalog tile styling
   - Toast notification animations
   - Color coding for compliance states
   - Mobile-friendly (media queries)

3. Add proper meta tags:
   - Viewport for mobile
   - Description
   - Author
   - Keywords

4. Link to main.js as ES6 module

Include accessibility attributes (ARIA labels, semantic HTML).
Add keyboard navigation hints in UI.
```

---

## PROMPT 16: Testing & Bug Fixes

```
Test the complete Phase 1 application and fix any bugs:

1. Functional testing:
   - Add each module type from catalog
   - Drag modules around
   - Test grid snapping (should snap to 0.1m)
   - Test rotation (90° increments)
   - Test deletion
   - Test selection/deselection
   - Test bounds checking (12m × 8m limits)

2. Validation testing:
   - Create adjacency violations:
     - Place Hygiene next to Crew Quarters
     - Place WCS next to Galley
     - Place Exercise next to Crew Quarters
   - Verify violations are detected
   - Check HUD updates correctly
   - Test path width validation

3. Export/Import testing:
   - Export a layout
   - Clear scene
   - Import the layout
   - Verify all modules restored correctly
   - Test with empty layout
   - Test with invalid JSON

4. UI/UX testing:
   - Test all buttons
   - Verify toast notifications appear
   - Check HUD metric calculations
   - Test catalog module addition
   - Verify error messages are clear

5. Performance testing:
   - Add 20+ modules
   - Check FPS stays at 60
   - Test drag performance with many modules
   - Check validation speed (<100ms)

6. Browser compatibility:
   - Test in Chrome
   - Test in Firefox
   - Test in Edge
   - Check console for errors

7. Common bugs to check:
   - Module overlap detection
   - Rotation dimension swap
   - Grid snapping precision
   - Memory leaks (dispose calls)
   - Event listener cleanup
   - Raycasting accuracy

Document any bugs found and fix them.
Create a test checklist for future reference.
```

---

## PROMPT 17: Documentation & Polish

```
Add final documentation and polish:

1. Create README.md:
   - Project overview
   - NASA Space Apps challenge context
   - Features implemented in Phase 1
   - Installation instructions
   - Usage guide
   - NASA data sources cited
   - Technology stack
   - Future roadmap (Phase 2)
   - License (MIT recommended)
   - Credits and attributions

2. Add code documentation:
   - JSDoc comments for all classes
   - Method parameter documentation
   - Return type documentation
   - Example usage in comments

3. Create CHANGELOG.md:
   - Version 1.0.0 (Phase 1)
   - List all features
   - Note NASA compliance

4. Add inline tooltips:
   - Module catalog items
   - HUD metrics
   - Validation errors
   - Control buttons

5. Improve error messages:
   - Make them educational
   - Cite NASA constraints
   - Suggest fixes

6. Add keyboard shortcuts reference:
   - R: Rotate selected module
   - Delete: Delete selected module
   - Esc: Deselect
   - Show in UI (help button or info panel)

7. Performance optimizations:
   - Check for any unnecessary renders
   - Optimize raycasting
   - Cache calculations where possible
   - Minimize DOM updates

8. Accessibility:
   - Add ARIA labels
   - Ensure keyboard navigation works
   - Check color contrast ratios
   - Add alt text where needed

9. Visual polish:
   - Smooth animations
   - Consistent spacing
   - Professional color scheme
   - Clear visual hierarchy

10. Create demo layout JSON:
    - Example "optimal" layout
    - Include in /public/examples/
    - Users can import to see best practices
```

---

## PROMPT 18: Deployment Preparation

```
Prepare the application for deployment:

1. Build configuration:
   - Verify vite.config.js is production-ready
   - Check asset optimization settings
   - Enable minification
   - Configure base path if needed

2. Production build:
   - Run `npm run build`
   - Check dist/ output
   - Verify all assets included
   - Test production build locally with `npm run preview`

3. Optimization:
   - Minimize bundle size
   - Check for unused dependencies
   - Optimize Three.js imports (tree-shaking)
   - Compress textures/assets if any

4. Static site deployment options:
   - GitHub Pages setup
   - Netlify configuration
   - Vercel configuration
   - Add deployment instructions to README

5. Environment configuration:
   - Check no hardcoded dev URLs
   - Verify all paths are relative
   - Test on different domains

6. Create deployment checklist:
   - Build passes
   - No console errors
   - All features working
   - Performance acceptable
   - Mobile responsive
   - Cross-browser tested

7. Post-deployment:
   - Verify live site works
   - Test all features on production
   - Check loading times
   - Monitor for errors

8. Create GitHub repository (if not exists):
   - Initialize git
   - Create .gitignore
   - Add all files
   - Create initial commit
   - Push to GitHub
   - Add LICENSE file
   - Add project description
   - Add topics/tags
```

---

## SUCCESS CRITERIA CHECKLIST

After completing all prompts, verify these Phase 1 goals are met:

**Core Functionality:**
- [ ] Three.js scene renders correctly with 2.5D view
- [ ] Grid system shows 1m major and 0.1m minor lines
- [ ] 12m × 8m habitat floor plate visible
- [ ] All 7 module types can be added from catalog
- [ ] Modules can be dragged and positioned
- [ ] Modules snap to 0.1m grid
- [ ] Modules can be rotated in 90° increments
- [ ] Modules can be deleted
- [ ] Module selection works correctly

**NASA Constraint Validation:**
- [ ] Minimum area requirements enforced for all 7 module types
- [ ] Adjacency rules detected and flagged (Hygiene ↔ Crew, WCS ↔ Galley, Exercise ↔ Crew)
- [ ] Path width validation (≥1.0m) working
- [ ] Clean/dirty zone separation validated
- [ ] Bounds checking (12m × 8m shell) working
- [ ] Overlap detection prevents module overlap

**UI/UX:**
- [ ] HUD shows real-time metrics (footprint, compliance %, path status)
- [ ] Module catalog displays all 7 modules correctly
- [ ] Toast notifications provide feedback
- [ ] Error messages are clear and educational
- [ ] Keyboard shortcuts work (R, Delete, Esc)
- [ ] Visual feedback for violations (yellow highlighting)
- [ ] Color coding works (blue clean, red dirty)

**Data Management:**
- [ ] Export layout to JSON works
- [ ] Import layout from JSON works
- [ ] NASA source citations included in exports
- [ ] Validation results included in exports

**Performance:**
- [ ] 60 FPS with 20+ modules
- [ ] Validation completes in <100ms
- [ ] Smooth drag-and-drop interaction
- [ ] No memory leaks (proper disposal)

**Code Quality:**
- [ ] All code documented with comments
- [ ] ES6 modules used correctly
- [ ] No console errors
- [ ] Clean separation of concerns
- [ ] NASA sources cited in code comments

**Documentation:**
- [ ] README.md complete
- [ ] Installation instructions clear
- [ ] NASA data sources documented
- [ ] Usage guide provided
- [ ] Phase 2 roadmap outlined

**Deployment:**
- [ ] Production build succeeds
- [ ] Application works on live URL
- [ ] Cross-browser compatible
- [ ] Mobile-responsive
- [ ] All assets load correctly

---

## NEXT STEPS (Phase 2)

After Phase 1 is complete and validated:

1. Implement psychological simulation model (HERA + UND)
2. Add mission configuration panel
3. Build time-step simulation engine
4. Create well-being heatmap visualization
5. Implement CSV export with psychological metrics
6. Add comparison mode for multiple layouts
7. Create demo scenarios (45-day lunar mission)

---

**END OF PHASE 1 IMPLEMENTATION PROMPTS**

Execute these prompts sequentially. Test thoroughly after each major component.
Document any deviations or issues encountered.
Celebrate when Phase 1 is complete! 🚀

/**
 * Habitat Configurator Component
 *
 * Allows users to select and customize habitat shape, dimensions, and type
 * based on NASA-validated configurations from:
 * - IEEE TH-Design 2023 (Mars Transit Habitat)
 * - NASA TP-2020-220505 (Deep Space Habitability Guidelines)
 * - ISS heritage designs
 *
 * NASA Space Apps Challenge 2024
 */

export default class HabitatConfigurator {
  constructor(onConfigChange) {
    this.onConfigChange = onConfigChange;

    // Embedded habitat types (no async loading needed)
    this.habitatTypes = [
      {
        id: 'rectangular_base',
        name: 'Rectangular Base',
        type: 'rigid',
        description: 'Standard lunar surface habitat - 12m × 8m floor plan',
        dimensions: { width: 12.0, depth: 8.0, height: 3.0 }
      },
      {
        id: 'large_base',
        name: 'Large Base',
        type: 'rigid',
        description: 'Extended habitat - 16m × 12m for more crew',
        dimensions: { width: 16.0, depth: 12.0, height: 3.0 }
      },
      {
        id: 'compact_base',
        name: 'Compact Base',
        type: 'rigid',
        description: 'Small crew habitat - 8m × 6m efficient layout',
        dimensions: { width: 8.0, depth: 6.0, height: 3.0 }
      },
      {
        id: 'cylindrical',
        name: 'Cylindrical Module',
        type: 'inflatable',
        description: 'Inflatable habitat - 10m diameter × 10m length',
        dimensions: { width: 10.0, depth: 10.0, height: 3.5 }
      }
    ];

    this.selectedType = this.habitatTypes[0];
    this.isLoaded = true;

    // Default config
    this.currentConfig = {
      type: 'rectangular_base',
      width: 12.0,
      depth: 8.0,
      height: 3.0,
      levels: 1
    };

    console.log('✅ HabitatConfigurator initialized with', this.habitatTypes.length, 'habitat types');
  }

  /**
   * Create the habitat configurator UI
   * @returns {HTMLElement} Configurator panel element
   */
  create() {
    const panel = document.createElement('div');
    panel.id = 'habitat-configurator';
    panel.style.cssText = `
      padding: 16px;
      background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      margin-bottom: 18px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    `;

    // Data is always loaded (embedded), so directly create UI
    panel.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Habitat Configuration
        </div>
      </div>

      <!-- Habitat Type Selector -->
      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 6px;">
          Habitat Type
        </label>
        <select id="habitat-type-select" style="width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: white; cursor: pointer;">
          ${this.habitatTypes.map(type => `
            <option value="${type.id}" ${type.id === 'rectangular_base' ? 'selected' : ''}>
              ${type.name}
            </option>
          `).join('')}
        </select>
        <div id="habitat-type-description" style="font-size: 10px; color: #64748b; margin-top: 4px; line-height: 1.4;">
          ${this.selectedType ? this.selectedType.description : ''}
        </div>
      </div>

      <!-- Dimensions Panel -->
      <div id="dimensions-panel" style="margin-bottom: 14px;">
        <!-- Width/Diameter -->
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 6px;">
            <span id="width-label">Diameter</span>: <span id="width-value">8.0</span> m
          </label>
          <input type="range" id="habitat-width" min="7.0" max="8.5" step="0.5" value="8.0"
            style="width: 100%; height: 4px; border-radius: 2px; background: linear-gradient(to right, #0ea5e9, #3b82f6); cursor: pointer;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; margin-top: 2px;">
            <span id="width-min">7.0 m</span>
            <span id="width-max">8.5 m</span>
          </div>
        </div>

        <!-- Length/Depth -->
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 6px;">
            <span id="depth-label">Length</span>: <span id="depth-value">8.5</span> m
          </label>
          <input type="range" id="habitat-depth" min="7.0" max="10.0" step="0.5" value="8.5"
            style="width: 100%; height: 4px; border-radius: 2px; background: linear-gradient(to right, #0ea5e9, #3b82f6); cursor: pointer;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; margin-top: 2px;">
            <span id="depth-min">7.0 m</span>
            <span id="depth-max">10.0 m</span>
          </div>
        </div>

        <!-- Height (shown only for rigid/modular) -->
        <div id="height-control" style="margin-bottom: 12px; display: none;">
          <label style="display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 6px;">
            Height: <span id="height-value">3.0</span> m
          </label>
          <input type="range" id="habitat-height" min="2.4" max="5.0" step="0.1" value="3.0"
            style="width: 100%; height: 4px; border-radius: 2px; background: linear-gradient(to right, #0ea5e9, #3b82f6); cursor: pointer;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; margin-top: 2px;">
            <span>2.4 m</span>
            <span>5.0 m</span>
          </div>
        </div>

        <!-- Levels (shown only for capable habitats) -->
        <div id="levels-control" style="margin-bottom: 12px; display: none;">
          <label style="display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 6px;">
            Levels: <span id="levels-value">1</span>
          </label>
          <input type="range" id="habitat-levels" min="1" max="3" step="1" value="1"
            style="width: 100%; height: 4px; border-radius: 2px; background: linear-gradient(to right, #10b981, #059669); cursor: pointer;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; margin-top: 2px;">
            <span>1 level</span>
            <span>3 levels</span>
          </div>
        </div>
      </div>

      <!-- Launch Vehicle Constraints -->
      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 6px;">
          Launch Vehicle
        </label>
        <select id="launch-vehicle-select" style="width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: white; cursor: pointer;">
          <option value="sls_block_1" selected>SLS Block 1 (8.4m fairing)</option>
          <option value="falcon_heavy">Falcon Heavy (5.2m fairing)</option>
          <option value="starship_hls">Starship HLS (9.0m fairing)</option>
        </select>
      </div>

      <!-- Calculated Metrics -->
      <div id="habitat-metrics" style="padding: 10px; background: rgba(15, 23, 42, 0.03); border-radius: 6px; border-left: 3px solid #3b82f6;">
        <div style="font-size: 10px; font-weight: 600; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">
          NASA Metrics
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
          <div>
            <div style="color: #64748b; font-size: 9px;">Volume</div>
            <div id="metric-volume" style="font-weight: 600; color: #0f172a;">-- m³</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 9px;">Per Crew</div>
            <div id="metric-per-crew" style="font-weight: 600; color: #0f172a;">-- m³</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 9px;">Est. Mass</div>
            <div id="metric-mass" style="font-weight: 600; color: #0f172a;">-- kg</div>
          </div>
          <div>
            <div style="color: #64748b; font-size: 9px;">Crew Cap.</div>
            <div id="metric-crew" style="font-weight: 600; color: #0f172a;">4</div>
          </div>
        </div>

        <!-- Compliance Indicator -->
        <div id="compliance-indicator" style="margin-top: 8px; padding: 6px; border-radius: 4px; font-size: 10px; text-align: center;">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- NASA Source Citation -->
      <div style="margin-top: 12px; padding: 8px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.2);">
        <div style="font-size: 9px; color: #64748b; line-height: 1.4;">
          <strong style="color: #475569;">NASA Source:</strong> <span id="nasa-source">IEEE TH-Design 2023</span>
        </div>
      </div>
    `;

    this.setupEventListeners(panel);
    this.updateMetrics();

    return panel;
  }

  /**
   * Setup event listeners for all controls
   */
  setupEventListeners(panel) {
    // Habitat type selector
    const typeSelect = panel.querySelector('#habitat-type-select');
    typeSelect.addEventListener('change', (e) => {
      this.handleTypeChange(e.target.value);
    });

    // Dimension sliders
    const widthSlider = panel.querySelector('#habitat-width');
    const depthSlider = panel.querySelector('#habitat-depth');
    const heightSlider = panel.querySelector('#habitat-height');
    const levelsSlider = panel.querySelector('#habitat-levels');

    widthSlider.addEventListener('input', (e) => {
      this.currentConfig.width = parseFloat(e.target.value);
      panel.querySelector('#width-value').textContent = e.target.value;
      this.updateMetrics();
      this.notifyConfigChange();
    });

    depthSlider.addEventListener('input', (e) => {
      this.currentConfig.depth = parseFloat(e.target.value);
      panel.querySelector('#depth-value').textContent = e.target.value;
      this.updateMetrics();
      this.notifyConfigChange();
    });

    if (heightSlider) {
      heightSlider.addEventListener('input', (e) => {
        this.currentConfig.height = parseFloat(e.target.value);
        panel.querySelector('#height-value').textContent = e.target.value;
        this.updateMetrics();
        this.notifyConfigChange();
      });
    }

    if (levelsSlider) {
      levelsSlider.addEventListener('input', (e) => {
        this.currentConfig.levels = parseInt(e.target.value);
        panel.querySelector('#levels-value').textContent = e.target.value;
        this.updateMetrics();
        this.notifyConfigChange();
      });
    }

    // Launch vehicle selector
    const launchSelect = panel.querySelector('#launch-vehicle-select');
    launchSelect.addEventListener('change', (e) => {
      this.currentConfig.launchVehicle = e.target.value;
      this.updateMetrics();
    });
  }

  /**
   * Handle habitat type change
   */
  handleTypeChange(typeId) {
    if (!this.isLoaded || !this.habitatTypes.length) return;

    this.selectedType = this.habitatTypes.find(t => t.id === typeId);
    this.currentConfig.type = typeId;

    // Update description
    const descEl = document.getElementById('habitat-type-description');
    if (descEl && this.selectedType) {
      descEl.textContent = this.selectedType.description;
    }

    // Load customization limits
    fetch('/src/data/habitat-types.json')
      .then(res => res.json())
      .then(data => {
        const customLimits = data.habitat_customization_limits[typeId];
    if (customLimits) {
      // Update width/diameter
      const widthSlider = document.getElementById('habitat-width');
      const widthLabel = document.getElementById('width-label');
      if (widthSlider && customLimits.diameter_range_m) {
        widthSlider.min = customLimits.diameter_range_m.min;
        widthSlider.max = customLimits.diameter_range_m.max;
        widthSlider.value = customLimits.diameter_range_m.default;
        this.currentConfig.width = customLimits.diameter_range_m.default;

        document.getElementById('width-value').textContent = customLimits.diameter_range_m.default.toFixed(1);
        document.getElementById('width-min').textContent = customLimits.diameter_range_m.min.toFixed(1) + ' m';
        document.getElementById('width-max').textContent = customLimits.diameter_range_m.max.toFixed(1) + ' m';

        if (widthLabel) widthLabel.textContent = 'Diameter';
      }

      // Update depth/length
      const depthSlider = document.getElementById('habitat-depth');
      const depthLabel = document.getElementById('depth-label');
      if (depthSlider && customLimits.length_range_m) {
        depthSlider.min = customLimits.length_range_m.min;
        depthSlider.max = customLimits.length_range_m.max;
        depthSlider.value = customLimits.length_range_m.default;
        this.currentConfig.depth = customLimits.length_range_m.default;

        document.getElementById('depth-value').textContent = customLimits.length_range_m.default.toFixed(1);
        document.getElementById('depth-min').textContent = customLimits.length_range_m.min.toFixed(1) + ' m';
        document.getElementById('depth-max').textContent = customLimits.length_range_m.max.toFixed(1) + ' m';

        if (depthLabel) depthLabel.textContent = 'Length';
      }

      // Show/hide levels control for TransHab (3 levels) vs others
      const levelsControl = document.getElementById('levels-control');
      if (typeId === 'hybrid_transhab' || (this.selectedType.dimensions && this.selectedType.dimensions.max_diameter_m >= 7.0)) {
        levelsControl.style.display = 'block';
      } else {
        levelsControl.style.display = 'none';
      }
    }

        // Update NASA source
        const sourceEl = document.getElementById('nasa-source');
        if (sourceEl && this.selectedType) {
          sourceEl.textContent = this.selectedType.source;
        }

        this.updateMetrics();
        this.notifyConfigChange();
      })
      .catch(err => console.error('Failed to load customization limits:', err));
  }

  /**
   * Calculate and update metrics based on current configuration
   */
  updateMetrics() {
    const { width, depth, height, levels, type, launchVehicle } = this.currentConfig;

    // Calculate volume based on habitat type
    let volume = 0;
    let habitableVolume = 0;

    if (type === 'hybrid_transhab') {
      // NASA formula for inflatable cylinder with toroids
      const radius = width / 2;
      const cylindricalLength = depth;
      volume = Math.PI * radius * radius * cylindricalLength;
      habitableVolume = volume * 0.65; // 65% habitable (rest is structure, systems, stowage)
    } else {
      // Simple cylinder for rigid/inflatable
      const radius = width / 2;
      volume = Math.PI * radius * radius * depth;
      habitableVolume = volume * 0.75; // 75% habitable for simpler designs
    }

    // Estimate mass based on NASA data (from IEEE paper)
    let estimatedMass = 0;
    if (type === 'hybrid_transhab') {
      // Scale from NASA reference (26,400 kg for 400 m³)
      estimatedMass = (volume / 400) * 26400;
    } else if (type === 'rigid_cylinder') {
      // Higher mass per volume for metallic
      estimatedMass = (volume / 127) * 18000;
    } else if (type === 'inflatable_beam') {
      // Lower mass for pure inflatable
      estimatedMass = (volume / 282) * 12000;
    } else {
      // Modular - highest mass
      estimatedMass = (volume / 285) * 45000;
    }

    // Crew capacity (NASA minimum 25 m³ per crew, recommended 50 m³)
    const crewCapacity = Math.floor(habitableVolume / 50);

    // Volume per crew
    const volumePerCrew = crewCapacity > 0 ? habitableVolume / crewCapacity : 0;

    // Update display
    document.getElementById('metric-volume').textContent = volume.toFixed(1) + ' m³';
    document.getElementById('metric-per-crew').textContent = volumePerCrew.toFixed(1) + ' m³';
    document.getElementById('metric-mass').textContent = Math.round(estimatedMass).toLocaleString() + ' kg';
    document.getElementById('metric-crew').textContent = crewCapacity;

    // Compliance check
    const complianceEl = document.getElementById('compliance-indicator');
    if (complianceEl) {
      // Check launch vehicle fit
      const vehicle = this.launchVehicles[launchVehicle];
      const fitsInFairing = width <= vehicle.payload_fairing.diameter_m;
      const fitsInMass = estimatedMass <= vehicle.max_payload_mass_kg;

      // Check NASA volume requirements
      const meetsMinVolume = volumePerCrew >= 25;
      const meetsRecVolume = volumePerCrew >= 50;
      const meetsOptimalVolume = volumePerCrew >= 60;

      let complianceHTML = '';
      let complianceColor = '';

      if (fitsInFairing && fitsInMass && meetsOptimalVolume) {
        complianceHTML = '✅ Optimal - Exceeds NASA standards';
        complianceColor = '#10b981';
      } else if (fitsInFairing && fitsInMass && meetsRecVolume) {
        complianceHTML = '✅ Compliant - Meets NASA recommendations';
        complianceColor = '#059669';
      } else if (fitsInFairing && fitsInMass && meetsMinVolume) {
        complianceHTML = '⚠️ Minimum - Meets NASA minimums only';
        complianceColor = '#d97706';
      } else if (!fitsInFairing || !fitsInMass) {
        complianceHTML = `❌ Launch constraint violation (${vehicle.name})`;
        complianceColor = '#dc2626';
      } else {
        complianceHTML = '❌ Below NASA minimum volume';
        complianceColor = '#dc2626';
      }

      complianceEl.innerHTML = complianceHTML;
      complianceEl.style.backgroundColor = complianceColor + '20';
      complianceEl.style.color = complianceColor;
      complianceEl.style.fontWeight = '600';
    }
  }

  /**
   * Notify parent application of configuration change
   */
  notifyConfigChange() {
    if (this.onConfigChange) {
      this.onConfigChange(this.getCurrentConfig());
    }
  }

  /**
   * Get current habitat configuration
   */
  getCurrentConfig() {
    return {
      ...this.currentConfig,
      habitatType: this.selectedType,
      volume: this.calculateVolume(),
      estimatedMass: this.calculateMass()
    };
  }

  /**
   * Calculate current volume
   */
  calculateVolume() {
    const { width, depth, type } = this.currentConfig;
    const radius = width / 2;
    return Math.PI * radius * radius * depth;
  }

  /**
   * Calculate estimated mass
   */
  calculateMass() {
    const volume = this.calculateVolume();
    const { type } = this.currentConfig;

    if (type === 'hybrid_transhab') {
      return (volume / 400) * 26400;
    } else if (type === 'rigid_cylinder') {
      return (volume / 127) * 18000;
    } else if (type === 'inflatable_beam') {
      return (volume / 282) * 12000;
    } else {
      return (volume / 285) * 45000;
    }
  }

  /**
   * Render or re-render the configurator panel
   */
  render() {
    if (!this.panel) {
      // Create panel for first time
      this.panel = this.create();

      // Find the left sidebar container
      const sidebar = document.querySelector('.left-sidebar');
      if (sidebar) {
        // Insert at the top of the sidebar
        sidebar.insertBefore(this.panel, sidebar.firstChild);
      } else {
        // Fallback: Insert before catalog if it exists
        const catalog = document.getElementById('catalog');
        if (catalog && catalog.parentElement) {
          catalog.parentElement.insertBefore(this.panel, catalog);
        }
      }
    } else if (this.isLoaded) {
      // Re-render with loaded data
      const newPanel = this.create();
      if (this.panel.parentElement) {
        this.panel.parentElement.replaceChild(newPanel, this.panel);
      }
      this.panel = newPanel;
    }
  }

  /**
   * Set configuration programmatically (for scenario loader)
   */
  setConfiguration(config) {
    if (config.type) {
      this.currentConfig.type = config.type;
      const typeSelect = document.getElementById('habitat-type-select');
      if (typeSelect) {
        typeSelect.value = config.type;
        this.handleTypeChange(config.type);
      }
    }
    if (config.width !== undefined) this.currentConfig.width = config.width;
    if (config.depth !== undefined) this.currentConfig.depth = config.depth;
    if (config.height !== undefined) this.currentConfig.height = config.height;
    if (config.levels !== undefined) this.currentConfig.levels = config.levels;

    this.updateMetrics();
    this.notifyConfigChange();
  }

  /**
   * Clean up event listeners (prevent memory leaks)
   */
  destroy() {
    if (this.panel && this.panel.parentElement) {
      this.panel.parentElement.removeChild(this.panel);
    }
    this.panel = null;
  }
}

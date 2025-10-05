/**
 * MissionConfigPanel.js
 *
 * Mission configuration UI panel for HERA-compliant simulations
 *
 * Features:
 * - Mission duration selection (HERA standard: 45 days)
 * - Crew size and composition
 * - Design parameters (windows, lighting, exercise)
 * - Preset configurations
 *
 * NASA Sources:
 * - HERA Facility: 45-day mission baseline
 * - TP-2020-220505: Crew configuration guidelines
 */

export class MissionConfigPanel {
  constructor(constraints) {
    this.constraints = constraints;

    // Default configuration (HERA baseline)
    this.config = {
      missionDays: 45,
      crewSize: 4,
      crewProfiles: [
        { id: 'crew-1', name: 'Commander', role: 'Leadership', gender: 'M' },
        { id: 'crew-2', name: 'Engineer', role: 'Technical', gender: 'F' },
        { id: 'crew-3', name: 'Scientist', role: 'Research', gender: 'M' },
        { id: 'crew-4', name: 'Medical Officer', role: 'Health', gender: 'F' }
      ],

      // Design parameters
      windowType: 0.5, // Virtual windows (HERA capability)
      visualOrder: 0.8,
      lightingScheduleCompliance: 0.8,
      exerciseCompliance: 0.7,
      circulationPattern: 1 // Loop circulation preferred
    };

    this.container = null;
    this.callbacks = {
      onConfigChange: null,
      onRunSimulation: null
    };
  }

  /**
   * Create and render the mission configuration panel
   * @param {HTMLElement} container - Container element
   * @param {Object} callbacks - Event callbacks
   */
  render(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    container.innerHTML = this.generateHTML();
    this.attachEventListeners();
  }

  /**
   * Generate HTML for the configuration panel
   * @returns {String} - HTML string
   */
  generateHTML() {
    return `
      <div class="mission-config-panel">
        <h3 style="margin-top:0; font-size:14px; font-weight:600;">🚀 Mission Configuration</h3>

        <!-- Mission Parameters -->
        <div class="config-section">
          <label class="config-label">Mission Duration:</label>
          <select id="missionDays" class="config-input">
            <option value="30">30 days</option>
            <option value="45" selected>45 days (HERA standard)</option>
            <option value="60">60 days</option>
            <option value="90">90 days (extended)</option>
          </select>
          <small class="config-hint">HERA baseline: 45 days confinement</small>
        </div>

        <div class="config-section">
          <label class="config-label">Crew Size:</label>
          <select id="crewSize" class="config-input">
            <option value="2">2 crew</option>
            <option value="4" selected>4 crew (HERA standard)</option>
            <option value="6">6 crew</option>
          </select>
          <small class="config-hint">Adjust crew roster below when changed</small>
        </div>

        <!-- Crew Roster -->
        <div class="config-section">
          <label class="config-label">Crew Roster:</label>
          <div id="crewRoster" class="crew-roster">
            ${this.generateCrewRosterHTML()}
          </div>
        </div>

        <!-- Design Parameters -->
        <div class="config-section">
          <h4 style="font-size:13px; margin:12px 0 8px 0;">Design Parameters</h4>

          <label class="config-label">Window Type:</label>
          <select id="windowType" class="config-input">
            <option value="0">None</option>
            <option value="0.5" selected>Virtual/Digital (HERA)</option>
            <option value="1">Physical</option>
          </select>
          <small class="config-hint">Virtual windows reduce confinement stress</small>
        </div>

        <div class="config-section">
          <label class="config-label">
            Lighting Schedule: <span id="lightingValue">80%</span>
          </label>
          <input
            type="range"
            id="lightingCompliance"
            class="config-slider"
            min="0"
            max="100"
            value="80"
          />
          <small class="config-hint">Circadian-aligned LED schedule (HERA)</small>
        </div>

        <div class="config-section">
          <label class="config-label">
            Exercise Compliance: <span id="exerciseValue">70%</span>
          </label>
          <input
            type="range"
            id="exerciseCompliance"
            class="config-slider"
            min="0"
            max="100"
            value="70"
          />
          <small class="config-hint">Daily exercise schedule adherence</small>
        </div>

        <!-- Presets -->
        <div class="config-section">
          <label class="config-label">Quick Presets:</label>
          <div class="preset-buttons">
            <button class="btn-preset" data-preset="hera">HERA Baseline</button>
            <button class="btn-preset" data-preset="optimal">Optimal</button>
            <button class="btn-preset" data-preset="minimal">Minimal</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="config-section" style="margin-top:16px;">
          <button id="runSimBtn" class="btn-primary">
            ▶️ Run 45-Day Simulation
          </button>
          <button id="resetConfigBtn" class="btn-secondary">
            Reset to Default
          </button>
        </div>

        <!-- Status Display -->
        <div id="simStatus" class="sim-status" style="display:none;">
          <div class="status-text">Simulation running...</div>
          <div class="status-progress">
            <div class="progress-bar" id="simProgress" style="width:0%"></div>
          </div>
        </div>
      </div>

      <style>
        .mission-config-panel {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px;
          font-size: 13px;
        }

        .config-section {
          margin-bottom: 12px;
        }

        .config-label {
          display: block;
          font-weight: 500;
          margin-bottom: 4px;
          color: #374151;
        }

        .config-input, .config-slider {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
        }

        .config-slider {
          padding: 0;
          height: 6px;
        }

        .config-hint {
          display: block;
          color: #6b7280;
          font-size: 11px;
          margin-top: 2px;
        }

        .crew-roster {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
          background: white;
        }

        .crew-item {
          display: grid;
          grid-template-columns: 1fr 1fr 60px;
          gap: 6px;
          margin-bottom: 6px;
          padding-bottom: 6px;
          border-bottom: 1px solid #f3f4f6;
        }

        .crew-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .crew-input {
          padding: 4px 6px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 12px;
        }

        .preset-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .btn-preset {
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-preset:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .btn-primary {
          width: 100%;
          padding: 10px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-secondary {
          width: 100%;
          padding: 8px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .sim-status {
          margin-top: 12px;
          padding: 10px;
          background: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 8px;
        }

        .status-text {
          font-size: 12px;
          color: #1e40af;
          margin-bottom: 6px;
        }

        .status-progress {
          height: 8px;
          background: #e0e7ff;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s;
        }
      </style>
    `;
  }

  /**
   * Generate crew roster HTML
   * @returns {String}
   */
  generateCrewRosterHTML() {
    return this.config.crewProfiles.map((member, index) => `
      <div class="crew-item" data-crew-index="${index}">
        <input
          type="text"
          class="crew-input crew-name"
          placeholder="Name"
          value="${member.name}"
          data-field="name"
        />
        <input
          type="text"
          class="crew-input crew-role"
          placeholder="Role"
          value="${member.role}"
          data-field="role"
        />
        <select class="crew-input crew-gender" data-field="gender">
          <option value="M" ${member.gender === 'M' ? 'selected' : ''}>M</option>
          <option value="F" ${member.gender === 'F' ? 'selected' : ''}>F</option>
        </select>
      </div>
    `).join('');
  }

  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Mission parameters
    document.getElementById('missionDays').addEventListener('change', (e) => {
      this.config.missionDays = parseInt(e.target.value);
      this.updateRunButtonText();
      this.notifyConfigChange();
    });

    document.getElementById('crewSize').addEventListener('change', (e) => {
      this.config.crewSize = parseInt(e.target.value);
      this.updateCrewRoster();
      this.notifyConfigChange();
    });

    // Design parameters
    document.getElementById('windowType').addEventListener('change', (e) => {
      this.config.windowType = parseFloat(e.target.value);
      this.notifyConfigChange();
    });

    document.getElementById('lightingCompliance').addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.config.lightingScheduleCompliance = value / 100;
      document.getElementById('lightingValue').textContent = `${value}%`;
      this.notifyConfigChange();
    });

    document.getElementById('exerciseCompliance').addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      this.config.exerciseCompliance = value / 100;
      document.getElementById('exerciseValue').textContent = `${value}%`;
      this.notifyConfigChange();
    });

    // Crew roster inputs
    this.container.querySelectorAll('.crew-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.closest('.crew-item').dataset.crewIndex);
        const field = e.target.dataset.field;
        this.config.crewProfiles[index][field] = e.target.value;
        this.notifyConfigChange();
      });
    });

    // Preset buttons
    this.container.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.applyPreset(preset);
      });
    });

    // Action buttons
    document.getElementById('runSimBtn').addEventListener('click', () => {
      if (this.callbacks.onRunSimulation) {
        this.callbacks.onRunSimulation(this.config);
      }
    });

    document.getElementById('resetConfigBtn').addEventListener('click', () => {
      this.resetToDefault();
    });
  }

  /**
   * Update crew roster when crew size changes
   */
  updateCrewRoster() {
    const defaultNames = ['Commander', 'Engineer', 'Scientist', 'Medical Officer', 'Pilot', 'Specialist'];
    const defaultRoles = ['Leadership', 'Technical', 'Research', 'Health', 'Navigation', 'Support'];

    // Adjust crew profiles array
    while (this.config.crewProfiles.length < this.config.crewSize) {
      const index = this.config.crewProfiles.length;
      this.config.crewProfiles.push({
        id: `crew-${index + 1}`,
        name: defaultNames[index] || `Crew ${index + 1}`,
        role: defaultRoles[index] || 'Crew Member',
        gender: index % 2 === 0 ? 'M' : 'F'
      });
    }

    while (this.config.crewProfiles.length > this.config.crewSize) {
      this.config.crewProfiles.pop();
    }

    // Re-render crew roster
    document.getElementById('crewRoster').innerHTML = this.generateCrewRosterHTML();

    // Re-attach listeners for new inputs
    this.container.querySelectorAll('.crew-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.closest('.crew-item').dataset.crewIndex);
        const field = e.target.dataset.field;
        this.config.crewProfiles[index][field] = e.target.value;
        this.notifyConfigChange();
      });
    });
  }

  /**
   * Apply a configuration preset
   * @param {String} presetName - 'hera', 'optimal', or 'minimal'
   */
  applyPreset(presetName) {
    switch (presetName) {
      case 'hera':
        // HERA baseline configuration
        this.config.windowType = 0.5;
        this.config.lightingScheduleCompliance = 0.8;
        this.config.exerciseCompliance = 0.7;
        break;

      case 'optimal':
        // Optimal psychological health configuration
        this.config.windowType = 1.0;
        this.config.lightingScheduleCompliance = 1.0;
        this.config.exerciseCompliance = 1.0;
        break;

      case 'minimal':
        // Minimal countermeasures
        this.config.windowType = 0;
        this.config.lightingScheduleCompliance = 0.5;
        this.config.exerciseCompliance = 0.5;
        break;
    }

    // Update UI
    document.getElementById('windowType').value = this.config.windowType;
    document.getElementById('lightingCompliance').value = Math.round(this.config.lightingScheduleCompliance * 100);
    document.getElementById('lightingValue').textContent = `${Math.round(this.config.lightingScheduleCompliance * 100)}%`;
    document.getElementById('exerciseCompliance').value = Math.round(this.config.exerciseCompliance * 100);
    document.getElementById('exerciseValue').textContent = `${Math.round(this.config.exerciseCompliance * 100)}%`;

    this.notifyConfigChange();
  }

  /**
   * Reset configuration to default
   */
  resetToDefault() {
    this.config = {
      missionDays: 45,
      crewSize: 4,
      crewProfiles: [
        { id: 'crew-1', name: 'Commander', role: 'Leadership', gender: 'M' },
        { id: 'crew-2', name: 'Engineer', role: 'Technical', gender: 'F' },
        { id: 'crew-3', name: 'Scientist', role: 'Research', gender: 'M' },
        { id: 'crew-4', name: 'Medical Officer', role: 'Health', gender: 'F' }
      ],
      windowType: 0.5,
      visualOrder: 0.8,
      lightingScheduleCompliance: 0.8,
      exerciseCompliance: 0.7,
      circulationPattern: 1
    };

    // Re-render entire panel
    this.render(this.container, this.callbacks);
  }

  /**
   * Update run button text based on mission days
   */
  updateRunButtonText() {
    const btn = document.getElementById('runSimBtn');
    if (btn) {
      btn.textContent = `▶️ Run ${this.config.missionDays}-Day Simulation`;
    }
  }

  /**
   * Show simulation progress
   * @param {Number} progress - Progress percentage (0-100)
   */
  showProgress(progress) {
    const statusEl = document.getElementById('simStatus');
    const progressBar = document.getElementById('simProgress');

    if (statusEl && progressBar) {
      statusEl.style.display = 'block';
      progressBar.style.width = `${progress}%`;
    }
  }

  /**
   * Hide simulation progress
   */
  hideProgress() {
    const statusEl = document.getElementById('simStatus');
    if (statusEl) {
      statusEl.style.display = 'none';
    }
  }

  /**
   * Notify parent of configuration change
   */
  notifyConfigChange() {
    if (this.callbacks.onConfigChange) {
      this.callbacks.onConfigChange(this.config);
    }
  }

  /**
   * Get current configuration
   * @returns {Object}
   */
  getConfig() {
    return { ...this.config };
  }
}

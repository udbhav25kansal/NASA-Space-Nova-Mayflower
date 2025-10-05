/**
 * Mission Scenario Loader
 *
 * Provides preset mission scenarios (Artemis, HERA, Gateway, Mars)
 * Allows quick prototyping of different mission configurations
 *
 * NASA Space Apps Challenge 2024 - Gap #5: Mission Scenarios
 */

export default class ScenarioLoader {
  constructor(onScenarioLoad) {
    this.onScenarioLoad = onScenarioLoad;
    this.scenarios = [];
    this.isLoaded = false;

    // Load scenarios
    this.loadScenarios();
  }

  /**
   * Load mission scenarios from JSON
   */
  async loadScenarios() {
    try {
      const response = await fetch('/src/data/mission-scenarios.json');
      if (!response.ok) {
        throw new Error(`Failed to load scenarios: ${response.status}`);
      }

      const data = await response.json();
      this.scenarios = data.scenarios;
      this.isLoaded = true;

      console.log('✅ Mission scenarios loaded:', this.scenarios.length);
    } catch (error) {
      console.error('Failed to load mission scenarios:', error);
      this.isLoaded = false;
    }
  }

  /**
   * Render scenario selector in existing mission config panel
   */
  render() {
    if (!this.isLoaded) return;

    // Find mission config section
    const missionSection = document.getElementById('missionConfigSection');
    if (!missionSection) return;

    // Create scenario dropdown
    const scenarioSelect = document.createElement('div');
    scenarioSelect.style.cssText = 'margin-bottom: 12px;';

    scenarioSelect.innerHTML = `
      <label style="display: block; font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 6px;">
        🎯 Mission Scenario Presets
      </label>
      <select id="scenario-preset-select" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: white; cursor: pointer; margin-bottom: 6px;">
        <option value="">-- Select a scenario --</option>
        ${this.scenarios.map(s => `
          <option value="${s.id}">${s.name}</option>
        `).join('')}
      </select>
      <div id="scenario-description" style="font-size: 10px; color: #64748b; line-height: 1.4; padding: 8px; background: #f8fafc; border-radius: 4px; display: none;"></div>
    `;

    // Insert at top of mission section
    const firstChild = missionSection.querySelector('h3');
    if (firstChild && firstChild.nextSibling) {
      firstChild.parentNode.insertBefore(scenarioSelect, firstChild.nextSibling);
    }

    // Setup event listener
    const select = document.getElementById('scenario-preset-select');
    select.addEventListener('change', (e) => {
      const scenarioId = e.target.value;
      if (scenarioId) {
        this.loadScenario(scenarioId);
      } else {
        document.getElementById('scenario-description').style.display = 'none';
      }
    });
  }

  /**
   * Load a specific scenario
   */
  loadScenario(scenarioId) {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      console.error('Scenario not found:', scenarioId);
      return;
    }

    console.log('📋 Loading scenario:', scenario.name);

    // Show description
    const descEl = document.getElementById('scenario-description');
    if (descEl) {
      descEl.style.display = 'block';
      descEl.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">${scenario.name}</div>
        <div style="margin-bottom: 6px;">${scenario.description}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
          <div><strong>Crew:</strong> ${scenario.crew_size}</div>
          <div><strong>Duration:</strong> ${scenario.mission_duration_days} days</div>
          <div><strong>Modules:</strong> ${scenario.required_modules.length}</div>
          <div><strong>Objects:</strong> ${scenario.recommended_objects.length}</div>
        </div>
      `;
    }

    // Call callback with scenario data
    if (this.onScenarioLoad) {
      this.onScenarioLoad(scenario);
    }
  }

  /**
   * Get scenario by ID
   */
  getScenario(id) {
    return this.scenarios.find(s => s.id === id);
  }

  /**
   * Get all scenarios
   */
  getAllScenarios() {
    return this.scenarios;
  }
}

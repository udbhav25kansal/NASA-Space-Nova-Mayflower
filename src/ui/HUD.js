/**
 * HUD (Heads-Up Display) - Live Metrics Dashboard
 *
 * Manages the real-time display of layout metrics and NASA compliance:
 * - Total footprint area
 * - Module count
 * - Adjacency compliance percentage
 * - Path width validation status
 * - Violation list
 *
 * Updates automatically when layout changes.
 */

export default class HUD {
  constructor(validator) {
    this.validator = validator;

    // Cache DOM elements
    this.elements = {
      areaTotal: document.getElementById('areaTotal'),
      moduleCount: document.getElementById('moduleCount'),
      adjComp: document.getElementById('adjComp'),
      pathOk: document.getElementById('pathOk'),
      errors: document.getElementById('errors')
    };

    // Last validation report
    this.lastReport = null;

    console.log('✅ HUD initialized');
  }

  /**
   * Update HUD with current layout state
   * @param {Array<HabitatModule>} modules - All modules in layout
   * @param {Object} shellDimensions - Habitat shell dimensions
   */
  update(modules, shellDimensions) {
    if (!this.validator) {
      console.warn('HUD: No validator available');
      return;
    }

    // Run validation
    this.lastReport = this.validator.validateLayout(modules, shellDimensions);

    // Update metrics
    this.updateFootprint(modules);
    this.updateModuleCount(modules);
    this.updateCompliance(this.lastReport);
    this.updatePathStatus(this.lastReport);
    this.updateViolations(this.lastReport);
  }

  /**
   * Update total footprint display
   * @param {Array<HabitatModule>} modules
   */
  updateFootprint(modules) {
    const totalArea = modules.reduce((sum, m) => sum + m.getFootprint(), 0);
    this.elements.areaTotal.textContent = this.formatArea(totalArea);
  }

  /**
   * Update module count display
   * @param {Array<HabitatModule>} modules
   */
  updateModuleCount(modules) {
    this.elements.moduleCount.textContent = modules.length;
  }

  /**
   * Update compliance percentage display
   * @param {Object} report - Validation report
   */
  updateCompliance(report) {
    const percentage = report.compliancePercentage;
    this.elements.adjComp.textContent = this.formatPercentage(percentage);

    // Color code based on compliance level
    const color = this.getComplianceColor(percentage);
    this.elements.adjComp.style.color = color;
  }

  /**
   * Update path width validation status
   * @param {Object} report - Validation report
   */
  updatePathStatus(report) {
    // Check if there are any path width violations
    const pathViolations = report.violations.filter(v => v.type === 'path_width');
    const status = pathViolations.length === 0 ? 'OK' : 'FAIL';

    this.elements.pathOk.textContent = status;

    // Color code: green for OK, red for FAIL
    if (status === 'OK') {
      this.elements.pathOk.style.color = '#059669'; // Green
    } else {
      this.elements.pathOk.style.color = '#dc2626'; // Red
    }
  }

  /**
   * Update violations list display
   * @param {Object} report - Validation report
   */
  updateViolations(report) {
    const errorsContainer = this.elements.errors;
    errorsContainer.innerHTML = ''; // Clear existing

    // Show violations
    if (report.violations.length > 0) {
      const title = document.createElement('div');
      title.style.fontWeight = '600';
      title.style.marginBottom = '8px';
      title.textContent = `⚠️ Violations (${report.violations.length})`;
      errorsContainer.appendChild(title);

      // Group violations by severity
      const critical = report.violations.filter(v => v.severity === 'critical');
      const high = report.violations.filter(v => v.severity === 'high');
      const medium = report.violations.filter(v => v.severity === 'medium');

      // Display critical first
      if (critical.length > 0) {
        this.renderViolations(critical, 'Critical', '#dc2626', errorsContainer);
      }

      if (high.length > 0) {
        this.renderViolations(high, 'High', '#ea580c', errorsContainer);
      }

      if (medium.length > 0) {
        this.renderViolations(medium, 'Medium', '#d97706', errorsContainer);
      }
    }

    // Show warnings
    if (report.warnings.length > 0) {
      const warningTitle = document.createElement('div');
      warningTitle.style.fontWeight = '600';
      warningTitle.style.marginTop = '12px';
      warningTitle.style.marginBottom = '8px';
      warningTitle.style.color = '#d97706';
      warningTitle.textContent = `⚡ Warnings (${report.warnings.length})`;
      errorsContainer.appendChild(warningTitle);

      report.warnings.forEach(warning => {
        const item = document.createElement('div');
        item.className = 'error-item';
        item.style.background = '#fef3c7';
        item.style.borderColor = '#d97706';
        item.style.padding = '6px 8px';
        item.style.marginBottom = '4px';
        item.style.borderRadius = '4px';
        item.style.fontSize = '11px';
        item.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 2px;">${warning.message}</div>
          <div style="color: #92400e; font-size: 10px;">${warning.rationale || ''}</div>
        `;
        errorsContainer.appendChild(item);
      });
    }

    // Show success message if no violations or warnings
    if (report.violations.length === 0 && report.warnings.length === 0 && report.moduleCount > 0) {
      const success = document.createElement('div');
      success.style.padding = '12px';
      success.style.background = '#d1fae5';
      success.style.borderLeft = '3px solid #059669';
      success.style.borderRadius = '4px';
      success.style.color = '#065f46';
      success.style.fontSize = '12px';
      success.style.fontWeight = '600';
      success.textContent = '✓ Layout meets all NASA habitability requirements';
      errorsContainer.appendChild(success);
    }
  }

  /**
   * Render a group of violations
   * @param {Array} violations - Violations to render
   * @param {string} label - Severity label
   * @param {string} color - Color for the label
   * @param {HTMLElement} container - Container element
   */
  renderViolations(violations, label, color, container) {
    violations.forEach(violation => {
      const item = document.createElement('div');
      item.className = 'error-item';
      item.style.marginBottom = '6px';

      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
          <span style="font-weight: 600; font-size: 11px;">${violation.message}</span>
          <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: 600; text-transform: uppercase;">${label}</span>
        </div>
        ${violation.rationale ? `<div style="font-size: 10px; color: #6b7280; margin-bottom: 3px;">${violation.rationale}</div>` : ''}
        ${violation.source ? `<div style="font-size: 9px; color: #9ca3af;">Source: ${violation.source}</div>` : ''}
      `;

      container.appendChild(item);
    });
  }

  /**
   * Clear all HUD displays
   */
  clear() {
    this.elements.areaTotal.textContent = '0.00';
    this.elements.moduleCount.textContent = '0';
    this.elements.adjComp.textContent = '100%';
    this.elements.adjComp.style.color = '#059669';
    this.elements.pathOk.textContent = 'OK';
    this.elements.pathOk.style.color = '#059669';
    this.elements.errors.innerHTML = '';
  }

  /**
   * Get the last validation report
   * @returns {Object|null}
   */
  getLastReport() {
    return this.lastReport;
  }

  /**
   * Format area value
   * @param {number} area - Area in m²
   * @returns {string} Formatted string
   */
  formatArea(area) {
    return area.toFixed(2);
  }

  /**
   * Format percentage value
   * @param {number} percentage - Percentage (0-100)
   * @returns {string} Formatted string
   */
  formatPercentage(percentage) {
    return `${Math.round(percentage)}%`;
  }

  /**
   * Get color for compliance percentage
   * @param {number} percentage - Compliance percentage (0-100)
   * @returns {string} CSS color
   */
  getComplianceColor(percentage) {
    if (percentage >= 90) {
      return '#059669'; // Green
    } else if (percentage >= 70) {
      return '#d97706'; // Yellow/Orange
    } else {
      return '#dc2626'; // Red
    }
  }

  /**
   * Show a specific metric highlight (for animations/emphasis)
   * @param {string} metric - Metric name ('area', 'count', 'compliance', 'path')
   */
  highlightMetric(metric) {
    const elementMap = {
      area: this.elements.areaTotal.parentElement,
      count: this.elements.moduleCount.parentElement,
      compliance: this.elements.adjComp.parentElement,
      path: this.elements.pathOk.parentElement
    };

    const element = elementMap[metric];
    if (element) {
      element.style.background = '#fef3c7';
      setTimeout(() => {
        element.style.background = '';
      }, 500);
    }
  }
}

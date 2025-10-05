/**
 * Layout Exporter - Export/Import Layout to/from JSON
 *
 * Handles:
 * - Exporting current layout to JSON file
 * - Importing layout from JSON file
 * - Validation of import data
 * - NASA source citations in exports
 * - Metadata (date, version, compliance)
 *
 * JSON format includes:
 * - Module positions and rotations
 * - Validation report
 * - NASA source references
 * - Habitat dimensions
 */

import Toast from '../ui/Toast.js';

export default class LayoutExporter {
  constructor() {
    this.version = '1.0';
    this.nasaSources = [
      'NASA/TP-2020-220505',
      'AIAA ASCEND 2022',
      'HERA Facility 2019'
    ];

    console.log('✅ LayoutExporter initialized');
  }

  /**
   * Export layout to JSON structure
   * @param {Array<HabitatModule>} modules - All modules in layout
   * @param {Object} validationReport - Validation report from ConstraintValidator
   * @param {Object} shellDimensions - Habitat shell dimensions
   * @returns {Object} JSON structure
   */
  exportLayout(modules, validationReport, shellDimensions) {
    const exportData = {
      version: this.version,
      exportDate: new Date().toISOString(),
      nasaSources: this.nasaSources,
      habitatShell: {
        width: shellDimensions.width,
        depth: shellDimensions.depth,
        units: 'meters'
      },
      modules: modules.map(m => m.toJSON()),
      validation: {
        compliancePercentage: validationReport.compliancePercentage,
        totalFootprint: validationReport.totalFootprint,
        violations: validationReport.violations.length,
        warnings: validationReport.warnings.length,
        moduleCount: validationReport.moduleCount
      },
      metadata: {
        moduleCount: modules.length,
        cleanModules: modules.filter(m => m.zone === 'clean').length,
        dirtyModules: modules.filter(m => m.zone === 'dirty').length,
        totalFootprint: modules.reduce((sum, m) => sum + m.getFootprint(), 0)
      }
    };

    console.log('📤 Layout exported:', exportData);
    return exportData;
  }

  /**
   * Export layout and download as JSON file
   * @param {Array<HabitatModule>} modules
   * @param {Object} validationReport
   * @param {Object} shellDimensions
   */
  downloadJSON(modules, validationReport, shellDimensions) {
    const data = this.exportLayout(modules, validationReport, shellDimensions);
    const jsonString = JSON.stringify(data, null, 2);

    // Create filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `habitat-layout-${date}.json`;

    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    Toast.success(`Layout exported: ${filename}`);
    console.log(`💾 Downloaded: ${filename}`);
  }

  /**
   * Validate import data structure
   * @param {Object} data - Parsed JSON data
   * @returns {Object} {valid: boolean, errors: Array<string>}
   */
  validateImportData(data) {
    const errors = [];

    // Check required fields
    if (!data.version) {
      errors.push('Missing version field');
    }

    if (!data.habitatShell) {
      errors.push('Missing habitatShell field');
    } else {
      if (typeof data.habitatShell.width !== 'number') {
        errors.push('Invalid habitatShell.width');
      }
      if (typeof data.habitatShell.depth !== 'number') {
        errors.push('Invalid habitatShell.depth');
      }
    }

    if (!Array.isArray(data.modules)) {
      errors.push('Missing or invalid modules array');
    } else {
      // Validate each module
      data.modules.forEach((module, index) => {
        if (!module.name) {
          errors.push(`Module ${index}: Missing name`);
        }
        if (!module.position || typeof module.position.x !== 'number') {
          errors.push(`Module ${index}: Invalid position`);
        }
        if (!module.dimensions) {
          errors.push(`Module ${index}: Missing dimensions`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Import layout from JSON data
   * @param {string} jsonString - JSON string to parse
   * @returns {Promise<Object>} Parsed and validated data
   */
  async importLayout(jsonString) {
    return new Promise((resolve, reject) => {
      try {
        // Parse JSON
        const data = JSON.parse(jsonString);

        // Validate structure
        const validation = this.validateImportData(data);

        if (!validation.valid) {
          reject({
            error: 'Invalid layout file',
            details: validation.errors
          });
          return;
        }

        // Check version compatibility
        if (data.version !== this.version) {
          console.warn(`Version mismatch: File is ${data.version}, expected ${this.version}`);
        }

        console.log('📥 Layout imported:', data);
        resolve(data);

      } catch (error) {
        reject({
          error: 'Failed to parse JSON',
          details: [error.message]
        });
      }
    });
  }

  /**
   * Load layout from file input
   * @param {File} file - File object from input
   * @returns {Promise<Object>} Parsed layout data
   */
  async loadFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject({ error: 'No file provided' });
        return;
      }

      // Check file type
      if (!file.name.endsWith('.json')) {
        reject({ error: 'File must be .json format' });
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const jsonString = e.target.result;
          const data = await this.importLayout(jsonString);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject({ error: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Set up file input handler
   * @param {HTMLInputElement} inputElement - File input element
   * @param {Function} onSuccess - Callback(data) when import succeeds
   * @param {Function} onError - Callback(error) when import fails
   */
  setupFileInput(inputElement, onSuccess, onError) {
    if (!inputElement) {
      console.error('File input element not found');
      return;
    }

    inputElement.addEventListener('change', async (event) => {
      const file = event.target.files[0];

      if (!file) return;

      try {
        const data = await this.loadFromFile(file);
        Toast.success(`Loaded layout: ${file.name}`);
        onSuccess(data);
      } catch (error) {
        console.error('Import error:', error);
        Toast.error(error.error || 'Failed to import layout');
        if (onError) {
          onError(error);
        }
      }

      // Reset input so same file can be loaded again
      event.target.value = '';
    });

    console.log('✅ File input handler set up');
  }

  /**
   * Set up export button handler
   * @param {HTMLButtonElement} buttonElement - Export button
   * @param {Function} getData - Callback() that returns {modules, validationReport, shellDimensions}
   */
  setupExportButton(buttonElement, getData) {
    if (!buttonElement) {
      console.error('Export button element not found');
      return;
    }

    buttonElement.addEventListener('click', () => {
      const { modules, validationReport, shellDimensions } = getData();

      if (!modules || modules.length === 0) {
        Toast.warning('No modules to export');
        return;
      }

      this.downloadJSON(modules, validationReport, shellDimensions);
    });

    console.log('✅ Export button handler set up');
  }
}

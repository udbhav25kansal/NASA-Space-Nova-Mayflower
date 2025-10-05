/**
 * Catalog - Module Catalog UI Panel
 *
 * Manages the module catalog sidebar panel where users can:
 * - View available habitat modules
 * - See module specifications (dimensions, zone, NASA requirements)
 * - Add modules to the layout
 *
 * Each catalog tile displays:
 * - Module name
 * - Dimensions (w × d meters)
 * - Zone badge (clean/dirty)
 * - NASA minimum area requirement
 * - Add button
 */

export default class Catalog {
  constructor(catalogData, onAddModule) {
    this.catalogData = catalogData;
    this.onAddModule = onAddModule;
    this.container = document.getElementById('catalog');

    console.log('✅ Catalog UI initialized');
    console.log(`   Available modules: ${catalogData.length}`);
  }

  /**
   * Render the complete catalog
   */
  render() {
    if (!this.container) {
      console.error('Catalog container not found');
      return;
    }

    // Clear existing content
    this.container.innerHTML = '';

    // Create tile for each module type
    this.catalogData.forEach(moduleItem => {
      const tile = this.createTile(moduleItem);
      this.container.appendChild(tile);
    });

    console.log(`📦 Rendered ${this.catalogData.length} module tiles`);
  }

  /**
   * Create a catalog tile for one module type
   * @param {Object} moduleItem - Module definition from catalog
   * @returns {HTMLElement} Tile element
   */
  createTile(moduleItem) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.title = moduleItem.description; // Tooltip

    // Info section (left side)
    const info = document.createElement('div');
    info.className = 'info';

    // Module name
    const name = document.createElement('strong');
    name.textContent = moduleItem.name;

    // Dimensions
    const dimensions = document.createElement('small');
    dimensions.textContent = `${moduleItem.w}m × ${moduleItem.d}m`;
    dimensions.style.display = 'block';

    // NASA minimum area
    const minArea = document.createElement('small');
    minArea.textContent = `Min: ${moduleItem.minArea} m²`;
    minArea.style.display = 'block';
    minArea.style.color = '#9ca3af';
    minArea.style.fontSize = '10px';

    // Zone badge
    const zoneBadge = document.createElement('span');
    zoneBadge.className = `zone-badge ${moduleItem.zone}`;
    zoneBadge.textContent = moduleItem.zone;

    // Assemble info section
    info.appendChild(name);
    info.appendChild(dimensions);
    info.appendChild(minArea);
    info.appendChild(zoneBadge);

    // Add button (right side)
    const button = document.createElement('button');
    button.className = 'btn secondary';
    button.textContent = 'Add';
    button.onclick = (e) => {
      e.stopPropagation();
      this.handleAddClick(moduleItem);
    };

    // Assemble tile
    tile.appendChild(info);
    tile.appendChild(button);

    // Make tile clickable to add module
    tile.onclick = () => {
      this.handleAddClick(moduleItem);
    };

    return tile;
  }

  /**
   * Handle add module click
   * @param {Object} moduleItem - Module to add
   */
  handleAddClick(moduleItem) {
    if (this.onAddModule) {
      this.onAddModule(moduleItem);
      console.log(`➕ Adding module: ${moduleItem.name}`);
    }
  }

  /**
   * Update catalog with module counts (optional feature)
   * Shows how many of each module type have been placed
   * @param {Array<HabitatModule>} modules - Currently placed modules
   */
  updateCounts(modules) {
    // Count modules by name
    const counts = {};
    modules.forEach(module => {
      counts[module.moduleName] = (counts[module.moduleName] || 0) + 1;
    });

    // Update each tile with count badge
    this.catalogData.forEach((moduleItem, index) => {
      const count = counts[moduleItem.name] || 0;
      const tile = this.container.children[index];

      if (tile) {
        // Remove existing count badge if present
        const existingBadge = tile.querySelector('.count-badge');
        if (existingBadge) {
          existingBadge.remove();
        }

        // Add count badge if count > 0
        if (count > 0) {
          const countBadge = document.createElement('div');
          countBadge.className = 'count-badge';
          countBadge.textContent = `×${count}`;
          countBadge.style.position = 'absolute';
          countBadge.style.top = '4px';
          countBadge.style.right = '4px';
          countBadge.style.background = '#111827';
          countBadge.style.color = 'white';
          countBadge.style.padding = '2px 6px';
          countBadge.style.borderRadius = '10px';
          countBadge.style.fontSize = '10px';
          countBadge.style.fontWeight = '600';

          tile.style.position = 'relative';
          tile.appendChild(countBadge);
        }
      }
    });
  }

  /**
   * Highlight a specific module type in the catalog
   * @param {string} moduleName - Name of module to highlight
   */
  highlightModule(moduleName) {
    const index = this.catalogData.findIndex(m => m.name === moduleName);
    if (index >= 0 && this.container.children[index]) {
      const tile = this.container.children[index];
      tile.style.background = '#fef3c7';
      tile.style.borderColor = '#d97706';

      setTimeout(() => {
        tile.style.background = '';
        tile.style.borderColor = '';
      }, 1000);
    }
  }

  /**
   * Filter catalog by zone
   * @param {string} zone - 'clean', 'dirty', or 'all'
   */
  filterByZone(zone) {
    Array.from(this.container.children).forEach((tile, index) => {
      const moduleItem = this.catalogData[index];

      if (zone === 'all' || moduleItem.zone === zone) {
        tile.style.display = '';
      } else {
        tile.style.display = 'none';
      }
    });
  }

  /**
   * Get module by name from catalog
   * @param {string} name - Module name
   * @returns {Object|null} Module definition
   */
  getModuleByName(name) {
    return this.catalogData.find(m => m.name === name) || null;
  }

  /**
   * Refresh the catalog display
   */
  refresh() {
    this.render();
  }
}

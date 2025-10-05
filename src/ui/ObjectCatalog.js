/**
 * Object Catalog Component
 *
 * Allows users to place and resize objects in the habitat
 * based on NASA-validated equipment masses from:
 * - IEEE TH-Design 2023 Master Equipment List
 * - ISS Heritage Equipment Database
 * - NASA Habitat Logistics Calculator
 *
 * NASA Space Apps Challenge 2024 - Gap #3: Object Placement
 */

export default class ObjectCatalog {
  constructor(onObjectAdd) {
    this.onObjectAdd = onObjectAdd;
    this.objects = [];
    this.categories = [];
    this.isLoaded = false;
    this.totalMass = 0;
    this.massLimit = 2850; // kg - from IEEE TH-2023

    // Load object catalog data
    this.loadObjectCatalog();
  }

  /**
   * Load object catalog from JSON file
   */
  async loadObjectCatalog() {
    try {
      const response = await fetch('/src/data/object-catalog.json');
      if (!response.ok) {
        throw new Error(`Failed to load object catalog: ${response.status}`);
      }

      const data = await response.json();
      this.categories = data.object_categories;
      this.massLimit = data.mass_budget_guidelines.total_equipment_mass_reference_kg;

      // Flatten objects for easy access
      this.objects = [];
      this.categories.forEach(cat => {
        cat.objects.forEach(obj => {
          this.objects.push({...obj, category: cat.category});
        });
      });

      this.isLoaded = true;
      this.render();

      console.log('✅ Object catalog loaded:', this.objects.length, 'objects');
    } catch (error) {
      console.error('Failed to load object catalog:', error);
      this.isLoaded = false;
    }
  }

  /**
   * Render the object catalog UI
   */
  render() {
    // Find or create container
    let container = document.getElementById('object-catalog-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'object-catalog-container';

      // Insert after module catalog
      const moduleCatalog = document.getElementById('catalog');
      if (moduleCatalog && moduleCatalog.parentElement) {
        moduleCatalog.parentElement.insertBefore(container, moduleCatalog.nextSibling);
      }
    }

    container.innerHTML = '';

    // Create panel
    const panel = this.createPanel();
    container.appendChild(panel);
  }

  /**
   * Create the object catalog panel
   */
  createPanel() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      padding: 16px;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #f59e0b;
      border-radius: 10px;
      margin-bottom: 18px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
    `;

    if (!this.isLoaded) {
      panel.innerHTML = `
        <div style="font-size: 11px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
          Object Placement
        </div>
        <div style="font-size: 12px; color: #78350f; padding: 20px; text-align: center;">
          Loading NASA object catalog...
        </div>
      `;
      return panel;
    }

    // Header with mass budget
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 12px;';
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-size: 11px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em;">
          Object Placement
        </div>
        <div style="font-size: 10px; color: #78350f; background: #fef3c7; padding: 4px 8px; border-radius: 4px;">
          Mass: <span id="total-object-mass" style="font-weight: 600;">${this.totalMass.toFixed(1)}</span> / ${this.massLimit} kg
        </div>
      </div>
      <div style="font-size: 10px; color: #78350f; line-height: 1.4;">
        Place NASA-validated objects. Click to add, drag to position, resize as needed.
      </div>
    `;
    panel.appendChild(header);

    // Object grid by category
    this.categories.forEach(category => {
      const categorySection = this.createCategorySection(category);
      panel.appendChild(categorySection);
    });

    return panel;
  }

  /**
   * Create category section with objects
   */
  createCategorySection(category) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom: 12px;';

    const categoryHeader = document.createElement('div');
    categoryHeader.style.cssText = `
      font-size: 10px;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #fde68a;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    categoryHeader.innerHTML = `
      <span>${category.category}</span>
      <span style="font-size: 9px; color: #a16207;">${category.objects.length} items</span>
    `;

    const objectGrid = document.createElement('div');
    objectGrid.style.cssText = `
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      margin-top: 6px;
    `;

    // Toggle visibility
    let isExpanded = false;
    objectGrid.style.display = 'none';

    categoryHeader.addEventListener('click', () => {
      isExpanded = !isExpanded;
      objectGrid.style.display = isExpanded ? 'grid' : 'none';
    });

    category.objects.forEach(obj => {
      const objectTile = this.createObjectTile(obj);
      objectGrid.appendChild(objectTile);
    });

    section.appendChild(categoryHeader);
    section.appendChild(objectGrid);

    return section;
  }

  /**
   * Create individual object tile
   */
  createObjectTile(obj) {
    const tile = document.createElement('div');
    tile.style.cssText = `
      padding: 8px;
      background: #fffbeb;
      border: 1px solid #fbbf24;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    `;

    tile.innerHTML = `
      <div style="font-size: 11px; font-weight: 600; color: #92400e; margin-bottom: 3px;">
        ${obj.name}
      </div>
      <div style="font-size: 9px; color: #a16207; margin-bottom: 4px;">
        ${obj.description}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 9px; color: #78350f;">
          <span style="font-weight: 600;">${obj.mass_kg}</span> kg
        </div>
        <div style="font-size: 8px; color: #a16207;">
          ${obj.dimensions_m.width.toFixed(1)}×${obj.dimensions_m.depth.toFixed(1)}×${obj.dimensions_m.height.toFixed(1)}m
        </div>
      </div>
      ${obj.resizable ? `
        <div style="font-size: 8px; color: #15803d; margin-top: 3px; background: #dcfce7; padding: 2px 4px; border-radius: 3px; display: inline-block;">
          Resizable
        </div>
      ` : ''}
    `;

    // Hover effects
    tile.addEventListener('mouseenter', () => {
      tile.style.background = '#fef3c7';
      tile.style.borderColor = '#f59e0b';
      tile.style.transform = 'translateX(2px)';
      tile.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.2)';
    });

    tile.addEventListener('mouseleave', () => {
      tile.style.background = '#fffbeb';
      tile.style.borderColor = '#fbbf24';
      tile.style.transform = 'translateX(0)';
      tile.style.boxShadow = 'none';
    });

    // Click to add object
    tile.addEventListener('click', () => {
      this.handleObjectAdd(obj);
    });

    return tile;
  }

  /**
   * Handle adding an object to the habitat
   */
  handleObjectAdd(obj) {
    // Call the callback
    if (this.onObjectAdd) {
      this.onObjectAdd(obj);
    }

    // Update mass total
    this.totalMass += obj.mass_kg;
    this.updateMassDisplay();

    // Visual feedback
    const Toast = window.Toast || { show: (msg) => console.log(msg) };
    Toast.show(`Added ${obj.name} (${obj.mass_kg} kg)`, 2000);
  }

  /**
   * Update mass budget display
   */
  updateMassDisplay() {
    const massEl = document.getElementById('total-object-mass');
    if (massEl) {
      massEl.textContent = this.totalMass.toFixed(1);

      // Color code based on budget
      const parent = massEl.parentElement;
      if (this.totalMass > this.massLimit) {
        parent.style.background = '#fee2e2';
        parent.style.color = '#991b1b';
      } else if (this.totalMass > this.massLimit * 0.8) {
        parent.style.background = '#fef3c7';
        parent.style.color = '#78350f';
      } else {
        parent.style.background = '#dcfce7';
        parent.style.color = '#166534';
      }
    }
  }

  /**
   * Remove object mass from total
   */
  removeObject(mass_kg) {
    this.totalMass -= mass_kg;
    if (this.totalMass < 0) this.totalMass = 0;
    this.updateMassDisplay();
  }

  /**
   * Reset mass budget
   */
  resetMass() {
    this.totalMass = 0;
    this.updateMassDisplay();
  }

  /**
   * Get current mass budget status
   */
  getMassStatus() {
    return {
      totalMass: this.totalMass,
      massLimit: this.massLimit,
      percentUsed: (this.totalMass / this.massLimit * 100).toFixed(1),
      overBudget: this.totalMass > this.massLimit
    };
  }
}

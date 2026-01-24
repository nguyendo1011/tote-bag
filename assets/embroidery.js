/**
 * Embroidery Customization Component
 * Handles name input, font selection, color selection, and dynamic product options
 * Supports different contexts: PDP (Product Detail Page) and drawer
 *
 * @example
 * <c-embroidery data-position="pdp" data-product-id="123">
 *   <!-- embroidery options -->
 * </c-embroidery>
 */

class EmbroideryCustomizer extends Component {
  // Constants
  static POSITIONS = {
    PDP: 'pdp',
    DRAWER: 'drawer'
  };

  static SELECTORS = {
    NAME_INPUT: '[data-embroidery-name]',
    CHECKBOX: '[data-embroidery-checkbox]',
    NAME_LENGTH: '[data-name-length]',
    PREVIEW_TEXT: '[data-preview-text]',
    OPTION_FIELDSET: 'fieldset[data-option-name]',
    RADIO_INPUT: 'input[type="radio"]',
    CHECKED_RADIO: 'input[type="radio"]:checked'
  };

  constructor() {
    super();
    this.position = this.dataset.position || EmbroideryCustomizer.POSITIONS.PDP;
    this.productId = this.dataset.productId;
  }

  onDOMReady() {
    this.cacheElements();
    this.setupEventListeners();
    this.initializeState();

    if (this.isDrawer()) {
      this.loadSavedState();
    }
  }

  // ==================== Element Caching ====================

  /**
   * Cache all required DOM elements
   */
  cacheElements() {
    const { SELECTORS } = EmbroideryCustomizer;

    // Input elements
    this.els = {
      nameInput: this.querySelector(SELECTORS.NAME_INPUT),
      checkbox: this.querySelector(SELECTORS.CHECKBOX),
      nameLength: this.querySelector(SELECTORS.NAME_LENGTH),
      previewText: this.querySelector(SELECTORS.PREVIEW_TEXT),
      optionFieldsets: this.querySelectorAll(SELECTORS.OPTION_FIELDSET)
    };
  }

  // ==================== Position Helpers ====================

  /**
   * Check if component is in PDP context
   * @returns {boolean}
   */
  isPDP() {
    return this.position === EmbroideryCustomizer.POSITIONS.PDP;
  }

  /**
   * Check if component is in drawer context
   * @returns {boolean}
   */
  isDrawer() {
    return this.position === EmbroideryCustomizer.POSITIONS.DRAWER;
  }

  // ==================== Event Listeners ====================

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    if (this.els.nameInput) {
      this.els.nameInput.addEventListener('input', this.handleNameInput.bind(this));
    }

    if (this.els.checkbox) {
      this.els.checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
    }

    this.els.optionFieldsets.forEach(fieldset => {
      fieldset.addEventListener('change', this.handleOptionChange.bind(this));
    });
  }

  // ==================== Event Handlers ====================

  /**
   * Handle name input changes
   * @param {Event} event
   */
  handleNameInput(event) {
    const value = event.target.value;

    this.updateCharacterCount(value.length);
    this.updatePreview();

    if (this.isPDP()) {
      this.saveState();
    }
  }

  /**
   * Handle checkbox state changes
   */
  handleCheckboxChange() {
    const isChecked = this.els.checkbox?.checked;

    if (this.isPDP()) {
      this.saveState();
    }

    this.dispatchEvent(new CustomEvent('embroidery:toggle', {
      bubbles: true,
      detail: { enabled: isChecked, position: this.position }
    }));
  }

  /**
   * Handle option changes (font, color, etc.)
   * @param {Event} event
   */
  handleOptionChange(event) {
    const fieldset = event.currentTarget;
    const optionName = fieldset.dataset.optionName;
    const selectedInput = fieldset.querySelector(EmbroideryCustomizer.SELECTORS.CHECKED_RADIO);

    this.updatePreview();

    if (this.isPDP()) {
      this.saveState();
    }

    this.dispatchEvent(new CustomEvent('embroidery:option-change', {
      bubbles: true,
      detail: {
        optionName,
        value: selectedInput?.value,
        position: this.position
      }
    }));
  }

  // ==================== State Management ====================

  /**
   * Initialize component state
   */
  initializeState() {
    const state = this.getState();
    this.updatePreview();

    if (!state.name && this.els.nameLength) {
      this.els.nameLength.textContent = '0';
    }
  }

  /**
   * Get current state
   * @returns {Object} Current embroidery configuration
   */
  getState() {
    return {
      name: this.els.nameInput?.value || '',
      enabled: this.els.checkbox?.checked || false,
      productId: this.productId,
      position: this.position,
      options: this.getSelectedOptions()
    };
  }

  /**
   * Save state to sessionStorage (for PDP)
   */
  saveState() {
    if (!this.productId) return;

    const state = this.getState();
    const key = `embroidery_${this.productId}`;

    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save embroidery state:', error);
    }
  }

  /**
   * Load saved state from sessionStorage (for drawer)
   */
  loadSavedState() {
    if (!this.productId) return;

    const key = `embroidery_${this.productId}`;

    try {
      const savedState = sessionStorage.getItem(key);
      if (savedState) {
        const state = JSON.parse(savedState);
        this.applyState(state);
      }
    } catch (error) {
      console.warn('Failed to load embroidery state:', error);
    }
  }

  /**
   * Apply state to component
   * @param {Object} state - Saved state object
   */
  applyState(state) {
    if (state.name && this.els.nameInput) {
      this.els.nameInput.value = state.name;
      this.updateCharacterCount(state.name.length);
    }

    if (state.enabled !== undefined && this.els.checkbox) {
      this.els.checkbox.checked = state.enabled;
    }

    if (state.options) {
      Object.entries(state.options).forEach(([optionName, value]) => {
        const input = this.querySelector(
          `input[data-option-name="${optionName}"][value="${value}"]`
        );
        if (input) {
          input.checked = true;
        }
      });
    }

    this.updatePreview();
  }

  // ==================== Option Helpers ====================

  /**
   * Get all selected options
   * @returns {Object} Selected options with option names as keys
   */
  getSelectedOptions() {
    const options = {};

    this.els.optionFieldsets.forEach(fieldset => {
      const optionName = fieldset.dataset.optionName;
      const selectedInput = fieldset.querySelector(EmbroideryCustomizer.SELECTORS.CHECKED_RADIO);

      if (selectedInput) {
        options[optionName] = selectedInput.value;
      }
    });

    return options;
  }

  /**
   * Get selected option by name
   * @param {string} optionName - Name of the option (e.g., 'font', 'color')
   * @returns {HTMLInputElement|null} Selected radio input
   */
  getSelectedOption(optionName) {
    return this.querySelector(
      `input[data-option-name="${optionName}"][data-option-value]:checked`
    );
  }

  // ==================== Preview Updates ====================

  /**
   * Update character count display
   * @param {number} length - Current character count
   */
  updateCharacterCount(length) {
    if (this.els.nameLength) {
      this.els.nameLength.textContent = length;
    }
  }

  /**
   * Update preview display with current selections
   */
  updatePreview() {
    if (!this.els.previewText) return;

    const name = this.els.nameInput?.value || '';
    this.els.previewText.textContent = name;

    // Apply selected color
    this.els.optionFieldsets.forEach(fieldset => {
      const selectedInput = fieldset.querySelector(EmbroideryCustomizer.SELECTORS.CHECKED_RADIO);
      if (!selectedInput) return;
      const optionValue = selectedInput.dataset.optionValue;
      if (!optionValue) return;

      this.els.previewText.style[optionName] = optionValue;
    });
  }

}

// Register custom element
customElements.define('c-embroidery', EmbroideryCustomizer);

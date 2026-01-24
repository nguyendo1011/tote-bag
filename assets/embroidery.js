/**
 * Embroidery Customization Component
 * Handles name input, font selection, color selection, and dynamic product options
 *
 * @example
 * <c-embroidery data-position="pdp" data-product-id="123">
 *   <!-- embroidery options -->
 * </c-embroidery>
 */

// Check if already defined to prevent double registration
if (!customElements.get('c-embroidery')) {

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
    CHECKED_RADIO: 'input[type="radio"]:checked',
    PRICE_DISPLAY: '[data-embroidery-price]',
    ACCORDION: 'c-accordion',
    PRODUCT_FORM: 'product-form',
    ADD_BUTTON: 'button[name="add"]'
  };

  constructor() {
    super();
    this.position = this.dataset.position || EmbroideryCustomizer.POSITIONS.PDP;
    this.productId = this.dataset.variantId;
    this.basePrice = 0; // Will be set from data-additional-price
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

    const accordion = this.querySelector(SELECTORS.ACCORDION);
    const productForm = document.querySelector(SELECTORS.PRODUCT_FORM);

    let checkbox = this.querySelector(SELECTORS.CHECKBOX);
    if (!checkbox && accordion) {
      checkbox = accordion.querySelector(SELECTORS.CHECKBOX);
    }

    this.els = {
      nameInput: this.querySelector(SELECTORS.NAME_INPUT),
      checkbox: checkbox,
      nameLength: this.querySelector(SELECTORS.NAME_LENGTH),
      previewText: this.querySelector(SELECTORS.PREVIEW_TEXT),
      optionFieldsets: this.querySelectorAll(SELECTORS.OPTION_FIELDSET),
      priceDisplay: accordion?.querySelector(SELECTORS.PRICE_DISPLAY) || this.querySelector(SELECTORS.PRICE_DISPLAY),
      productForm: productForm,
      addButton: isPDP() ? productForm?.querySelector(SELECTORS.ADD_BUTTON) : isDrawer() ? this.querySelector(SELECTORS.ADD_BUTTON) : null,
      accordion: accordion
    };
    if (this.els.priceDisplay?.dataset.additionalPrice) {
      this.basePrice = parseInt(this.els.priceDisplay.dataset.additionalPrice, 10);
    }
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
    
    if (this.els.accordion) {
      this.els.accordion.addEventListener('accordion:toggle', (e) => {
        this.handleAccordionToggle(e);
      });
    }

    if (this.els.checkbox) {
      this.els.checkbox.addEventListener('change', (e) => {
        this.handleCheckboxChange(e);
      });
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
   * Handle accordion toggle event (dispatched by accordion.js)
   * @param {CustomEvent} event - Accordion toggle event
   */
  handleAccordionToggle(event) {
    const isOpen = event.detail.isOpen;

    if (this.els.checkbox) {
      this.els.checkbox.checked = isOpen;
    }

    if (this.isPDP()) {
      this.saveState();
    }

    this.validateAndUpdateButton();

    this.dispatchEvent(new CustomEvent('embroidery:toggle', {
      bubbles: true,
      detail: { enabled: isOpen, position: this.position }
    }));
  }

  /**
   * Handle checkbox state changes (fallback if accordion doesn't handle it)
   */
  handleCheckboxChange(event) {
    // Stop propagation to prevent double handling
    event.stopPropagation();

    const isChecked = this.els.checkbox?.checked;
    console.log('Checkbox changed:', isChecked);

    if (this.isPDP()) {
      this.saveState();
    }

    // Validate and update button state
    this.validateAndUpdateButton();

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

    // Initial validation of add button
    this.validateAndUpdateButton();
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

  /**
   * Toggle loading state of add button
   * @param {boolean} loading - Loading state
   */
  setLoadingState(loading) {
    if (!this.els.addButton) return;
    if (isPDP()) return;
    if (loading) {
      this.els.addButton.setAttribute('aria-disabled', true);
      this.els.addButton.classList.add('loading');
      this.els.addButton.querySelector('.loading__spinner')?.classList.remove('hidden');
    } else {
      this.els.addButton.setAttribute('aria-disabled', false);
      this.els.addButton.classList.remove('loading');
      this.els.addButton.querySelector('.loading__spinner')?.classList.add('hidden');
    }
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
      const optionName = selectedInput.dataset.optionName;
      if (!optionValue) return;

      const mapName = this.getMappingCSS(optionName);

      this.els.previewText.style[mapName] = optionValue;
    });

    this.updatePrice();
    this.validateAndUpdateButton();
    this.buildEmbroideryAddons();
  }

  /**
   * Calculate total price (base + selected options)
   * @returns {number} Total price in cents
   */
  calculateTotalPrice() {
    // Start with base price (only if name is entered)
    const hasName = this.els.nameInput?.value.length > 0;
    if (!hasName) return 0;

    let totalPrice = this.basePrice;

    // Add prices from selected options
    this.els.optionFieldsets.forEach(fieldset => {
      const selectedInput = fieldset.querySelector(EmbroideryCustomizer.SELECTORS.CHECKED_RADIO);
      if (selectedInput?.dataset.optionPrice) {
        const optionPrice = parseInt(selectedInput.dataset.optionPrice, 10);
        if (!isNaN(optionPrice)) {
          totalPrice += optionPrice;
        }
      }
    });

    return totalPrice;
  }

  /**
   * Update price display
   */
  updatePrice() {
    if (!this.els.priceDisplay) return;

    const totalPrice = this.calculateTotalPrice();

    // Format price using Shopify money format
    if (totalPrice > 0) {
      // Convert cents to dollars for display
      const formattedPrice = this.formatMoney(totalPrice);
      this.els.priceDisplay.textContent = `+${formattedPrice}`;
    } else {
      this.els.priceDisplay.textContent = '+' + this.formatMoney(this.basePrice);
    }
  }

  /**
   * Format money in cents to currency string
   * @param {number} cents - Price in cents
   * @returns {string} Formatted price string
   */
  formatMoney(cents) {
    const dollars = cents / 100;

    // Use Shopify's money format if available
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, Shopify.money_format || '${{amount}}');
    }

    // Fallback to basic formatting
    return `$${dollars.toFixed(2)}`;
  }

  /**
   * Mapping of option names to CSS properties
   * @returns {Object} Mapping of option names to CSS properties
   */
  getMappingCSS(key) {
    const mapping = {
      color: 'color',
      font: 'font-family'
    };
    return mapping[key] || key;
  }

  // ==================== Embroidery Addons ====================

  /**
   * Build embroidery addons data and store in window.embroideryAddons
   * This will be used by product-form to add embroidery products to cart
   */
  buildEmbroideryAddons() {
    // Clear addons if embroidery is not enabled or not valid
    if (!this.els.checkbox?.checked || !this.isEmbroideryValid()) {
      delete window.embroideryAddons;
      return;
    }

    const name = this.els.nameInput?.value || '';
    const items = [];

    // Get main product quantity from form
    const quantityInput = this.els.productForm?.querySelector('[name="quantity"]');
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1;

    // Build embroidery properties for main product
    const properties = {};
    let embroiderySelected = '';
    embroiderySelected += '"' + name + '"';

    // Add base product (name input) as first addon item
    if (this.els.nameInput) {
      const baseVariantId = this.els.nameInput.dataset.variantId;
      const basePrice = this.els.nameInput.dataset.optionPrice;

      if (baseVariantId && basePrice) {
        const price = parseInt(basePrice, 10);
        if (!isNaN(price) && price > 0) {
          items.push({
            id: baseVariantId,
            quantity: quantity,
            parent_id: this.productId
          });
        }
      }
    }

    // Collect addon items from selected options
    this.els.optionFieldsets.forEach(fieldset => {
      const selectedInput = fieldset.querySelector(EmbroideryCustomizer.SELECTORS.CHECKED_RADIO);
      if (!selectedInput) return;

      const value = selectedInput.value;
      embroiderySelected += ', ' + value;

      // Add addon item only if it has valid variant ID and price > 0
      const variantId = selectedInput.dataset.variantId;
      const optionPrice = selectedInput.dataset.optionPrice;

      // Validate: variant ID exists, price exists, and price > 0
      if (!variantId || !optionPrice) return;

      const price = parseInt(optionPrice, 10);
      if (isNaN(price) || price <= 0) return;

      // Add valid addon item
      items.push({
        id: variantId,
        quantity: quantity,
        parent_id: this.productId
      });
    });

    properties['Embroidery Name'] = embroiderySelected;

    // Store in window for product-form to use
    window.embroideryAddons = {
      mainProductId: this.productId,
      items: [...items],
      properties: properties
    };
  }

  /**
   * Find matching variant ID based on selected options
   * @returns {string|null} Variant ID or null if not found
   */
  findMatchingVariantId() {
    // Get all radio inputs to find variant data
    const selectedInputs = [];
    this.els.optionFieldsets.forEach(fieldset => {
      const selectedInput = fieldset.querySelector(EmbroideryCustomizer.SELECTORS.CHECKED_RADIO);
      if (selectedInput) {
        selectedInputs.push(selectedInput);
      }
    });

    if (selectedInputs.length === 0) return null;

    // TODO: Implement proper variant matching logic
    // This should find the variant ID that matches all selected options
    // For now, return the product ID from the first input
    const productId = selectedInputs[0].dataset.productId;

    // You may need to query the product's variants to find exact match
    // Example: Find variant where option1 == optionValues[0] && option2 == optionValues[1]

    return productId;
  }

  // ==================== Validation ====================

  /**
   * Check if embroidery customization is valid
   * @returns {boolean} True if all requirements are met
   */
  isEmbroideryValid() {
    // If checkbox is not checked, embroidery is not required
    if (!this.els.checkbox?.checked) {
      return true;
    }

    // Check if name is entered
    const hasName = this.els.nameInput?.value.trim().length > 0;
    if (!hasName) {
      return false;
    }

    // Check if all fieldsets have a selected option
    let allOptionsSelected = true;
    this.els.optionFieldsets.forEach(fieldset => {
      const hasSelection = fieldset.querySelector(EmbroideryCustomizer.SELECTORS.CHECKED_RADIO);
      if (!hasSelection) {
        allOptionsSelected = false;
      }
    });

    return allOptionsSelected;
  }

  /**
   * Validate embroidery and update add button state
   */
  validateAndUpdateButton() {
    if (!this.els.addButton) return;

    const isValid = this.isEmbroideryValid();

    if (isValid) {
      this.els.addButton.removeAttribute('disabled');
      this.els.addButton.classList.remove('disabled');
    } else {
      this.els.addButton.setAttribute('disabled', 'disabled');
      this.els.addButton.classList.add('disabled');
    }
  }
}

  // Register custom element
  customElements.define('c-embroidery', EmbroideryCustomizer);

} // End of customElements.get check

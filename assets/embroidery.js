/**
 * Embroidery Customization Component
 * Handles name input, font selection, color selection, and dynamic product options
 * Extends Component base class for DOMContentLoaded handling
 */

class EmbroideryCustomizer extends Component {
  constructor() {
    super();
  }

  onDOMReady() {
    this.initializeElements();
    this.initializeProductOptions();
    this.initConfig();
    this.bindEventListeners();
  }

  /**
   * Initialize configuration
   */
  initConfig() {
    this.config = {
      name: this.nameInputEl.value,
      checkbox: this.checkboxEl.checked,
      productId: this.dataset.productId,
      fontFamily: this.getSelectedValue('font'),
      color: this.getSelectedValue('color'),
    };
  }

  /**
   * Initialize all DOM element references
   */
  initializeElements() {
    // Input elements
    this.nameInputEl = this.querySelector('[data-embroidery-name]');
    this.checkboxEl = this.querySelector('[data-embroidery-checkbox]');

    // Display elements
    this.nameLengthEl = this.querySelector('[data-name-length]');
    this.previewTextEl = this.querySelector('[data-preview-text]');

    // Dynamic product options (colors, fonts, etc. from metafields) - using fieldsets
    this.optionFieldsets = [...this.querySelectorAll('fieldset[data-option-name]')];
  }

  /**
   * Bind all event listeners
   */
  bindEventListeners() {
    // Name input
    if (this.nameInputEl) {
      this.nameInputEl.addEventListener('input', this.handleNameInput.bind(this));
    }

    // Checkbox toggle
    if (this.checkboxEl) {
      this.checkboxEl.addEventListener('change', this.handleCheckboxChange.bind(this));
    }
  }

  /**
   * Handle name input changes
   * @param {Event} event - Input event
   */
  handleNameInput(event) {
    const value = event.target.value;

    if (this.nameLengthEl) {
      this.nameLengthEl.textContent = value.length;
    }

    this.updatePreview();
  }

  /**
   * Handle checkbox state changes
   * @param {Event} event - Change event
   */
  handleCheckboxChange() {
    this.updatePreview();
  }

  /**
   * Update preview display with current selections
   */
  updatePreview() {
    if (!this.previewTextEl) return;

    const name = this.nameInputEl ? this.nameInputEl.value : '';

    this.previewTextEl.textContent = name;

    // Get selected color from dynamic options
    const selectedColorOption = this.querySelector('input[type="radio"][data-option-name="color"]:checked');
    if (selectedColorOption) {
      const colorHex = selectedColorOption.dataset.fontColor;
      if (colorHex) {
        this.previewTextEl.style.color = colorHex;
      }
    }

    // Get selected font from dynamic options
    const selectedFontOption = this.querySelector('input[type="radio"][data-option-name="font"]:checked');
    if (selectedFontOption) {
      const fontFamily = selectedFontOption.dataset.fontFamily;
      if (fontFamily) {
        this.previewTextEl.style.fontFamily = fontFamily;
      }
    }
  }

  /**
   * Initialize dynamic product options (colors, sizes, etc.)
   */
  initializeProductOptions() {
    this.optionFieldsets.forEach(fieldsetEl => {
      fieldsetEl.addEventListener('change', this.updatePreview.bind(this));
    });
  }

  /**
   * Get all selected values from all fieldsets
   * @returns {Object} Object with option names as keys and selected values
   */
  getAllSelectedValues() {
    const selectedValues = {};

    this.optionFieldsets.forEach(fieldsetEl => {
      const optionName = fieldsetEl.dataset.optionName;
      const selectedRadioEl = fieldsetEl.querySelector('input[type="radio"]:checked');

      if (selectedRadioEl) {
        selectedValues[optionName] = selectedRadioEl.value;
      }
    });

    console.log('All selected values:', selectedValues);
    return selectedValues;
  }
}

// Register custom element
customElements.define('c-embroidery', EmbroideryCustomizer);

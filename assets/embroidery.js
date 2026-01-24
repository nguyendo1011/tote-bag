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
    console.log('EmbroideryCustomizer: DOM Ready, initializing...');
    this.initializeElements();
    this.initializeDefaultSelections();
    this.bindEventListeners();
    console.log('EmbroideryCustomizer: Initialization complete');
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
    this.previewContainerEl = this.querySelector('[data-embroidery-preview]');
    this.previewTextEl = this.querySelector('[data-preview-text]');

    // Dynamic product options (colors, fonts, etc. from metafields) - using fieldsets
    this.optionFieldsets = [...this.querySelectorAll('fieldset[data-option-name]')];
  }

  /**
   * Set default selections for dynamic options
   */
  initializeDefaultSelections() {
    // Initialize product options (fonts, colors, etc. from metafields)
    this.initializeProductOptions();
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
    if (!this.previewTextEl || !this.previewContainerEl) return;

    const name = this.nameInputEl ? this.nameInputEl.value : '';

    if (name.length === 0) {
      this.previewContainerEl.classList.add('tw-hidden');
      return;
    }

    this.previewTextEl.textContent = name;

    // Get selected color from dynamic options
    const selectedColorOption = this.querySelector('input[type="radio"][data-option-name="color"]:checked');
    if (selectedColorOption) {
      const colorHex = selectedColorOption.style.backgroundColor;
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

    this.previewContainerEl.classList.remove('tw-hidden');
  }

  /**
   * Initialize dynamic product options (colors, sizes, etc.)
   */
  initializeProductOptions() {
    console.log('Initializing product options, found fieldsets:', this.optionFieldsets.length);

    this.optionFieldsets.forEach(fieldsetEl => {
      const legendEl = fieldsetEl.querySelector('legend');
      const optionName = legendEl?.textContent.trim();
      const radioInputEls = [...fieldsetEl.querySelectorAll('input[type="radio"]')];

      console.log('Option:', optionName, 'radios:', radioInputEls.length);

      // Select first option by default
      if (radioInputEls.length > 0) {
        radioInputEls[0].checked = true;
      }

      // Add change event listeners to update preview
      radioInputEls.forEach(radioEl => {
        radioEl.addEventListener('change', () => {
          if (radioEl.checked) {
            console.log('Radio changed:', radioEl.value);
            this.updatePreview();
          }
        });
      });
    });
  }

  /**
   * Get selected value from a specific fieldset
   * @param {string} optionName - The handleized option name (e.g., 'color', 'font')
   * @returns {string|null} The selected value or null if none selected
   */
  getSelectedValue(optionName) {
    const fieldsetEl = this.querySelector(`fieldset[data-option-name="${optionName}"]`);
    if (!fieldsetEl) {
      console.warn(`Fieldset not found for option: ${optionName}`);
      return null;
    }

    const selectedRadioEl = fieldsetEl.querySelector('input[type="radio"]:checked');
    return selectedRadioEl ? selectedRadioEl.value : null;
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

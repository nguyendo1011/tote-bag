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
    this.previewContainerEl = this.querySelector('[data-preview-container]');
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

    // Dynamic product options are handled in initializeProductOptions
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

    if (this.nameValueInputEl) {
      this.nameValueInputEl.value = value;
    }

    this.updatePreview();
  }

  /**
   * Handle checkbox state changes
   * @param {Event} event - Change event
   */
  handleCheckboxChange(event) {
    const isChecked = event.target.checked;
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
      const isColorOption = optionName === 'Color';
      const radioInputEls = [...fieldsetEl.querySelectorAll('input[type="radio"]')];
      const labelEls = [...fieldsetEl.querySelectorAll('label')];

      console.log('Option:', optionName, 'isColor:', isColorOption, 'radios:', radioInputEls.length, 'labels:', labelEls.length);

      // Select first option by default
      if (radioInputEls.length > 0) {
        radioInputEls[0].checked = true;
        this.updateProductOptionSelection(radioInputEls[0], isColorOption);
      }

      // Bind click handlers
      this.bindProductOptionHandlers(labelEls, radioInputEls, isColorOption);
    });
  }

  /**
   * Bind event handlers for product options
   * @param {HTMLElement[]} labelEls - Label elements
   * @param {HTMLInputElement[]} radioInputEls - Radio input elements
   * @param {boolean} isColorOption - Whether this is a color option
   */
  bindProductOptionHandlers(labelEls, radioInputEls, isColorOption) {
    labelEls.forEach(labelEl => {
      const radioEl = labelEl.querySelector('input[type="radio"]');

      const clickHandler = () => {
        // Allow label click to propagate naturally
        if (!radioEl) {
          console.warn('No radio element found in label', labelEl);
          return;
        }

        console.log('Clicking option:', radioEl.value, 'isColor:', isColorOption);
        radioEl.checked = true;

        // Trigger change event manually for better compatibility
        const changeEvent = new Event('change', { bubbles: true });
        radioEl.dispatchEvent(changeEvent);
      };

      // Add click handler to the label itself
      labelEl.addEventListener('click', clickHandler);
    });

    radioInputEls.forEach(radioEl => {
      radioEl.addEventListener('change', () => {
        if (radioEl.checked) {
          console.log('Radio changed:', radioEl.value, 'isColor:', isColorOption);
          this.updateProductOptionSelection(radioEl, isColorOption);
        }
      });
    });
  }

  /**
   * Update visual selection state for product options
   * @param {HTMLInputElement} selectedRadioEl - Selected radio input
   * @param {boolean} isColorOption - Whether this is a color option
   */
  updateProductOptionSelection(selectedRadioEl, isColorOption) {
    const fieldsetEl = selectedRadioEl.closest('fieldset[data-option-name]');
    if (!fieldsetEl) return;

    const allRadioEls = [...fieldsetEl.querySelectorAll('input[type="radio"]')];

    allRadioEls.forEach(radioEl => {
      const labelEl = radioEl.closest('label');
      if (!labelEl) return;

      if (isColorOption) {
        this.updateColorOptionStyle(labelEl, radioEl.checked);
      } else {
        this.updateTextOptionStyle(labelEl, radioEl.checked);
      }
    });

    // Update preview when color or font option changes
    this.updatePreview();
  }

  /**
   * Update styling for color option
   * @param {HTMLElement} labelEl - Label element
   * @param {boolean} isSelected - Whether option is selected
   */
  updateColorOptionStyle(labelEl, isSelected) {
    if (isSelected) {
      // Update label border - increase from border-2 to border-4 and change color
      labelEl.classList.remove('tw-border-2', 'tw-border-transparent', 'tw-ring-1', 'tw-ring-gray-300');
      labelEl.classList.add('tw-border-4', 'tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
    } else {
      // Reset label border to default
      labelEl.classList.remove('tw-border-4', 'tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
      labelEl.classList.add('tw-border-2', 'tw-border-transparent', 'tw-ring-1', 'tw-ring-gray-300');
    }
  }

  /**
   * Update styling for text option
   * @param {HTMLElement} labelEl - Label element
   * @param {boolean} isSelected - Whether option is selected
   */
  updateTextOptionStyle(labelEl, isSelected) {
    const spanEl = labelEl.querySelector('span:not(.tw-text-xs)');
    if (!spanEl) return;

    if (isSelected) {
      // Increase border from border-2 to border-3 and change color
      spanEl.classList.remove('tw-border-2', 'tw-border-gray-300');
      spanEl.classList.add('tw-border-3', 'tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200', 'tw-bg-blue-50');
    } else {
      // Reset to default border
      spanEl.classList.remove('tw-border-3', 'tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200', 'tw-bg-blue-50');
      spanEl.classList.add('tw-border-2', 'tw-border-gray-300');
    }
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

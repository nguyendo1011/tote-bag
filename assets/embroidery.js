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
    this.initializeDefaultSelections();
    this.bindEventListeners();
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

    // Dynamic product options (colors, fonts, etc. from metafields)
    this.optionContainerEls = [...this.querySelectorAll('[data-option-name]')];
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
      const colorButton = selectedColorOption.closest('label')?.querySelector('button');
      if (colorButton) {
        const colorHex = colorButton.style.backgroundColor;
        if (colorHex) {
          this.previewTextEl.style.color = colorHex;
        }
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
    this.optionContainerEls.forEach(containerEl => {
      const parentDivEl = containerEl.closest('.tw-flex.tw-flex-col');
      const labelEl = parentDivEl?.querySelector('label.tw-block');
      const isColorOption = labelEl?.textContent.trim() === 'Color';
      const radioInputEls = [...containerEl.querySelectorAll('input[type="radio"]')];
      const labelEls = [...containerEl.querySelectorAll('label')];

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
      const buttonEl = labelEl.querySelector('button');
      const spanEl = labelEl.querySelector('span:not(.tw-text-xs)');

      const clickHandler = (e) => {
        e.preventDefault();
        if (!radioEl) return;

        radioEl.checked = true;
        this.updateProductOptionSelection(radioEl, isColorOption);
      };

      if (buttonEl) {
        buttonEl.addEventListener('click', clickHandler);
      } else if (spanEl) {
        spanEl.addEventListener('click', clickHandler);
      }
    });

    radioInputEls.forEach(radioEl => {
      radioEl.addEventListener('change', () => {
        if (radioEl.checked) {
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
    const containerEl = selectedRadioEl.closest('[data-option-name]');
    if (!containerEl) return;

    const allRadioEls = [...containerEl.querySelectorAll('input[type="radio"]')];

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
    const buttonEl = labelEl.querySelector('button');
    const svgEl = labelEl.querySelector('svg');

    if (!buttonEl || !svgEl) return;

    if (isSelected) {
      buttonEl.classList.remove('tw-ring-1', 'tw-ring-gray-300');
      buttonEl.classList.add('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
      svgEl.classList.remove('tw-hidden');
    } else {
      buttonEl.classList.remove('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
      buttonEl.classList.add('tw-ring-1', 'tw-ring-gray-300');
      svgEl.classList.add('tw-hidden');
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
      spanEl.classList.remove('tw-border-gray-300');
      spanEl.classList.add('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
    } else {
      spanEl.classList.remove('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
      spanEl.classList.add('tw-border-gray-300');
    }
  }
}

// Register custom element
customElements.define('embroidery-customizer', EmbroideryCustomizer);

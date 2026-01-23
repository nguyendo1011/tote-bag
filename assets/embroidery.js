/**
 * Embroidery Customization Component
 * Handles name input, font selection, color selection, and dynamic product options
 */

class EmbroideryCustomizer extends HTMLElement {
  constructor() {
    super();
    this.selectedFont = { id: 'classic', name: 'Classic', family: 'Georgia, serif' };
    this.selectedColor = { id: 'black', name: 'Black', hex: '#000000' };
  }

  connectedCallback() {
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
    this.selectedColorNameEl = this.querySelector('[data-selected-color-name]');

    // Button groups
    this.fontButtonEls = [...this.querySelectorAll('[data-font-id]')];
    this.colorButtonEls = [...this.querySelectorAll('[data-color-id]')];

    // Hidden form inputs
    this.enabledInputEl = this.querySelector('[data-embroidery-enabled]');
    this.nameValueInputEl = this.querySelector('[data-embroidery-name-value]');
    this.fontValueInputEl = this.querySelector('[data-embroidery-font-value]');
    this.colorValueInputEl = this.querySelector('[data-embroidery-color-value]');

    // Dynamic product options
    this.optionContainerEls = [...this.querySelectorAll('[data-option-name]')];
  }

  /**
   * Set default selections for fonts and colors
   */
  initializeDefaultSelections() {
    // Select first font by default
    if (this.fontButtonEls.length > 0) {
      this.selectFont(this.fontButtonEls[0]);
    }

    // Select first color by default
    if (this.colorButtonEls.length > 0) {
      this.selectColor(this.colorButtonEls[0]);
    }

    // Initialize product options
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

    // Font buttons
    this.fontButtonEls.forEach(buttonEl => {
      buttonEl.addEventListener('click', () => this.handleFontClick(buttonEl));
    });

    // Color buttons
    this.colorButtonEls.forEach(buttonEl => {
      buttonEl.addEventListener('click', () => this.handleColorClick(buttonEl));
    });
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
    if (!this.enabledInputEl) return;

    this.enabledInputEl.value = event.target.checked ? 'Yes' : 'No';
  }

  /**
   * Handle font button click
   * @param {HTMLElement} buttonEl - Clicked button element
   */
  handleFontClick(buttonEl) {
    this.selectFont(buttonEl);
    this.updatePreview();
  }

  /**
   * Handle color button click
   * @param {HTMLElement} buttonEl - Clicked button element
   */
  handleColorClick(buttonEl) {
    this.selectColor(buttonEl);
    this.updatePreview();
  }

  /**
   * Select a font and update UI
   * @param {HTMLElement} buttonEl - Font button to select
   */
  selectFont(buttonEl) {
    // Remove selection from all fonts
    this.fontButtonEls.forEach(btn => {
      btn.classList.remove('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
      btn.classList.add('tw-border-gray-300');

      const checkmarkEl = btn.querySelector('.tw-absolute');
      if (checkmarkEl) checkmarkEl.remove();
    });

    // Add selection to clicked font
    buttonEl.classList.remove('tw-border-gray-300');
    buttonEl.classList.add('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
    buttonEl.innerHTML += this.getCheckmarkHTML();

    // Update selected font data
    this.selectedFont = {
      id: buttonEl.dataset.fontId,
      name: buttonEl.dataset.fontName,
      family: buttonEl.dataset.fontFamily
    };

    if (this.fontValueInputEl) {
      this.fontValueInputEl.value = this.selectedFont.name;
    }
  }

  /**
   * Select a color and update UI
   * @param {HTMLElement} buttonEl - Color button to select
   */
  selectColor(buttonEl) {
    // Remove selection from all colors
    this.colorButtonEls.forEach(btn => {
      btn.classList.remove('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
      btn.classList.add('tw-ring-1', 'tw-ring-gray-300');

      const svgEl = btn.querySelector('svg');
      if (svgEl) svgEl.classList.add('tw-hidden');
    });

    // Add selection to clicked color
    buttonEl.classList.remove('tw-ring-1', 'tw-ring-gray-300');
    buttonEl.classList.add('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');

    const svgEl = buttonEl.querySelector('svg');
    if (svgEl) svgEl.classList.remove('tw-hidden');

    // Update selected color data
    this.selectedColor = {
      id: buttonEl.dataset.colorId,
      name: buttonEl.dataset.colorName,
      hex: buttonEl.dataset.colorHex
    };

    if (this.selectedColorNameEl) {
      this.selectedColorNameEl.textContent = this.selectedColor.name;
    }

    if (this.colorValueInputEl) {
      this.colorValueInputEl.value = this.selectedColor.name;
    }
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
    this.previewTextEl.style.fontFamily = this.selectedFont.family;
    this.previewTextEl.style.color = this.selectedColor.hex;
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

  /**
   * Get checkmark icon HTML
   * @returns {string} Checkmark SVG HTML
   */
  getCheckmarkHTML() {
    return '<div class="tw-absolute tw-top-2 tw-right-2 tw-w-5 tw-h-5 tw-bg-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center"><svg class="tw-w-3 tw-h-3 tw-text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>';
  }
}

// Register custom element
customElements.define('embroidery-customizer', EmbroideryCustomizer);

// Initialize on accordion elements (backward compatibility)
(() => {
  const initializeEmbroideryCustomizers = () => {
    const accordionEls = document.querySelectorAll('accordion-element');

    accordionEls.forEach(accordionEl => {
      // Check if it's an embroidery accordion
      if (!accordionEl.classList.contains('embroidery-accordion')) return;

      // Check if already initialized
      if (accordionEl.hasAttribute('data-embroidery-initialized')) return;

      // Mark as initialized
      accordionEl.setAttribute('data-embroidery-initialized', 'true');

      // Wrap in embroidery-customizer if not already
      if (accordionEl.tagName !== 'EMBROIDERY-CUSTOMIZER') {
        const customizerEl = document.createElement('embroidery-customizer');
        customizerEl.innerHTML = accordionEl.innerHTML;
        accordionEl.innerHTML = '';
        accordionEl.appendChild(customizerEl);
      }
    });
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEmbroideryCustomizers);
  } else {
    initializeEmbroideryCustomizers();
  }

  // Re-initialize on Shopify theme editor events
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', initializeEmbroideryCustomizers);
  }
})();

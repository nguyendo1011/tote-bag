// Embroidery Component
// Handles embroidery customization options, font selection, color selection, and dynamic product options

(function() {
  const container = document.querySelector('[data-accordion]');
  if (!container) return;

  const nameInput = container.querySelector('[data-embroidery-name]');
  const nameLength = container.querySelector('[data-name-length]');
  const fontButtons = container.querySelectorAll('[data-font-id]');
  const colorButtons = container.querySelectorAll('[data-color-id]');
  const previewContainer = container.querySelector('[data-preview-container]');
  const previewText = container.querySelector('[data-preview-text]');
  const selectedColorName = container.querySelector('[data-selected-color-name]');
  const checkbox = container.querySelector('[data-embroidery-checkbox]');

  const enabledInput = container.querySelector('[data-embroidery-enabled]');
  const nameValueInput = container.querySelector('[data-embroidery-name-value]');
  const fontValueInput = container.querySelector('[data-embroidery-font-value]');
  const colorValueInput = container.querySelector('[data-embroidery-color-value]');

  let selectedFont = { id: 'classic', name: 'Classic', family: 'Georgia, serif' };
  let selectedColor = { id: 'black', name: 'Black', hex: '#000000' };

  if (fontButtons[0]) {
    fontButtons[0].classList.add('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
    fontButtons[0].innerHTML += '<div class="tw-absolute tw-top-2 tw-right-2 tw-w-5 tw-h-5 tw-bg-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center"><svg class="tw-w-3 tw-h-3 tw-text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>';
  }
  if (colorButtons[0]) {
    colorButtons[0].classList.remove('tw-ring-1', 'tw-ring-gray-300');
    colorButtons[0].classList.add('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
    colorButtons[0].querySelector('svg').classList.remove('tw-hidden');
  }

  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const value = e.target.value;
      if (nameLength) nameLength.textContent = value.length;
      if (nameValueInput) nameValueInput.value = value;
      updatePreview();
    });
  }

  fontButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      fontButtons.forEach(b => {
        b.classList.remove('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
        b.classList.add('tw-border-gray-300');
        const checkmark = b.querySelector('.tw-absolute');
        if (checkmark) checkmark.remove();
      });

      btn.classList.remove('tw-border-gray-300');
      btn.classList.add('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
      btn.innerHTML += '<div class="tw-absolute tw-top-2 tw-right-2 tw-w-5 tw-h-5 tw-bg-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center"><svg class="tw-w-3 tw-h-3 tw-text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>';

      selectedFont = {
        id: btn.dataset.fontId,
        name: btn.dataset.fontName,
        family: btn.dataset.fontFamily
      };

      if (fontValueInput) fontValueInput.value = selectedFont.name;
      updatePreview();
    });
  });

  colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      colorButtons.forEach(b => {
        b.classList.remove('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
        b.classList.add('tw-ring-1', 'tw-ring-gray-300');
        b.querySelector('svg').classList.add('tw-hidden');
      });

      btn.classList.remove('tw-ring-1', 'tw-ring-gray-300');
      btn.classList.add('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
      btn.querySelector('svg').classList.remove('tw-hidden');

      selectedColor = {
        id: btn.dataset.colorId,
        name: btn.dataset.colorName,
        hex: btn.dataset.colorHex
      };

      if (selectedColorName) selectedColorName.textContent = selectedColor.name;
      if (colorValueInput) colorValueInput.value = selectedColor.name;
      updatePreview();
    });
  });

  if (checkbox) {
    checkbox.addEventListener('change', (e) => {
      if (enabledInput) enabledInput.value = e.target.checked ? 'Yes' : 'No';
    });
  }

  function updatePreview() {
    if (!previewText || !previewContainer) return;

    const name = nameInput ? nameInput.value : '';

    if (name.length > 0) {
      previewText.textContent = name;
      previewText.style.fontFamily = selectedFont.family;
      previewText.style.color = selectedColor.hex;
      previewContainer.classList.remove('tw-hidden');
    } else {
      previewContainer.classList.add('tw-hidden');
    }
  }

  const optionContainers = container.querySelectorAll('[data-option-name]');
  optionContainers.forEach(optionContainer => {
    const parentDiv = optionContainer.closest('.tw-flex.tw-flex-col');
    const labelElement = parentDiv?.querySelector('label.tw-block');
    const isColorOption = labelElement?.textContent.trim() === 'Color';
    const radioInputs = optionContainer.querySelectorAll('input[type="radio"]');
    const labels = optionContainer.querySelectorAll('label');

    if (radioInputs[0]) {
      radioInputs[0].checked = true;
      updateOptionSelection(radioInputs[0], isColorOption);
    }

    labels.forEach(label => {
      const radio = label.querySelector('input[type="radio"]');
      const button = label.querySelector('button');
      const span = label.querySelector('span:not(.tw-text-xs)');

      if (button) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          if (radio) {
            radio.checked = true;
            updateOptionSelection(radio, isColorOption);
          }
        });
      } else if (span) {
        span.addEventListener('click', (e) => {
          e.preventDefault();
          if (radio) {
            radio.checked = true;
            updateOptionSelection(radio, isColorOption);
          }
        });
      }
    });

    radioInputs.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          updateOptionSelection(radio, isColorOption);
        }
      });
    });
  });

  function updateOptionSelection(selectedRadio, isColorOption) {
    const optionContainer = selectedRadio.closest('[data-option-name]');
    const allRadios = optionContainer.querySelectorAll('input[type="radio"]');

    allRadios.forEach(radio => {
      const label = radio.closest('label');
      if (!label) return;

      if (isColorOption) {
        const button = label.querySelector('button');
        const svg = label.querySelector('svg');
        if (button && svg) {
          if (radio.checked) {
            button.classList.remove('tw-ring-1', 'tw-ring-gray-300');
            button.classList.add('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
            svg.classList.remove('tw-hidden');
          } else {
            button.classList.remove('tw-ring-2', 'tw-ring-offset-2', 'tw-ring-blue-600');
            button.classList.add('tw-ring-1', 'tw-ring-gray-300');
            svg.classList.add('tw-hidden');
          }
        }
      } else {
        const span = label.querySelector('span:not(.tw-text-xs)');
        if (span) {
          if (radio.checked) {
            span.classList.remove('tw-border-gray-300');
            span.classList.add('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
          } else {
            span.classList.remove('tw-border-blue-600', 'tw-ring-2', 'tw-ring-blue-200');
            span.classList.add('tw-border-gray-300');
          }
        }
      }
    });
  }
})();

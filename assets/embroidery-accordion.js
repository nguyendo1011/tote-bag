// Embroidery Accordion Class
// Uses global slideDown, slideUp, slideToggle, and throttle functions from global.js

class EmbroideryAccordion {
  constructor(container) {
    this.container = container;
    this.toggle = this.container.querySelector('[data-embroidery-toggle]');
    this.body = this.container.querySelector('[data-embroidery-body]');
    this.checkbox = this.container.querySelector('[data-embroidery-checkbox]');
    this.priceDisplay = this.container.querySelector('[data-embroidery-price]');

    if (!this.toggle || !this.body || !this.checkbox) return;

    this.isOpen = false;
    this.price = parseFloat(this.container.dataset.embroideryPrice) || 5.00;

    this.init();
  }

  init() {
    // Hide body initially
    this.body.style.display = 'none';

    // Add click event to checkbox
    this.checkbox.addEventListener('change', throttle((e) => {
      this.onToggle(e.target.checked);
    }, 300));

    // Add click event to the entire toggle area
    this.toggle.addEventListener('click', throttle((e) => {
      // Don't trigger if clicking directly on checkbox
      if (e.target === this.checkbox) return;

      e.preventDefault();
      this.checkbox.checked = !this.checkbox.checked;
      this.onToggle(this.checkbox.checked);
    }, 300));
  }

  onToggle(shouldOpen) {
    this.isOpen = shouldOpen;

    if (shouldOpen) {
      this.onOpen();
    } else {
      this.onClose();
    }

    // Update price display
    this.updatePriceDisplay();

    // Dispatch custom event
    this.container.dispatchEvent(new CustomEvent('embroidery:toggle', {
      bubbles: true,
      detail: { isOpen: this.isOpen, price: this.price }
    }));
  }

  onOpen() {
    this.toggle.classList.add('is-open');
    slideDown(this.body, 400);
  }

  onClose() {
    this.toggle.classList.remove('is-open');
    slideUp(this.body, 400);
  }

  updatePriceDisplay() {
    if (!this.priceDisplay) return;

    if (this.isOpen && this.price > 0) {
      this.priceDisplay.textContent = `+$${this.price.toFixed(2)}`;
      this.priceDisplay.style.display = 'inline';
    } else {
      this.priceDisplay.style.display = 'none';
    }
  }
}

// Initialize all embroidery accordions
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-embroidery-accordion]');
  containers.forEach(container => {
    new EmbroideryAccordion(container);
  });
});

// Re-initialize on Shopify theme editor events
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', () => {
    const containers = document.querySelectorAll('[data-embroidery-accordion]');
    containers.forEach(container => {
      new EmbroideryAccordion(container);
    });
  });
}

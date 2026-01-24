// Modern Accordion Custom Element
// Uses global slideDown, slideUp, and throttle functions from global.js

class AccordionElement extends HTMLElement {
  constructor() {
    super();
    this.isOpen = false;
    this.throttledToggle = null;
  }

  connectedCallback() {
    // Find child elements
    this.toggle = this.querySelector('[data-accordion-toggle]');
    this.body = this.querySelector('[data-accordion-body]');
    this.trigger = this.querySelector('[data-accordion-trigger]');

    if (!this.toggle || !this.body) {
      console.warn('Accordion: Missing required elements (toggle or body)');
      return;
    }

    this.init();
  }

  init() {
    // Check initial state from data-open attribute
    const initialState = this.getAttribute('data-open') === 'true';

    // Set initial display based on data-open
    if (!initialState) {
      this.body.style.display = 'none';
    }

    // Create throttled toggle function
    this.throttledToggle = throttle((shouldOpen) => {
      this.onToggle(shouldOpen);
    }, 300);

    // Handle checkbox trigger if present
    if (this.trigger) {
      // Sync checkbox with data-open attribute
      this.trigger.checked = initialState;

      this.trigger.addEventListener('change', (e) => {
        this.throttledToggle(e.target.checked);
      });
    }

    // Handle click on toggle area
    this.toggle.addEventListener('click', (e) => {
      // Don't trigger if clicking directly on checkbox
      if (this.trigger && e.target === this.trigger) return;

      e.preventDefault();

      if (this.trigger) {
        // Toggle checkbox state
        this.trigger.checked = !this.trigger.checked;
        this.throttledToggle(this.trigger.checked);
      } else {
        // Toggle without checkbox
        this.throttledToggle(!this.isOpen);
      }
    });

    // Apply initial state
    if (initialState) {
      this.onToggle(true);
    }
  }

  onToggle(shouldOpen) {
    this.isOpen = shouldOpen;

    // Update data-open attribute
    this.setAttribute('data-open', shouldOpen ? 'true' : 'false');

    if (shouldOpen) {
      this.onOpen();
    } else {
      this.onClose();
    }

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('accordion:toggle', {
      bubbles: true,
      detail: { isOpen: this.isOpen }
    }));
  }

  onOpen() {
    this.toggle.classList.add('is-open');
    this.setAttribute('open', '');
    slideDown(this.body, 400);
  }

  onClose() {
    this.toggle.classList.remove('is-open');
    this.removeAttribute('open');
    slideUp(this.body, 400);
  }

  // Public API methods
  open() {
    if (!this.isOpen) {
      if (this.trigger) this.trigger.checked = true;
      this.onToggle(true);
    }
  }

  close() {
    if (this.isOpen) {
      if (this.trigger) this.trigger.checked = false;
      this.onToggle(false);
    }
  }

  toggle() {
    if (this.trigger) {
      this.trigger.checked = !this.trigger.checked;
      this.onToggle(this.trigger.checked);
    } else {
      this.onToggle(!this.isOpen);
    }
  }
}

// Register the custom element
customElements.define('c-accordion', AccordionElement);

// Also support generic data-accordion attribute for backward compatibility
document.addEventListener('DOMContentLoaded', () => {
  // Upgrade elements with data-accordion that aren't custom elements
  const accordions = document.querySelectorAll('[data-accordion]:not(c-accordion)');
  accordions.forEach(element => {
    // Wrap in c-accordion if not already a custom element
    if (!element.tagName.includes('-')) {
      console.warn('Consider using <c-accordion> instead of data-accordion attribute');
    }
  });
});

// Shopify theme editor support
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', () => {
    // Custom elements will automatically initialize when added to DOM
    console.log('Shopify section loaded: Accordions auto-initialized');
  });
}

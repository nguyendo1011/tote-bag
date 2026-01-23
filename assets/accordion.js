// Modern Accordion Custom Element
// Uses global slideDown, slideUp, and throttle functions from global.js
// Extends Component base class for DOMContentLoaded handling

class AccordionElement extends Component {
  constructor() {
    super();
    this.isOpen = false;
    this.throttledToggle = null;
  }

  onDOMReady() {
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
    // Hide body initially
    this.body.style.display = 'none';

    // Create throttled toggle function
    this.throttledToggle = throttle((shouldOpen) => {
      this.onToggle(shouldOpen);
    }, 300);

    // Handle checkbox trigger if present
    if (this.trigger) {
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

    // Check if should start open
    if (this.hasAttribute('open') || (this.trigger && this.trigger.checked)) {
      this.onToggle(true);
    }
  }

  onToggle(shouldOpen) {
    this.isOpen = shouldOpen;

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
customElements.define('accordion-element', AccordionElement);

// Also support generic data-accordion attribute for backward compatibility
document.addEventListener('DOMContentLoaded', () => {
  // Upgrade elements with data-accordion that aren't custom elements
  const accordions = document.querySelectorAll('[data-accordion]:not(accordion-element)');
  accordions.forEach(element => {
    // Wrap in accordion-element if not already a custom element
    if (!element.tagName.includes('-')) {
      console.warn('Consider using <accordion-element> instead of data-accordion attribute');
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

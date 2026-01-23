// Accordion Singleton
// Uses global slideDown, slideUp, slideToggle, and throttle functions from global.js

class Accordion {
  constructor(container) {
    this.container = container;
    this.toggle = this.container.querySelector('[data-accordion-toggle]');
    this.body = this.container.querySelector('[data-accordion-body]');
    this.trigger = this.container.querySelector('[data-accordion-trigger]');

    if (!this.toggle || !this.body) {
      this.container = null;
      return;
    }

    this.isOpen = false;
    this.init();
  }

  init() {
    this.body.style.display = 'none';

    if (this.trigger) {
      this.trigger.addEventListener('change', throttle((e) => {
        this.onToggle(e.target.checked);
      }, 300));
    }

    this.toggle.addEventListener('click', throttle((e) => {
      if (this.trigger && e.target === this.trigger) return;

      e.preventDefault();
      if (this.trigger) {
        this.trigger.checked = !this.trigger.checked;
        this.onToggle(this.trigger.checked);
      } else {
        this.onToggle(!this.isOpen);
      }
    }, 300));
  }

  onToggle(shouldOpen) {
    this.isOpen = shouldOpen;

    if (shouldOpen) {
      this.onOpen();
    } else {
      this.onClose();
    }

    this.container.dispatchEvent(new CustomEvent('accordion:toggle', {
      bubbles: true,
      detail: { isOpen: this.isOpen }
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
}

const AccordionManager = {
  instances: new Map(),

  init(selector = '[data-accordion]') {
    const containers = document.querySelectorAll(selector);
    containers.forEach(container => {
      if (!this.instances.has(container)) {
        const accordion = new Accordion(container);
        if (accordion && accordion.container) {
          this.instances.set(container, accordion);
        }
      }
    });
  },

  destroy(container) {
    if (this.instances.has(container)) {
      this.instances.delete(container);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AccordionManager.init();
});

if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', () => {
    AccordionManager.init();
  });
}

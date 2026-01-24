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
    const initialState = this.getAttribute('data-open') === 'true';

    if (!initialState) {
      this.body.style.display = 'none';
    }

    this.throttledToggle = throttle((shouldOpen) => {
      this.onToggle(shouldOpen);
    }, 300);

    if (this.trigger) {
      this.trigger.checked = initialState;

      this.trigger.addEventListener('change', (e) => {
        this.throttledToggle(e.target.checked);
      });
    }

    this.toggle.addEventListener('click', (e) => {
      e.preventDefault();

      if (this.trigger) {
        this.trigger.checked = !this.trigger.checked;
        this.throttledToggle(this.trigger.checked);
      } else {
        this.throttledToggle(!this.isOpen);
      }
    });

    if (initialState) {
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

customElements.define('c-accordion', AccordionElement);

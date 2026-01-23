/**
 * Base Component Class
 * Extends HTMLElement and ensures initialization after DOMContentLoaded
 * Other custom elements should extend this class
 */
class Component extends HTMLElement {
  constructor() {
    super();
    this._isDOMReady = false;
    this._initPromise = null;
  }

  /**
   * Called when element is connected to DOM
   * Waits for DOMContentLoaded if needed
   */
  connectedCallback() {
    // Check if DOM is already ready (interactive or complete)
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      this._isDOMReady = true;
      // Use setTimeout to ensure DOM is fully parsed
      setTimeout(() => this.onDOMReady(), 0);
    } else {
      // DOM is still loading, wait for DOMContentLoaded
      this._initPromise = new Promise((resolve) => {
        const checkReady = () => {
          if (document.readyState === 'interactive' || document.readyState === 'complete') {
            this._isDOMReady = true;
            resolve();
          }
        };

        // Check immediately in case state changed
        checkReady();

        // Listen for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', checkReady, { once: true });
      });

      this._initPromise.then(() => {
        setTimeout(() => this.onDOMReady(), 0);
      });
    }
  }

  /**
   * Called when element is disconnected from DOM
   */
  disconnectedCallback() {
    this.onDisconnected();
  }

  /**
   * Lifecycle hook: Called after DOMContentLoaded
   * Override this method in child classes
   */
  onDOMReady() {
    // Override in child classes
  }

  /**
   * Lifecycle hook: Called when element is disconnected
   * Override this method in child classes for cleanup
   */
  onDisconnected() {
    // Override in child classes
  }

  /**
   * Check if DOM is ready
   * @returns {boolean}
   */
  get isDOMReady() {
    return this._isDOMReady;
  }

  /**
   * Wait for DOM to be ready (if not already)
   * @returns {Promise<void>}
   */
  async waitForDOMReady() {
    if (this._isDOMReady) {
      return Promise.resolve();
    }

    if (!this._initPromise) {
      this._initPromise = new Promise((resolve) => {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          this._isDOMReady = true;
          resolve();
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            this._isDOMReady = true;
            resolve();
          }, { once: true });
        }
      });
    }

    return this._initPromise;
  }
}

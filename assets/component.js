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
    if (document.readyState === 'loading') {
      // DOM is still loading, wait for DOMContentLoaded
      this._initPromise = new Promise((resolve) => {
        if (document.readyState === 'complete') {
          this._isDOMReady = true;
          resolve();
        } else {
          document.addEventListener('DOMContentLoaded', () => {
            this._isDOMReady = true;
            resolve();
          }, { once: true });
        }
      });

      this._initPromise.then(() => {
        this.onDOMReady();
      });
    } else {
      // DOM is already ready
      this._isDOMReady = true;
      this.onDOMReady();
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

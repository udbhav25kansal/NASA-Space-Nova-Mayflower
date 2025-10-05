/**
 * Toast - Notification System
 *
 * Displays temporary notification messages to the user:
 * - Success messages (green)
 * - Error messages (red)
 * - Warning messages (yellow)
 * - Info messages (blue)
 *
 * Auto-dismisses after a configurable duration.
 * Can be manually dismissed by clicking.
 */

export default class Toast {
  static toastElement = null;
  static queue = [];
  static isShowing = false;
  static currentTimeout = null;

  /**
   * Initialize toast element (call once on app start)
   */
  static init() {
    Toast.toastElement = document.getElementById('toast');

    if (!Toast.toastElement) {
      console.error('Toast element not found');
      return;
    }

    // Make toast dismissible on click
    Toast.toastElement.onclick = () => {
      Toast.hide();
    };

    console.log('✅ Toast notification system initialized');
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Display duration in ms (default 1400)
   */
  static show(message, type = 'info', duration = 1400) {
    if (!Toast.toastElement) {
      Toast.init();
    }

    // If a toast is currently showing, queue this one
    if (Toast.isShowing) {
      Toast.queue.push({ message, type, duration });
      return;
    }

    Toast.isShowing = true;

    // Clear existing classes
    Toast.toastElement.className = '';

    // Add type class
    const typeClass = `toast-${type}`;
    Toast.toastElement.classList.add(typeClass);

    // Set message
    Toast.toastElement.textContent = message;

    // Show toast
    Toast.toastElement.classList.add('show');

    // Auto-hide after duration
    Toast.currentTimeout = setTimeout(() => {
      Toast.hide();
    }, duration);
  }

  /**
   * Hide the current toast
   */
  static hide() {
    if (!Toast.toastElement) return;

    // Clear timeout
    if (Toast.currentTimeout) {
      clearTimeout(Toast.currentTimeout);
      Toast.currentTimeout = null;
    }

    // Hide toast
    Toast.toastElement.classList.remove('show');

    // Mark as not showing
    setTimeout(() => {
      Toast.isShowing = false;

      // Show next queued toast if any
      if (Toast.queue.length > 0) {
        const next = Toast.queue.shift();
        Toast.show(next.message, next.type, next.duration);
      }
    }, 300); // Wait for fade-out animation
  }

  /**
   * Show success message (green)
   * @param {string} message - Success message
   * @param {number} duration - Display duration (optional)
   */
  static success(message, duration = 1400) {
    Toast.show(message, 'success', duration);
  }

  /**
   * Show error message (red)
   * @param {string} message - Error message
   * @param {number} duration - Display duration (optional)
   */
  static error(message, duration = 2000) {
    Toast.show(message, 'error', duration);
  }

  /**
   * Show warning message (yellow/orange)
   * @param {string} message - Warning message
   * @param {number} duration - Display duration (optional)
   */
  static warning(message, duration = 1800) {
    Toast.show(message, 'warning', duration);
  }

  /**
   * Show info message (blue)
   * @param {string} message - Info message
   * @param {number} duration - Display duration (optional)
   */
  static info(message, duration = 1400) {
    Toast.show(message, 'info', duration);
  }

  /**
   * Clear all queued toasts
   */
  static clearQueue() {
    Toast.queue = [];
  }

  /**
   * Check if toast is currently showing
   * @returns {boolean}
   */
  static isActive() {
    return Toast.isShowing;
  }
}

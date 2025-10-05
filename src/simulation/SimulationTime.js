/**
 * SimulationTime.js - Simulation Time Management System
 *
 * Manages simulation time for the habitat:
 * - Tracks mission elapsed time (days, hours, minutes)
 * - Time acceleration (1x, 2x, 5x, 10x, 30x)
 * - Pause/resume
 * - Day/night cycles
 * - Event callbacks for time milestones
 *
 * Lunar day cycle: ~29.5 Earth days, but we use simplified 24-hour schedule
 */

class SimulationTime {
  constructor() {
    // Current simulation time
    this.totalSeconds = 0;          // Total simulation seconds elapsed
    this.missionDay = 1;             // Current mission day (1-based)
    this.hour = 6;                   // Current hour (0-23), start at 6 AM
    this.minute = 0;                 // Current minute (0-59)

    // Time control
    this.timeScale = 30.0;           // Time acceleration (30x default: 1 real second = 30 sim seconds)
    this.isPaused = false;           // Pause state

    // Day cycle (simplified 24-hour Earth schedule)
    this.dayStartHour = 6;           // Day starts at 6:00 AM
    this.nightStartHour = 22;        // Night starts at 10:00 PM
    this.isDaytime = true;

    // Mission tracking
    this.missionStartDate = new Date();
    this.missionDuration = 45;       // Default HERA mission: 45 days

    // Event callbacks
    this.onHourChange = null;        // Callback when hour changes
    this.onDayChange = null;         // Callback when day changes
    this.onDayNightToggle = null;    // Callback when day/night toggles
  }

  /**
   * Update simulation time
   * @param {number} deltaTime - Real-world elapsed time in seconds
   */
  update(deltaTime) {
    if (this.isPaused) return;

    // Apply time scale
    const simDeltaTime = deltaTime * this.timeScale;
    this.totalSeconds += simDeltaTime;

    // Extract time components
    const previousHour = this.hour;
    const previousDay = this.missionDay;

    // Calculate total minutes and hours
    const totalMinutes = Math.floor(this.totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);

    this.minute = totalMinutes % 60;
    this.hour = totalHours % 24;
    this.missionDay = Math.floor(totalHours / 24) + 1;

    // Check for hour change
    if (this.hour !== previousHour) {
      this.onHourChanged(this.hour);
    }

    // Check for day change
    if (this.missionDay !== previousDay) {
      this.onDayChanged(this.missionDay);
    }

    // Update day/night cycle
    this.updateDayNightCycle();
  }

  /**
   * Update day/night cycle based on hour
   */
  updateDayNightCycle() {
    const wasDaytime = this.isDaytime;

    if (this.hour >= this.dayStartHour && this.hour < this.nightStartHour) {
      this.isDaytime = true;
    } else {
      this.isDaytime = false;
    }

    // Trigger callback if changed
    if (this.isDaytime !== wasDaytime && this.onDayNightToggle) {
      this.onDayNightToggle(this.isDaytime);
    }
  }

  /**
   * Handle hour change
   */
  onHourChanged(newHour) {
    if (this.onHourChange) {
      this.onHourChange(newHour);
    }
  }

  /**
   * Handle day change
   */
  onDayChanged(newDay) {
    if (this.onDayChange) {
      this.onDayChange(newDay);
    }
  }

  /**
   * Set time scale (speed)
   * @param {number} scale - Time acceleration (1x, 2x, 5x, 10x, 30x, 60x)
   */
  setTimeScale(scale) {
    this.timeScale = Math.max(0, scale);
  }

  /**
   * Get time scale
   * @returns {number}
   */
  getTimeScale() {
    return this.timeScale;
  }

  /**
   * Pause simulation
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume simulation
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Toggle pause
   */
  togglePause() {
    this.isPaused = !this.isPaused;
  }

  /**
   * Reset time to mission start
   */
  reset() {
    this.totalSeconds = 0;
    this.missionDay = 1;
    this.hour = this.dayStartHour;
    this.minute = 0;
    this.missionStartDate = new Date();
  }

  /**
   * Get formatted time string (HH:MM)
   * @returns {string}
   */
  getTimeString() {
    const h = String(this.hour).padStart(2, '0');
    const m = String(this.minute).padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Get formatted day string (Day X)
   * @returns {string}
   */
  getDayString() {
    return `Day ${this.missionDay}`;
  }

  /**
   * Get full time display (Day X - HH:MM)
   * @returns {string}
   */
  getFullTimeString() {
    return `${this.getDayString()} - ${this.getTimeString()}`;
  }

  /**
   * Get mission progress percentage
   * @returns {number} Progress 0-100
   */
  getMissionProgress() {
    return Math.min(100, (this.missionDay / this.missionDuration) * 100);
  }

  /**
   * Get time of day description
   * @returns {string} 'Morning', 'Afternoon', 'Evening', 'Night'
   */
  getTimeOfDay() {
    if (this.hour >= 6 && this.hour < 12) return 'Morning';
    if (this.hour >= 12 && this.hour < 17) return 'Afternoon';
    if (this.hour >= 17 && this.hour < 22) return 'Evening';
    return 'Night';
  }

  /**
   * Check if it's a specific time (for schedules)
   * @param {number} targetHour - Target hour
   * @param {number} targetMinute - Target minute (optional)
   * @returns {boolean}
   */
  isTime(targetHour, targetMinute = null) {
    if (targetMinute !== null) {
      return this.hour === targetHour && this.minute === targetMinute;
    }
    return this.hour === targetHour;
  }

  /**
   * Check if time is within range
   * @param {number} startHour - Start hour
   * @param {number} endHour - End hour
   * @returns {boolean}
   */
  isTimeInRange(startHour, endHour) {
    if (endHour < startHour) {
      // Range crosses midnight (e.g., 22:00 - 06:00)
      return this.hour >= startHour || this.hour < endHour;
    } else {
      return this.hour >= startHour && this.hour < endHour;
    }
  }

  /**
   * Get current status
   * @returns {Object}
   */
  getStatus() {
    return {
      day: this.missionDay,
      hour: this.hour,
      minute: this.minute,
      timeString: this.getTimeString(),
      dayString: this.getDayString(),
      fullString: this.getFullTimeString(),
      timeOfDay: this.getTimeOfDay(),
      isDaytime: this.isDaytime,
      timeScale: this.timeScale,
      isPaused: this.isPaused,
      missionProgress: this.getMissionProgress(),
      totalSeconds: this.totalSeconds
    };
  }

  /**
   * Export to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      totalSeconds: this.totalSeconds,
      missionDay: this.missionDay,
      hour: this.hour,
      minute: this.minute,
      timeScale: this.timeScale,
      missionDuration: this.missionDuration
    };
  }

  /**
   * Load from JSON
   * @param {Object} data - Time data
   */
  fromJSON(data) {
    if (data.totalSeconds !== undefined) this.totalSeconds = data.totalSeconds;
    if (data.missionDay !== undefined) this.missionDay = data.missionDay;
    if (data.hour !== undefined) this.hour = data.hour;
    if (data.minute !== undefined) this.minute = data.minute;
    if (data.timeScale !== undefined) this.timeScale = data.timeScale;
    if (data.missionDuration !== undefined) this.missionDuration = data.missionDuration;

    this.updateDayNightCycle();
  }
}

export default SimulationTime;

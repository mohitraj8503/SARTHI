/**
 * CIRCUIT BREAKER FOR SERVICE PROTECTION
 * Prevents cascade failures by temporarily stopping requests to failing services
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 1 minute
    this.monitorInterval = options.monitorInterval || 10000; // 10 seconds
    this.successThreshold = options.successThreshold || 3;

    this.failures = 0;
    this.successes = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.lastFailureTime = null;
    this.nextAttemptTime = null;

    // Start monitoring
    this.monitor = setInterval(() => this.checkState(), this.monitorInterval);
  }

  async execute(operation, fallback = null) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        if (fallback) return fallback();
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.successes++;

    if (this.state === 'HALF_OPEN' && this.successes >= this.successThreshold) {
      this.state = 'CLOSED';
      this.successes = 0;
      console.log('🔄 Circuit breaker CLOSED - service recovered');
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.successes = 0;

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.timeout;
      console.log(`🚫 Circuit breaker OPEN - ${this.failures} failures, retry in ${this.timeout}ms`);
    }
  }

  checkState() {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTime) {
      this.state = 'HALF_OPEN';
      this.successes = 0;
      console.log('🔄 Circuit breaker HALF_OPEN - testing service');
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttemptIn: this.nextAttemptTime ? this.nextAttemptTime - Date.now() : 0
    };
  }

  shutdown() {
    if (this.monitor) {
      clearInterval(this.monitor);
    }
  }
}

module.exports = CircuitBreaker;
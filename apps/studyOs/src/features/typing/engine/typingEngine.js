/**
 * TypingEngine.js
 * A pure JavaScript class to handle typing logic with zero React overhead.
 * Designed for high performance and low latency.
 */
export class TypingEngine {
  constructor(text, options = {}) {
    this.text = text;
    this.onComplete = options.onComplete;
    this.onCharTyped = options.onCharTyped;
    
    this.input = '';
    this.startTime = null;
    this.endTime = null;
    this.errors = 0;
    this.isFinished = false;
    
    // Detailed stats for weak key analysis
    this.keyTimings = []; // Array of { char: string, time: number, correct: boolean }
    this.lastCharTime = null;
  }

  handleKeyDown(key) {
    if (this.isFinished) return;

    if (!this.startTime) {
      this.startTime = Date.now();
      this.lastCharTime = this.startTime;
    }

    if (key === 'Backspace') {
      if (this.input.length > 0) {
        this.input = this.input.slice(0, -1);
      }
      return;
    }

    if (key.length === 1) {
      const now = Date.now();
      const expectedChar = this.text[this.input.length];
      const isCorrect = key === expectedChar;

      if (!isCorrect) {
        this.errors++;
      }

      // Track individual key performance
      this.keyTimings.push({
        char: expectedChar,
        actualChar: key,
        time: now - this.lastCharTime,
        correct: isCorrect,
        timestamp: now
      });

      this.lastCharTime = now;
      this.input += key;

      if (this.onCharTyped) {
        this.onCharTyped({ 
          char: key, 
          expected: expectedChar, 
          isCorrect, 
          index: this.input.length - 1 
        });
      }

      if (this.input.length === this.text.length) {
        this.finish();
      }
    }
  }

  finish() {
    this.isFinished = true;
    this.endTime = Date.now();
    if (this.onComplete) this.onComplete(this.getSnapshot());
  }

  getSnapshot() {
    const now = this.endTime || Date.now();
    const timeInMinutes = this.startTime ? (now - this.startTime) / 60000 : 0;
    
    // Standard: 5 characters = 1 word
    const rawWPM = timeInMinutes > 0 ? Math.round((this.input.length / 5) / timeInMinutes) : 0;
    const netWPM = timeInMinutes > 0 ? Math.round(((this.input.length - this.errors) / 5) / timeInMinutes) : 0;
    
    const accuracy = this.input.length > 0 
      ? Math.max(0, Math.round(((this.input.length - this.errors) / this.input.length) * 100))
      : 100;

    return {
      input: this.input,
      errors: this.errors,
      isFinished: this.isFinished,
      startTime: this.startTime,
      endTime: this.endTime,
      wpm: Math.max(0, netWPM),
      rawWpm: rawWPM,
      accuracy,
      progress: (this.input.length / this.text.length) * 100,
      currentIndex: this.input.length,
      keyTimings: this.keyTimings
    };
  }

  reset(newText) {
    if (newText) this.text = newText;
    this.input = '';
    this.startTime = null;
    this.endTime = null;
    this.errors = 0;
    this.isFinished = false;
    this.keyTimings = [];
    this.lastCharTime = null;
  }
}

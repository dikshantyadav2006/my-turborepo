import { validateAiEvent, sanitizePayload } from './validators';
import actionMap from './actionMap';
import { useAiStore } from './aiStore';

class AiDispatcher {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async handle(event) {
    // Validate
    const v = validateAiEvent(event);
    if (!v.valid) {
      if (import.meta.env.DEV) console.warn('AI event validation failed', v.reason, event);
      return;
    }

    const { traceId, sessionId } = event;
    const ai = useAiStore.getState();
    if (ai.isSeen(traceId, sessionId)) {
      if (import.meta.env.DEV) console.log('Duplicate AI event ignored', traceId);
      return;
    }

    // Mark seen
    ai.markSeen(traceId, sessionId);
    ai.setLastEvent(event);

    // Sanitize
    event.payload = sanitizePayload(event.payload || {});

    // Queue
    this.queue.push(event);
    this.processNext();
  }

  async processNext() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const evt = this.queue.shift();
      try {
        if (import.meta.env.DEV) console.log('AI dispatch:', evt.event, evt.traceId);
        const handler = actionMap[evt.event];
        if (handler) {
          await handler(evt);
        } else {
          if (import.meta.env.DEV) console.warn('No handler for AI event', evt.event);
        }
      } catch (err) {
        console.error('AI dispatch error', err);
      }
    }
    this.processing = false;
  }
}

export const aiDispatcher = new AiDispatcher();

export default aiDispatcher;

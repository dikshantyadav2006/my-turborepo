export function validateAiEvent(event) {
  if (!event || typeof event !== 'object') return { valid: false, reason: 'invalid_event' };
  const { event: name, payload, timestamp, eventVersion, sessionId, traceId } = event;
  if (!name || typeof name !== 'string') return { valid: false, reason: 'invalid_event_name' };
  if (!payload || typeof payload !== 'object') return { valid: false, reason: 'invalid_payload' };
  if (!timestamp || isNaN(Date.parse(timestamp))) return { valid: false, reason: 'invalid_timestamp' };
  if (!eventVersion || typeof eventVersion !== 'string') return { valid: false, reason: 'invalid_eventVersion' };
  if (!sessionId || typeof sessionId !== 'string') return { valid: false, reason: 'invalid_sessionId' };
  if (!traceId || typeof traceId !== 'string') return { valid: false, reason: 'invalid_traceId' };
  return { valid: true };
}

export function sanitizePayload(payload) {
  // shallow sanitize: remove functions and prototype pollution keys
  const safe = {};
  for (const k of Object.keys(payload || {})) {
    if (typeof payload[k] === 'function') continue;
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    safe[k] = payload[k];
  }
  return safe;
}

import { io } from 'socket.io-client';
import { getAiStore } from './aiStore';

let socket = null;
let heartbeatTimer = null;

export function createAiSocket({ url = import.meta.env.VITE_API_URL || 'http://localhost:5000', token = null, onEvent = () => {} } = {}) {
  if (socket) return socket;

  // connect to /study namespace
  socket = io(url + '/study', {
    autoConnect: false,
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    secure: false,
  });

  socket.on('connect', () => {
    getAiStore().setState({ aiConnected: true, aiStatus: 'connected' });
    startHeartbeat();
  });

  socket.on('disconnect', (reason) => {
    getAiStore().setState({ aiConnected: false, aiStatus: 'disconnected' });
    stopHeartbeat();
  });

  socket.on('connect_error', (err) => {
    getAiStore().setState({ aiStatus: 'error' });
  });

  socket.on('ai-action', (event) => {
    // delegate handling to dispatcher (import lazily to avoid circular deps)
    onEvent && onEvent(event);
  });

  return socket;
}

export function connectAiSocket(opts = {}) {
  const s = createAiSocket(opts);
  if (!s.connected) s.connect();
  return s;
}

export function disconnectAiSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('heartbeat', { ts: new Date().toISOString() });
    }
  }, 15000);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

export function getSocket() {
  return socket;
}

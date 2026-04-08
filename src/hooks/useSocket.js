import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socketInstance = null;
let connectedToken = null;

/**
 * Get (or create) the singleton socket. If the JWT changed since the last call,
 * tear down the existing socket and create a fresh one with the new token so
 * the server-side handshake middleware joins the correct user:{id} room.
 */
function getSocket() {
  const token = localStorage.getItem('tg-token');

  // Token rotation — recreate the socket so the server re-runs JWT verify and
  // joins the new personal room.
  if (socketInstance && connectedToken !== token) {
    try {
      socketInstance.disconnect();
    } catch {}
    socketInstance = null;
    connectedToken = null;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Bypass ngrok free-tier browser warning page on the websocket handshake
      // (sent on the polling fallback HTTP request socket.io makes first).
      // Harmless when not behind ngrok.
      extraHeaders: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    connectedToken = token;

    // Update auth on each reconnect attempt so a freshly-rotated token is sent
    socketInstance.on('reconnect_attempt', () => {
      const latest = localStorage.getItem('tg-token');
      if (latest) socketInstance.auth = { token: latest };
    });
  }

  return socketInstance;
}

/**
 * Tear down the singleton socket. Called from authStore.logout so the server
 * stops sending events to a logged-out browser session.
 */
export function disconnectSocket() {
  if (socketInstance) {
    try {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    } catch {}
    socketInstance = null;
    connectedToken = null;
  }
}

// Expose on window so authStore.logout can call this without creating a
// circular ESM import (authStore → useSocket → authStore).
if (typeof window !== 'undefined') {
  window.__tgDisconnectSocket = disconnectSocket;
}

/**
 * useSocket — subscribes to a map of event handlers for the lifetime of the
 * component. Re-subscribes whenever the handler set changes (so renaming keys
 * works correctly). Re-runs when authentication state changes (so logout +
 * login as a different user works without reload).
 *
 * Usage:
 *   useSocket({
 *     'game:result': (data) => { ... },
 *     'game:win':    (data) => { ... },
 *   });
 */
export function useSocket(handlers = {}) {
  // Keep the latest handlers in a ref so the effect captures live closures
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Build a stable subscription key from the sorted event names. The effect
  // re-runs when this key changes (e.g. a new handler is added).
  const eventKey = Object.keys(handlers).sort().join('|');

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    if (socket.disconnected) {
      socket.connect();
    }

    const events = Object.keys(handlersRef.current);
    const wrapped = {};
    for (const event of events) {
      wrapped[event] = (...args) => {
        const fn = handlersRef.current[event];
        if (fn) fn(...args);
      };
      socket.on(event, wrapped[event]);
    }

    return () => {
      for (const event of events) {
        socket.off(event, wrapped[event]);
      }
    };
  }, [isAuthenticated, eventKey]);
}

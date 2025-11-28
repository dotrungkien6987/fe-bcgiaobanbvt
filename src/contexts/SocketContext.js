/**
 * Socket.IO Context Provider
 * Manages WebSocket connection for real-time notifications
 *
 * Features:
 * - Auto-connect when authenticated
 * - Auto-disconnect on logout
 * - Auto-reconnect on connection loss
 * - JWT token authentication
 *
 * Usage:
 *   const { socket, isConnected, emit, on, off } = useSocket();
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

// Default to backend API URL, can be overridden with REACT_APP_SOCKET_URL
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_BACKEND_API?.replace("/api", "") ||
  "http://localhost:8020";

/**
 * SocketProvider - Wraps app to provide WebSocket connection
 *
 * @param {React.ReactNode} children - Child components
 */
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get auth state from AuthContext (not Redux)
  const { isAuthenticated } = useAuth();
  // Get accessToken from localStorage
  const accessToken = window.localStorage.getItem("accessToken");

  useEffect(() => {
    console.log(
      "[Socket] 🔍 Auth check - isAuthenticated:",
      isAuthenticated,
      "hasToken:",
      !!accessToken
    );

    // Only connect if authenticated
    if (!isAuthenticated || !accessToken) {
      // Disconnect existing socket if any
      setSocket((prevSocket) => {
        if (prevSocket) {
          console.log("[Socket] 🔌 Disconnecting - not authenticated");
          prevSocket.disconnect();
        }
        return null;
      });
      setIsConnected(false);
      return;
    }

    // Create socket connection with JWT auth
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"], // WebSocket first, polling fallback
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("[Socket] ✅ Connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] ❌ Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("[Socket] 🔄 Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("[Socket] 🔄 Reconnect attempt:", attemptNumber);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("[Socket] ❌ Reconnection failed");
    });

    setSocket(newSocket);

    // Cleanup on unmount or token change
    return () => {
      console.log("[Socket] 🔌 Cleanup - disconnecting");
      newSocket.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  /**
   * Emit event to server
   * @param {string} event - Event name
   * @param {any} data - Data to send
   */
  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      } else {
        console.warn("[Socket] Cannot emit - not connected");
      }
    },
    [socket, isConnected]
  );

  /**
   * Subscribe to event
   * Returns unsubscribe function
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  const on = useCallback(
    (event, callback) => {
      if (socket) {
        socket.on(event, callback);
        return () => socket.off(event, callback);
      }
      return () => {};
    },
    [socket]
  );

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   */
  const off = useCallback(
    (event, callback) => {
      if (socket) {
        socket.off(event, callback);
      }
    },
    [socket]
  );

  const value = {
    socket,
    isConnected,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

/**
 * Custom hook to use Socket context
 * @returns {Object} Socket context value
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export default SocketContext;

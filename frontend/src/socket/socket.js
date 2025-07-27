import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL; // Change if deployed

// Singleton connection
const socket = io(SOCKET_URL, {
  autoConnect: false, // Manual control
  withCredentials: true
});

export default socket;

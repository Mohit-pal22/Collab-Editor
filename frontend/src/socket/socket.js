import { io } from "socket.io-client";

// Singleton connection
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false, // Manual control
  withCredentials: true
});

export default socket;

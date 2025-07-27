import { useEffect } from "react";
import socket from "./socket";

export default function useSocket(documentId, user) {
  useEffect(() => {
    if (!documentId || !user) return;

    socket.connect();

    // Join the room
    socket.emit("join_room", { documentId, user });

    // Clean up on unmount
    return () => {
      socket.emit("leave_room", documentId);
      socket.disconnect();
    };
  }, [documentId, user]);

  return socket;
}

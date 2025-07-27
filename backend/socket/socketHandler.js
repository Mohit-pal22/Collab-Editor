const documentUsers = {};    // { documentId: [user, user, ...] }
const editingUsers = {};     // { documentId: { userId: timestamp } }

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on("join_room", ({ documentId, user }) => {
      socket.join(documentId);  // roomId
      socket.data.documentId = documentId;  // client roomId
      socket.data.user = user;   // client info

      if (!documentUsers[documentId]) documentUsers[documentId] = []; // create room
      if (!documentUsers[documentId].some(u => u.id === user.id)) {
        documentUsers[documentId].push(user); // adding user in room
      }

      io.to(documentId).emit("user_list", documentUsers[documentId]);
      console.log(`✅ ${user.name || user.email} joined room ${documentId}`);
    });

    socket.on("leave_room", (documentId) => {
      socket.leave(documentId);
      const userId = socket.data.user?.id;

      if (userId && documentUsers[documentId]) {
        documentUsers[documentId] = documentUsers[documentId].filter(u => u.id !== userId);
        io.to(documentId).emit("user_list", documentUsers[documentId]);
      }

      console.log(`🚪 Socket ${socket.id} left room ${documentId}`);
    });

    socket.on("send_code", ({ code, room }) => {
      socket.to(room).emit("receive_code", code);
    });

    socket.on("send_chat", ({ documentId, ...message }) => {
      socket.to(documentId).emit("receive_chat", message);
    });

    socket.on("typing", ({ documentId, user }) => {
      socket.to(documentId).emit("user_typing", user);
    });

    socket.on("user_editing", ({ room, user }) => {
      if (!editingUsers[room]) editingUsers[room] = {};
      editingUsers[room][user.id] = Date.now();

      io.to(room).emit("user_editing_update", {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        isEditing: true
      });

      setTimeout(() => {
        const lastEdit = editingUsers[room]?.[user.id];
        if (lastEdit && Date.now() - lastEdit >= 3000) {
          delete editingUsers[room][user.id];
          socket.to(room).emit("user_editing_update", {
            userId: user.id,
            name: user.name,
            avatar: user.avatar,
            isEditing: false
          });
        }
      }, 3500);
    });

    // Cursor position event (moved here, outside user_editing)
    socket.on("cursor_position", ({ room, user, position }) => {
      socket.to(room).emit("receive_cursor_position", {
        userId: user.id,
        position
      });
    });

    // Cursor selection event (moved here, outside user_editing)
    socket.on("cursor_selection", ({ room, user, selection }) => {
      socket.to(room).emit("receive_cursor_selection", {
        userId: user.id,
        selection
      });
    });

    socket.on("disconnect", () => {
      const documentId = socket.data.documentId;
      const userId = socket.data.user?.id;

      if (documentId && userId && documentUsers[documentId]) {
        documentUsers[documentId] = documentUsers[documentId].filter(u => u.id !== userId);
        io.to(documentId).emit("user_list", documentUsers[documentId]);
      }

      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
}

module.exports = socketHandler;

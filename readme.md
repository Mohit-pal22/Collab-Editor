# 📝 Collab Code Editor

A real-time collaborative code editor with chat, live presence, and user authentication. Built using **React**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB**.

---

## 🚀 Features

* ✅ Real-time code editing with others
* ✅ Chat with collaborators
* ✅ See who is currently editing
* ✅ Create, share, and join documents
* ✅ User signup, login, and session persistence
* ✅ Avatar and identity for collaborators
* ✅ Sidebar to show active users

---

## 📁 Project Structure

```
collab-code-editor/
├── backend/
│   ├── config/             # MongoDB connection
│   │   └── db.js           
│   ├── controllers/        # Auth & document logic
│   ├── middleware/         # JWT middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── socket/             # Socket.IO server setup
│   ├── app.js              # Main Express + Socket.IO server entry
│   └── .env                # Backend environment variables (not committed)
│
├── frontend/
│   ├── public/             # Static public files
│   ├── src/
│   │   ├── components/     # Sidebar, Auth, Editor, etc.
│   │   ├── pages/          # Login, Signup, Dashboard, Editor
│   │   ├── context/        # Auth context (React Context API)
│   │   ├── socket/         # Socket.IO client setup
│   │   ├── App.js          # App routes and layout
│   │   ├── api.js          # Axios API setup
│   │   ├── auth.js         # doLogin, doLogout, isLoggedIn, getToken
│   └── .env                # Frontend environment variables (not committed)
│
└── README.md               # Project documentation
```

---

## 🛠️ Tech Stack

### Frontend:

* React
* Axios
* React Router
* Socket.IO-client
* Monaco Editor

### Backend:

* Node.js + Express
* MongoDB + Mongoose
* Socket.IO
* JWT Authentication
* Bcrypt for password hashing

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/Mohit-pal22/Collab-Code-Editor.git
```

---

### 2. Install Dependencies

#### Backend:

```bash
cd backend
npm install
```

#### Frontend:

```bash
cd ../frontend
npm install
```

---

### 3. Environment Variables

Create a `.env` file in `/backend`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=https://your-frontend-url
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=your_backend_base_url
```

---

### 4. Start the App

#### Start Backend:

```bash
cd backend
npm start
```

#### Start Frontend:

```bash
cd ../frontend
npm run dev
```

App runs on:

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend + Socket.IO: [http://localhost:5000](http://localhost:5000)

---

## 🧠 Future Enhancements

* 🕓 Version history
* 📹 Live video/audio call
* 🧠 AI-assisted coding help
* 💾 Save code snapshots

---

## 👨‍💻 Author

Made by Mohit

---

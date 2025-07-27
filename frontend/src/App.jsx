import './index.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import CodeEditor from "./pages/Editor/CodeEditor";
import NotFound from './components/NotFound';


// index.js (or top of App.jsx)
if (process.env.NODE_ENV === "development") {
  const originalOnError = window.onerror;
  window.onerror = function (msg, url, lineNo, colNo, error) {
    if (
      typeof msg === "string" &&
      msg.includes("ResizeObserver loop completed with undelivered notifications")
    ) {
      // ignore this warning
      return true;
    }
    if (originalOnError) return originalOnError(msg, url, lineNo, colNo, error);
  };
}


function App() {


  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <PrivateRoute>
                <CodeEditor />
              </PrivateRoute>
            }
          />
          <Route path='*' element={<NotFound />} replace />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

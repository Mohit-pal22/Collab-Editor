import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div>Loading...</div>; // ⏳ Wait until done

  if (!user) return <Navigate to="/login" />; // 🔒 Redirect to login if not authenticated

  return children; // ✅ Allow access
};

export default PrivateRoute;

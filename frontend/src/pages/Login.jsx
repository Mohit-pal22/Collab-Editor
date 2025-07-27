import "./css/Login.css"
import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.token);
      navigate("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  useEffect(() => {
    if(isLoggedIn())
        navigate("/", {replace: true})
  }, [navigate])

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <form onSubmit={handleSubmit} className="border-4 p-6 rounded-xl">
        <h1 className="text-center text-xl font-bold p-2">Login</h1>
        <input id="email" name="email" onChange={handleChange} placeholder="Email" />
        <input id="password" name="password" onChange={handleChange} placeholder="Password" type="password" />
        <Button name="Submit" className={"bg-blue-500"} />
        <div className="relative top-2">
          Don't have an account?{" "}
          <Button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline"
            name="Signup"
          />
        </div>
      </form>
    </div>
  );
}

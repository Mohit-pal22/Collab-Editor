import "./css/Signup.css"
import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";


export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(form)
      const res = await API.post("/auth/signup", form);
      login(res.data.token);
      navigate("/");
    } catch (err) {
        alert(err);
    }
  };

  useEffect(() => {
    if(isLoggedIn())
        navigate("/", {replace: true})
  }, [navigate])

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <form onSubmit={handleSubmit} className="border-4 p-6 rounded-xl">
        <h1 className="text-center text-xl font-bold p-2">Sign Up</h1>
        <input name="name" onChange={handleChange} placeholder="Name" value={form.name} />
        <input id="email" name="email" onChange={handleChange} placeholder="Email" value={form.email} type="email"/>
        <input id="password" name="password" onChange={handleChange} placeholder="Password" value={form.password} type="password" />
        <div className="flex justify-center m-4">
          <Button name={"Submit"} className={"bg-blue-500"} />
        </div>
        <div className="relative top-2">
          Already have an account?{" "}
          <Button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline"
            name="Login"
          />
        </div>

      </form>
    </div>
  );
}

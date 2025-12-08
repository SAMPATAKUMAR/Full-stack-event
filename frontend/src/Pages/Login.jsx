import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/login.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import axios from "axios";

const Login = () => {
  const [theme, setTheme] = useState("dark");
  const [email, setEmail] = useState("");
  const [usn, setUsn] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));
  const Admin_uid = "BchFbbDOoTMxE7vdodxqYAkyEWA2";

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    // 1️⃣ Firebase login
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid; // ✅ Get UID after login


    // 2️⃣ Check email verification only for normal users
    if (uid !== Admin_uid && !userCred.user.emailVerified) {
      toast.warn("Please verify your email before logging in.");
      return;
    }

    // 3️⃣ Save UID
    localStorage.setItem("uid", uid);

    // 4️⃣ Admin bypasses USN & MongoDB check
    if (uid === Admin_uid) {
      toast.success("Admin login successful!");
      navigate("/admin-dashboard");
      return;
    }



      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/auth";
      const res = await axios.get(`${API_URL}/${uid}`);
      if (!res.data) throw new Error("User not found");

      if (res.data.usn !== usn) {
        toast.error("USN does not match registered account.");
        return;
      }

      localStorage.setItem("uid", uid);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed.");
    }
  };

  return (
    <div className={`login-bg ${theme === "light" ? "light-theme" : "dark-theme"}`}>
      <header className="login-header">
        <h1>EduConnect</h1>
        <nav className="login-nav">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </nav>
      </header>

      <main>
        <div className="login-card">
          <h2>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="text" placeholder="USN" value={usn} onChange={(e) => setUsn(e.target.value.toUpperCase())} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
          </form>
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <p className="login-user-id">@EduConnect</p>
        </div>
      </main>
    </div>
  );
};

export default Login;

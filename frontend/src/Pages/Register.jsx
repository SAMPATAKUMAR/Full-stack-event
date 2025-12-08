import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/register.css";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";

const Register = () => {
  const [theme, setTheme] = useState("dark-theme");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Send verification email
      await sendEmailVerification(userCred.user);
      toast.success("Verification email sent! Please verify your email.");

      // Save profile to MongoDB immediately
      const profileData = { uid, name, usn, email, college, branch, course, semester };
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/auth";

      try {
        await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData),
        });
        toast.success("Profile saved in database!");
      } catch (err) {
        toast.error("Failed to save profile in MongoDB.");
        console.error(err);
      }

      navigate("/verify-email");
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          toast.error("This email is already registered.");
          break;
        case "auth/invalid-email":
          toast.error("Invalid email format.");
          break;
        case "auth/weak-password":
          toast.error("Password should be at least 6 characters.");
          break;
        default:
          toast.error(err.message || "Registration failed.");
      }
    }
  };

  return (
    <div className={`register-bg ${theme}`}>
      <header className="register-header">
        <h1>EduConnect</h1>
        <nav className="register-nav">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark-theme" ? "light-theme" : "dark-theme")}
          >
            {theme === "dark-theme" ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      </header>

      <div className="register-card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Full Name" required onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="USN" required onChange={(e) => setUsn(e.target.value.toUpperCase())} />
          <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
          <input type="text" placeholder="College" required onChange={(e) => setCollege(e.target.value)} />
          <input type="text" placeholder="Branch" required onChange={(e) => setBranch(e.target.value)} />
          <input type="text" placeholder="Course" required onChange={(e) => setCourse(e.target.value)} />
          <input type="text" placeholder="Semester" required onChange={(e) => setSemester(e.target.value)} />
          <button type="submit">Register</button>
        </form>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;

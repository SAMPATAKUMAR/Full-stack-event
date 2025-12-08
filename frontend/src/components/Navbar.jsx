import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";   // IMPORTANT
import "../style/navbar.css";

function Navbar() {
  // Hooks must always run — do NOT put returns before hooks
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [user, setUser] = useState(null); // real-time auth user
  const location = useLocation();

  // Theme updater (hook 1)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen to Firebase login status (hook 2)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      // optional: keep localStorage uid in sync
      if (u) localStorage.setItem("uid", u.uid);
      else localStorage.removeItem("uid");
    });
    return () => unsub();
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Now it's safe to early-return based on route because all hooks above already ran
  const hideOn = ["/login", "/register", "/verify-email", "/admin-dashboard" , "/pending"];
  if (hideOn.includes(location.pathname)) return null;

  return (
    <div className="nav-container">
      <nav className="navbar-glass">
        <div className="logo">
          <Link className="h-btn" to="/">EduConnect</Link>
        </div>

        <div className="nav-links">
          {/* NOT LOGGED IN */}
          {!user && <Link className="Link-btn1" to="/login">Login</Link>}
          {!user && <Link className="Link-btn2" to="/register">Register</Link>}

          {/* LOGGED IN */}
          {user && <Link className="Link-btn3" to="/dashboard">Dashboard</Link>}
          {user && <Link className="Link-btn4" to="/resources">Resources</Link>}
          {user && <Link className="Link-btn5" to="/upload">Upload</Link>}
          {user && <Link className="Link-btn6" to="/chats">Chat</Link>}

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;

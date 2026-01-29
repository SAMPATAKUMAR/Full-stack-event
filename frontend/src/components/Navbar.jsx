import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import "../Style/navbar.css";

function Navbar() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // 🔹 hamburger state
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) localStorage.setItem("uid", u.uid);
      else localStorage.removeItem("uid");
    });
    return () => unsub();
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const hideOn = [
    "/login",
    "/register",
    "/verify-email",
    "/admin-dashboard",
    "/pending",
  ];
  if (hideOn.includes(location.pathname)) return null;

  return (
    <div className="nav-container">
      <nav className="navbar-glass">
        <div className="logo">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            EduConnect
          </Link>
        </div>

        {/* 🔹 Hamburger */}
        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </div>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          {!user && (
            <Link
              className="Link-btn1"
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
          {!user && (
            <Link
              className="Link-btn2"
              to="/register"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>
          )}

          {user && (
            <Link
              className="Link-btn3"
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          {user && (
            <Link
              className="Link-btn4"
              to="/resources"
              onClick={() => setMenuOpen(false)}
            >
              Resources
            </Link>
          )}
          {user && (
            <Link
              className="Link-btn5"
              to="/upload"
              onClick={() => setMenuOpen(false)}
            >
              Upload
            </Link>
          )}
          {user && (
            <Link
              className="Link-btn6"
              to="/chats"
              onClick={() => setMenuOpen(false)}
            >
              Chat
            </Link>
          )}

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;

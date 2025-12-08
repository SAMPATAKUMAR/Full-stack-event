// client/src/Pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../style/home.css";

export default function Home() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // undefined = loading, null = logged out, object = logged in
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Fast synchronous check if Firebase already has currentUser (avoids flicker)
    const fastUser = auth.currentUser ?? undefined;
    if (fastUser) {
      console.log("[Home] fast path auth.currentUser:", fastUser.uid);
      setUser(fastUser);
      const adminUid = localStorage.getItem("adminUid");
      setIsAdmin(Boolean(adminUid && fastUser.uid === adminUid));
    } else {
      // If there's no immediate user, start as loading (undefined)
      setUser(undefined);
    }

    // Subscribe to auth changes (this is the reliable source)
    const unsub = auth.onAuthStateChanged(
      (u) => {
        console.log("[Home] onAuthStateChanged ->", u);
        // u is null when signed out
        setUser(u);
        const adminUid = localStorage.getItem("adminUid");
        setIsAdmin(Boolean(u && adminUid && u.uid === adminUid));

        // Clear stale localStorage 'uid' if signed out to prevent other components showing logged-in UI
        if (!u) {
          if (localStorage.getItem("uid")) {
            console.log("[Home] clearing stale localStorage uid");
            localStorage.removeItem("uid");
          }
        } else {
          // keep localStorage.uid in sync (optional)
          localStorage.setItem("uid", u.uid);
        }
      },
      (err) => {
        console.error("[Home] onAuthStateChanged error:", err);
        setUser(null);
      }
    );

    return () => unsub();
  }, []);

  // cursor effect
  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
    e.currentTarget.style.setProperty("--angle", `${angle}deg`);
  }

  const cards = [
    { title: "Dashboard", desc: "View and manage your profile", to: "/dashboard", icon: "🏠", adminOnly: false },
    { title: "Resources", desc: "Browse approved notes and resources", to: "/resources", icon: "📚", adminOnly: false },
    { title: "Upload", desc: "Upload notes (pending admin approval)", to: "/upload", icon: "📤", adminOnly: false },
    { title: "Chat", desc: "Open chats with peers", to: "/chats", icon: "💬", adminOnly: false },
    { title: "Pending Approvals", desc: "Approve or reject user uploads", to: "/admin/pending", icon: "📝", adminOnly: true },
    { title: "Admin Dashboard", desc: "Admin uploads & management", to: "/admin", icon: "🛠️", adminOnly: true },
  ];
  const visibleCards = cards.filter((c) => !c.adminOnly || isAdmin);

  // ————— LOADING —————
  if (user === undefined) {
    return (
      <div className="home-container">
        <h1>Welcome to EduConnect 🌍</h1>
        <p>Loading your session…</p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 999,
            border: "4px solid rgba(255,255,255,0.08)",
            borderTopColor: "rgba(0,200,255,0.95)",
            animation: "spin 1s linear infinite"
          }} />
        </div>
        <div className="canvas-glass" style={{ opacity: 0.7, marginTop: 20 }}>
          <Canvas>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} />
            <Sphere args={[1.4, 32, 32]}>
              <meshStandardMaterial color="royalblue" wireframe />
            </Sphere>
            <OrbitControls autoRotate enableZoom={false} />
          </Canvas>
        </div>

        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ————— NOT LOGGED IN —————
  if (!user) {
    return (
      <div className="home-container">
        <h1>Welcome to EduConnect 🌍</h1>
        <p>
          EduConnect is your student empowerment hub — collaborate, share notes, and connect with peers.
          Join today to access resources, groups, and real-time messaging designed to help you succeed.
        </p>

        <div className="canvas-glass">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} />
            <Sphere args={[1.5, 32, 32]}>
              <meshStandardMaterial color="royalblue" wireframe />
            </Sphere>
            <OrbitControls autoRotate enableZoom={false} />
          </Canvas>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
          <button className="glass-button primary" onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </div>
    );
  }

  // ————— LOGGED IN —————
  return (
    <div className="home-container">
      <h1>Welcome to EduConnect 🌍</h1>
      <p>
        EduConnect is your student empowerment hub — collaborate, share notes, and connect with peers.
        Join today to access resources, groups, and real-time messaging designed to help you succeed.
      </p>

      <div className="canvas-glass">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Sphere args={[1.5, 32, 32]}>
            <meshStandardMaterial color="royalblue" wireframe />
          </Sphere>
          <OrbitControls autoRotate enableZoom={false} />
        </Canvas>
      </div>

      <div className="cards-wrapper">
        <div className="cards-grid">
          {visibleCards.map((c, idx) => (
            <div
              key={c.title}
              className="app-card"
              style={{ animationDelay: `${idx * 80}ms` }}
              onMouseMove={handleMove}
              onClick={() => navigate(c.to)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(c.to); }}
            >
              <div className="card-icon">{c.icon}</div>
              <div className="card-body">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
              {c.adminOnly && <div className="badge">Admin</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

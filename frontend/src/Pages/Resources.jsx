// client/src/Pages/Resources.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getNoteUrl } from "../utils/getNoteUrl";
import "../style/resources.css";

export default function Resources() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState("");
  const [scheme, setScheme] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  const branches = ["CSE", "ECE", "ME", "EE"];
  const schemes = ["2018", "2020", "2022"];
  const subjects = {
    CSE: ["DSA", "DBMS", "OS", "CN"],
    ECE: ["Signals", "Electronics"],
    ME: ["Thermodynamics"],
    EE: ["Circuits"],
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchNotes = async (branchVal, schemeVal, subjectVal, searchVal = "") => {
    if (!branchVal || !schemeVal || !subjectVal) return;
    try {
      // Use the public endpoint that returns only approved notes
      const res = await axios.get("/api/notes");

      // Defensive: res.data might be an object (error or wrapped), convert to array safely
      let data = res.data;
      if (!Array.isArray(data)) {
        // try common wrappers
        if (data?.notes && Array.isArray(data.notes)) data = data.notes;
        else if (data?.approved && Array.isArray(data.approved)) data = data.approved;
        else {
          console.warn("Unexpected /api/notes response shape:", res.data);
          data = [];
        }
      }

      const filtered = data.filter(
        (n) =>
          n.branch === branchVal &&
          n.scheme === schemeVal &&
          n.subject === subjectVal &&
          (
            (n.title || "").toLowerCase().includes(searchVal.toLowerCase()) ||
            (n.subjectCode || "").toLowerCase().includes(searchVal.toLowerCase()) ||
            (n.tags || []).some((t) => t.toLowerCase().includes(searchVal.toLowerCase()))
          )
      );
      setNotes(filtered);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setNotes([]); // clear on error
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchNotes(branch, scheme, subject, e.target.value);
  };

  return (
    <div className="resources-container">
      {/* <nav className="navbar-glass">
        <div className="logo"><a href="/">EduConnect</a></div>
        <a href="/dashboard">Dashboard</a>
        <a href="/upload">Upload Notes</a>

        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
        </button>
      </nav> */}

      <h1>Resources</h1>

      {/* Step 1: Select Branch */}
      {step === 1 && (
        <div className="card-grid">
          {branches.map((b) => (
            <div
              key={b}
              className="branch-card glass-card"
              onClick={() => { setBranch(b); setStep(2); }}
            >
              {b}
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Select Scheme */}
      {step === 2 && (
        <>
          <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
          <div className="card-grid">
            {schemes.map((s) => (
              <div
                key={s}
                className="branch-card glass-card"
                onClick={() => { setScheme(s); setStep(3); }}
              >
                {s}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Step 3: Select Subject */}
      {step === 3 && (
        <>
          <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
          <div className="card-grid">
            {subjects[branch].map((sub) => (
              <div
                key={sub}
                className="branch-card glass-card"
                onClick={() => {
                  setSubject(sub);
                  fetchNotes(branch, scheme, sub); // auto-fetch notes immediately
                }}
              >
                {sub}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Notes list */}
      {notes.length > 0 && (
        <>
          <input
            type="text"
            placeholder="Search by title, subject code or tags..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />

          <div className="notes-list">
            {notes.map((n) => (
              <div key={n._id} className="note-card">
                <h3>{n.title}</h3>
                <p>{n.subject} ({n.subjectCode})</p>
                <p>Tags: {n.tags?.join(", ")}</p>

                <a href={getNoteUrl(n)} target="_blank" className="open-btn" rel="noreferrer">
                  Open
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// src/Pages/PublicUpload.jsx
import React, { useState, useEffect } from "react";
import api from "../utils/api"; // your api helper (axios wrapper) or axios instance
import { Link } from "react-router-dom";
import "../style/publicupload.css"; // import the CSS below

export default function PublicUpload({ currentUser }) {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [branch, setBranch] = useState("CSE");
  const [scheme, setScheme] = useState("2020");
  const [subject, setSubject] = useState("DSA");
  const [subjectCode, setSubjectCode] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

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

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleSubmit = async () => {
    if (!title || (!url && !file) || !subjectCode) {
      return alert("Please fill Title, Subject Code and attach a URL or File");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("branch", branch);
      fd.append("scheme", scheme);
      fd.append("subject", subject);
      fd.append("subjectCode", subjectCode);
      fd.append("title", title);
      fd.append("tags", tags);
      if (file) fd.append("file", file);
      if (url) fd.append("url", url);

      const uploader = {
        uid: currentUser?.uid || null,
        name: currentUser?.displayName || currentUser?.name || "Anonymous",
        email: currentUser?.email || "",
      };
      fd.append("uploader", JSON.stringify(uploader));

      // Note: your api helper likely already has base URL; keep using it
      await api.post("/api/notes/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Uploaded — awaiting admin approval");
      setTitle("");
      setFile(null);
      setUrl("");
      setTags("");
      setSubjectCode("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pubupload-page">
      

      <main className="upload-container">
        <div className="upload-card">
          <h2>Upload Resource <span className="muted">(Pending Review)</span></h2>

          <div className="row">
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <select value={scheme} onChange={(e) => setScheme(e.target.value)}>
              {schemes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects[branch].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <input
            className="full-input"
            placeholder="Subject Code"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
          />

          <input
            className="full-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="full-input"
            placeholder="External URL (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <div className="file-row">
            <label className="file-label">
              <span>Attach file</span>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <input
              className="tags-input"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="actions-row">
            <button className="btn primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Uploading..." : "Upload (Pending approval)"}
            </button>

            <button
              className="btn ghost"
              onClick={() => {
                setTitle("");
                setFile(null);
                setUrl("");
                setTags("");
                setSubjectCode("");
              }}
            >
              Clear
            </button>
          </div>

          <p className="note-txt">Uploads will be visible to everyone only after admin approval.</p>
        </div>
      </main>
    </div>
  );
}

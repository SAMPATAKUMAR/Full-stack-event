import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase"; // Assuming you use Firebase auth for logout
import { getNoteUrl } from "../utils/getNoteUrl";
import "../style/admin.css";

export default function AdminDashboard() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [notes, setNotes] = useState([]);

  // Upload states
  const [branch, setBranch] = useState("CSE");
  const [scheme, setScheme] = useState("2020");
  const [subject, setSubject] = useState("DSA");
  const [subjectCode, setSubjectCode] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState("");

  // Edit mode states
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const branches = ["CSE", "ECE", "ME", "EE"];
  const schemes = ["2018", "2020", "2022"];
  const subjects = {
    CSE: ["DSA", "DBMS", "OS", "CN"],
    ECE: ["Signals", "Electronics"],
    ME: ["Thermodynamics"],
    EE: ["Circuits"]
  };

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("/api/admin/notes");
      setNotes(res.data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  // Upload note
  const handleUpload = async () => {
    if (!title || (!url && !file) || !subjectCode)
      return alert("Fill all required fields");

    const formData = new FormData();
    formData.append("branch", branch);
    formData.append("scheme", scheme);
    formData.append("subject", subject);
    formData.append("subjectCode", subjectCode);
    formData.append("title", title);
    formData.append("tags", tags);

    if (url) formData.append("url", url);
    if (file) formData.append("file", file);

    try {
      await axios.post("/api/admin/notes", formData);
      clearUploadForm();
      fetchNotes();
    } catch (error) {
      alert("Failed to upload note");
      console.error(error);
    }
  };

  const clearUploadForm = () => {
    setTitle("");
    setUrl("");
    setFile(null);
    setTags("");
    setSubjectCode("");
  };

  // Delete note
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/notes/${id}`);
      fetchNotes();
    } catch (error) {
      alert("Failed to delete note");
      console.error(error);
    }
  };

  // Enter edit mode for a note
  const handleEditClick = (note) => {
    setEditId(note._id);
    setEditData({
      branch: note.branch,
      scheme: note.scheme,
      subject: note.subject,
      subjectCode: note.subjectCode,
      title: note.title,
      url: note.url,
      tags: note.tags.join(", "),
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  // Handle edit input changes
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save edited note
  const handleSaveEdit = async () => {
    const { branch, scheme, subject, subjectCode, title, url, tags } = editData;
    if (!title || !subjectCode)
      return alert("Title and Subject Code are required");

    try {
      await axios.patch(`/api/admin/notes/${editId}`, {
        branch, scheme, subject, subjectCode, title, url, tags
      });

      setEditId(null);
      setEditData({});
      fetchNotes();
    } catch (error) {
      alert("Failed to save changes");
      console.error(error);
    }
  };

  // Logout function using Firebase auth (if you want) or simple localStorage clear
  const handleLogout = async () => {
    try {
      if (auth && auth.signOut) {
        await auth.signOut();
      }
    } catch {
      // ignore firebase logout error
    }
    localStorage.removeItem("adminUid"); // or "token" based on your auth
    window.location.href = "/login";
  };

  return (
    <div className="admin-container">
      <nav className="navbar-glass">
        <div className="/admin-dashboard">EduConnect Admin</div>
        <a href="/pending">Peding Uploads</a>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              cursor: "pointer",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <h1>Admin Dashboard</h1>

      <div className="upload-section">
        <h2>Upload Note</h2>

        <select value={branch} onChange={(e) => setBranch(e.target.value)}>
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select value={scheme} onChange={(e) => setScheme(e.target.value)}>
          {schemes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects[branch].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          placeholder="Subject Code"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
        />

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <button onClick={handleUpload}>Upload</button>
      </div>

      <div className="notes-list">
        <h2>All Notes</h2>
        {notes.map((n) => (
          <div key={n._id} className="note-card">
            {editId === n._id ? (
              <>
                <select
                  name="branch"
                  value={editData.branch}
                  onChange={handleEditChange}
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  name="scheme"
                  value={editData.scheme}
                  onChange={handleEditChange}
                >
                  {schemes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  name="subject"
                  value={editData.subject}
                  onChange={handleEditChange}
                >
                  {subjects[editData.branch].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <input
                  name="subjectCode"
                  placeholder="Subject Code"
                  value={editData.subjectCode}
                  onChange={handleEditChange}
                />

                <input
                  name="title"
                  placeholder="Title"
                  value={editData.title}
                  onChange={handleEditChange}
                />

                <input
                  name="url"
                  placeholder="URL"
                  value={editData.url}
                  onChange={handleEditChange}
                />

                <input
                  name="tags"
                  placeholder="Tags (comma separated)"
                  value={editData.tags}
                  onChange={handleEditChange}
                />

                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <h3>{n.title}</h3>
                <p>
                  {n.branch} - {n.scheme} - {n.subject} ({n.subjectCode})
                </p>
                <p>Tags: {n.tags.join(", ")}</p>
                <a
                  href={getNoteUrl(n)}
                  target="_blank"
                  className="open-btn"
                  rel="noreferrer"
                >
                  Open
                </a>
                <button onClick={() => handleEditClick(n)}>Edit</button>
                <button onClick={() => handleDelete(n._id)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

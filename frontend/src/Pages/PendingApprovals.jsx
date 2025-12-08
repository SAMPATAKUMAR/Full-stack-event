// src/Pages/PendingApprovals.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getNoteUrl } from "../utils/getNoteUrl";
import "../style/admin.css";

/**
 * Pending Approvals page (standalone)
 * - Does NOT modify your existing AdminDashboard, Resources, or PublicUpload
 * - Uses backend endpoints:
 *   GET  /api/admin/notes/pending
 *   PATCH /api/admin/notes/:id/approve
 *   PATCH /api/admin/notes/:id/reject
 *   DELETE /api/admin/notes/:id
 *
 * Mount it at /admin/pending (see router line below).
 */
export default function PendingApprovals({ adminName = "Admin" }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPending() {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/notes/pending");
      setPending(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending notes:", err);
      setPending([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await axios.patch(`/api/admin/notes/${id}/approve`, {
        adminName,
        message: adminMessage || ""
      });
      setAdminMessage("");
      await fetchPending();
      alert("Approved");
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Approve failed");
    }
  }

  async function handleReject(id) {
    try {
      await axios.patch(`/api/admin/notes/${id}/reject`, {
        adminName,
        message: adminMessage || "",
        deleteFile: false
      });
      setAdminMessage("");
      await fetchPending();
      alert("Rejected");
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Reject failed");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this pending note and its file?")) return;
    try {
      await axios.delete(`/api/admin/notes/${id}`);
      await fetchPending();
      alert("Deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  }

  return (
    <div className="admin-container">
      <nav className="navbar-glass" style={{ marginBottom: 20 }}>
        <div className="logo"><a href="/admin-dashboard">EduConnect</a> — Pending Approvals</div>
        
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
          </button>
          <button onClick={fetchPending} style={{ padding: "6px 10px" }}>
            Refresh
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2>Pending Uploads ({pending.length})</h2>

        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="Message to uploader (optional)"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            style={{ padding: 8, width: "70%" }}
          />
        </div>

        {loading && <p>Loading…</p>}
        {!loading && pending.length === 0 && <p>No pending uploads.</p>}

        <div style={{ display: "grid", gap: 12 }}>
          {pending.map((n) => (
            <div key={n._id} className="note-card" style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "4px 0" }}>{n.title || "(no title)"}</h3>
                  <p style={{ margin: "4px 0", opacity: 0.9 }}>
                    {n.branch} - {n.scheme} - {n.subject} ({n.subjectCode})
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    Uploaded by: {n.uploader?.name || "Anonymous"} ({n.uploader?.email || "—"})
                  </p>
                  <p style={{ margin: "4px 0" }}>Tags: {n.tags?.join(", ")}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {n.filePath && (
                    <a
                      href={getNoteUrl(n)}
                      target="_blank"
                      rel="noreferrer"
                      className="open-btn"
                      style={{ textAlign: "center" }}
                    >
                      Preview file
                    </a>
                  )}
                  {n.url && (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noreferrer"
                      className="open-btn"
                      style={{ textAlign: "center" }}
                    >
                      Open URL
                    </a>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button onClick={() => handleApprove(n._id)}>✅ Approve</button>
                <button
                  onClick={() => handleReject(n._id)}
                  style={{ backgroundColor: "#e53935", color: "#fff" }}
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => handleDelete(n._id)}
                  style={{ backgroundColor: "#9e9e9e", color: "#fff" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

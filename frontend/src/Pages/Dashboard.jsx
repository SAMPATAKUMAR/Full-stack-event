import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/theme.css";
import "../style/dashboard.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { FiLogOut } from "react-icons/fi";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [theme] = useState(localStorage.getItem("theme") || "dark");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) return;
        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api/profile";
        const res = await axios.get(`${API_URL}/${uid}`);
        setUser(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile data.");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api/profile";
      const res = await axios.put(`${API_URL}/${uid}`, formData);
      setUser(res.data);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("uid");
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="dashboard-container profile-screen">
      <div className="profile-card glass-card">
        {/* Top row – avatar, name, usn, college pill + buttons */}
        <div className="profile-header-row">
          <div className="profile-main">
            <img
              src={
                user?.profilePicture ||
                "https://media4.giphy.com/media/QCJlIDkOJDEIctfdzz/giphy.gif"
              }
              alt="Profile"
              className="profile-avatar"
            />
            <div>
              <h2 className="profile-name">{user?.name || "Guest"}</h2>
              <p className="profile-usn">{user?.usn || "USN not set"}</p>
            </div>
          </div>

          <div className="profile-actions">
            <span className="college-pill">
              {user?.college || "College"}
            </span>
            {/* <button className="pill-btn join-btn">Join</button> */}
            {user && (
              <button
                className="pill-btn signout-btn"
                onClick={handleLogout}
              >
                <FiLogOut className="logout-icon" />
                Sign out
              </button>
            )}
          </div>
        </div>

        <div className="profile-divider" />

        {/* If editing, show form inside same card */}
        {editing ? (
          <div className="profile-edit">
            <div className="profile-edit-grid">
              <input
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="input-field"
                placeholder="Name"
              />
              <input
                name="college"
                value={formData.college || ""}
                onChange={handleChange}
                className="input-field"
                placeholder="College"
              />
              <input
                name="branch"
                value={formData.branch || ""}
                onChange={handleChange}
                className="input-field"
                placeholder="Branch"
              />
              <input
                name="course"
                value={formData.course || ""}
                onChange={handleChange}
                className="input-field"
                placeholder="Course"
              />
              <input
                name="semester"
                value={formData.semester || ""}
                onChange={handleChange}
                className="input-field"
                placeholder="Semester"
              />
              <input
                name="profilePicture"
                value={formData.profilePicture || ""}
                onChange={handleChange}
                className="input-field"
                placeholder="Profile Picture URL"
              />
            </div>

            <p className="small-field">
              <span className="label">Email:</span> {user?.email || "-"}
            </p>

            <div className="form-actions">
              <button onClick={handleSave} className="edit-btn">
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="edit-btn secondary-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Info – two columns like screenshot */}
            <div className="profile-info-grid">
              <div className="profile-col">
                <p>
                  <span className="label">College:</span>{" "}
                  {user?.college || "-"}
                </p>
                <p>
                  <span className="label">Branch:</span>{" "}
                  {user?.branch || "-"}
                </p>
                <p>
                  <span className="label">Course:</span>{" "}
                  {user?.course || "-"}
                </p>
              </div>
              <div className="profile-col">
                <p>
                  <span className="label">Semester:</span>{" "}
                  {user?.semester || "-"}
                </p>
                <p>
                  <span className="label">Email:</span>{" "}
                  {user?.email || "-"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="edit-btn edit-full"
            >
              Edit Profile
            </button>

            {/* <p className="register-text">
              Don&apos;t have an account?{" "}
              <span
                className="register-link"
                onClick={() => navigate("/register")}
              >
                Register here
              </span>
            </p> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

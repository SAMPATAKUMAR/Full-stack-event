import React, { useState } from 'react';
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import VerifyEmail from "./Pages/VerifyEmail";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Resources from "./Pages/Resources";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./Pages/AdminDashboard";
import PublicUpload from "./Pages/PublicUpload";
import PendingApprovals from "./Pages/PendingApprovals";
import Chat from "./Pages/Chat";
import Navbar from './components/Navbar';


function App() {
  

  return (
    <div className="App">
      < Navbar />
      
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/upload" element={<PublicUpload />} />
        <Route path="/pending" element={<PendingApprovals />} />
        <Route path="/chats" element={<Chat />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<h2>404: Page Not Found</h2>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;

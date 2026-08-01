# 🎓 EduConnect — Next-Gen Student Collaboration & Resource Platform

**EduConnect** is a modern, full-stack web application engineered for college students to share academic resources, collaborate in real-time study chatrooms, access curated course notes, and manage student profiles under an Admin moderation workflow. Built with a sleek **Neomorphic Design System**, real-time WebSockets, and hybrid Firebase + MongoDB architecture.

---

## ✨ Key Features

- **🎨 Neomorphic UI/UX Architecture**: Crafted with custom CSS design tokens, soft dual-inset/outset shadows, cyan accent glows, responsive flex/grid layouts, and interactive 3D viewport graphics.
- **🔐 Hybrid Authentication & Profile Management**: Firebase Authentication combined with MongoDB student profile records (USN, Branch, Course, Semester).
- **📚 Curated Resource Hub**: Filter study notes and question papers by **Branch**, **Scheme**, **Subject Code**, and **Tags** with instant PDF preview and download capabilities.
- **📤 Public Resource Upload & Admin Moderation**: Students submit academic notes with attachments. Submissions enter a **Pending Approval** queue until reviewed by an Admin.
- **💬 Real-time Study Chatrooms**: Socket.IO powered instant messaging with room channels, optimism handling, and live participant presence.
- **💡 Daily Student Inspiration Engine**: Integrated random quote generator featuring 60+ motivational quotes for students.
- **🛡️ Admin Management Dashboard**: Dedicated dashboard for administrators to approve, reject, or manage published resources.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **Routing**: React Router DOM v7
- **Real-Time Communications**: Socket.IO Client
- **Authentication**: Firebase Web Auth SDK
- **Styling**: Vanilla CSS (Neomorphic Token System)
- **UI Enhancements**: React Toastify, Lucide Icons

### **Backend**
- **Runtime**: Node.js & Express
- **Database**: MongoDB & Mongoose ORM
- **Real-Time Engine**: Socket.IO Server
- **Security & Hashing**: Bcrypt, Firebase Admin SDK
- **File Management**: Multer (Static `/uploads` serving)

---

## 📁 Repository Structure

```text
Full-stack-event/
├── backend/
│   ├── models/           # Mongoose Data Schemas (User, Note, Message)
│   ├── routes/           # Express API Routes (auth, profile, notes, adminNotes, messages)
│   ├── quotes/           # Educational quotes dataset (quotes.json)
│   ├── uploads/          # Static uploaded PDF & document storage
│   ├── .env.example      # Backend environment variables template
│   └── server.js         # Express server & Socket.IO initialization
├── frontend/
│   ├── src/
│   │   ├── Components/   # Navbar & reusable UI components
│   │   ├── Pages/        # Home, Dashboard, Resources, PublicUpload, Chat, Admin, Auth
│   │   ├── Style/        # Neomorphic CSS styles (index.css, navbar.css, etc.)
│   │   └── utils/        # Axios API instance & URL formatting helpers
│   ├── .env.example      # Frontend environment variables template
│   └── vite.config.js    # Vite configuration & dev proxy rules
└── package.json          # Workspace root package runner (concurrently)
```

---

## 🚀 Quick Start (Local Setup)

### **1. Prerequisites**
- Node.js (v18+ recommended)
- Local MongoDB Instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### **2. Clone & Install Dependencies**
```bash
git clone https://github.com/your-username/EduConnect.git
cd EduConnect

# Install dependencies across workspace
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### **3. Environment Setup**

#### **Backend Config (`backend/.env`)**
Create a `backend/.env` file:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/EduConnect
```

#### **Frontend Config (`frontend/.env`)**
Create a `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_UID=your_admin_firebase_uid
```

### **4. Run Concurrent Local Servers**
Run both backend and frontend servers with a single command from the project root:
```bash
npm run dev
```

- **Frontend**: Accessible at `http://localhost:5173`
- **Backend API**: Accessible at `http://localhost:5000`

---

## 🔒 Security Best Practices

- All sensitive environment files (`.env`, `.env.production`) and uploads are untracked and listed in `.gitignore`.
- Reference template files (`.env.example`) are provided for easy environment configuration.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
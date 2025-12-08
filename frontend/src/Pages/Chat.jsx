// src/components/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { io } from "socket.io-client";
import "../style/chat.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const PROFILE_API = import.meta.env.VITE_API_URL || `${API_BASE}/api/profile`;

function makeClientId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function Chat({ onSignOut }) {
  // user = profile from backend
  const [user, setUser] = useState(null);
  // authUser = Firebase auth user
  const [authUser, setAuthUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [room, setRoom] = useState("global");
  const [setJoined] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const fetchControllerRef = useRef(null);

  // 🔐 Auth listener (Firebase)
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u || null);
      if (!u) {
        // if logged out, clear profile
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // 👤 Fetch profile from backend (by uid saved in localStorage)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) return;
        const res = await axios.get(`${PROFILE_API}/${uid}`);
        setUser(res.data);
      } catch (err) {
        console.error("fetchUser error:", err);
        try {
          toast.error("Failed to fetch profile data.");
        } catch {
          // Silently ignore toast errors
        }
      }
    };
    fetchUser();
  }, []);

  // 📜 Fetch messages helper
  const fetchMessages = async (r) => {
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;
    try {
      const res = await fetch(
        `${API_BASE}/api/messages?room=${encodeURIComponent(r)}&limit=200`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== "AbortError") console.error("fetchMessages error:", err);
    } finally {
      if (fetchControllerRef.current === controller) {
        fetchControllerRef.current = null;
      }
    }
  };

  // 🔌 Connect socket AFTER both profile (user) and Firebase user (authUser) available
  useEffect(() => {
    // need BOTH: backend profile + firebase auth user
    if (!user || !authUser) return;

    const connectSocket = async () => {
      try {
        const idToken = await authUser.getIdToken(false);

        const socket = io(API_BASE, {
          auth: { token: idToken },
          autoConnect: false,
          transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
          socket.emit("joinRoom", room);
        });

        // newMessage handler: reconcile by clientId, then heuristics
        socket.on("newMessage", (m) => {
          setMessages((prev) => {
            // avoid exact duplicate
            if (prev.some((p) => p._id === m._id)) return prev;

            // 1) if server returned clientId -> replace optimistic message with same clientId
            if (m.clientId) {
              const idx = prev.findIndex((p) => p.clientId === m.clientId);
              if (idx !== -1) {
                const copy = prev.slice();
                const serverSender = m.senderName || m.displayName || "";
                const serverHasEmail =
                  typeof serverSender === "string" && serverSender.includes("@");
                const finalDisplayName = serverHasEmail
                  ? copy[idx].displayName || "Unknown"
                  : serverSender || copy[idx].displayName || "Unknown";
                copy[idx] = { ...m, displayName: finalDisplayName };
                return copy;
              }
            }

            // 2) fallback heuristics: match by text + timestamp proximity (5s) for optimistic messages
            const serverCreatedAt = m.createdAt
              ? new Date(m.createdAt).getTime()
              : Date.now();
            const optIndex = prev.findIndex((p) => {
              if (typeof p._id !== "string") return false;
              if (!p._id.startsWith("local-")) return false;
              if (p.text !== m.text) return false;
              const optCreated = p.createdAt
                ? new Date(p.createdAt).getTime()
                : null;
              if (optCreated && Math.abs(optCreated - serverCreatedAt) <= 5000)
                return true;
              return false;
            });

            if (optIndex !== -1) {
              const copy = prev.slice();
              const optimistic = prev[optIndex];
              const serverSender = m.senderName || m.displayName || "";
              const serverHasEmail =
                typeof serverSender === "string" && serverSender.includes("@");
              const finalDisplayName = serverHasEmail
                ? optimistic.displayName || "Unknown"
                : serverSender || optimistic.displayName || "Unknown";
              copy[optIndex] = { ...m, displayName: finalDisplayName };
              return copy;
            }

            // 3) otherwise append, normalize displayName to avoid showing email
            const serverSender = m.senderName || m.displayName || "";
            const serverHasEmail =
              typeof serverSender === "string" && serverSender.includes("@");
            const finalDisplayName = serverHasEmail
              ? "Unknown"
              : serverSender || "Unknown";
            return [...prev, { ...m, displayName: finalDisplayName }];
          });
        });

        socket.on("joinedRoom", (r) => {
          setJoined(true);
          setRoom(r);
          fetchMessages(r);
        });

        socket.on("roomMessages", (msgs) => {
          if (Array.isArray(msgs)) setMessages(msgs);
        });

        socket.on("disconnect", () => {
          console.log("Socket disconnected");
          setJoined(false);
        });

        socket.connect();
        // initial fetch
        fetchMessages(room);
      } catch (err) {
        console.error("socket connect error:", err);
        try {
          toast.error("Socket connect failed");
        } catch {
          // Silently ignore toast errors
        }
      }
    };

    connectSocket();

    return () => {
      const s = socketRef.current;
      if (s) {
        s.off("connect");
        s.off("newMessage");
        s.off("joinedRoom");
        s.off("roomMessages");
        s.off("disconnect");
        s.disconnect();
        socketRef.current = null;
      }
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
    };
  }, [user, authUser, room, setJoined]); // re-run if profile, auth user, room, or setJoined changes

  // ⬇️ Scroll to bottom on messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🚪 Join room
  const joinRoom = (r) => {
    if (!socketRef.current || !socketRef.current.connected) {
      setRoom(r);
      fetchMessages(r);
      return;
    }
    socketRef.current.emit("leaveRoom", room);
    socketRef.current.emit("joinRoom", r);
    fetchMessages(r);
    setRoom(r);
    setJoined(true);
  };

  // ✉️ Send message: include clientId and client-side displayName
  const send = (e) => {
    e?.preventDefault();
    const textTrim = (text || "").trim();
    if (!textTrim) return;

    const s = socketRef.current;
    if (!s || !s.connected) {
      alert("Socket not connected. Try again.");
      return;
    }

    const clientId = makeClientId();
    const optimistic = {
      _id: `local-${Date.now()}`,
      clientId,
      text: textTrim,
      uid: user?.uid,
      displayName: user?.displayName || user?.name || "Unknown",
      createdAt: new Date().toISOString(),
    };

    s.emit("sendMessage", {
      text: textTrim,
      room,
      clientId,
      displayName: optimistic.displayName,
    });

    setMessages((prev) => [...prev, optimistic]);
    setText("");
  };

  const signOutUser = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      if (onSignOut) onSignOut();
    } catch (err) {
      console.error("signOut error", err);
      try {
        toast.error("Sign out failed");
      } catch {
        // Silently ignore toast errors
      }
    }
  };

  return (
    <div className="chat">
      {!user ? (
        <div className="chat-auth-placeholder">
          <p>Please sign in to join the chat.</p>
        </div>
      ) : null}

      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={
              user?.profilePicture ||
              "https://media4.giphy.com/media/QCJlIDkOJDEIctfdzz/giphy.gif"
            }
            alt="Profile"
            className="profile-pic-large"
          />
          <div style={{ fontWeight: 600 }}>
            {user?.displayName || user?.name || ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="room-sets"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="room name"
          />
          <button onClick={() => joinRoom(room)}>Join</button>
          <button onClick={signOutUser}>Sign out</button>
        </div>
      </div>

      <hr />

      <div className="messages" role="log" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`message ${m.uid === user?.uid ? "me" : ""}`}
          >
            <div className="meta">
              {m.displayName || m.senderName || "Unknown"} •{" "}
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={send}>
        <input
          className="send-msg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

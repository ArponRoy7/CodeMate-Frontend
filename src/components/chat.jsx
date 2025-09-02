// src/components/Chat.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getSocket } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import PresenceDot from "./PresenceDot";

const timeAgo = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  const units = [
    ["year", 365 * 24 * 3600],
    ["month", 30 * 24 * 3600],
    ["day", 24 * 3600],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [name, secs] of units) {
    const v = Math.floor(diff / secs);
    if (v >= 1) return `${v} ${name}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

export default function Chat() {
  const { targetUserId } = useParams();
  const location = useLocation();
  const passed = location.state?.target;

  const [messages, setMessages] = useState([]);
  const [targetPresence, setTargetPresence] = useState({ online: false, lastSeen: null });
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [newMessage, setNewMessage] = useState("");
  const [targetProfile, setTargetProfile] = useState({
    name: passed?.name || "",
    photoUrl: passed?.photoUrl || "",
  });
  const listRef = useRef(null);

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  // initial chat fetch
  const fetchChat = async () => {
    const chat = await axios.get(`${BASE_URL}/chat/${targetUserId}`, { withCredentials: true });
    const chatMessages = (chat?.data?.messages || []).map((m) => ({
      senderId: m.senderId?._id || m.senderId,
      name: m.senderId?.name || "",
      text: m.text,
      createdAt: m.createdAt,
    }));
    setMessages(chatMessages);
  };

  // presence fetch
  const fetchPresence = async () => {
    const res = await axios.get(`${BASE_URL}/presence/${targetUserId}`, { withCredentials: true });
    setTargetPresence(res.data || { online: false, lastSeen: null });
  };

  // target profile fetch (only if not passed via Link state)
  const fetchTargetProfile = async () => {
    if (targetProfile.name && targetProfile.photoUrl) return;
    try {
      const r = await axios.get(`${BASE_URL}/user/${targetUserId}`, { withCredentials: true });
      const d = r.data || {};
      setTargetProfile((p) => ({
        name: p.name || d.name || "",
        photoUrl: p.photoUrl || d.photoUrl || d.photourl || "",
      }));
    } catch {
      try {
        const r2 = await axios.get(`${BASE_URL}/api/user/${targetUserId}`, { withCredentials: true });
        const d2 = r2.data || {};
        setTargetProfile((p) => ({
          name: p.name || d2.name || "",
          photoUrl: p.photoUrl || d2.photoUrl || d2.photourl || "",
        }));
      } catch {
        // leave as-is, avatar fallback will cover
      }
    }
  };

  useEffect(() => {
    fetchChat();
    fetchPresence();
    fetchTargetProfile();
  }, [targetUserId]);

  // auto scroll
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typingUsers]);

  // socket events
  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();

    socket.emit("identify", { userId });
    socket.emit("joinChat", { name: user.name, userId, targetUserId });

    const onMessage = ({ senderId, name, text, createdAt }) => {
      setMessages((prev) => [...prev, { senderId, name, text, createdAt }]);
    };
    const onPresence = ({ userId: who, online, lastSeen }) => {
      if (String(who) === String(targetUserId)) setTargetPresence({ online, lastSeen });
    };
    const onTyping = ({ userId: who }) => {
      if (String(who) === String(targetUserId)) setTypingUsers((s) => new Set([...s, who]));
    };
    const onStopTyping = ({ userId: who }) => {
      if (String(who) === String(targetUserId)) {
        setTypingUsers((s) => {
          const n = new Set(s);
          n.delete(who);
          return n;
        });
      }
    };

    socket.on("messageReceived", onMessage);
    socket.on("presenceUpdate", onPresence);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);

    return () => {
      socket.off("messageReceived", onMessage);
      socket.off("presenceUpdate", onPresence);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
    };
  }, [userId, targetUserId, user?.name]);

  // typing emit (debounced)
  const typingRef = useRef({ timeout: null, sent: false });
  const handleChange = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (!typingRef.current.sent) {
      socket.emit("typing", { userId, targetUserId });
      typingRef.current.sent = true;
    }
    if (typingRef.current.timeout) clearTimeout(typingRef.current.timeout);
    typingRef.current.timeout = setTimeout(() => {
      socket.emit("stopTyping", { userId, targetUserId });
      typingRef.current.sent = false;
    }, 1200);
  };

  const sendMessage = () => {
    const text = newMessage.trim();
    if (!text) return;
    const socket = getSocket();
    socket.emit(
      "sendMessage",
      { name: user.name, userId, targetUserId, text },
      (ack) => {
        if (!ack?.ok) console.error("sendMessage failed:", ack?.error);
      }
    );
    setNewMessage("");
    socket.emit("stopTyping", { userId, targetUserId });
    typingRef.current.sent = false;
  };

  const isTyping = useMemo(() => typingUsers.size > 0, [typingUsers]);

  const avatarSrc = targetProfile.photoUrl || `https://i.pravatar.cc/80?u=${targetUserId}`;

  return (
    <div className="w-full mx-auto mt-4 sm:mt-6 px-2 sm:px-0">
      <div className="mx-auto w-full sm:w-11/12 md:w-5/6 lg:w-2/3 xl:w-1/2 rounded-box border border-base-300 shadow-xl bg-base-100 flex flex-col h-[78vh] sm:h-[80vh] overflow-hidden">
        {/* Header — target user (sticky inside chat) */}
        <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur border-b border-base-300 p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 sm:w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src={avatarSrc}
                  alt={targetProfile.name || "User"}
                  onError={(e) => { e.currentTarget.src = `https://i.pravatar.cc/80?u=${targetUserId}`; }}
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-base sm:text-lg flex items-center gap-2">
                <span className="truncate max-w-[40vw] sm:max-w-[240px]">{targetProfile.name || "User"}</span>
                <PresenceDot online={targetPresence.online} />
              </div>
              <div className="text-xs sm:text-sm opacity-70">
                {targetPresence.online
                  ? "online"
                  : targetPresence.lastSeen
                  ? `last seen ${timeAgo(targetPresence.lastSeen)}`
                  : "offline"}
              </div>
            </div>
          </div>

          <div className="badge badge-outline badge-sm sm:badge-md">1:1</div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {messages.map((msg, idx) => {
            const mine =
              String(msg.senderId) === String(userId) || msg.name === user.name;
            return (
              <div key={idx} className={`chat ${mine ? "chat-end" : "chat-start"}`}>
                <div className="chat-header">
                  <span className="truncate max-w-[40vw] sm:max-w-[260px]">{msg.name}</span>
                  <time className="text-xs opacity-50 ml-2">
                    {msg.createdAt ? timeAgo(msg.createdAt) : ""}
                  </time>
                </div>
                <div
                  className={[
                    "chat-bubble whitespace-pre-wrap break-words max-w-[82%] sm:max-w-[70%]",
                    mine ? "chat-bubble-secondary" : "chat-bubble-primary chat-bubble-outline",
                  ].join(" ")}
                >
                  {msg.text}
                </div>
                <div className="chat-footer opacity-50">{mine ? "Sent" : "Seen"}</div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="chat chat-start">
              <div className="chat-bubble">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}
        </div>

        {/* Composer (sticky at bottom) */}
        <div className="sticky bottom-0 z-10 border-t border-base-300 bg-base-100/95 backdrop-blur p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <input
              value={newMessage}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="input input-bordered flex-1 text-sm sm:text-base"
              placeholder="Type a message…"
              aria-label="Message text"
            />
            <button
              onClick={sendMessage}
              className="btn btn-secondary min-w-20 sm:min-w-24"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

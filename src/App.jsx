// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./utils/appStore";

import Body from "./components/Body";
import Home from "./components/Home";
import Feed from "./components/Feed";
import Login from "./components/Login";
import Profile from "./components/Profile";
import RequireAuth from "./components/RequireAuth";
import Requests from "./components/Requests";
import Connections from "./components/Connections";
import ChangePassword from "./components/ChangePasswordModal";
import Premium from "./components/Premium";

// 👇 ADD THIS
import Chat from "./components/chat";

const ThemeBoot = ({ children }) => {
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    const html = document.documentElement;
    html.setAttribute("data-theme", saved);
    if (saved === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
  }, []);
  return children;
};

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <ThemeBoot>
          <Routes>
            <Route path="/" element={<Body />}>
              <Route index element={<Home />} />
              <Route path="feed" element={<RequireAuth><Feed /></RequireAuth>} />
              <Route path="login" element={<Login />} />
              <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="requests" element={<RequireAuth><Requests /></RequireAuth>} />
              <Route path="connections" element={<RequireAuth><Connections /></RequireAuth>} />
              <Route path="change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
              <Route path="premium" element={<RequireAuth><Premium /></RequireAuth>} />
              
              {/* ✅ NEW: Chat route (requires auth) */}
              <Route path="chat/:targetUserId" element={<RequireAuth><Chat /></RequireAuth>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ThemeBoot>
      </Router>
    </Provider>
  );
}

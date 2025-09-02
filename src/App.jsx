// App.jsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store from "./utils/appStore";

import Body from "./components/Body";

import Feed from "./components/Feed";
import Login from "./components/Login";
import Profile from "./components/Profile";
import RequireAuth from "./components/RequireAuth";
import Requests from "./components/Requests";
import Connections from "./components/Connections";
// ✅ Fix incorrect import name to match your component file
import ChangePassword from "./components/ChangePasswordModal";
import Premium from "./components/Premium";
// ✅ Fix case-sensitive import for Chat
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

/**
 * If the user is logged in, land them on /feed.
 * If not, show the public Home page.
 */
const HomeGate = () => {
  const user = useSelector((s) => s.user);
  return user ? <Navigate to="/feed" replace /> : <Home />;
};

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <ThemeBoot>
          <Routes>
            <Route path="/" element={<Body />}>
              {/* ✅ Index now routes to Feed when authed, Home otherwise */}
              <Route index element={<HomeGate />} />

              <Route
                path="feed"
                element={
                  <RequireAuth>
                    <Feed />
                  </RequireAuth>
                }
              />
              <Route path="login" element={<Login />} />
              <Route
                path="profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="requests"
                element={
                  <RequireAuth>
                    <Requests />
                  </RequireAuth>
                }
              />
              <Route
                path="connections"
                element={
                  <RequireAuth>
                    <Connections />
                  </RequireAuth>
                }
              />
              <Route
                path="change-password"
                element={
                  <RequireAuth>
                    <ChangePassword />
                  </RequireAuth>
                }
              />
              <Route
                path="premium"
                element={
                  <RequireAuth>
                    <Premium />
                  </RequireAuth>
                }
              />
              <Route
                path="chat/:targetUserId"
                element={
                  <RequireAuth>
                    <Chat />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ThemeBoot>
      </Router>
    </Provider>
  );
}

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
import Requests from "./components/Requests";      // ← NEW
import Connections from "./components/Connections"; // ← NEW

// Ensure default theme = light and persisted
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
              {/* NEW protected pages */}
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

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ThemeBoot>
      </Router>
    </Provider>
  );
}

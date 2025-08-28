// Body.jsx (keep imports as-is)
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);

  const [checking, setChecking] = React.useState(true);
  const [toast, setToast] = React.useState(null); // { type: 'success' | 'error', text: string }

  // Mount-time auth check (only redirect on 401)
  React.useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        if (!cancelled) {
          // Always overwrite with the freshest DB snapshot
          dispatch(addUser(res.data));
        }
      } catch (err) {
        const status = err?.response?.status || err?.status;
        if (!cancelled && status === 401) {
          navigate("/login", { replace: true });
        }
        console.error("Session check failed:", err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate]);

  // Global toast listener (components can dispatch events)
  React.useEffect(() => {
    let hideTimer;
    const handler = (e) => {
      const detail = e?.detail || {};
      const type = detail.type === "error" ? "error" : "success";
      const text = detail.text || "";
      setToast({ type, text });
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setToast(null), detail.timeout ?? 1800);
    };
    window.addEventListener("app:toast", handler);
    return () => {
      window.removeEventListener("app:toast", handler);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      <NavBar />

      {/* Global toast just under the navbar */}
      {toast && (
        <div className="container mx-auto px-4 pt-3">
          <div
            className={[
              "alert shadow",
              toast.type === "error" ? "alert-error" : "alert-success",
            ].join(" ")}
          >
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6 flex-1">
        {checking ? (
          <div className="w-full flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-md" />
            <span className="ml-3 text-sm opacity-70">Checking session…</span>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Body;

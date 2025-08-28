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

  React.useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        if (!cancelled) dispatch(addUser(res.data)); // always overwrite with fresh DB snapshot
      } catch (err) {
        const status = err?.response?.status || err?.status;
        if (!cancelled && status === 401) navigate("/login", { replace: true });
        console.error("Session check failed:", err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    fetchUser();
    return () => { cancelled = true; };
  }, [dispatch, navigate]); // no dependency on user → always runs on mount

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col">
      <NavBar />
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

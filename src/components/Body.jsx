import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);

  // prevent flicker/redirect during initial auth check
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      // If we already have user in store, no need to hit the API
      if (userData) {
        setChecking(false);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        if (!cancelled) {
          dispatch(addUser(res.data));
        }
      } catch (err) {
        const status = err?.response?.status || err?.status;
        // Only redirect if the server confirms we're not authenticated
        if (!cancelled && status === 401) {
          navigate("/login", { replace: true });
        }
        // Otherwise, stay on the page (network error, 5xx, etc.)
        console.error("Session check failed:", err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [userData, dispatch, navigate]);

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

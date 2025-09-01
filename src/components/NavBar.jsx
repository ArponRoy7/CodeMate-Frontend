// src/components/NavBar.jsx
import React from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";

const ThemeToggle = () => {
  const [theme, setTheme] = React.useState(
    () => localStorage.getItem("theme") || "light"
  );

  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    html.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      className="btn btn-ghost btn-circle hover:scale-105 active:scale-95 transition-transform"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="text-lg leading-none">{theme === "light" ? "🌞" : "🌙"}</span>
    </button>
  );
};

const topLinkClass = ({ isActive }) =>
  [
    "px-3 py-2 rounded-xl transition-all duration-200",
    "hover:bg-base-200 hover:shadow-sm",
    isActive ? "font-semibold text-indigo-600" : "text-base-content/80",
  ].join(" ");

const menuLinkClass = ({ isActive }) =>
  [
    "justify-between",
    isActive ? "active font-medium text-indigo-600" : "",
  ].join(" ");

const displayName = (u) => (u?.name && String(u.name).trim()) || "User";
const avatarUrl = (u) =>
  u?.photoUrl || u?.photourl || "https://i.pravatar.cc/80?u=codemate-fallback";

const NavBar = () => {
  const user = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  // NEW: premium badge state
  const [isPremium, setIsPremium] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await axios.get(`${BASE_URL}/me/subscription`, { withCredentials: true });
        if (mounted) setIsPremium(!!r?.data?.isPremium);
      } catch {
        // not logged in or no sub; ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/logout`, { withCredentials: true });
    } catch {
      /* ignore */
    }
    dispatch(removeUser());
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={[
        "navbar sticky top-0 z-40",
        "bg-base-100/80 backdrop-blur supports-[backdrop-filter]:bg-base-100/70",
        "border-b border-indigo-100 shadow-sm",
        "px-4",
      ].join(" ")}
    >
      {/* Left: brand */}
      <div className="navbar-start">
        <Link
          to="/"
          className="btn btn-ghost text-xl font-bold tracking-tight flex items-center gap-2"
        >
          <span className="text-indigo-600 text-lg">■</span>
          <span>CodeMate</span>
        </Link>
      </div>

      {/* Center: primary nav */}
      <div className="navbar-center hidden md:flex">
        <nav className="flex items-center gap-1 p-1 rounded-2xl shadow-sm bg-base-100/60">
          <NavLink to="/" className={topLinkClass}>
            Home
          </NavLink>
          <NavLink to="/feed" className={topLinkClass}>
            Feed
          </NavLink>
          <NavLink to="/premium" className={topLinkClass}>
            Premium
          </NavLink>
        </nav>
      </div>

      {/* Right: theme + user */}
      <div className="navbar-end gap-3">
        <ThemeToggle />

        {user ? (
          <>
            <div className="hidden sm:block text-sm">
              <span className="opacity-80">Welcome, </span>
              <span className="font-semibold">{displayName(user)}</span>
            </div>

            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar"
                aria-haspopup="menu"
                aria-label="Open user menu"
              >
                <div className="relative w-9 rounded-full ring ring-indigo-500/70 ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img
                    src={avatarUrl(user)}
                    alt={displayName(user)}
                    onError={(e) => {
                      e.currentTarget.src = "https://i.pravatar.cc/80?u=codemate-fallback";
                    }}
                    loading="lazy"
                  />
                  {isPremium && (
                    <span
                      title="Premium member"
                      className="absolute -right-0.5 -bottom-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold shadow"
                    >
                      ✓
                    </span>
                  )}
                </div>
              </button>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-lg"
                role="menu"
              >
                <li>
                  <NavLink to="/profile" className={menuLinkClass}>
                    Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/connections" className={menuLinkClass}>
                    Connections
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/requests" className={menuLinkClass}>
                    Requests
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/change-password" className={menuLinkClass}>
                    Change password
                  </NavLink>
                </li>
                <li className="md:hidden">
                  {/* Mobile access to Premium */}
                  <NavLink to="/premium" className={menuLinkClass}>
                    Premium
                  </NavLink>
                </li>
                <li>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          !isLoginPage && (
            <Link
              to="/login"
              className="btn btn-primary shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Login
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default NavBar;

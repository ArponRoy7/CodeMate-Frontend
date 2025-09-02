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
    "hover:bg-base-200 hover:shadow-sm whitespace-nowrap",
    isActive ? "font-semibold text-primary" : "text-base-content/80",
  ].join(" ");

const menuLinkClass = ({ isActive }) =>
  ["justify-between", isActive ? "active font-medium text-primary" : ""].join(" ");

const displayName = (u) => (u?.name && String(u.name).trim()) || "User";
const avatarUrl = (u) =>
  u?.photoUrl || u?.photourl || "https://i.pravatar.cc/80?u=codemate-fallback";

const PremiumBadge = ({ className = "" }) => (
  <span
    title="Premium member"
    className={`inline-flex items-center justify-center ml-1 align-middle ${className}`}
    aria-label="Premium"
  >
    <svg width="14" height="14" viewBox="0 0 20 20" className="shrink-0">
      <defs>
        <linearGradient id="pm-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path d="M10 1.8l6.2 6.2a2.5 2.5 0 010 3.5L10 17.8l-6.2-6.3a2.5 2.5 0 010-3.5L10 1.8z" fill="url(#pm-blue)" />
      <path d="M8.2 10.8l-1.7-1.7a1 1 0 10-1.4 1.4l2.4 2.4a1 1 0 001.4 0l5-5a1 1 0 10-1.4-1.4l-4.3 4.3z" fill="white" />
    </svg>
  </span>
);

const NavBar = () => {
  const user = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const [isPremium, setIsPremium] = React.useState(false);

  // Single function to check premium; memoized to reuse in effects
  const checkPremium = React.useCallback(async () => {
    // If logged out, clear immediately (prevents stale blue tick)
    if (!user?._id) {
      setIsPremium(false);
      return;
    }
    try {
      const r = await axios.get(`${BASE_URL}/me/subscription`, {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      setIsPremium(Boolean(r?.data?.isPremium));
    } catch {
      setIsPremium(false);
    }
  }, [user?._id]);

  // Re-check when user changes or route changes (e.g., after login, profile updates, nav)
  React.useEffect(() => {
    checkPremium();
  }, [checkPremium, location.pathname]);

  // Also re-check when window regains focus (user may have changed plan in another tab)
  React.useEffect(() => {
    const onFocus = () => checkPremium();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [checkPremium]);

  const handleLogout = async () => {
    try {
      await axios.get(`${BASE_URL}/logout`, { withCredentials: true });
    } catch {}
    setIsPremium(false); // ensure badge disappears right away
    dispatch(removeUser());
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={[
        "navbar sticky top-0 left-0 right-0 z-40",
        "min-h-14 py-0",
        "bg-base-100/80 backdrop-blur supports-[backdrop-filter]:bg-base-100/70",
        "border-b border-base-200 shadow-sm",
      ].join(" ")}
    >
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 flex items-center gap-2 flex-nowrap">
        {/* Left: brand + mobile menu */}
        <div className="navbar-start gap-1 shrink-0">
          <div className="dropdown lg:hidden">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-circle"
              aria-label="Open main menu"
              aria-haspopup="menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-56"
              role="menu"
            >
              <li><NavLink to="/" className={menuLinkClass}>Home</NavLink></li>
              <li><NavLink to="/feed" className={menuLinkClass}>Feed</NavLink></li>
              <li><NavLink to="/premium" className={menuLinkClass}>Premium</NavLink></li>
            </ul>
          </div>

          {/* Brand button navigates to /feed */}
          <Link
            to="/feed"
            className="btn btn-ghost text-xl font-bold tracking-tight flex items-center gap-2"
            title="Go to Feed"
          >
            <span className="text-primary text-lg">■</span>
            <span>CodeMate</span>
          </Link>
        </div>

        {/* Center: primary nav (desktop) */}
        <div className="navbar-center hidden lg:flex flex-1 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 p-1 rounded-2xl shadow-sm bg-base-100/60">
            <NavLink to="/" className={topLinkClass}>Home</NavLink>
            <NavLink to="/feed" className={topLinkClass}>Feed</NavLink>
            <NavLink to="/premium" className={topLinkClass}>Premium</NavLink>
          </nav>
        </div>

        {/* Right: theme + user */}
        <div className="navbar-end gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          {user ? (
            <>
              <div className="hidden lg:flex items-center text-sm">
                <span className="opacity-80">Welcome,&nbsp;</span>
                <span className="font-semibold inline-flex items-center">
                  {displayName(user)}
                  {isPremium && <PremiumBadge />}
                </span>
              </div>

              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="btn btn-ghost btn-circle avatar"
                  aria-haspopup="menu"
                  aria-label="Open user menu"
                >
                  <div className="w-9 rounded-full ring ring-primary/70 ring-offset-base-100 ring-offset-2 overflow-hidden">
                    <img
                      src={avatarUrl(user)}
                      alt={displayName(user)}
                      onError={(e) => {
                        e.currentTarget.src = "https://i.pravatar.cc/80?u=codemate-fallback";
                      }}
                      loading="lazy"
                    />
                  </div>
                </button>

                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-lg"
                  role="menu"
                >
                  <li className="pointer-events-none">
                    <div className="flex items-center gap-2 opacity-80">
                      <span className="text-xs">Status:</span>
                      {isPremium ? (
                        <span className="inline-flex items-center text-xs font-medium text-blue-600">
                          Premium <PremiumBadge className="ml-1" />
                        </span>
                      ) : (
                        <span className="text-xs">Free</span>
                      )}
                    </div>
                  </li>
                  <li><NavLink to="/profile" className={menuLinkClass}>Profile</NavLink></li>
                  <li><NavLink to="/connections" className={menuLinkClass}>Connections</NavLink></li>
                  <li><NavLink to="/requests" className={menuLinkClass}>Requests</NavLink></li>
                  <li><NavLink to="/change-password" className={menuLinkClass}>Change password</NavLink></li>
                  <li className="lg:hidden"><NavLink to="/premium" className={menuLinkClass}>Premium</NavLink></li>
                  <li><button type="button" onClick={handleLogout}>Logout</button></li>
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
    </div>
  );
};

export default NavBar;

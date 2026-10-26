import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { getSavedUser } from "./utility";
import { logout } from "./api/login";
import { BRAND } from "./utility/consts";
import NotificationBell from "./common-component/NotificationBell";

export default function Layout() {
  const user = getSavedUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = location.pathname.includes("jobs-screen")
    ? "Jobs"
    : "Job Request";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="shell">
      {menuOpen && (
        <button
          className="backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={menuOpen ? "sidebar open" : "sidebar"}>
        <div className="logo">
          <img className="logo-mark" src={BRAND} alt="Pulso" />
          <div>
            <strong>Pulso</strong>
            <small>BY THINKSYS</small>
          </div>
        </div>
        <nav onClick={() => setMenuOpen(false)}>
          <NavLink to="/requests/new">Job Request</NavLink>
          <NavLink to="/jobs-screen">Job</NavLink>
        </nav>
        <div className="sidebar-user">
          <span className="avatar">
            {user?.name?.[0] || "U"}
          </span>
          <div>
            <strong>{user?.name}</strong>
            <small>{user?.email}</small>
            <small className="role-line">{user?.role}</small>
          </div>
        </div>
      </aside>
      <div className="main">
        <div className="content">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="menu-btn"
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <span />
                <span />
                <span />
              </button>
              <h1>{pageTitle}</h1>
            </div>
            <div className="topbar-actions">
              <NotificationBell />
              <button
                type="button"
                className="ghost-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </header>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getSavedUser } from "./utility";
import { logout } from "./api/login";

const BRAND = "/app-brand.svg";

export default function Layout() {
  const user = getSavedUser();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="shell">
      Layout Screen
    </div>
  );
}

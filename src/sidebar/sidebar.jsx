import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUpload,
  FiSettings,
  FiFileText,
  FiActivity,
  FiHelpCircle,
  FiLogOut,
  FiMail
} from "react-icons/fi";
import "./sidebar.css";

<span className="material-symbols-outlined">dashboard</span>

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div>
          <div className="brand-title">ViljeTech</div>
          <div className="brand-subtitle">Email Agent</div>
        </div>
        <FiMail className="brand-icon" />
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className="menu-item">
          <FiHome />
          Dashboard
        </NavLink>

        <NavLink to="/upload" className="menu-item">
          <FiUpload />
          Upload
        </NavLink>

        <NavLink to="/generate" className="menu-item">
          <FiSettings />
          Generate
        </NavLink>

        <NavLink to="/review" className="menu-item">
          <FiFileText />
          Review
        </NavLink>

        <NavLink to="/logs" className="menu-item">
          <FiActivity />
          Logs
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <NavLink to="/support" className="menu-item support">
          <FiHelpCircle />
          Support
        </NavLink>

        <button className="logout" onClick={logout}>
          <FiLogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}

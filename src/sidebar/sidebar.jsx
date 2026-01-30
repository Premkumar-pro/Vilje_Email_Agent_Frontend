import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    // Prevent multiple clicks
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Simulate API call delay (replace with actual logout API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear session storage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      
      // Navigate to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* Brand Logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="material-symbols-outlined logo-icon">mail_lock</span>
          </div>
          <div className="brand-text">
            <div className="brand-title">ViljeTech</div>
            <div className="brand-subtitle">Email Agent</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-menu">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/upload" 
            className={({ isActive }) => 
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="material-symbols-outlined">cloud_upload</span>
            <span>Upload</span>
          </NavLink>

          <NavLink 
            to="/generate" 
            className={({ isActive }) => 
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            <span>Generate</span>
          </NavLink>

          {/* <NavLink 
            to="/result" 
            className={({ isActive }) => 
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="material-symbols-outlined">description</span>
            <span>Result</span>
          </NavLink> */}

          <NavLink 
            to="/logs" 
            className={({ isActive }) => 
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="material-symbols-outlined">monitor_heart</span>
            <span>Logs</span>
          </NavLink>
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer">
          <NavLink 
            to="/support" 
            className={({ isActive }) => 
              isActive ? "menu-item active support" : "menu-item support"
            }
          >
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </NavLink>

          <button 
            className={`logout ${isLoggingOut ? 'logout-loading' : ''}`}
            onClick={logout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="logout-text">Logout</span>
            <div className="logout-spinner"></div>
          </button>
        </div>
      </div>
    </aside>
  );
}
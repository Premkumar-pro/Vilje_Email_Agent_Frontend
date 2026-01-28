// import { getUserFromToken } from "../auth/api";

// export default function Dashboard() {
//   const user = getUserFromToken();

//   return (
//     <div className="dashboard">
//       <h1>
//         Hello, <strong>{user?.name}</strong>
//       </h1>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../auth/api";
import "../styles/dashboard.css";

// Mock API calls - Replace with actual API calls
// TODO: Replace these mock functions with actual API calls from backend

// Mock function to get dashboard stats
const fetchDashboardStats = async () => {
  // TODO: Replace with actual API call: GET /api/dashboard/stats
  return {
    totalRecipients: 1240,
    totalRecipientsChange: 5.2,
    lastEmailSent: "Oct 24, 2:00 PM",
    lastCampaignName: "Product Launch v2.1",
    pendingDrafts: 12,
    pendingDraftsStatus: "Requires AI review"
  };
};

// Mock function to get recent activities with pagination
const fetchRecentActivities = async (page = 1, limit = 3) => {
  // TODO: Replace with actual API call: GET /api/dashboard/activities?page=${page}&limit=${limit}
  const allActivities = [
    {
      id: 1,
      name: "Monthly Newsletter",
      status: "sent",
      date: "Oct 24, 2023",
      recipients: 850,
      icon: "newspaper",
      iconColor: "blue"
    },
    {
      id: 2,
      name: "Product Update",
      status: "drafting",
      date: "Oct 25, 2023",
      recipients: 240,
      icon: "update",
      iconColor: "amber"
    },
    {
      id: 3,
      name: "Welcome Sequence",
      status: "pending",
      date: "Oct 25, 2023",
      recipients: 150,
      icon: "waving_hand",
      iconColor: "purple"
    },
    {
      id: 4,
      name: "Weekly Digest",
      status: "sent",
      date: "Oct 23, 2023",
      recipients: 320,
      icon: "article",
      iconColor: "blue"
    },
    {
      id: 5,
      name: "Promotional Offer",
      status: "drafting",
      date: "Oct 26, 2023",
      recipients: 180,
      icon: "local_offer",
      iconColor: "amber"
    },
    {
      id: 6,
      name: "Survey Request",
      status: "pending",
      date: "Oct 26, 2023",
      recipients: 95,
      icon: "poll",
      iconColor: "purple"
    }
  ];

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const activities = allActivities.slice(startIndex, endIndex);
  
  return {
    activities,
    total: allActivities.length,
    page,
    totalPages: Math.ceil(allActivities.length / limit)
  };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [stats, setStats] = useState({
    totalRecipients: 0,
    totalRecipientsChange: 0,
    lastEmailSent: "",
    lastCampaignName: "",
    pendingDrafts: 0,
    pendingDraftsStatus: ""
  });
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    // Fetch user data
    const userData = getUserFromToken();
    setUser(userData);
    
    // Fetch dashboard data
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Load activities when page changes
    loadActivities(pagination.page);
  }, [pagination.page]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Load data from backend API
      const statsData = await fetchDashboardStats();
      setStats(statsData);
      
      const activitiesData = await fetchRecentActivities(1, 5);
      setActivities(activitiesData.activities);
      setPagination(prev => ({
        ...prev,
        total: activitiesData.total,
        totalPages: activitiesData.totalPages
      }));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // TODO: Add error handling UI
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (page) => {
    try {
      const data = await fetchRecentActivities(page, pagination.limit);
      setActivities(data.activities);
      setPagination(prev => ({
        ...prev,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages
      }));
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const handleNewCampaign = async () => {
    try {
      setCreatingCampaign(true);
      // TODO: Add any pre-upload logic if needed
      // For now, just navigate to upload page
      setTimeout(() => {
        navigate("/upload");
      }, 1000); // Simulate loading time
    } catch (error) {
      console.error("Error creating new campaign:", error);
      setCreatingCampaign(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <span className="status-badge sent">Sent</span>;
      case 'drafting':
        return <span className="status-badge drafting">Drafting</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };

  const getIconClass = (color) => {
    return `campaign-icon ${color}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {/* Page Header */}
        <header className="dashboard-header">
          <div className="dashboard-header-text">
            <h2>
              Welcome, <strong>{user?.name || "Admin"}</strong>
            </h2>
            <p>Manage your AI-powered bulk email campaigns efficiently.</p>
          </div>
          
          <button 
            className={`new-campaign-btn ${creatingCampaign ? 'loading' : ''}`}
            onClick={handleNewCampaign}
            disabled={creatingCampaign || loading}
          >
            {creatingCampaign ? (
              <>
                <span className="loading-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined btn-icon">add</span>
                New Campaign
              </>
            )}
          </button>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          {/* Total Recipients Card */}
          <div className="stat-card">
            <div className="stat-card-header">
              <p className="stat-card-title">Total Recipients</p>
              <span className="material-symbols-outlined stat-card-icon">group</span>
            </div>
            <div className="stat-card-content">
              <p className="stat-card-value">{loading ? "Loading..." : stats.totalRecipients.toLocaleString()}</p>
              {!loading && stats.totalRecipientsChange > 0 && (
                <p className="stat-card-trend">
                  <span className="material-symbols-outlined trend-icon">trending_up</span>
                  {stats.totalRecipientsChange}%
                </p>
              )}
            </div>
            {!loading && stats.totalRecipientsChange > 0 && (
              <p className="stat-card-subtitle">Increase from last month</p>
            )}
          </div>

          {/* Last Email Sent Card */}
          <div className="stat-card">
            <div className="stat-card-header">
              <p className="stat-card-title">Last Email Sent</p>
              <span className="material-symbols-outlined stat-card-icon">send</span>
            </div>
            <p className="stat-card-value">{loading ? "Loading..." : stats.lastEmailSent}</p>
            <p className="stat-card-subtitle">{loading ? "" : stats.lastCampaignName}</p>
          </div>

          {/* Pending Drafts Card */}
          <div className="stat-card">
            <div className="stat-card-header">
              <p className="stat-card-title">Pending Drafts</p>
              <span className="material-symbols-outlined stat-card-icon">edit_note</span>
            </div>
            <p className="stat-card-value">{loading ? "Loading..." : `${stats.pendingDrafts} Drafts`}</p>
            <p className="stat-card-subtitle">{loading ? "" : stats.pendingDraftsStatus}</p>
          </div>
        </section>

        {/* Recent Activity Table */}
        <section className="activity-section">
          <div className="activity-header">
            <h2>Recent Activity Overview</h2>
            <a href="/logs" className="view-all-link">View all</a>
          </div>
          
          <div className="activity-table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Recipients</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                      Loading activities...
                    </td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                      No activities found
                    </td>
                  </tr>
                ) : (
                  activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="campaign-cell">
                        <div className={getIconClass(activity.iconColor)}>
                          <span className="material-symbols-outlined">{activity.icon}</span>
                        </div>
                        <span className="campaign-name">{activity.name}</span>
                      </td>
                      <td>{getStatusBadge(activity.status)}</td>
                      <td className="date-cell">{activity.date}</td>
                      <td className="recipients-cell">{activity.recipients.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {activities.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} ViljeTech AI Systems. All rights reserved.</p>
          <div className="footer-links">
            <a href="/documentation" className="footer-link">Documentation</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
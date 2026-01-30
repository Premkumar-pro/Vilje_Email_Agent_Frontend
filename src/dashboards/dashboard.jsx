import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { getUserFromToken } from "../auth/api";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalRecipients: 0,
    lastEmailSent: "Never",
    lastCampaign: "No campaigns yet"
  });
  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFullView, setShowFullView] = useState(false);
  
  const token = sessionStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const itemsPerPage = 5;

  // Get user name from token
  useEffect(() => {
    const user = getUserFromToken();
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  // Fetch campaigns and calculate stats
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch(`${BASE_URL}/generate/campaigns`, {
          headers: { ...authHeader },
        });
        const data = await res.json();
        setCampaigns(data);
        
        // Calculate statistics from campaigns
        if (data && data.length > 0) {
          const totalRecipients = data.reduce((sum, campaign) => 
            sum + (campaign.total_recipients || 0), 0);
          
          // Find the most recent campaign
          const sortedCampaigns = [...data].sort((a, b) => 
            new Date(b.last_sent || b.created_at || 0) - 
            new Date(a.last_sent || a.created_at || 0)
          );
          
          const latestCampaign = sortedCampaigns[0];
          
          setStats({
            totalRecipients,
            lastEmailSent: latestCampaign.last_sent || latestCampaign.created_at || "Never",
            lastCampaign: latestCampaign.subject || "Latest Campaign"
          });
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  // Navigate to upload page
  const handleNewCampaign = () => {
    navigate("/upload");
  };

  // Calculate pagination
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = campaigns.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Never") return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        
        {pages}
        
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
        
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Welcome, {userName}</h2>
          <p className="dashboard-subtitle">Manage your AI-powered bulk email campaigns efficiently.</p>
        </div>
        <button className="new-campaign-btn" onClick={handleNewCampaign}>
          <span className="material-symbols-outlined">add</span>
          New Campaign
        </button>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <p className="stat-label">Total Recipients</p>
            <span className="stat-icon">group</span>
          </div>
          <div className="stat-content">
            <p className="stat-value">{loading ? "..." : stats.totalRecipients}</p>
            <p className="stat-trend">
              <span className="material-symbols-outlined">trending_up</span>
              5.2%
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <p className="stat-label">Last Email Sent</p>
            <span className="stat-icon">send</span>
          </div>
          <p className="stat-date">{formatDate(stats.lastEmailSent)}</p>
          <p className="stat-campaign">{stats.lastCampaign}</p>
        </div>
      </section>

      {/* Activity Table */}
      <section className="activity-section">
        <div className="activity-header">
          <h2 className="activity-title">Recent Activity Overview</h2>
          {campaigns.length > itemsPerPage && (
            <button 
              className="view-all-link"
              onClick={() => setShowFullView(true)}
            >
              View all ({campaigns.length})
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="loading-state">
            <span className="material-symbols-outlined">hourglass_empty</span>
            <p>Loading campaigns...</p>
          </div>
        ) : campaigns.length > 0 ? (
          <>
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
                  {currentCampaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <div className="campaign-info">
                          <div className={`campaign-icon ${
                            campaign.status === 'sent' ? 'newsletter' : 
                            campaign.status === 'draft' ? 'update' : 'default'
                          }`}>
                            <span className="material-symbols-outlined">
                              {campaign.status === 'sent' ? 'newspaper' : 
                              campaign.status === 'draft' ? 'edit_note' : 'mail'}
                            </span>
                          </div>
                          <span className="campaign-name">{campaign.subject}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          campaign.status?.toLowerCase() || 'pending'
                        }`}>
                          {campaign.status || 'Pending'}
                        </span>
                      </td>
                      <td className="activity-date">
                        {formatDate(campaign.last_sent || campaign.created_at)}
                      </td>
                      <td className="activity-recipients">
                        {campaign.total_recipients || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {renderPagination()}
          </>
        ) : (
          <div className="empty-state">
            <span className="material-symbols-outlined">inbox</span>
            <p>No campaigns yet. Click "New Campaign" to get started!</p>
          </div>
        )}
      </section>

      {/* Full View Modal */}
      {showFullView && (
        <div className="full-view-overlay" onClick={() => setShowFullView(false)}>
          <div className="full-view-container" onClick={(e) => e.stopPropagation()}>
            <div className="full-view-header">
              <h3 className="full-view-title">All Campaigns ({campaigns.length})</h3>
              <button 
                className="close-full-view"
                onClick={() => setShowFullView(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="full-view-content">
              <table className="full-view-table">
                <thead>
                  <tr>
                    <th>Campaign Name</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Recipients</th>
                    <th>Sent</th>
                    <th>Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <div className="campaign-info">
                          <div className={`campaign-icon ${
                            campaign.status === 'sent' ? 'newsletter' : 
                            campaign.status === 'draft' ? 'update' : 'default'
                          }`}>
                            <span className="material-symbols-outlined">
                              {campaign.status === 'sent' ? 'newspaper' : 
                              campaign.status === 'draft' ? 'edit_note' : 'mail'}
                            </span>
                          </div>
                          <span className="campaign-name">{campaign.subject}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${
                          campaign.status?.toLowerCase() || 'pending'
                        }`}>
                          {campaign.status || 'Pending'}
                        </span>
                      </td>
                      <td className="activity-date">
                        {formatDate(campaign.last_sent || campaign.created_at)}
                      </td>
                      <td className="activity-recipients">
                        {campaign.total_recipients || 0}
                      </td>
                      <td className="activity-recipients">
                        {campaign.sent_count || 0}
                      </td>
                      <td className="activity-recipients">
                        {campaign.failed_count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>© 2023 ViljeTech AI Systems. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Documentation</a>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
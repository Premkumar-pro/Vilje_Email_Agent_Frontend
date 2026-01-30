import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { getUserFromToken } from "../auth/api";
import "../styles/logs.css";

function Logs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");
  const [currentPage, setCurrentPage] = useState(1);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalEmails: 0,
    failureRate: 0,
  });
  
  const itemsPerPage = 5;
  const token = sessionStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Get user name from token
  useEffect(() => {
    const user = getUserFromToken();
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  // Fetch logs from backend (using campaigns data as logs)
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`${BASE_URL}/generate/campaigns`, {
          headers: { ...authHeader },
        });
        const data = await res.json();
        
        // Transform campaigns into logs format
        const campaignLogs = data.map(campaign => ({
          id: campaign.id,
          timestamp: campaign.last_sent || campaign.created_at,
          subject: campaign.subject,
          campaign_id: `CMP-${campaign.id?.toString().padStart(6, '0')}`,
          recipients: campaign.total_recipients || 0,
          status: campaign.status || 'sent',
          sent: campaign.sent_count || 0,
          failed: campaign.failed_count || 0
        }));
        
        setLogs(campaignLogs);
        setFilteredLogs(campaignLogs);
        
        // Calculate statistics
        if (campaignLogs.length > 0) {
          const total = campaignLogs.reduce((sum, log) => sum + (log.recipients || 0), 0);
          const failed = campaignLogs.reduce((sum, log) => sum + (log.failed || 0), 0);
          const failureRate = total > 0 ? ((failed / total) * 100).toFixed(1) : 0;
          
          setStats({
            totalEmails: total,
            failureRate: parseFloat(failureRate)
          });
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.campaign_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(log =>
        log.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffDate;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, logs]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle status filter click
  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? "all" : status);
  };

  // Handle date filter
  const handleDateFilter = (days) => {
    setDateFilter(days === dateFilter ? "all" : days);
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Add page numbers
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

    // Add last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className={`pagination-btn ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date/Time", "Subject", "Campaign ID", "Recipients", "Status", "Sent", "Failed"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => [
        `"${formatDate(log.timestamp)}"`,
        `"${log.subject || 'N/A'}"`,
        `"${log.campaign_id || 'N/A'}"`,
        log.recipients || 0,
        log.status || 'N/A',
        log.sent || 0,
        log.failed || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle preview/retry/cancel actions
  const handleAction = (log, action) => {
    switch(action) {
      case "preview":
        alert(`Preview campaign: ${log.subject}`);
        break;
      case "retry":
        if (confirm(`Retry failed campaign: ${log.subject}?`)) {
          alert("Retry functionality would be implemented here");
        }
        break;
      case "cancel":
        if (confirm(`Cancel pending campaign: ${log.subject}?`)) {
          alert("Cancel functionality would be implemented here");
        }
        break;
      default:
        break;
    }
  };

  // Get action button text based on status
  const getActionText = (status) => {
    switch(status?.toLowerCase()) {
      case "sent":
        return "Preview";
      case "failed":
        return "Retry";
      case "pending":
        return "Cancel";
      case "draft":
        return "Edit";
      default:
        return "View";
    }
  };

  return (
    <div className="logs-container">
      <div className="logs-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h2 className="page-title">Email Audit Logs</h2>
            <div className="user-welcome">Welcome, {userName}</div>
            <div className="stats-info">
              <div className="stat-item">
                <span className="material-symbols-outlined stat-icon">outbox</span>
                <span>Total Emails Sent: {stats.totalEmails.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="material-symbols-outlined stat-icon">error</span>
                <span>Failure Rate: {stats.failureRate}%</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="export-button" onClick={handleExportCSV}>
              <span className="material-symbols-outlined">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="filters-section">
          <div className="search-container">
            <label className="search-input-wrapper">
              <span className="search-icon">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                className="search-input"
                placeholder="Search by subject or campaign ID..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
          </div>
          
          <div className="filters-chips">
            <button 
              className={`filter-chip ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              <span>All Statuses</span>
              <span className="material-symbols-outlined">keyboard_arrow_down</span>
            </button>
            
            {["sent", "failed", "pending", "draft"].map(status => (
              <button
                key={status}
                className={`filter-chip ${statusFilter === status ? "active" : ""}`}
                onClick={() => handleStatusFilter(status)}
              >
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </button>
            ))}
            
            <button 
              className={`filter-chip ${dateFilter === "30" ? "active" : ""}`}
              onClick={() => handleDateFilter("30")}
            >
              <span className="material-symbols-outlined">calendar_today</span>
              <span>Last 30 Days</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <span className="material-symbols-outlined">hourglass_empty</span>
              <p>Loading audit logs...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <>
              <div className="table-wrapper">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th className="table-header">Date/Time</th>
                      <th className="table-header">Subject</th>
                      <th className="table-header">Campaign ID</th>
                      <th className="table-header">Recipients</th>
                      <th className="table-header">Status</th>
                      <th className="table-header action-header">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log) => (
                      <tr key={log.id} className="table-row">
                        <td className="table-cell date-cell">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="table-cell subject-cell">
                          <span className="subject-text">{log.subject || "No Subject"}</span>
                        </td>
                        <td className="table-cell campaign-cell">
                          {log.campaign_id}
                        </td>
                        <td className="table-cell recipients-cell">
                          {(log.recipients || 0).toLocaleString()}
                        </td>
                        <td className="table-cell">
                          <span className={`status-badge ${log.status?.toLowerCase() || "unknown"}`}>
                            <span className="status-dot"></span>
                            {log.status?.charAt(0).toUpperCase() + log.status?.slice(1) || "Unknown"}
                          </span>
                        </td>
                        <td className="table-cell action-cell">
                          <button 
                            className="action-button"
                            onClick={() => handleAction(log, log.status?.toLowerCase())}
                          >
                            {getActionText(log.status)}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <p className="pagination-info">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} results
                  </p>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn nav-btn"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    
                    {renderPagination()}
                    
                    <button
                      className="pagination-btn nav-btn"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span className="material-symbols-outlined">inbox</span>
              <p>No audit logs found</p>
              {searchTerm && (
                <p className="empty-subtext">Try adjusting your search filters</p>
              )}
            </div>
          )}
        </div>

        {/* Intelligence Section */}
        <div className="intelligence-section">
          <div className="intelligence-header">
            <span className="material-symbols-outlined intelligence-icon">auto_awesome</span>
            <h3 className="intelligence-title">Audit Intelligence</h3>
          </div>
          <p className="intelligence-text">
            This audit log is powered by the <strong>ViljeTech AI Email Framework</strong> 
            with OpenAI integration. All email campaigns are automatically logged and 
            analyzed for delivery performance and compliance monitoring.
          </p>
          <div className="intelligence-stats">
            <div className="intelligence-stat">
              <span className="material-symbols-outlined">bolt</span>
              <span>Real-time monitoring</span>
            </div>
            <div className="intelligence-stat">
              <span className="material-symbols-outlined">shield</span>
              <span>GDPR compliant</span>
            </div>
            <div className="intelligence-stat">
              <span className="material-symbols-outlined">insights</span>
              <span>AI-powered analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;
import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import "../styles/result.css";

export default function Result() {
  const [progress, setProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState("Preparing to send...");
  const [isSending, setIsSending] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [deliveryLog, setDeliveryLog] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState("Calculating...");

  // Load email data from sessionStorage
  const sendData = JSON.parse(sessionStorage.getItem("send_data") || "{}");
  const users = sendData.users || [];
  const totalMembers = users.length;
  const emailSubject = sendData.subject || "No subject";
  const emailBody = sendData.body || "";

  // Format time for log
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  // Add log entry
  const addLogEntry = (email, status, details = "") => {
    const timestamp = getCurrentTime();
    const newEntry = {
      email,
      status,
      timestamp,
      details
    };
    setDeliveryLog(prev => [newEntry, ...prev]);
  };

  // Calculate estimated time
  const calculateEstimatedTime = (sent, total) => {
    if (sent === 0) return "Calculating...";
    
    const remaining = total - sent;
    const averageTimePerEmail = 2000; // 2 seconds per email
    const estimatedSeconds = Math.round((remaining * averageTimePerEmail) / 1000);
    
    if (estimatedSeconds < 60) return `${estimatedSeconds} seconds`;
    if (estimatedSeconds < 3600) return `${Math.ceil(estimatedSeconds / 60)} minutes`;
    return `${Math.ceil(estimatedSeconds / 3600)} hours`;
  };

  // Function to send emails
  const sendEmails = async () => {
    if (!sendData.subject || !sendData.body || totalMembers === 0) {
      setStatus("No data to send.");
      setIsSending(false);
      return;
    }

    setStatus(`Starting to send ${totalMembers} emails...`);
    setPendingCount(totalMembers);

    for (let i = 0; i < users.length; i++) {
      // Check if paused
      while (isPaused) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Check if cancelled
      if (!isSending) break;

      const user = users[i];
      const currentSent = sentCount + failedCount;
      setStatus(`Sending to ${user.name || user.email} (${currentSent + 1}/${totalMembers})...`);

      try {
        // Add to log as sending
        addLogEntry(user.email, "Sending...", `Email to ${user.name || user.email}`);

        const res = await fetch(`${BASE_URL}/generate/send-emails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: sendData.subject,
            body: sendData.body.replace("{{name}}", user.name || ""),
            users: [user]
          }),
        });

        const result = await res.json();
        
        if (result.sent_count > 0) {
          setSentCount(prev => prev + 1);
          addLogEntry(user.email, "Sent", `Successfully delivered to ${user.name || user.email}`);
        } else {
          setFailedCount(prev => prev + 1);
          addLogEntry(user.email, "Failed", `Failed to deliver to ${user.email}`);
        }

      } catch (error) {
        console.error("Error sending email:", error);
        setFailedCount(prev => prev + 1);
        addLogEntry(user.email, "Failed", `Network error: ${error.message}`);
      }

      const currentProgress = Math.round(((i + 1) / totalMembers) * 100);
      setProgress(currentProgress);
      setPendingCount(totalMembers - (sentCount + failedCount + 1));
      
      // Update estimated time
      const estimated = calculateEstimatedTime(sentCount + failedCount + 1, totalMembers);
      setEstimatedTime(estimated);

      // Small delay to simulate realistic sending
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (isSending) {
      setStatus("All emails processed!");
      setIsSending(false);
    }
  };

  // Pause/Resume sending
  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      setStatus("Resuming sending...");
    } else {
      setIsPaused(true);
      setStatus("Paused - Click resume to continue");
    }
  };

  // Cancel sending
  const handleCancel = () => {
    setIsSending(false);
    setIsPaused(false);
    setStatus("Sending cancelled");
    addLogEntry("System", "Cancelled", "Campaign cancelled by user");
  };

  // View full report
  const handleViewReport = () => {
    // You can implement download or navigation to detailed report
    console.log("Delivery Report:", {
      total: totalMembers,
      sent: sentCount,
      failed: failedCount,
      pending: pendingCount,
      progress,
      logs: deliveryLog
    });
    alert("Report data logged to console. Implement download functionality here.");
  };

  // Initialize sending on component mount
  useEffect(() => {
    sendEmails();
    
    // Cleanup on unmount
    return () => {
      setIsSending(false);
    };
  }, []);

  // Update pending count
  useEffect(() => {
    setPendingCount(totalMembers - sentCount - failedCount);
  }, [sentCount, failedCount, totalMembers]);

  return (
    <div className="result-container">
      {/* Header */}
      <header className="result-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"></path>
              </svg>
            </div>
            <h2 className="header-title">ViljeTech Email Agent</h2>
          </div>
          <div className="admin-info">
            <span className="admin-label">Admin Dashboard</span>
            <div className="admin-avatar"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="result-main">
        <div className="content-wrapper">
          {/* Breadcrumbs */}
          <nav className="breadcrumbs">
            <a className="breadcrumb-item" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </a>
            <span className="breadcrumb-separator">/</span>
            <a className="breadcrumb-item" href="#">Campaigns</a>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Sending Status</span>
          </nav>

          {/* Status Card */}
          <div className="status-card">
            <div className="status-header">
              <div className="status-title-section">
                <div className="status-indicator">
                  <div className={`status-dot ${isSending ? 'pulsing' : 'completed'}`}></div>
                  <h1 className="status-title">Live Sending Status</h1>
                </div>
                <p className="campaign-info">
                  Campaign: "{emailSubject.length > 50 ? `${emailSubject.substring(0, 50)}...` : emailSubject}"
                </p>
              </div>
              
              <div className="status-actions">
                <button 
                  className={`action-button ${isPaused ? 'resume' : 'pause'}`}
                  onClick={handlePauseResume}
                  disabled={!isSending}
                >
                  <span className="material-symbols-outlined">
                    {isPaused ? 'play_circle' : 'pause_circle'}
                  </span>
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  className="action-button cancel"
                  onClick={handleCancel}
                  disabled={!isSending}
                >
                  <span className="material-symbols-outlined">cancel</span>
                  Cancel
                </button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Sending Process</span>
                <span className="progress-percentage">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="estimated-time">
                {isSending ? `Estimated time remaining: ${estimatedTime}` : 'Sending completed'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card sent">
                <div className="stat-header">
                  <span className="material-symbols-outlined stat-icon">check_circle</span>
                  <span className="stat-label">Emails Sent</span>
                </div>
                <div className="stat-value">{sentCount}</div>
                <p className="stat-description">Successfully delivered</p>
              </div>
              
              <div className="stat-card pending">
                <div className="stat-header">
                  <span className="material-symbols-outlined stat-icon">pending</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-value">{pendingCount}</div>
                <p className="stat-description">Queued for delivery</p>
              </div>
              
              <div className="stat-card failed">
                <div className="stat-header">
                  <span className="material-symbols-outlined stat-icon">error</span>
                  <span className="stat-label">Failed</span>
                </div>
                <div className="stat-value">{failedCount}</div>
                <p className="stat-description">Delivery issues detected</p>
              </div>
            </div>
          </div>

          {/* Delivery Log */}
          <div className="delivery-log">
            <div className="log-header">
              <h2 className="log-title">
                <span className="material-symbols-outlined log-icon">list_alt</span>
                Delivery Log (Live)
              </h2>
              <div className="auto-refresh-badge">
                AUTO-REFRESHING
              </div>
            </div>
            
            <div className="log-content">
              <table className="log-table">
                <thead>
                  <tr>
                    <th className="table-header">Recipient</th>
                    <th className="table-header">Status</th>
                    <th className="table-header timestamp-header">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryLog.length > 0 ? (
                    deliveryLog.map((log, index) => (
                      <tr key={index} className="log-row">
                        <td className="recipient-cell">{log.email}</td>
                        <td className="status-cell">
                          <span className={`status-badge ${log.status.toLowerCase().replace('...', '')}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="timestamp-cell">{log.timestamp}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="empty-log">
                        <span className="material-symbols-outlined">hourglass_empty</span>
                        <p>Waiting for sending to start...</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="log-footer">
              <button className="view-report-button" onClick={handleViewReport}>
                View Full Delivery Report
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="footer-info">
            <div className="security-info">
              <span className="material-symbols-outlined security-icon">verified_user</span>
              <span>Live monitoring enabled for compliance and delivery assurance</span>
            </div>
            <p className="disclaimer">
              The sending process is automated. You can pause or cancel the delivery at any time, 
              but emails already dispatched cannot be recalled.
            </p>
            <div className="status-message">
              <span className="material-symbols-outlined">info</span>
              <span>{status}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
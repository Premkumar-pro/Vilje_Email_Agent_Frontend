import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { getUserFromToken } from "../auth/api";
import "../styles/generate.css";

function Generate() {
  const [intent, setIntent] = useState("");
  const [tone, setTone] = useState("Professional");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [links, setLinks] = useState([{ label: "", url: "" }]);
  const [advancedOptions, setAdvancedOptions] = useState({
    concise: false,
    cta: true,
  });

  const [users, setUsers] = useState([]);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [isRecipientPanelOpen, setIsRecipientPanelOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const token = sessionStorage.getItem("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Get user name from token
  useEffect(() => {
    const user = getUserFromToken();
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  // Load recipients from Upload page (sessionStorage)
  useEffect(() => {
    const storedUsers = sessionStorage.getItem("users");
    const total = sessionStorage.getItem("total_members");

    if (storedUsers && total) {
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(parsedUsers);
      setTotalRecipients(Number(total));
    }
  }, []);

  // Add new link field
  const addLinkField = () => {
    setLinks([...links, { label: "", url: "" }]);
  };

  // Update link field
  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  // Toggle advanced option
  const toggleAdvancedOption = (option) => {
    setAdvancedOptions({
      ...advancedOptions,
      [option]: !advancedOptions[option],
    });
  };

  // Generate email
  const handleGenerate = async () => {
    if (!intent.trim()) {
      alert("Please enter email intent");
      return;
    }

    if (users.length === 0) {
      alert("Please upload recipient list first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/generate/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ 
          intent: intent.trim(), 
          tone,
          links: links.filter(link => link.url.trim() !== "").map(link => ({ 
            label: link.label, 
            url: link.url 
          })),
          options: advancedOptions
        }),
      });

      if (res.status === 401) {
        alert("Unauthorized! Please login again.");
        return;
      }

      const data = await res.json();
      setSubject(data.subject);
      setBody(data.email_body);
    } catch (err) {
      console.error("Generate email error:", err);
      alert("Error generating email");
    } finally {
      setLoading(false);
    }
  };

  // Regenerate email
  const handleRegenerate = async () => {
    if (!intent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/generate/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({ 
          intent: intent.trim(), 
          tone,
          links: links.filter(link => link.url.trim() !== "").map(link => ({ 
            label: link.label, 
            url: link.url 
          })),
          options: advancedOptions
        }),
      });

      const data = await res.json();
      setSubject(data.subject);
      setBody(data.email_body);
    } catch (err) {
      console.error("Regenerate email error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Copy email to clipboard
  const copyToClipboard = () => {
    if (!subject || !body) return;
    
    const emailText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(emailText)
      .then(() => {
        alert("Email copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  };

  // Save as template
  const handleSaveTemplate = () => {
    if (!subject || !body) {
      alert("Please generate an email first");
      return;
    }
    alert("Template saved successfully!");
  };

  // Send emails using stored recipients
  const handleSend = async () => {
    if (!subject || !body || users.length === 0) {
      alert("Missing subject, body, or recipients");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/generate/send-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({
          subject,
          body,
          users,
        }),
      });

      if (res.status === 401) {
        alert("Unauthorized! Please login again.");
        return;
      }

      const data = await res.json();
      setStatus(data);
      
      // Save campaign data to sessionStorage for Result page
      sessionStorage.setItem("send_data", JSON.stringify({
        subject,
        body,
        users,
        campaign_id: data.campaign_id
      }));
      
    } catch (err) {
      console.error("Send emails error:", err);
      alert("Error sending emails");
    } finally {
      setLoading(false);
    }
  };

  // Format email body for display
  const formatEmailBody = (text) => {
    if (!text) return "";
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <div className="generate-container">
      <div className="generate-layout">
        {/* Configuration Panel */}
        <aside className="config-panel">
          <div className="config-header">
            <h3 className="config-title">
              <span className="material-symbols-outlined config-icon">tune</span>
              Configuration
            </h3>
          </div>
          
          <div className="config-content">
            <label className="config-field">
              <span className="field-label">Email Intent</span>
              <textarea
                className="intent-input"
                placeholder="e.g., Announcement about the upcoming company vacation policy update..."
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                rows={5}
              />
            </label>

            <label className="config-field">
              <span className="field-label">Voice Tone</span>
              <select
                className="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option>Professional</option>
                <option>Friendly</option>
                <option>Urgent</option>
                <option>Inspirational</option>
                <option>Direct</option>
              </select>
            </label>

            {/* Advanced Options */}
            <div className="advanced-options">
              <span className="advanced-title">Advanced Options</span>
              <div className="options-list">
                <label className="option-checkbox">
                  <input
                    type="checkbox"
                    checked={advancedOptions.concise}
                    onChange={() => toggleAdvancedOption("concise")}
                  />
                  <span>Prefer concise messaging</span>
                </label>
                <label className="option-checkbox">
                  <input
                    type="checkbox"
                    checked={advancedOptions.cta}
                    onChange={() => toggleAdvancedOption("cta")}
                  />
                  <span>Include clear Call to Action</span>
                </label>
              </div>
            </div>

            {/* Links Section */}
            <div className="links-section">
              <span className="links-title">Add Links</span>
              <div className="links-list">
                {links.map((link, index) => (
                  <div key={index} className="link-input-group">
                    <input
                      type="text"
                      className="link-label-input"
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => updateLink(index, "label", e.target.value)}
                    />
                    <input
                      type="text"
                      className="link-url-input"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                    />
                  </div>
                ))}
                <button className="add-link-button" onClick={addLinkField}>
                  <span className="material-symbols-outlined">add_link</span>
                  Add another link
                </button>
              </div>
            </div>
          </div>

          <div className="generate-button-container">
            <button
              className="generate-button"
              onClick={handleGenerate}
              disabled={loading || !intent.trim() || users.length === 0}
            >
              <span className="material-symbols-outlined">auto_fix_high</span>
              {loading ? "Generating..." : "Generate Draft"}
            </button>
          </div>
        </aside>

        {/* Resize Handle */}
        <div className="resize-handle"></div>

        {/* Email Preview Panel */}
        <main className="preview-panel">
          <div className="preview-header">
            <div className="preview-title-section">
              <h4 className="preview-section-title">Preview Draft</h4>
              <div className="preview-status">
                <span className="status-dot"></span>
                <span className="status-text">
                  {subject ? "AI Generated • Just now" : "Awaiting Generation"}
                </span>
              </div>
            </div>
            
            {subject && (
              <div className="preview-actions">
                <button className="regenerate-button" onClick={handleRegenerate} disabled={loading}>
                  <span className="material-symbols-outlined">refresh</span>
                  Regenerate
                </button>
                <button className="icon-button" onClick={copyToClipboard} title="Copy">
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
                <button className="icon-button" title="Download">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
            )}
          </div>

          <div className="preview-content">
            {subject ? (
              <div className="email-preview">
                <div className="email-header">
                  <div className="email-field">
                    <span className="field-label">Subject:</span>
                    <input
                      type="text"
                      className="subject-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="email-field">
                    <span className="field-label">To:</span>
                    <div className="recipient-tags">
                      <span className="recipient-tag">
                        All Employees ({totalRecipients})
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="email-body">
                  <div dangerouslySetInnerHTML={{ __html: formatEmailBody(body) }} />
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <span className="material-symbols-outlined">draft</span>
                <p>Your generated email will appear here</p>
              </div>
            )}
          </div>

          <div className="preview-footer">
            <div className="footer-warning">
              <span className="material-symbols-outlined">warning</span>
              <p>Verify placeholders before sending.</p>
            </div>
            
            <div className="footer-actions">
              <button className="save-template-button" onClick={handleSaveTemplate}>
                Save as Template
              </button>
              <button
                className="approve-send-button"
                onClick={handleSend}
                disabled={loading || !subject || users.length === 0}
              >
                {loading ? "Sending..." : `Approve and Send (${totalRecipients})`}
              </button>
            </div>
          </div>
        </main>

        {/* Resize Handle */}
        <div className="resize-handle"></div>

        {/* Recipient Panel */}
        <aside className={`recipient-panel ${isRecipientPanelOpen ? "open" : "closed"}`}>
          <div className="recipient-header">
            <h3 className="recipient-title">
              <span className="material-symbols-outlined recipient-icon">group</span>
              Recipient List ({users.length})
            </h3>
            <button
              className="close-panel-button"
              onClick={() => setIsRecipientPanelOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="recipient-content">
            <table className="recipient-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} className={!user.is_valid ? "invalid-user" : ""}>
                    <td className="user-name">{user.name || "Anonymous"}</td>
                    <td className="user-email">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="recipient-footer">
            <p>Showing {users.length} of {users.length} recipients</p>
          </div>
        </aside>
      </div>

      {/* Recipient Panel Toggle Button (floating) */}
      <button
        className="recipient-toggle-button"
        onClick={() => setIsRecipientPanelOpen(!isRecipientPanelOpen)}
        title={isRecipientPanelOpen ? "Close recipient panel" : "Open recipient panel"}
      >
        <span className="material-symbols-outlined">
          {isRecipientPanelOpen ? "chevron_right" : "group"}
        </span>
      </button>

      {/* Campaign Status Modal */}
      {status && (
        <div className="status-modal-overlay" onClick={() => setStatus(null)}>
          <div className="status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="status-modal-header">
              <h3 className="status-modal-title">
                <span className="material-symbols-outlined">check_circle</span>
                Campaign Status
              </h3>
              <button className="close-modal-button" onClick={() => setStatus(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="status-modal-content">
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Campaign ID:</span>
                  <span className="status-value">{status.campaign_id}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Subject:</span>
                  <span className="status-value">{status.subject}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Total Recipients:</span>
                  <span className="status-value">{status.total}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Sent:</span>
                  <span className="status-value sent">{status.sent}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Failed:</span>
                  <span className="status-value failed">{status.failed}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className={`status-badge ${status.status?.toLowerCase()}`}>
                    {status.status}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="modal-button primary" onClick={() => setStatus(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Generate;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import "../styles/upload.css"; // Import the CSS file

export default function Upload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Load data from sessionStorage on page load
  useEffect(() => {
    const storedUsers = sessionStorage.getItem("users");
    const total = sessionStorage.getItem("total_members");

    if (storedUsers && total) {
      const users = JSON.parse(storedUsers);
      setResult({
        total_members: Number(total),
        users,
        valid_email_count: users.filter(u => u.is_valid).length,
        invalid_email_count: users.filter(u => !u.is_valid).length,
      });
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/upload/excel`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);

    // Persist data
    sessionStorage.setItem("total_members", data.total_members);
    sessionStorage.setItem("users", JSON.stringify(data.users));
  };

  // Clear List
  const handleClear = () => {
    sessionStorage.removeItem("users");
    sessionStorage.removeItem("total_members");
    setResult(null);
    setFile(null);
  };

  // Navigate to Generate
  const handleGeneratePage = () => {
    if (!result || !result.users || result.users.length === 0) {
      return alert("Please upload employees first");
    }
    navigate("/generate");
  };

  // Pagination logic
  const totalPages = result ? Math.ceil(result.users.length / itemsPerPage) : 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = result ? result.users.slice(startIndex, endIndex) : [];

  return (
    <div className="upload-container">
      {/* Page Heading */}
      <div className="page-heading">
        <h1 className="page-title">Upload Recipient List</h1>
        <p className="page-description">
          Import your Excel file to populate your mailing list. Our AI engine will automatically map 'Name' and 'Email' fields for you.
        </p>
      </div>

      <div className="grid-container">
        {/* Upload Zone */}
        <div className="upload-zone-container">
          <div className="upload-zone">
            <div className="upload-content">
              <span className="material-symbols-outlined upload-icon">cloud_upload</span>
              <p className="upload-text">Drag and drop your file here</p>
              <p className="upload-subtext">Supported formats: .xlsx (Max 10MB)</p>
            </div>
            <div className="file-input-container">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="file-input"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="file-input-label">
                Select File
              </label>
            </div>
            <button onClick={handleUpload} className="upload-button">
              Upload
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {result && (
          <div className="stats-container">
            <div className="stat-card total-recipients">
              <div className="stat-header">
                <span className="material-symbols-outlined stat-icon">group</span>
                <p className="stat-label">Total Recipients</p>
              </div>
              <p className="stat-value">{result.total_members}</p>
            </div>
            <div className="stat-card valid-emails">
              <div className="stat-header">
                <span className="material-symbols-outlined stat-icon">check_circle</span>
                <p className="stat-label">Valid Emails</p>
              </div>
              <p className="stat-value">{result.valid_email_count}</p>
            </div>
            <div className="stat-card invalid-emails">
              <div className="stat-header">
                <span className="material-symbols-outlined stat-icon">error</span>
                <p className="stat-label">Invalid/Missing</p>
              </div>
              <p className="stat-value">{result.invalid_email_count}</p>
            </div>
          </div>
        )}

        {/* Data Preview Table */}
        {result && (
          <div className="data-preview-container">
            <div className="preview-header">
              <h3 className="preview-title">Data Preview</h3>
              <div className="preview-actions">
                <button className="filter-button">
                  <span className="material-symbols-outlined filter-icon">filter_list</span>
                  Filter Errors
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email Address</th>
                    <th className="table-header">Status</th>
                    <th className="table-header actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr key={index} className="table-row">
                      <td className={`table-cell ${!user.name ? 'missing-name' : ''}`}>
                        {user.name || "Anonymous"}
                      </td>
                      <td className={`table-cell ${!user.is_valid ? 'invalid-email' : ''}`}>
                        {user.email}
                      </td>
                      <td className="table-cell">
                        <span className={`status-badge ${user.is_valid ? 'valid' : 'invalid'}`}>
                          <span className="status-dot"></span>
                          {user.is_valid ? "Valid" : !user.email.includes('@') ? "Missing '@'" : "Invalid Email"}
                        </span>
                      </td>
                      <td className="table-cell actions-cell">
                        <button className="edit-button">
                          <span className="material-symbols-outlined edit-icon">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination-container">
              <p className="pagination-info">
                Showing {startIndex + 1}-{Math.min(endIndex, result.users.length)} of {result.users.length} recipients
              </p>
              <div className="pagination-controls">
                <button 
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined pagination-icon">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <span className="material-symbols-outlined pagination-icon">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {result && (
        <div className="action-footer">
          <button onClick={handleClear} className="clear-button">
            Clear Entire List
          </button>
          <div className="action-buttons">
            <button className="save-draft-button">
              Save as Draft
            </button>
            <button onClick={handleGeneratePage} className="proceed-button">
              <span>Proceed to Email Agent</span>
              <span className="material-symbols-outlined arrow-icon">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
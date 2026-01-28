// export default function Upload() {
//   return <h2>Upload Page</h2>;
// }
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../auth/api";
import "../styles/upload.css";

// TODO: Replace these mock functions with actual API calls from backend

// Mock function to get upload stats
const fetchUploadStats = async () => {
  // TODO: Replace with actual API call: GET /api/upload/stats
  return {
    totalRecipients: 1250,
    validEmails: 1242,
    invalidEmails: 8
  };
};

// Mock function to get recipient data with pagination
const fetchRecipientData = async (page = 1, limit = 5) => {
  // TODO: Replace with actual API call: GET /api/upload/recipients?page=${page}&limit=${limit}
  const allRecipients = [
    {
      id: 1,
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      status: "valid",
      statusText: "Valid"
    },
    {
      id: 2,
      name: "Marcus Thorne",
      email: "marcus.thorne-example.com",
      status: "invalid",
      statusText: "Missing '@'"
    },
    {
      id: 3,
      name: "Anonymous",
      email: "support@techflow.io",
      status: "warning",
      statusText: "Missing Name"
    },
    {
      id: 4,
      name: "Elena Rodriguez",
      email: "elena.rod@provider.net",
      status: "valid",
      statusText: "Valid"
    },
    {
      id: 5,
      name: "David Smith",
      email: "dsmith@corp.com",
      status: "valid",
      statusText: "Valid"
    },
    {
      id: 6,
      name: "Jennifer Lee",
      email: "jennifer.lee@company.org",
      status: "valid",
      statusText: "Valid"
    },
    {
      id: 7,
      name: "Robert Johnson",
      email: "robert.johnson",
      status: "invalid",
      statusText: "Invalid Domain"
    },
    {
      id: 8,
      name: "Maria Garcia",
      email: "maria.garcia@business.com",
      status: "valid",
      statusText: "Valid"
    }
  ];

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const recipients = allRecipients.slice(startIndex, endIndex);
  
  return {
    recipients,
    total: allRecipients.length,
    page,
    totalPages: Math.ceil(allRecipients.length / limit),
    limit
  };
};

// Mock function to upload file
const uploadFile = async (file) => {
  // TODO: Replace with actual API call: POST /api/upload/file
  console.log("Uploading file:", file.name);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    message: "File uploaded successfully",
    fileName: file.name,
    fileSize: file.size
  };
};

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStats, setUploadStats] = useState({
    totalRecipients: 0,
    validEmails: 0,
    invalidEmails: 0
  });
  const [recipients, setRecipients] = useState([]);
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
    
    // Fetch upload data
    loadUploadData();
  }, []);

  useEffect(() => {
    // Load recipients when page changes
    loadRecipients(pagination.page);
  }, [pagination.page]);

  const loadUploadData = async () => {
    try {
      setLoading(true);
      const statsData = await fetchUploadStats();
      setUploadStats(statsData);
      
      const recipientsData = await fetchRecipientData(1, pagination.limit);
      setRecipients(recipientsData.recipients);
      setPagination({
        page: recipientsData.page,
        limit: recipientsData.limit,
        total: recipientsData.total,
        totalPages: recipientsData.totalPages
      });
    } catch (error) {
      console.error("Error loading upload data:", error);
      // TODO: Add error handling UI
    } finally {
      setLoading(false);
    }
  };

  const loadRecipients = async (page) => {
    try {
      const data = await fetchRecipientData(page, pagination.limit);
      setRecipients(data.recipients);
      setPagination(prev => ({
        ...prev,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages
      }));
    } catch (error) {
      console.error("Error loading recipients:", error);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFileUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    await processFileUpload(file);
  };

  const processFileUpload = async (file) => {
    try {
      setUploading(true);
      setSelectedFile(file);
      
      // Validate file type
      const validExtensions = ['.xlsx', '.csv'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (!validExtensions.includes(fileExtension)) {
        alert('Please upload only .xlsx or .csv files');
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('File size should be less than 10MB');
        setSelectedFile(null);
        return;
      }

      // Upload file to backend
      const uploadResult = await uploadFile(file);
      
      if (uploadResult.success) {
        // Reload data after successful upload
        await loadUploadData();
        alert('File uploaded successfully! Data has been processed.');
      } else {
        alert('Upload failed. Please try again.');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert('An error occurred during upload. Please try again.');
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClearList = () => {
    if (window.confirm("Are you sure you want to clear the entire recipient list? This action cannot be undone.")) {
      // TODO: Implement clear list API call
      console.log("Clearing recipient list...");
      setRecipients([]);
      setUploadStats({
        totalRecipients: 0,
        validEmails: 0,
        invalidEmails: 0
      });
      setPagination({
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 1
      });
      setSelectedFile(null);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft API call
    console.log("Saving draft...");
    alert('Draft saved successfully!');
  };

  const handleProceed = () => {
    // TODO: Add validation before proceeding
    if (recipients.length === 0) {
      alert('Please upload a file with recipient data first.');
      return;
    }
    
    navigate("/generate");
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  const handleEditRecipient = (recipientId) => {
    // TODO: Implement edit recipient functionality
    console.log("Editing recipient:", recipientId);
    // Open edit modal or navigate to edit page
  };

  const getStatusBadge = (status, statusText) => {
    switch (status) {
      case 'valid':
        return (
          <span className="status-badge valid">
            <span className="status-indicator"></span>
            {statusText}
          </span>
        );
      case 'invalid':
        return (
          <span className="status-badge invalid">
            <span className="status-indicator"></span>
            {statusText}
          </span>
        );
      case 'warning':
        return (
          <span className="status-badge warning">
            <span className="status-indicator"></span>
            {statusText}
          </span>
        );
      default:
        return (
          <span className="status-badge invalid">
            <span className="status-indicator"></span>
            {statusText}
          </span>
        );
    }
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        className="pagination-button"
        onClick={() => handlePageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
      >
        <span className="material-symbols-outlined pagination-icon">chevron_left</span>
      </button>
    );

    // Page number buttons
    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-button ${pagination.page === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        className="pagination-button"
        onClick={() => handlePageChange(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages}
      >
        <span className="material-symbols-outlined pagination-icon">chevron_right</span>
      </button>
    );

    return buttons;
  };

  return (
    <div className="upload">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="upload-content">
        {/* Breadcrumbs */}
        <nav className="upload-breadcrumbs">
          <a href="/dashboard" className="breadcrumb-link">Campaigns</a>
          <span className="breadcrumb-separator">/</span>
          <a href="#" className="breadcrumb-link">New Campaign</a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Recipient Upload</span>
        </nav>

        {/* Page Header */}
        <div className="upload-header">
          <h1>Upload Recipient List</h1>
          <p>
            Import your Excel or CSV file to populate your mailing list. 
            Our AI engine will automatically map 'Name' and 'Email' fields for you.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="upload-zone">
          <div 
            className={`upload-drop-area ${dragOver ? 'drag-over' : ''}`}
            onClick={handleFileSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              <span className="material-symbols-outlined">cloud_upload</span>
            </div>
            
            <div className="upload-instructions">
              <h3>Drag and drop your file here</h3>
              <p>Supported formats: .xlsx, .csv (Max 10MB)</p>
            </div>

            <button 
              className="upload-button"
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                handleFileSelect();
              }}
            >
              {uploading ? (
                <>
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined button-icon">upload</span>
                  Select File
                </>
              )}
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.csv"
              style={{ display: 'none' }}
            />
          </div>

          {/* File info display */}
          {selectedFile && (
            <div className="file-info">
              <p>Selected file: <span className="file-name">{selectedFile.name}</span></p>
              <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card total">
            <div className="stat-header">
              <span className="material-symbols-outlined stat-icon">group</span>
              <p className="stat-label">Total Recipients</p>
            </div>
            <p className="stat-value">{uploadStats.totalRecipients.toLocaleString()}</p>
          </div>

          <div className="stat-card valid">
            <div className="stat-header">
              <span className="material-symbols-outlined stat-icon">check_circle</span>
              <p className="stat-label">Valid Emails</p>
            </div>
            <p className="stat-value">{uploadStats.validEmails.toLocaleString()}</p>
          </div>

          <div className="stat-card invalid">
            <div className="stat-header">
              <span className="material-symbols-outlined stat-icon">error</span>
              <p className="stat-label">Invalid/Missing</p>
            </div>
            <p className="stat-value">{uploadStats.invalidEmails.toLocaleString()}</p>
          </div>
        </div>

        {/* Data Preview Table */}
        <div className="data-preview">
          <div className="preview-header">
            <h3>Data Preview</h3>
            <div className="preview-actions">
              <button className="filter-button">
                <span className="material-symbols-outlined filter-icon">filter_list</span>
                Filter Errors
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      Loading data...
                    </td>
                  </tr>
                ) : recipients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      <span className="material-symbols-outlined empty-icon">upload_file</span>
                      <h4>No data available</h4>
                      <p>Upload a file to see recipient data preview</p>
                    </td>
                  </tr>
                ) : (
                  recipients.map((recipient) => (
                    <tr key={recipient.id}>
                      <td className={`name-cell ${recipient.status === 'warning' ? 'missing' : ''}`}>
                        {recipient.name}
                      </td>
                      <td className={`email-cell ${recipient.status === 'invalid' ? 'invalid' : ''}`}>
                        {recipient.email}
                      </td>
                      <td>
                        {getStatusBadge(recipient.status, recipient.statusText)}
                      </td>
                      <td>
                        <button 
                          className="action-button"
                          onClick={() => handleEditRecipient(recipient.id)}
                          title="Edit recipient"
                        >
                          <span className="material-symbols-outlined action-icon">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {recipients.length > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} recipients
              </div>
              <div className="pagination-controls">
                {getPaginationButtons()}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="action-footer">
          <button className="clear-button" onClick={handleClearList}>
            Clear Entire List
          </button>
          
          <div className="action-buttons">
            <button className="save-button" onClick={handleSaveDraft}>
              Save as Draft
            </button>
            <button 
              className="proceed-button"
              onClick={handleProceed}
              disabled={recipients.length === 0}
            >
              Proceed to Email Agent
              <span className="material-symbols-outlined proceed-icon">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="upload-footer">
          <p>© {new Date().getFullYear()} ViljeTech AI. Admin Dashboard v2.4.1</p>
        </footer>
      </div>
    </div>
  );
}
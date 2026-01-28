import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserFromToken } from "../auth/api";
import "../styles/review.css";

// TODO: Replace these mock functions with actual API calls from backend

// Mock function to get review data
const fetchReviewData = async () => {
  // TODO: Replace with actual API call: GET /api/review/data
  return {
    progress: 71,
    currentStep: 5,
    totalSteps: 7,
    recipients: 30,
    segment: "Active Subscribers",
    email: {
      subject: "Exclusive Update: New AI Features arriving in ViljeTech",
      body: `Dear User,

We are thrilled to share some exciting news regarding the evolution of ViljeTech. Our AI engineering team has been hard at work developing a new suite of features designed to streamline your email workflow like never before.

Key updates include:
• Automated follow-up logic based on sentiment analysis
• Predictive scheduling for optimal open rates
• Native integration with your existing CRM

We would love to get your feedback on these new capabilities. Please let us know if you'd like an early-access preview.

Best regards,
The ViljeTech Team`,
      status: "ready",
      lastModified: new Date().toISOString()
    }
  };
};

// Mock function to send test email
const sendTestEmail = async (emailData) => {
  // TODO: Replace with actual API call: POST /api/review/test
  console.log("Sending test email:", emailData);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    message: "Test email sent successfully to admin@viljetech.com",
    sentAt: new Date().toISOString()
  };
};

// Mock function to approve and send email
const approveAndSend = async (emailData, recipients) => {
  // TODO: Replace with actual API call: POST /api/review/approve
  console.log("Approving and sending email to", recipients, "recipients:", emailData);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    success: true,
    message: `Email successfully queued for delivery to ${recipients} recipients`,
    campaignId: "campaign_" + Date.now(),
    queuedAt: new Date().toISOString(),
    estimatedDelivery: "Within 5 minutes"
  };
};

export default function Review() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [reviewData, setReviewData] = useState({
    progress: 0,
    currentStep: 0,
    totalSteps: 0,
    recipients: 0,
    segment: "",
    email: {
      subject: "",
      body: ""
    }
  });
  
  const [email, setEmail] = useState({
    subject: "",
    body: ""
  });

  useEffect(() => {
    // Load review data
    loadReviewData();
    
    // Get user from token
    const userData = getUserFromToken();
    setUser(userData);
  }, []);

  useEffect(() => {
    // Update email state when review data loads
    if (reviewData.email.subject) {
      setEmail({
        subject: reviewData.email.subject,
        body: reviewData.email.body
      });
    }
  }, [reviewData]);

  const loadReviewData = async () => {
    try {
      setLoading(true);
      const data = await fetchReviewData();
      setReviewData(data);
      setEmail({
        subject: data.email.subject,
        body: data.email.body
      });
    } catch (error) {
      console.error("Error loading review data:", error);
      // TODO: Add error handling UI
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (field, value) => {
    setEmail(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendTest = async () => {
    try {
      setSendingTest(true);
      
      const result = await sendTestEmail(email);
      
      if (result.success) {
        // TODO: Add success notification
        alert(result.message);
      } else {
        // TODO: Add error notification
        alert("Failed to send test email. Please try again.");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      alert("An error occurred while sending test email.");
    } finally {
      setSendingTest(false);
    }
  };

  const handleBackToTemplate = () => {
    // Navigate back to generate page
    navigate("/generate");
  };

  const handleApproveClick = () => {
    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmApprove = async () => {
    try {
      setApproving(true);
      setShowConfirmModal(false);
      
      const result = await approveAndSend(email, reviewData.recipients);
      
      if (result.success) {
        // TODO: Add success notification
        alert(result.message);
        
        // Navigate to logs or campaigns page
        console.log("Campaign created:", result.campaignId);
        
        // Redirect to logs page after successful send
        setTimeout(() => {
          navigate("/logs");
        }, 1000);
      } else {
        // TODO: Add error notification
        alert("Failed to approve and send email. Please try again.");
      }
    } catch (error) {
      console.error("Error approving email:", error);
      alert("An error occurred while approving email.");
    } finally {
      setApproving(false);
    }
  };

  const handleCancelApprove = () => {
    setShowConfirmModal(false);
  };

  const handleFormatClick = (formatType) => {
    // TODO: Implement text formatting
    console.log("Formatting:", formatType);
    
    // This would typically integrate with a rich text editor
    switch (formatType) {
      case 'bold':
        alert("Bold formatting would be implemented with a rich text editor");
        break;
      case 'italic':
        alert("Italic formatting would be implemented with a rich text editor");
        break;
      case 'link':
        const url = prompt("Enter URL:");
        if (url) {
          alert(`Link to ${url} would be inserted`);
        }
        break;
      case 'list':
        alert("Bullet list would be inserted");
        break;
      case 'image':
        alert("Image upload dialog would open");
        break;
      default:
        break;
    }
  };

  const formatBodyWithBullets = (text) => {
    // Convert bullet points to list items
    return text.split('\n').map((line, index) => {
      if (line.startsWith('• ')) {
        return <li key={index}>{line.substring(2)}</li>;
      }
      return <p key={index}>{line}</p>;
    });
  };

  const handlePreviewMode = () => {
    // Toggle between edit and preview mode
    // TODO: Implement preview mode toggle
    console.log("Toggle preview mode");
  };

  return (
    <div className="review">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Review Page...</div>
        </div>
      )}

      <div className="review-content">
        {/* Breadcrumbs */}
        <nav className="review-breadcrumbs">
          <a href="/dashboard" className="breadcrumb-link">
            <span className="material-symbols-outlined breadcrumb-icon">dashboard</span>
            Dashboard
          </a>
          <span className="breadcrumb-separator">/</span>
          <a href="#" className="breadcrumb-link">Campaigns</a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Final Review</span>
        </nav>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-header">
            <div>
              <h3 className="progress-title">Step {reviewData.currentStep} of {reviewData.totalSteps}: Review & Approval</h3>
              <p className="progress-subtitle">Review the AI-generated draft for your segment.</p>
            </div>
            <div className="progress-percentage">{reviewData.progress}% Complete</div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${reviewData.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Page Title */}
        <div className="page-title">
          <h1>Review & Approval</h1>
          <p>Check the content before we dispatch the emails to your audience.</p>
        </div>

        {/* Warning Banner */}
        <div className="warning-banner">
          <div className="warning-icon">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div className="warning-content">
            <p className="warning-title">Ready to Broadcast</p>
            <p className="warning-message">
              This email will be sent to <strong>{reviewData.recipients} recipients</strong> in the{" "}
              <span className="warning-highlight" title={reviewData.segment}>
                {reviewData.segment}
              </span>{" "}
              segment.
            </p>
          </div>
        </div>

        {/* Email Editor Card */}
        <div className="email-editor">
          {/* Email Header */}
          <div className="email-header">
            <label className="header-label">Email Subject Line</label>
            <input
              type="text"
              className="subject-input"
              placeholder="Subject Line..."
              value={email.subject}
              onChange={(e) => handleEmailChange('subject', e.target.value)}
              disabled={approving}
            />
          </div>

          {/* Email Body */}
          <div className="email-body">
            <label className="body-label">Message Body</label>
            <div className="editor-container">
              {/* Editor Toolbar */}
              <div className="editor-toolbar">
                <button 
                  className="toolbar-button" 
                  onClick={() => handleFormatClick('bold')}
                  title="Bold"
                >
                  <span className="material-symbols-outlined">format_bold</span>
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => handleFormatClick('italic')}
                  title="Italic"
                >
                  <span className="material-symbols-outlined">format_italic</span>
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => handleFormatClick('link')}
                  title="Insert Link"
                >
                  <span className="material-symbols-outlined">link</span>
                </button>
                <div className="toolbar-separator"></div>
                <button 
                  className="toolbar-button" 
                  onClick={() => handleFormatClick('list')}
                  title="Bulleted List"
                >
                  <span className="material-symbols-outlined">format_list_bulleted</span>
                </button>
                <button 
                  className="toolbar-button" 
                  onClick={() => handleFormatClick('image')}
                  title="Insert Image"
                >
                  <span className="material-symbols-outlined">image</span>
                </button>
              </div>

              {/* Editor Textarea */}
              <textarea
                className="editor-textarea"
                placeholder="Write your email content here..."
                value={email.body}
                onChange={(e) => handleEmailChange('body', e.target.value)}
                spellCheck="false"
                disabled={approving}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="action-bar">
            <div className="action-left">
              <button 
                className="test-button"
                onClick={handleSendTest}
                disabled={sendingTest || approving}
              >
                {sendingTest ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined test-icon">send_and_archive</span>
                    Send Test Email
                  </>
                )}
              </button>
              
              <button 
                className="template-button"
                onClick={handleBackToTemplate}
                disabled={approving}
              >
                <span className="material-symbols-outlined template-icon">edit</span>
                Back to Template
              </button>
            </div>
            
            <div className="action-right">
              <button 
                className="approve-button"
                onClick={handleApproveClick}
                disabled={approving || !email.subject.trim() || !email.body.trim()}
              >
                {approving ? (
                  <>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined approve-icon">rocket_launch</span>
                    Approve & Send to {reviewData.recipients} Recipients
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="security-footer">
          <div className="security-note">
            <span className="material-symbols-outlined security-icon">verified_user</span>
            <span>Admin-only action required for bulk distribution</span>
          </div>
          <p className="security-disclaimer">
            By clicking "Approve & Send", you acknowledge that this email will be immediately queued for delivery. This action cannot be undone.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-icon">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="modal-title">Confirm Bulk Send</h3>
              <p className="modal-message">
                You are about to send this email to{" "}
                <strong className="modal-highlight">{reviewData.recipients} active subscribers</strong>. 
                Are you sure the content is correct?
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-button cancel"
                onClick={handleCancelApprove}
                disabled={approving}
              >
                CANCEL
              </button>
              <button 
                className="modal-button confirm"
                onClick={handleConfirmApprove}
                disabled={approving}
              >
                {approving ? (
                  <>
                    <div className="loading-spinner" style={{ 
                      width: '16px', 
                      height: '16px', 
                      display: 'inline-block',
                      marginRight: '8px',
                      verticalAlign: 'middle'
                    }}></div>
                    SENDING...
                  </>
                ) : (
                  "YES, SEND NOW"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
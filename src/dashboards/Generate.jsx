import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../auth/api";
import "../styles/generate.css";

// TODO: Replace these mock functions with actual API calls from backend

// Mock function to get user data
const fetchUserData = async () => {
  // TODO: Replace with actual API call: GET /api/user/profile
  return {
    name: "Alex Admin",
    email: "alex@viljetech.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxT8pBUYd8voHCL1TUrKZHwwqENTgc1yjZQIWGF9663HcSL1rL-dzXcRlBLfVD1T4obmX9gL5S1pL5snMRQQcLoaiDxZeFu7hz6LappqCaYPo9sabgQURXcVQ0g7cwbgMqHVDPNCjNomUKKzmp6X84xjFPbj_kjrlsDnUjARt85fu3MnZFrjHLxarfI5HjKVS8W_KoJeTJdEenwD2-gsJz1V0wJzU5n4DnNGqQeGB8nmxnr2oGFBzuwhz3C4FXDOBt550rJlwsLQ"
  };
};

// Mock function to get AI configuration
const fetchAIConfig = async () => {
  // TODO: Replace with actual API call: GET /api/ai/config
  return {
    emailIntent: "Announcement about the upcoming company vacation policy update for the summer of 2024. Include key dates and link to the portal.",
    voiceTone: "Professional",
    conciseMessaging: true,
    includeCTA: true,
    recentDrafts: [
      { id: 1, subject: "Monthly Newsletter - October 2023", date: "2023-10-25" },
      { id: 2, subject: "Product Update v2.1", date: "2023-10-24" },
      { id: 3, subject: "Welcome to ViljeTech", date: "2023-10-23" }
    ]
  };
};

// Mock function to generate email
const generateEmail = async (config) => {
  // TODO: Replace with actual API call: POST /api/ai/generate
  console.log("Generating email with config:", config);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    success: true,
    email: {
      subject: "Update: Upcoming Changes to Company Vacation Policy",
      recipient: "All Employees {{all_employees}}",
      body: `
Dear Team,

We are excited to share some updates regarding our company vacation policy as we approach the summer season. At ViljeTech, we believe in the importance of work-life balance and want to ensure everyone has the opportunity to recharge.

Starting July 1st, 2024, the following updates will take effect:

• Increased flexibility for 'Summer Fridays' throughout August.
• Simplified request process via the new ViljeTech Admin Portal.
• New rollover provisions for unused personal time.

Please take a moment to review the full policy documentation available on the internal portal. If you have any questions, feel free to reach out to the HR team.

Best regards,
The ViljeTech Leadership Team
      `.trim(),
      generatedAt: new Date().toISOString(),
      tokensUsed: 245,
      generationTime: 2.8
    }
  };
};

// Mock function to insert into campaign
const insertIntoCampaign = async (emailData) => {
  // TODO: Replace with actual API call: POST /api/campaigns/insert
  console.log("Inserting email into campaign:", emailData);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    campaignId: "campaign_" + Date.now(),
    message: "Email successfully inserted into campaign"
  };
};

export default function Generate() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({
    emailIntent: "",
    voiceTone: "Professional",
    conciseMessaging: false,
    includeCTA: true,
    advancedOptionsExpanded: false
  });
  
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [generationStats, setGenerationStats] = useState({
    tokensUsed: 0,
    generationTime: 0
  });

  useEffect(() => {
    // Load initial data
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Get user from token first
      const tokenUser = getUserFromToken();
      if (tokenUser) {
        setUser(tokenUser);
      }
      
      // Fetch additional user data from API
      const userData = await fetchUserData();
      setUser(prev => ({ ...prev, ...userData }));
      
      // Fetch AI configuration
      const aiConfig = await fetchAIConfig();
      setConfig({
        emailIntent: aiConfig.emailIntent,
        voiceTone: aiConfig.voiceTone,
        conciseMessaging: aiConfig.conciseMessaging,
        includeCTA: aiConfig.includeCTA,
        advancedOptionsExpanded: false
      });
      
      setRecentDrafts(aiConfig.recentDrafts);
      
      // Generate initial email
      await handleGenerate();
      
    } catch (error) {
      console.error("Error loading initial data:", error);
      // TODO: Add error handling UI
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      
      const result = await generateEmail(config);
      
      if (result.success) {
        setGeneratedEmail(result.email);
        setGenerationStats({
          tokensUsed: result.email.tokensUsed,
          generationTime: result.email.generationTime
        });
        
        // TODO: Add success notification
        console.log("Email generated successfully!");
      } else {
        // TODO: Add error notification
        console.error("Failed to generate email");
      }
    } catch (error) {
      console.error("Error generating email:", error);
      // TODO: Add error notification
    } finally {
      setGenerating(false);
    }
  };

  const handleInsertIntoCampaign = async () => {
    if (!generatedEmail) {
      alert("Please generate an email first");
      return;
    }
    
    try {
      setInserting(true);
      
      const result = await insertIntoCampaign(generatedEmail);
      
      if (result.success) {
        // TODO: Add success notification
        alert("Email successfully inserted into campaign!");
        
        // Navigate to campaigns page or show success message
        console.log("Inserted into campaign:", result.campaignId);
      } else {
        // TODO: Add error notification
        alert("Failed to insert email into campaign");
      }
    } catch (error) {
      console.error("Error inserting into campaign:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setInserting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedEmail) return;
    
    const textToCopy = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      // TODO: Add success notification
      alert("Email copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    if (!generatedEmail) return;
    
    const blob = new Blob([
      `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-draft-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewProject = () => {
    // Reset form for new project
    setConfig({
      emailIntent: "",
      voiceTone: "Professional",
      conciseMessaging: false,
      includeCTA: true,
      advancedOptionsExpanded: false
    });
    setGeneratedEmail(null);
    
    // TODO: Add confirmation dialog
    console.log("Starting new project...");
  };

  const handleRecentDrafts = () => {
    // TODO: Implement recent drafts modal or page
    console.log("Opening recent drafts...");
    // This could open a modal or navigate to drafts page
  };

  const toggleAdvancedOptions = () => {
    setConfig(prev => ({
      ...prev,
      advancedOptionsExpanded: !prev.advancedOptionsExpanded
    }));
  };

  const voiceToneOptions = [
    "Professional",
    "Friendly",
    "Urgent",
    "Inspirational",
    "Direct",
    "Casual",
    "Formal"
  ];

  return (
    <div className="generate">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading AI Generator...</div>
        </div>
      )}

      <div className="generate-content">
        {/* Main Header */}
        <header className="generate-header">
          <div className="header-left">
            <h2>AI Email Generator</h2>
            <p>Draft AI-powered bulk emails with specific tones and intents.</p>
          </div>
          
          <div className="header-right">
            <button className="header-button" onClick={handleRecentDrafts}>
              <span className="material-symbols-outlined button-icon">history</span>
              Recent Drafts
            </button>
            
            <button className="new-project-button" onClick={handleNewProject}>
              <span className="material-symbols-outlined button-icon">add</span>
              New Project
            </button>
          </div>
        </header>

        {/* Split View Layout */}
        <div className="split-view">
          {/* Left Configuration Panel */}
          <section className="config-panel">
            <div className="panel-header">
              <h3>
                <span className="material-symbols-outlined panel-icon">tune</span>
                Configuration
              </h3>
              <p>Define the scope and style for the AI to follow.</p>
            </div>

            <div className="config-form">
              {/* Email Intent */}
              <div className="form-group">
                <label className="form-label">Email Intent</label>
                <textarea
                  className="config-textarea"
                  placeholder="e.g., Announcement about the upcoming company vacation policy update for the summer of 2024. Include key dates and link to the portal."
                  value={config.emailIntent}
                  onChange={(e) => handleConfigChange('emailIntent', e.target.value)}
                  disabled={generating}
                />
              </div>

              {/* Voice Tone */}
              <div className="form-group">
                <label className="form-label">Voice Tone</label>
                <select
                  className="config-select"
                  value={config.voiceTone}
                  onChange={(e) => handleConfigChange('voiceTone', e.target.value)}
                  disabled={generating}
                >
                  {voiceToneOptions.map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>

              {/* Advanced Options */}
              <div className={`advanced-options ${config.advancedOptionsExpanded ? 'expanded' : ''}`}>
                <div className="options-header" onClick={toggleAdvancedOptions}>
                  <span>Advanced Options</span>
                  <span className="material-symbols-outlined options-icon">expand_more</span>
                </div>
                
                {config.advancedOptionsExpanded && (
                  <div className="options-content">
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="shorten"
                        className="checkbox-input"
                        checked={config.conciseMessaging}
                        onChange={(e) => handleConfigChange('conciseMessaging', e.target.checked)}
                        disabled={generating}
                      />
                      <label htmlFor="shorten" className="checkbox-label">
                        Prefer concise messaging
                      </label>
                    </div>
                    
                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="cta"
                        className="checkbox-input"
                        checked={config.includeCTA}
                        onChange={(e) => handleConfigChange('includeCTA', e.target.checked)}
                        disabled={generating}
                      />
                      <label htmlFor="cta" className="checkbox-label">
                        Include clear Call to Action
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                className="generate-button"
                onClick={handleGenerate}
                disabled={generating || !config.emailIntent.trim()}
              >
                {generating ? (
                  <>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined generate-icon">auto_fix_high</span>
                    Generate Draft
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Right Preview Pane */}
          <section className="preview-pane">
            <div className="preview-container">
              {/* Toolbar */}
              <div className="preview-toolbar">
                <h4>Preview Draft</h4>
                
                <div className="toolbar-actions">
                  <button 
                    className="toolbar-button" 
                    onClick={handleCopyToClipboard}
                    title="Copy to Clipboard"
                    disabled={!generatedEmail}
                  >
                    <span className="material-symbols-outlined toolbar-icon">content_copy</span>
                  </button>
                  
                  <button 
                    className="toolbar-button" 
                    onClick={handleDownload}
                    title="Download as Template"
                    disabled={!generatedEmail}
                  >
                    <span className="material-symbols-outlined toolbar-icon">download</span>
                  </button>
                  
                  <button 
                    className="insert-button"
                    onClick={handleInsertIntoCampaign}
                    disabled={inserting || !generatedEmail}
                  >
                    {inserting ? (
                      <>
                        <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                        Inserting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined insert-icon">send</span>
                        Insert into Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Email Preview */}
              {generatedEmail ? (
                <div className="email-preview">
                  {/* Email Header */}
                  <div className="email-header">
                    <div className="header-field">
                      <span className="field-label">Subject:</span>
                      <input
                        type="text"
                        className="subject-input"
                        value={generatedEmail.subject}
                        onChange={(e) => setGeneratedEmail(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Email subject..."
                      />
                    </div>
                    
                    <div className="header-field">
                      <span className="field-label">To:</span>
                      <span className="recipient-tag">
                        <span className="material-symbols-outlined recipient-icon">group</span>
                        {generatedEmail.recipient}
                      </span>
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="email-body">
                    <div className="email-content">
                      {generatedEmail.body.split('\n').map((paragraph, index) => {
                        if (paragraph.trim() === '') return <br key={index} />;
                        
                        if (paragraph.startsWith('• ')) {
                          return (
                            <ul key={index}>
                              <li>{paragraph.substring(2)}</li>
                            </ul>
                          );
                        }
                        
                        return <p key={index}>{paragraph}</p>;
                      })}
                    </div>

                    {/* Footer Actions */}
                    <div className="email-footer">
                      <button className="footer-button">
                        <span className="material-symbols-outlined footer-icon">edit</span>
                        Edit Body
                      </button>
                      
                      <button 
                        className="footer-button"
                        onClick={() => handleGenerate()} // Regenerate with same config
                      >
                        <span className="material-symbols-outlined footer-icon">refresh</span>
                        Regenerate Section
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="material-symbols-outlined empty-icon">drafts</span>
                  <h4>No Email Generated Yet</h4>
                  <p>Configure the AI settings and click "Generate Draft" to create your first email.</p>
                </div>
              )}

              {/* Generation Stats */}
              {generatedEmail && generationStats.tokensUsed > 0 && (
                <div className="disclaimer">
                  <span className="material-symbols-outlined disclaimer-icon">info</span>
                  <p>
                    Generated in {generationStats.generationTime}s • {generationStats.tokensUsed} tokens • 
                    AI can make mistakes. Please check important info before sending.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
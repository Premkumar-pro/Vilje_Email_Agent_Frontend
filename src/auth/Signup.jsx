// import { useState } from "react";
// import { signup} from "./api";
// import { useNavigate } from "react-router-dom";

// export default function Signup() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = await signup({ name, email, password });
//     if (data.access_token) {
//       sessionStorage.setItem("token", data.access_token);
//       navigate("/dashboard");
//     } else {
//       alert(data.detail || "Signup failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Sign Up</h2>
//       <form onSubmit={handleSubmit}>
//         <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
//         <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//         <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         <button type="submit">Sign Up</button>
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import { signup } from "./api";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!agreeTerms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await signup({ name, email, password });
      if (data.access_token) {
        sessionStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      } else {
        setError(data.detail || "Signup failed. Please try after some time.");
      }
    } catch (err) {
      setError("Signup failed. Please try after some time.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      {/* Top Navigation Bar - Only for auth pages */}
      <header className="auth-header">
        <div className="header-left">
          <div className="logo-container">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="brand-name">ViljeTech</h2>
        </div>
        <button className="support-btn">
          <span>Support</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="auth-main">
        <div className="auth-container">
          {/* Headline Section */}
          <div className="auth-header-section">
            <div className="auth-icon-container">
              <span className="material-symbols-outlined auth-icon">person_add</span>
            </div>
            <h1 className="auth-title">Create Admin Account</h1>
            <p className="auth-subtitle">Register to access the AI email workflow management system</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <div className="error-container">
                <span className="material-symbols-outlined error-icon">error</span>
                <p className="error-text">{error}</p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Work Email */}
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input
                className="form-input"
                placeholder="name@viljetech.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  className="form-input"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="8"
                  disabled={isLoading}
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined toggle-icon">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="password-hint">Must be at least 8 characters</p>
            </div>

            {/* Terms Agreement */}
            <div className="checkbox-group">
              <input
                className="checkbox-input"
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
              />
              <label className="terms-checkbox-label" htmlFor="agreeTerms">
                I agree to the{" "}
                <a className="terms-link" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="terms-link" href="#">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              className="submit-btn" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <div className="login-link-container">
              <p>
                Already have an account?{" "}
                <Link className="login-link" to="/login">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>

          {/* Footer Section */}
          <div className="auth-footer">
            <div className="divider"></div>
            <div className="security-badge">
              <span className="material-symbols-outlined security-icon">verified_user</span>
              <p className="security-text">Secure Registration</p>
            </div>
            <p className="terms-text">
              Your information is protected by ViljeTech Security Protocols.
            </p>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="page-footer">
        <p className="copyright">© 2024 ViljeTech Corporation. All rights reserved.</p>
      </footer>
    </div>
  );
}
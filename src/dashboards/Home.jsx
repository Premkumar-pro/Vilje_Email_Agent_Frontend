// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function Home() {
//     const navigate = useNavigate();

//     const styles = {
//         container: {
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             minHeight: "100vh",
//             background: "linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%)",
//             padding: "40px 20px",
//         },
//         hero: {
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: "24px",
//             maxWidth: "1100px",
//             width: "100%",
//             padding: "40px",
//             borderRadius: "12px",
//             boxShadow: "0 6px 24px rgba(16, 24, 40, 0.08)",
//             background: "#fff",
//             flexWrap: "wrap",
//         },
//         left: {
//             flex: "1 1 420px",
//             minWidth: "280px",
//         },
//         right: {
//             flex: "1 1 320px",
//             minWidth: "280px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//         },
//         title: {
//             fontSize: "34px",
//             marginBottom: "12px",
//             color: "#0f172a",
//             lineHeight: "1.1",
//         },
//         subtitle: {
//             color: "#475569",
//             marginBottom: "18px",
//             fontSize: "16px",
//         },
//         aiText: {
//             color: "#334155",
//             marginBottom: "20px",
//             fontSize: "15px",
//             lineHeight: "1.5",
//         },
//         button: {
//             background: "#2563eb",
//             color: "#fff",
//             border: "none",
//             padding: "12px 20px",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontSize: "16px",
//         },
//         iframe: {
//             width: "100%",
//             maxWidth: "420px",
//             height: "420px",
//             border: "none",
//             borderRadius: "8px",
//             background: "transparent",
//         },
//     };

//     return (
//         <div style={styles.container}>
//             <div style={styles.hero}>
//                 <div style={styles.left}>
//                     <h1 style={styles.title}>ViljeTech Email Agent</h1>
//                     <p style={styles.subtitle}>Build, automate and optimize email campaigns at scale.</p>
//                     <p style={styles.aiText}>
//                         Powered by modern AI, ViljeTech Email Agent personalizes content, optimizes send times, and
//                         analyzes campaign performance to maximize engagement. Save time while sending smarter,
//                         data-driven campaigns that convert.
//                     </p>
//                     <button style={styles.button} onClick={() => navigate("/login")}>
//                         Get Started
//                     </button>
//                 </div>

//                 <div style={styles.right}>
//                     <iframe
//                         title="ViljeTech animation"
//                         src="https://lottie.host/embed/11aeb574-d0d0-4310-b89c-dda1fdd16a0b/HZFrGppRYe"
//                         style={styles.iframe}
//                         frameBorder="0"
//                         allowFullScreen
//                     ></iframe>
//                 </div>
//             </div>
//         </div>
//     );
// }


import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Left side: Text & button */}
        <div className="home-text fade-in">
          <h1>AI Email Agent Agent</h1>
          <p className="home-subtitle">                         Powered by modern AI, ViljeTech Email Agent personalizes content, optimizes send times, and
                         analyzes campaign performance to maximize engagement. Save time while sending smarter,
                        data-driven campaigns that convert.
          </p>
          <button className="btn get-start-btn" onClick={() => navigate("/login")}>
            Get Started with AI →
          </button>
        </div>

        {/* Right side: Lottie Animation */}
        <div className="home-lottie float">
          <DotLottieReact
            src="https://lottie.host/11aeb574-d0d0-4310-b89c-dda1fdd16a0b/HZFrGppRYe.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    </div>
  );
};

export default Home;

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Signup from "./auth/Signup";
// import Login from "./auth/Login";
// import Dashboard from "./pages/Dashboard";
// import ProtectedRoute from "./auth/components/ProtectedRoute";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./auth/Signup";
import Login from "./auth/Login";
import Home from "./dashboards/Home";
import ProtectedRoute from "./auth/components/ProtectedRoute";

import Sidebar from "./sidebar/sidebar";

import Dashboard from "./dashboards/dashboard";
import Upload from "./dashboards/upload";
import Generate from "./dashboards/Generate";
import Review from "./dashboards/result";
import Logs from "./dashboards/logs";
import Support from "./dashboards/support";
import SendingStatus from "./dashboards/sending-status";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Public landing page */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <Upload />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <Layout>
                <Generate />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/result"
          element={
            <ProtectedRoute>
              <Layout>
                <Review />
              </Layout>
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/sending-status"
          element={<SendingStatus />}
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <Layout>
                <Logs />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Layout>
                <Support />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

/* Shared layout for all dashboard pages */
function Layout({ children }) {
  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: "200px", padding: "20px" }}>
        {children}
      </div>
    </>
  );
}

export default App;

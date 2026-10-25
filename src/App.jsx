import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout.jsx";
import Login from "./pages/Login.jsx";
import { getSavedUser } from "./utility/index.js";
import JobRequest from "./pages/JobRequest.jsx";
import Jobs from "./pages/Jobs.jsx";

function RequireAuth({ children }) {
  if (!getSavedUser()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/requests/new" replace />} />
        <Route path="requests/new" element={<JobRequest />} />
        <Route path="/jobs-screen" element={<Jobs/>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

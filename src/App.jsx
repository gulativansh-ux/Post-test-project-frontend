import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./Layout.jsx";
import Login from "./pages/Login.jsx";
import { getSavedUser } from "./utility/index.js";

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
      ></Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

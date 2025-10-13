import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Toaster />
      </div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPerms={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/unauthorized" element={<h2>Unauthorized</h2>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

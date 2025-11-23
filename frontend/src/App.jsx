import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";

import Dashboard from "./pages/Dashboard/Dashboard";
import CatalogList from "./pages/Catalog/CatalogList";
import StaffPage from "./pages/Staff/StaffPage";
import SupplierSettings from "./pages/Settings/SupplierSettings";
import LinksPage from "./pages/Links/LinksPage";
import OrdersList from "./pages/Orders/OrdersList";
import OrderDetails from "./pages/Orders/OrderDetails";
import IncidentsPage from "./pages/Incidents/IncidentsPage";
import ChatPage from "./pages/Chat/ChatPage.jsx";

import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignupPage from "./pages/Auth/SignupPage.jsx"; // <-- make sure file name matches

import { useAuth } from "./context/AuthContext.jsx";

// route guard
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// reuse your existing layout but with <Outlet /> inside
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-slate-100 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public (no navbar/sidebar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected app (with navbar + sidebar) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalog" element={<CatalogList />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/settings" element={<SupplierSettings />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="font-semibold text-slate-800">Supplier Platform</div>

      {user && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600 hidden sm:inline">
            {user.name} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            className="px-2 py-1 text-xs rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

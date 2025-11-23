import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);


const DEMO_USERS = [
  {
    name: "Demo Owner",
    email: "owner@supplier.kz",
    role: "OWNER",
    password: "owner123",
  },
  {
    name: "Aigul Manager",
    email: "manager@supplier.kz",
    role: "MANAGER",
    password: "manager123",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Restore from localStorage on refresh
  useEffect(() => {
    const raw = localStorage.getItem("authUser");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email && parsed.role) {
          setUser(parsed);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const persistUser = (u) => {
    setUser(u);
    if (u) {
      localStorage.setItem("authUser", JSON.stringify(u));
    } else {
      localStorage.removeItem("authUser");
    }
  };

  // Email + password login (for OWNER / MANAGER)
  function login(email, password) {
    const trimmedEmail = (email || "").trim().toLowerCase();

    const found = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === trimmedEmail &&
        u.password === (password || "")
    );

    if (!found) {
      return { success: false, message: "Invalid email or password" };
    }

    const { password: _pw, ...safeUser } = found;
    persistUser(safeUser);
    return { success: true, user: safeUser };
  }

  // Fake signup: create Owner/Manager in frontend and log in
  function signup({ name, email, password, role }) {
    const trimmedEmail = (email || "").trim().toLowerCase();
    if (!name.trim() || !trimmedEmail || !password) {
      return { success: false, message: "All fields are required" };
    }
    if (role !== "OWNER" && role !== "MANAGER") {
      return { success: false, message: "Role must be Owner or Manager" };
    }

    const newUser = {
      name: name.trim(),
      email: trimmedEmail,
      role,
    };

    persistUser(newUser);
    return { success: true, user: newUser };
  }

  function logout() {
    persistUser(null);
  }

  // Optional helpers (if you want quick login buttons somewhere)
  function loginAsOwner() {
    const { password: _pw, ...safeUser } = DEMO_USERS[0];
    persistUser(safeUser);
  }

  function loginAsManager() {
    const { password: _pw, ...safeUser } = DEMO_USERS[1];
    persistUser(safeUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        loginAsOwner,
        loginAsManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

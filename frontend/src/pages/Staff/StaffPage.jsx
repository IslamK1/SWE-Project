import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const INITIAL_STAFF = [
  {
    id: 1,
    name: "Demo Owner",
    email: "owner@supplier.kz",
    role: "OWNER",
    status: "active",
    password: "owner123",
  },
  {
    id: 2,
    name: "Aigul Manager",
    email: "manager@supplier.kz",
    role: "MANAGER",
    status: "active",
    password: "manager123",
  },
  {
    id: 3,
    name: "Dias Sales",
    email: "sales@supplier.kz",
    role: "SALES",
    status: "active",
    password: "sales123",
  },
];

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MANAGER", // default role for new staff
  });

  const isOwner = user.role === "OWNER";

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return;
    }

    const newStaff = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,        // MANAGER or SALES
      status: "active",
      password: form.password // used for mobile app login later
    };

    setStaff((prev) => [...prev, newStaff]);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "MANAGER",
    });
    setShowForm(false);
  };

  const handleToggleStatus = (id) => {
    if (!isOwner) return;
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s
      )
    );
  };

  const handleChangeRole = (id, newRole) => {
    if (!isOwner) return;
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, role: newRole } : s))
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="text-sm text-slate-600">
            Manage supplier owners, managers, and sales representatives who can
            log in to the platform (e.g. from mobile app).
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add staff"}
          </button>
        )}
      </div>

      {!isOwner && (
        <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          You are logged in as <strong>{user.role}</strong>. Staff creation,
          role changes and deactivation are available only to the{" "}
          <strong>Owner</strong>.
        </div>
      )}

      {showForm && isOwner && (
        <form
          onSubmit={handleCreate}
          className="mb-4 bg-white border rounded-lg p-4 shadow-sm space-y-3"
        >
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="Full name"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="user@supplier.kz"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="Temporary password"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Use this password for mobile / external app login.
              </p>
            </div>

            <div className="w-44">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
              >
                <option value="MANAGER">Manager</option>
                <option value="SALES">Sales representative</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  role: "MANAGER",
                });
              }}
              className="px-3 py-1.5 text-sm rounded border text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-center px-4 py-2">Role</th>
              <th className="text-center px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Password</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2 text-slate-500">{s.email}</td>
                <td className="px-4 py-2 text-center">
                  {isOwner ? (
                    <select
                      value={s.role}
                      onChange={(e) =>
                        handleChangeRole(s.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-xs"
                    >
                      <option value="OWNER">Owner</option>
                      <option value="MANAGER">Manager</option>
                      <option value="SALES">Sales</option>
                    </select>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                      {s.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                      s.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {s.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-slate-700">
                  {s.password || "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  {isOwner ? (
                    <button
                      onClick={() => handleToggleStatus(s.id)}
                      className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                    >
                      {s.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">View only</span>
                  )}
                </td>
              </tr>
            ))}

            {staff.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No staff yet.{" "}
                  {isOwner ? "Add your first manager or sales rep." : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

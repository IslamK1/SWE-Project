import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const INITIAL_PROFILE = {
  name: "Demo Supplier LLP",
  businessType: "Food wholesale",
  bin: "123456789012",
  address: "Astana, Kazakhstan",
  phone: "+7 700 000 0000",
  email: "contact@supplier.kz",
  notes: "We supply to supermarkets in Astana and Almaty.",
  isDeactivated: false,
};

export default function SupplierSettings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [saving, setSaving] = useState(false);

  const isOwner = user.role === "OWNER";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);

    // here you would call your real API, for now just simulate
    setTimeout(() => {
      setSaving(false);
      alert("Supplier settings saved (frontend only for now).");
    }, 500);
  };

  const handleDeactivate = () => {
    if (!isOwner) return;

    const confirm = window.confirm(
      "Are you sure you want to deactivate this supplier?\n\n" +
        "After deactivation, new orders and links should be blocked (in real system)."
    );
    if (!confirm) return;

    setProfile((prev) => ({ ...prev, isDeactivated: true }));
  };

  const handleReactivate = () => {
    if (!isOwner) return;
    const confirm = window.confirm(
      "Reactivate this supplier? They will be able to receive orders again."
    );
    if (!confirm) return;

    setProfile((prev) => ({ ...prev, isDeactivated: false }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Supplier Settings</h1>
          <p className="text-sm text-slate-600">
            Update your company information and manage supplier status.
          </p>
        </div>
      </div>

      {profile.isDeactivated && (
        <div className="mb-4 text-xs text-red-800 bg-red-50 border border-red-200 rounded px-3 py-2">
          This supplier account is <strong>deactivated</strong>. In the real
          system, new orders, links and logins would be restricted.
        </div>
      )}

      {!isOwner && (
        <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          You are logged in as <strong>{user.role}</strong>. Only the{" "}
          <strong>Owner</strong> can deactivate or reactivate the supplier
          account.
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white border rounded-lg p-4 shadow-sm space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Supplier name
            </label>
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="Company legal name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Business type
            </label>
            <input
              name="businessType"
              value={profile.businessType}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="e.g. Food wholesale, Construction materials"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              BIN / Registration number
            </label>
            <input
              name="bin"
              value={profile.bin}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="123456789012"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Address
            </label>
            <input
              name="address"
              value={profile.address}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="City, street, building"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Phone
            </label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="+7 ..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1.5 text-sm"
              placeholder="contact@supplier.kz"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={profile.notes}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1.5 text-sm min-h-[80px]"
            placeholder="Internal notes about this supplier (not visible to consumers)."
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t mt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          {isOwner && (
            <div className="flex items-center gap-2">
              {profile.isDeactivated ? (
                <button
                  type="button"
                  onClick={handleReactivate}
                  className="px-3 py-1.5 text-sm rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                >
                  Reactivate supplier
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeactivate}
                  className="px-3 py-1.5 text-sm rounded border border-red-600 text-red-700 hover:bg-red-50"
                >
                  Deactivate supplier
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

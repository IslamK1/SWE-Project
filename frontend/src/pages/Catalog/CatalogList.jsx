import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Sugar 1kg",
    sku: "SUG-1KG",
    category: "Groceries",
    unit: "kg",
    price: 500,
    minOrderQty: 10,
    isActive: true,
  },
  {
    id: 2,
    name: "Flour 5kg",
    sku: "FLR-5KG",
    category: "Groceries",
    unit: "bag",
    price: 1800,
    minOrderQty: 5,
    isActive: true,
  },
  {
    id: 3,
    name: "Oil 1L",
    sku: "OIL-1L",
    category: "Groceries",
    unit: "bottle",
    price: 900,
    minOrderQty: 12,
    isActive: false,
  },
];

const CATEGORY_OPTIONS = [
  "Groceries",
  "Drinks",
  "Dairy",
  "Bakery",
  "Other",
];

const UNIT_OPTIONS = ["kg", "bag", "bottle", "pack", "pcs"];

export default function CatalogList() {
  const { user } = useAuth();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Groceries",
    unit: "kg",
    price: "",
    minOrderQty: "",
    isActive: true,
  });

  const isOwner = user.role === "OWNER";
  const isManager = user.role === "MANAGER";
  const canManage = isOwner || isManager; // only web roles anyway

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        if (!nameMatch && !skuMatch) return false;
      }
      return true;
    });
  }, [products, statusFilter, search]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      sku: "",
      category: "Groceries",
      unit: "kg",
      price: "",
      minOrderQty: "",
      isActive: true,
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      price: String(product.price),
      minOrderQty: String(product.minOrderQty),
      isActive: product.isActive,
    });
    setShowForm(true);
  };

  const handleChangeForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canManage) return;

    if (!form.name.trim() || !form.sku.trim()) {
      return;
    }

    const price = Number(form.price);
    const minOrderQty = Number(form.minOrderQty);

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category || "Other",
      unit: form.unit || "pcs",
      price: isNaN(price) ? 0 : price,
      minOrderQty: isNaN(minOrderQty) ? 1 : minOrderQty,
      isActive: form.isActive,
    };

    if (editingId) {
      // update existing
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
      );
    } else {
      // create new
      const newProduct = {
        id: Date.now(),
        ...payload,
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleToggleActive = (id) => {
    if (!canManage) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Catalog</h1>
          <p className="text-sm text-slate-600">
            Manage products, prices and availability for consumers.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {showForm && !editingId ? "Cancel" : "+ Add product"}
          </button>
        )}
      </div>

      {!canManage && (
        <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          You are logged in as <strong>{user.role}</strong>. Catalog changes are
          available only to managers and owners.
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="inline-flex rounded-lg border bg-white overflow-hidden">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs md:text-sm border-r ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 text-xs md:text-sm border-r ${
              statusFilter === "active"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 text-xs md:text-sm ${
              statusFilter === "inactive"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Inactive
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm w-full md:w-72"
          />
        </div>
      </div>

      {/* Form for create / edit */}
      {showForm && canManage && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 bg-white border rounded-lg p-4 shadow-sm space-y-3"
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Product name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="Sugar 1kg"
              />
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                SKU / Code
              </label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
                placeholder="SUG-1KG"
              />
            </div>

            <div className="w-40 min-w-[160px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-28 min-w-[120px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-32 min-w-[140px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Price (₸)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>

            <div className="w-40 min-w-[160px]">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Min order qty
              </label>
              <input
                name="minOrderQty"
                type="number"
                min="1"
                value={form.minOrderQty}
                onChange={handleChangeForm}
                className="w-full border rounded px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 mt-5">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChangeForm}
                className="h-4 w-4"
              />
              <label
                htmlFor="isActive"
                className="text-xs font-medium text-slate-600"
              >
                Active in catalog
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="px-3 py-1.5 text-sm rounded border text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {editingId ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      )}

      {/* Products table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Product</th>
              <th className="text-left px-4 py-2">SKU</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Unit</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">Min qty</th>
              <th className="text-center px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2 text-slate-500">{p.sku}</td>
                <td className="px-4 py-2 text-slate-500">{p.category}</td>
                <td className="px-4 py-2 text-slate-500">{p.unit}</td>
                <td className="px-4 py-2 text-right">
                  {p.price.toLocaleString("ru-RU")} ₸
                </td>
                <td className="px-4 py-2 text-right">{p.minOrderQty}</td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                      p.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {canManage ? (
                    <div className="flex gap-1 justify-end flex-wrap">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(p.id)}
                        className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">View only</span>
                  )}
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No products found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const INITIAL_ORDERS = [
  {
    id: 101,
    consumerName: "Green Market Store",
    createdAt: "2025-11-10",
    status: "NEW",
    totalAmount: 125000,
  },
  {
    id: 102,
    consumerName: "Almaty Supermarket",
    createdAt: "2025-11-08",
    status: "IN_PROGRESS",
    totalAmount: 89000,
  },
  {
    id: 103,
    consumerName: "Small Cafe Astana",
    createdAt: "2025-11-01",
    status: "COMPLETED",
    totalAmount: 43000,
  },
  {
    id: 104,
    consumerName: "Test Consumer",
    createdAt: "2025-10-25",
    status: "REJECTED",
    totalAmount: 15000,
  },
];

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "NEW", label: "New" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "REJECTED", label: "Rejected" },
];

function statusClasses(status) {
  switch (status) {
    case "NEW":
      return "bg-amber-100 text-amber-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function OrdersList() {
  const { user } = useAuth();
  const [orders] = useState(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false;
      }

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const idMatch = order.id.toString().includes(query);
        const nameMatch = order.consumerName.toLowerCase().includes(query);
        if (!idMatch && !nameMatch) return false;
      }

      return true;
    });
  }, [orders, statusFilter, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-slate-600">
            View and manage incoming orders from linked consumers.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Logged in as <strong>{user.role}</strong>
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="inline-flex rounded-lg border bg-white overflow-hidden">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 text-xs md:text-sm border-r last:border-r-0 ${
                statusFilter === f.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by order ID or consumer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm w-full md:w-72"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Order</th>
              <th className="text-left px-4 py-2">Consumer</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-right px-4 py-2">Amount</th>
              <th className="text-center px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-2">
                  <div className="font-medium">
                    #{order.id.toString().padStart(4, "0")}
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {order.consumerName}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {order.createdAt}
                </td>
                <td className="px-4 py-2 text-right">
                  {order.totalAmount.toLocaleString("ru-RU")} ₸
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClasses(
                      order.status
                    )}`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex px-2 py-1 text-xs rounded border hover:bg-slate-50"
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No orders found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

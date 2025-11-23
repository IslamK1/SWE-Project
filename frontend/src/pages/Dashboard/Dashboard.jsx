import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const DASHBOARD_ORDERS = [
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

const DASHBOARD_LINKS = [
  {
    id: 1,
    consumerName: "Green Market Store",
    status: "pending",
  },
  {
    id: 2,
    consumerName: "Almaty Supermarket",
    status: "active",
  },
  {
    id: 3,
    consumerName: "Small Cafe Astana",
    status: "blocked",
  },
];

const DASHBOARD_INCIDENTS = [
  {
    id: 1,
    orderId: 103,
    status: "OPEN",
    severity: "HIGH",
  },
  {
    id: 2,
    orderId: 102,
    status: "IN_PROGRESS",
    severity: "MEDIUM",
  },
];

function statusPill(status) {
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

export default function Dashboard() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const totalOrders = DASHBOARD_ORDERS.length;
    const newOrders = DASHBOARD_ORDERS.filter((o) => o.status === "NEW").length;
    const inProgressOrders = DASHBOARD_ORDERS.filter(
      (o) => o.status === "IN_PROGRESS"
    ).length;

    const activeLinks = DASHBOARD_LINKS.filter(
      (l) => l.status === "active"
    ).length;
    const pendingLinks = DASHBOARD_LINKS.filter(
      (l) => l.status === "pending"
    ).length;

    const openIncidents = DASHBOARD_INCIDENTS.filter(
      (i) => i.status === "OPEN"
    ).length;

    const recentOrders = [...DASHBOARD_ORDERS].sort(
      (a, b) => (a.createdAt < b.createdAt ? 1 : -1)
    ).slice(0, 3);

    return {
      totalOrders,
      newOrders,
      inProgressOrders,
      activeLinks,
      pendingLinks,
      openIncidents,
      recentOrders,
    };
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Overview of orders, links, and incidents for your supplier.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Logged in as <strong>{user.role}</strong>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Total orders</div>
          <div className="text-2xl font-semibold">
            {stats.totalOrders}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.newOrders} new • {stats.inProgressOrders} in progress
          </div>
          <Link
            to="/orders"
            className="text-xs text-blue-600 mt-2 inline-block hover:underline"
          >
            Go to orders →
          </Link>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Linked consumers</div>
          <div className="text-2xl font-semibold">
            {DASHBOARD_LINKS.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.activeLinks} active • {stats.pendingLinks} pending
          </div>
          <Link
            to="/links"
            className="text-xs text-blue-600 mt-2 inline-block hover:underline"
          >
            Manage links →
          </Link>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Incidents</div>
          <div className="text-2xl font-semibold">
            {DASHBOARD_INCIDENTS.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {stats.openIncidents} open
          </div>
          <Link
            to="/incidents"
            className="text-xs text-blue-600 mt-2 inline-block hover:underline"
          >
            View incidents →
          </Link>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="text-xs text-slate-500 mb-1">Catalog products</div>
          <div className="text-2xl font-semibold">3</div>
          <div className="text-xs text-slate-400 mt-1">
            (mock value — connect to API later)
          </div>
          <Link
            to="/catalog"
            className="text-xs text-blue-600 mt-2 inline-block hover:underline"
          >
            Manage catalog →
          </Link>
        </div>
      </div>

      {/* Main content: recent orders + attention panel */}
      <div className="grid gap-4 md:grid-cols-[2fr,1.4fr]">
        {/* Recent orders */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link
              to="/orders"
              className="text-xs text-blue-600 hover:underline"
            >
              See all
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">
              No orders yet.
            </p>
          ) : (
            <ul className="divide-y">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      Order #{order.id.toString().padStart(4, "0")}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {order.consumerName} • {order.createdAt}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {order.totalAmount.toLocaleString("ru-RU")} ₸
                    </div>
                    <span
                      className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] ${statusPill(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Attention / tasks */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-2">Attention needed</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between items-start gap-3">
              <div>
                <div className="font-medium">Pending link requests</div>
                <div className="text-xs text-slate-500">
                  Approve or reject consumers who want to work with you.
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {stats.pendingLinks}
                </div>
                <Link
                  to="/links"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Open
                </Link>
              </div>
            </li>

            <li className="flex justify-between items-start gap-3">
              <div>
                <div className="font-medium">New orders</div>
                <div className="text-xs text-slate-500">
                  Review and accept or reject new orders from consumers.
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {stats.newOrders}
                </div>
                <Link
                  to="/orders"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Open
                </Link>
              </div>
            </li>

            <li className="flex justify-between items-start gap-3">
              <div>
                <div className="font-medium">Open incidents</div>
                <div className="text-xs text-slate-500">
                  Complaints escalated from orders that need your decision.
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {stats.openIncidents}
                </div>
                <Link
                  to="/incidents"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Open
                </Link>
              </div>
            </li>
          </ul>

          <div className="mt-4 border-t pt-3">
            <div className="text-xs text-slate-500 mb-1">
              
            </div>
            <p className="text-xs text-slate-600">
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

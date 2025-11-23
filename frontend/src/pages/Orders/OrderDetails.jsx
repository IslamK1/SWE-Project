import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Fake orders
const INITIAL_ORDERS = [
  {
    id: 101,
    consumerName: "Green Market Store",
    createdAt: "2025-11-10",
    status: "NEW",
    totalAmount: 125000,
    deliveryType: "delivery",
    address: "Astana, Saryarka district, Dostyk 10",
    contactPhone: "+7 700 111 2233",
    items: [
      { id: 1, name: "Sugar 1kg", unit: "kg", qty: 50, price: 500 },
      { id: 2, name: "Flour 5kg", unit: "bag", qty: 15, price: 1800 },
    ],
  },
  {
    id: 102,
    consumerName: "Almaty Supermarket",
    createdAt: "2025-11-08",
    status: "IN_PROGRESS",
    totalAmount: 89000,
    deliveryType: "pickup",
    address: "Pickup from warehouse A",
    contactPhone: "+7 701 555 0000",
    items: [
      { id: 1, name: "Oil 1L", unit: "bottle", qty: 30, price: 900 },
      { id: 2, name: "Rice 5kg", unit: "bag", qty: 10, price: 3500 },
    ],
  },
  {
    id: 103,
    consumerName: "Small Cafe Astana",
    createdAt: "2025-11-01",
    status: "COMPLETED",
    totalAmount: 43000,
    deliveryType: "delivery",
    address: "Astana, Right bank",
    contactPhone: "+7 702 999 8899",
    items: [
      { id: 1, name: "Milk 1L", unit: "pack", qty: 40, price: 350 },
      { id: 2, name: "Butter 200g", unit: "pack", qty: 20, price: 700 },
    ],
  },
  {
    id: 104,
    consumerName: "Test Consumer",
    createdAt: "2025-10-25",
    status: "REJECTED",
    totalAmount: 15000,
    deliveryType: "delivery",
    address: "Unknown address",
    contactPhone: "+7 700 000 0000",
    items: [
      { id: 1, name: "Test product", unit: "pcs", qty: 10, price: 1500 },
    ],
  },
];

// Fake complaints for orders
const INITIAL_COMPLAINTS = [
  {
    id: 1,
    orderId: 103,
    type: "Quality issue",
    from: "Small Cafe Astana",
    createdAt: "2025-11-02",
    status: "OPEN", // OPEN | IN_REVIEW | RESOLVED | ESCALATED
    description: "Milk was close to expiration date.",
    internalNotes: "",
  },
  {
    id: 2,
    orderId: 102,
    type: "Delay",
    from: "Almaty Supermarket",
    createdAt: "2025-11-09",
    status: "IN_REVIEW",
    description: "Pickup was delayed by 2 hours.",
    internalNotes: "Manager is checking with logistics.",
  },
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

function complaintStatusClasses(status) {
  switch (status) {
    case "OPEN":
      return "bg-amber-100 text-amber-700";
    case "IN_REVIEW":
      return "bg-blue-100 text-blue-700";
    case "RESOLVED":
      return "bg-emerald-100 text-emerald-700";
    case "ESCALATED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function OrderDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const initialOrder = useMemo(
    () => INITIAL_ORDERS.find((o) => o.id === Number(id)) || null,
    [id]
  );
  const [order, setOrder] = useState(initialOrder);

  // complaints only for this order
  const [complaints, setComplaints] = useState(
    INITIAL_COMPLAINTS.filter((c) => c.orderId === Number(id))
  );

  const isOwner = user.role === "OWNER";
  const isManager = user.role === "MANAGER";
  const canManage = isOwner || isManager;

  if (!order) {
    return (
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to orders
        </button>
        <p className="text-sm text-red-600">
          Order not found. (Check the URL or go back to the list.)
        </p>
      </div>
    );
  }

  // ORDER STATUS ACTIONS

  const handleAccept = () => {
    if (!canManage) return;
    setOrder((prev) => ({ ...prev, status: "IN_PROGRESS" }));
  };

  const handleReject = () => {
    if (!canManage) return;
    const confirm = window.confirm(
      "Reject this order? Consumer will see it as rejected."
    );
    if (!confirm) return;
    setOrder((prev) => ({ ...prev, status: "REJECTED" }));
  };

  const handleMarkCompleted = () => {
    if (!canManage) return;
    const confirm = window.confirm(
      "Mark this order as completed? This should be done after delivery/pickup is done."
    );
    if (!confirm) return;
    setOrder((prev) => ({ ...prev, status: "COMPLETED" }));
  };

  // COMPLAINTS ACTIONS

  const updateComplaintStatus = (complaintId, newStatus, extraNote) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: newStatus,
              internalNotes:
                extraNote && extraNote.trim()
                  ? (c.internalNotes
                      ? c.internalNotes + " | "
                      : "") + extraNote
                  : c.internalNotes,
            }
          : c
      )
    );
  };

  const handleStartReview = (complaintId) => {
    if (!canManage) return;
    updateComplaintStatus(complaintId, "IN_REVIEW", "Complaint moved to review.");
  };

  const handleResolveComplaint = (complaintId) => {
    if (!canManage) return;
    const note =
      window.prompt(
        "Add a short resolution note (optional):",
        "Issue resolved, consumer informed."
      ) || "";
    updateComplaintStatus(complaintId, "RESOLVED", note);
  };

  const handleEscalateComplaint = (complaintId) => {
    // according to SRS, escalation to incident is usually Manager/Owner-level
    if (!canManage) return;
    const confirm = window.confirm(
      "Escalate this complaint to an incident?\nIn a real system this would create an incident for Owner to handle."
    );
    if (!confirm) return;
    updateComplaintStatus(complaintId, "ESCALATED", "Escalated to incident.");
  };

  const handleAddInternalNote = (complaintId) => {
    if (!canManage) return;
    const note = window.prompt("Add internal note:", "");
    if (!note || !note.trim()) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              internalNotes: c.internalNotes
                ? c.internalNotes + " | " + note.trim()
                : note.trim(),
            }
          : c
      )
    );
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        ← Back to orders
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Order #{order.id.toString().padStart(4, "0")}
          </h1>
          <p className="text-sm text-slate-600">
            {order.consumerName} • {order.createdAt}
          </p>
        </div>

        <div className="text-right">
          <div
            className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClasses(
              order.status
            )}`}
          >
            {order.status.replace("_", " ")}
          </div>
          <div className="mt-1 text-sm font-medium">
            {order.totalAmount.toLocaleString("ru-RU")} ₸
          </div>
        </div>
      </div>

      {order.status === "NEW" && canManage && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 text-sm rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            Accept order
          </button>
          <button
            onClick={handleReject}
            className="px-3 py-1.5 text-sm rounded border border-red-600 text-red-700 hover:bg-red-50"
          >
            Reject order
          </button>
        </div>
      )}

      {order.status === "IN_PROGRESS" && canManage && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={handleMarkCompleted}
            className="px-3 py-1.5 text-sm rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
          >
            Mark as completed
          </button>
        </div>
      )}

      {!canManage && (
        <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          You are logged in as <strong>{user.role}</strong>. Order status and
          complaint handling actions are available only to managers and owners.
        </div>
      )}

      {/* Order summary cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-2">Consumer & Delivery</h2>
          <div className="text-sm text-slate-700">
            <div className="mb-1">
              <span className="font-medium">Consumer: </span>
              {order.consumerName}
            </div>
            <div className="mb-1">
              <span className="font-medium">Contact: </span>
              {order.contactPhone}
            </div>
            <div className="mb-1">
              <span className="font-medium">Delivery type: </span>
              {order.deliveryType === "delivery" ? "Delivery" : "Pickup"}
            </div>
            <div className="mb-1">
              <span className="font-medium">Address / pickup point: </span>
              {order.address}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-2">Summary</h2>
          <div className="text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span>Total items:</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Positions:</span>
              <span className="font-medium">{order.items.length}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-1">
              <span>Total amount:</span>
              <span className="font-semibold">
                {order.totalAmount.toLocaleString("ru-RU")} ₸
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
        <h2 className="text-sm font-semibold mb-2">Order items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-left px-3 py-2">Unit</th>
                <th className="text-right px-3 py-2">Qty</th>
                <th className="text-right px-3 py-2">Price</th>
                <th className="text-right px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">{item.name}</td>
                  <td className="px-3 py-2 text-slate-500">{item.unit}</td>
                  <td className="px-3 py-2 text-right">{item.qty}</td>
                  <td className="px-3 py-2 text-right">
                    {item.price.toLocaleString("ru-RU")} ₸
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(item.qty * item.price).toLocaleString("ru-RU")} ₸
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaints section */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-sm font-semibold mb-2">
          Complaints for this order
        </h2>

        {complaints.length === 0 ? (
          <p className="text-sm text-slate-500">
            No complaints received for this order.
          </p>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="border rounded-md px-3 py-2 text-sm flex flex-col gap-1"
              >
                <div className="flex justify-between items-center gap-2">
                  <div>
                    <div className="font-medium">{c.type}</div>
                    <div className="text-xs text-slate-500">
                      From: {c.from} • {c.createdAt}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs ${complaintStatusClasses(
                        c.status
                      )}`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="text-slate-700">
                  <span className="font-medium">Description: </span>
                  {c.description}
                </div>

                <div className="text-xs text-slate-500">
                  <span className="font-medium">Internal notes: </span>
                  {c.internalNotes && c.internalNotes.length > 0
                    ? c.internalNotes
                    : "—"}
                </div>

                {canManage && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {c.status === "OPEN" && (
                      <button
                        onClick={() => handleStartReview(c.id)}
                        className="px-2 py-1 text-xs rounded border border-blue-600 text-blue-700 hover:bg-blue-50"
                      >
                        Move to review
                      </button>
                    )}

                    {(c.status === "OPEN" || c.status === "IN_REVIEW") && (
                      <button
                        onClick={() => handleResolveComplaint(c.id)}
                        className="px-2 py-1 text-xs rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                      >
                        Mark resolved
                      </button>
                    )}

                    {c.status !== "ESCALATED" && (
                      <button
                        onClick={() => handleEscalateComplaint(c.id)}
                        className="px-2 py-1 text-xs rounded border border-red-600 text-red-700 hover:bg-red-50"
                      >
                        Escalate to incident
                      </button>
                    )}

                    <button
                      onClick={() => handleAddInternalNote(c.id)}
                      className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                    >
                      Add internal note
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

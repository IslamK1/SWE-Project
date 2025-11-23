import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const INITIAL_INCIDENTS = [
  {
    id: 1,
    orderId: 103,
    complaintId: 1,
    consumerName: "Small Cafe Astana",
    createdAt: "2025-11-02",
    status: "OPEN", // OPEN | IN_PROGRESS | RESOLVED
    severity: "HIGH", // LOW | MEDIUM | HIGH
    summary: "Milk delivered close to expiration date.",
    internalNotes: "Escalated from complaint about quality.",
    assignedTo: "Demo Owner",
  },
  {
    id: 2,
    orderId: 102,
    complaintId: 2,
    consumerName: "Almaty Supermarket",
    createdAt: "2025-11-09",
    status: "IN_PROGRESS",
    severity: "MEDIUM",
    summary: "Pickup delay of 2 hours.",
    internalNotes: "Manager checking logistics schedule.",
    assignedTo: "Aigul Manager",
  },
];

const STATUS_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "RESOLVED", label: "Resolved" },
];

function statusClasses(status) {
  switch (status) {
    case "OPEN":
      return "bg-amber-100 text-amber-700";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700";
    case "RESOLVED":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function severityClasses(severity) {
  switch (severity) {
    case "LOW":
      return "bg-slate-100 text-slate-700";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700";
    case "HIGH":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function IncidentsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const isOwner = user.role === "OWNER";
  const isManager = user.role === "MANAGER";
  const canManage = isOwner || isManager;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (statusFilter !== "ALL" && incident.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const idMatch = incident.id.toString().includes(q);
        const orderMatch = incident.orderId.toString().includes(q);
        const consumerMatch = incident.consumerName.toLowerCase().includes(q);
        if (!idMatch && !orderMatch && !consumerMatch) return false;
      }
      return true;
    });
  }, [incidents, statusFilter, search]);

  const updateIncident = (id, changes) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, ...changes } : inc))
    );
  };

  const handleChangeStatus = (id, newStatus) => {
    if (!canManage) return;
    updateIncident(id, { status: newStatus });
  };

  const handleAssign = (id) => {
    if (!canManage) return;
    const value =
      window.prompt(
        "Assign this incident to (e.g. manager name):",
        isOwner ? "Demo Owner" : user.name
      ) || "";
    if (!value.trim()) return;
    updateIncident(id, { assignedTo: value.trim() });
  };

  const handleAddNote = (id) => {
    if (!canManage) return;
    const note = window.prompt("Add internal note:", "");
    if (!note || !note.trim()) return;

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              internalNotes: inc.internalNotes
                ? inc.internalNotes + " | " + note.trim()
                : note.trim(),
            }
          : inc
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Incidents</h1>
          <p className="text-sm text-slate-600">
            Track escalated complaints and critical issues that require
            attention from managers and owners.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Logged in as <strong>{user.role}</strong>
        </div>
      </div>

      {!canManage && (
        <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          You are logged in as <strong>{user.role}</strong>. Incident
          management is available only for managers and owners.
        </div>
      )}

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
            placeholder="Search by incident ID, order, or consumer..."
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
              <th className="text-left px-4 py-2">Incident</th>
              <th className="text-left px-4 py-2">Order / Consumer</th>
              <th className="text-left px-4 py-2">Severity</th>
              <th className="text-center px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Notes</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((inc) => (
              <tr key={inc.id} className="border-t align-top">
                <td className="px-4 py-2">
                  <div className="font-medium">
                    Incident #{inc.id.toString().padStart(3, "0")}
                  </div>
                  <div className="text-xs text-slate-500">
                    Created: {inc.createdAt}
                  </div>
                  {inc.complaintId && (
                    <div className="text-xs text-slate-400">
                      Complaint ID: {inc.complaintId}
                    </div>
                  )}
                </td>

                <td className="px-4 py-2 text-slate-700">
                  <div>
                    Order{" "}
                    <Link
                      to={`/orders/${inc.orderId}`}
                      className="text-blue-600 hover:underline"
                    >
                      #{inc.orderId.toString().padStart(4, "0")}
                    </Link>
                  </div>
                  <div className="text-xs text-slate-500">
                    {inc.consumerName}
                  </div>
                  <div className="text-xs text-slate-400">
                    Assigned to:{" "}
                    {inc.assignedTo ? inc.assignedTo : "Not assigned"}
                  </div>
                </td>

                <td className="px-4 py-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${severityClasses(
                      inc.severity
                    )}`}
                  >
                    {inc.severity}
                  </span>
                </td>

                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${statusClasses(
                      inc.status
                    )}`}
                  >
                    {inc.status.replace("_", " ")}
                  </span>
                </td>

                <td className="px-4 py-2 text-slate-500 max-w-xs">
                  <div className="text-xs font-medium mb-0.5">
                    {inc.summary}
                  </div>
                  <div className="text-xs text-slate-400 whitespace-pre-wrap">
                    {inc.internalNotes || "No internal notes yet."}
                  </div>
                </td>

                <td className="px-4 py-2 text-right">
                  {canManage ? (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {inc.status !== "OPEN" && (
                        <button
                          onClick={() => handleChangeStatus(inc.id, "OPEN")}
                          className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                        >
                          Set open
                        </button>
                      )}
                      {inc.status !== "IN_PROGRESS" && (
                        <button
                          onClick={() =>
                            handleChangeStatus(inc.id, "IN_PROGRESS")
                          }
                          className="px-2 py-1 text-xs rounded border border-blue-600 text-blue-700 hover:bg-blue-50"
                        >
                          In progress
                        </button>
                      )}
                      {inc.status !== "RESOLVED" && (
                        <button
                          onClick={() =>
                            handleChangeStatus(inc.id, "RESOLVED")
                          }
                          className="px-2 py-1 text-xs rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        >
                          Resolved
                        </button>
                      )}
                      <button
                        onClick={() => handleAssign(inc.id)}
                        className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleAddNote(inc.id)}
                        className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                      >
                        Add note
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      View only
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {filteredIncidents.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No incidents found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

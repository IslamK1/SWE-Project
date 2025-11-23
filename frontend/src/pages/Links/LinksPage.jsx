import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const INITIAL_LINKS = [
  {
    id: 1,
    consumerName: "Green Market Store",
    contact: "+7 700 111 2233",
    createdAt: "2025-11-01",
    status: "pending", // "pending" | "active" | "blocked"
    notes: "Requested link from mobile app.",
  },
  {
    id: 2,
    consumerName: "Almaty Supermarket",
    contact: "+7 701 555 0000",
    createdAt: "2025-10-20",
    status: "active",
    notes: "Regular orders every week.",
  },
  {
    id: 3,
    consumerName: "Small Cafe Astana",
    contact: "+7 702 999 8899",
    createdAt: "2025-09-10",
    status: "blocked",
    notes: "Blocked due to repeated complaints.",
  },
];

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "blocked", label: "Blocked" },
];

export default function LinksPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const isOwner = user.role === "OWNER";
  const isManager = user.role === "MANAGER";

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      if (statusFilter !== "all" && link.status !== statusFilter) {
        return false;
      }
      if (
        search.trim() &&
        !link.consumerName.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [links, statusFilter, search]);

  const updateLinkStatus = (id, newStatus, extraNote) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: newStatus,
              notes:
                extraNote && extraNote.trim()
                  ? `${l.notes ? l.notes + " | " : ""}${extraNote}`
                  : l.notes,
            }
          : l
      )
    );
  };

  const handleApprove = (id) => {
    //both Owner and Manager can approve
    if (!isOwner && !isManager) return;
    updateLinkStatus(id, "active", "Link approved.");
  };

  const handleReject = (id) => {
    if (!isOwner && !isManager) return;
    const reason = window.prompt(
      "Optional: enter a reason for rejection (it will be saved to notes):",
      ""
    );
    updateLinkStatus(id, "blocked", reason || "Link request rejected.");
  };

  const handleUnlink = (id) => {
    if (!isOwner && !isManager) return;
    const confirm = window.confirm(
      "Unlink this consumer? They will no longer see your catalog or place orders."
    );
    if (!confirm) return;
    updateLinkStatus(id, "blocked", "Unlinked by supplier.");
  };

  const handleBlock = (id) => {
    //make blocking Owner-only
    if (!isOwner) return;
    const confirm = window.confirm(
      "Block this consumer? They will be blocked at link level.\nIn real system, they should not be able to request/link again easily."
    );
    if (!confirm) return;
    updateLinkStatus(id, "blocked", "Blocked by supplier.");
  };

  const handleUnblock = (id) => {
    if (!isOwner) return;
    const confirm = window.confirm(
      "Unblock this consumer? They will become active again."
    );
    if (!confirm) return;
    updateLinkStatus(id, "active", "Unblocked by supplier.");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Links</h1>
          <p className="text-sm text-slate-600">
            Manage links between your supplier and consumers. Approve pending
            requests, view active links, and handle blocked consumers.
          </p>
        </div>
      </div>

      {!isOwner && (
        <div className="mb-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          You are logged in as <strong>{user.role}</strong>. Approving and
          rejecting link requests is allowed. Blocking/unblocking consumers is{" "}
          <strong>Owner-only</strong>.
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
            placeholder="Search by consumer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1.5 text-sm w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Consumer</th>
              <th className="text-left px-4 py-2">Contact</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-center px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Notes</th>
              <th className="text-right px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.map((link) => (
              <tr key={link.id} className="border-t align-top">
                <td className="px-4 py-2">
                  <div className="font-medium">{link.consumerName}</div>
                  <div className="text-xs text-slate-400">
                    ID: {link.id.toString().padStart(4, "0")}
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-500">
                  <div>{link.contact}</div>
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {link.createdAt}
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                      link.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : link.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {link.status.charAt(0).toUpperCase() +
                      link.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500 max-w-xs">
                  <div className="text-xs whitespace-pre-wrap">
                    {link.notes || "—"}
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex flex-wrap gap-1 justify-end">
                    {link.status === "pending" && (isOwner || isManager) && (
                      <>
                        <button
                          onClick={() => handleApprove(link.id)}
                          className="px-2 py-1 text-xs rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(link.id)}
                          className="px-2 py-1 text-xs rounded border border-red-600 text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {link.status === "active" && (isOwner || isManager) && (
                      <>
                        <button
                          onClick={() => handleUnlink(link.id)}
                          className="px-2 py-1 text-xs rounded border hover:bg-slate-50"
                        >
                          Unlink
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => handleBlock(link.id)}
                            className="px-2 py-1 text-xs rounded border border-red-600 text-red-700 hover:bg-red-50"
                          >
                            Block
                          </button>
                        )}
                      </>
                    )}

                    {link.status === "blocked" && isOwner && (
                      <button
                        onClick={() => handleUnblock(link.id)}
                        className="px-2 py-1 text-xs rounded border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                      >
                        Unblock
                      </button>
                    )}

                    {/* If no actions available */}
                    {link.status === "blocked" && !isOwner && (
                      <span className="text-[11px] text-slate-400">
                        No actions (Owner-only)
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredLinks.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  No links found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

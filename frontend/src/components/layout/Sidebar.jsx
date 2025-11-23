import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/catalog", label: "Catalog" },
  { to: "/orders", label: "Orders" },
  { to: "/links", label: "Links" },
  { to: "/staff", label: "Staff" },
  { to: "/incidents", label: "Incidents" },
  { to: "/chat", label: "Chat" },
  { to: "/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-56 bg-white border-r">
      <div className="h-14 border-b flex items-center px-4 text-sm font-semibold">
        Menu
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center px-3 py-2 rounded text-sm",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-700 hover:bg-slate-100",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

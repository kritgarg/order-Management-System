import { Home, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = ({
  currentPage,
  onPageChange,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "All Orders", icon: FileText },
    { id: "add-order", label: "Add Order", icon: Plus },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white m-3 h-[calc(100vh-24px)] flex flex-col rounded-2xl shadow-xl">
      <div className="p-6 border-b border-slate-800/60">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          C.S CASTINGS
        </h1>
        <p className="text-xs text-slate-400 mt-1">Order Management System</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    currentPage === item.id
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-300 hover:bg-white/5",
                  )}
                >
                  <span className={cn(
                    "inline-flex items-center justify-center rounded-lg p-2",
                    currentPage === item.id ? "bg-white/20" : "bg-white/10"
                  )}>
                    <Icon
                      size={18}
                      className={cn(currentPage === item.id ? "text-white" : "text-slate-300")}
                    />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
};

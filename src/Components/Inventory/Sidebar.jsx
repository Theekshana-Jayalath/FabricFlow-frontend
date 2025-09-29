// Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBoxes, FaUserFriends, FaChartBar, FaHome, FaShoppingCart } from "react-icons/fa";

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/" },
    { name: "Materials", icon: <FaBoxes />, path: "/Material" },
    { name: "Suppliers", icon: <FaUserFriends />, path: "/Supplier" },
    { name: "Purchase", icon: <FaShoppingCart />, path: "/Purchase" },
    { name: "Reports", icon: <FaChartBar />, path: "/Reports" },
  ];

  return (
    <aside className="w-64 bg-green-900 text-white flex flex-col p-6 shadow-lg min-h-screen">
      <h2 className="text-2xl font-extrabold mb-10 text-center text-green-300 tracking-wide">FabricFlow</h2>
      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-green-700 shadow-md shadow-green-400" 
                  : "hover:bg-green-800 hover:translate-x-1"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-green-200 text-xs text-center py-4 border-t border-green-800">
        © 2025 FabricFlow
      </div>
    </aside>
  );
}

export default Sidebar;

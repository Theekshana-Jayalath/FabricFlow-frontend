import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

function InventoryDashboard() {
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/Material")
        .then((res) => res.json())
        .then((data) => setMaterials(data.materials || []))
        .catch((err) => console.error("Error fetching materials:", err));

      fetch("http://localhost:5000/api/Supplier")
        .then((res) => res.json())
        .then((data) => setSuppliers(Array.isArray(data) ? data : data.suppliers || []))
        .catch((err) => console.error("Error fetching suppliers:", err));

      fetch("http://localhost:5000/api/Purchase")
        .then((res) => res.json())
        .then((data) => setPurchases(data.purchases || []))
        .catch((err) => console.error("Error fetching purchases:", err));
    };

    fetchData(); // Initial load
    const interval = setInterval(fetchData, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Monthly purchases aggregation
  const monthlyPurchasesData = Array.from({ length: 12 }, (_, i) => {
    const monthPurchases = purchases.filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === i && d.getFullYear() === new Date().getFullYear();
    });

    const total = monthPurchases.reduce(
      (sum, p) => sum + (p.totalCost || p.quantity * p.unitPrice),
      0
    );

    return {
      month: new Date(0, i).toLocaleString("default", { month: "short" }),
      totalCost: total
    };
  });

  const lowStockMaterials = materials.filter(
    (m) => m.quantity <= m.reOrderLevel
  );

  return (
    <div className="flex min-h-screen font-sans ">

      <main className="flex-1 overflow-y-auto font-sans">
        <h1 className="text-2xl font-bold text-green-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br bg-[#1804CC] text-white p-6 rounded-xl shadow-lg transform transition hover:scale-105">
            <h2 className="text-lg font-semibold mb-2">Total Materials</h2>
            <p className="text-2xl font-bold">{materials.length}</p>
          </div>
          <div className="bg-gradient-to-br bg-[#005A54] text-white p-6 rounded-xl shadow-lg transform transition hover:scale-105">
            <h2 className="text-lg font-semibold mb-2">Total Suppliers</h2>
            <p className="text-2xl font-bold">{suppliers.length}</p>
          </div>
          <div
            className={`p-6 rounded-xl shadow-lg transform transition hover:scale-105 ${
              lowStockMaterials.length > 0
                ? "bg-red-100 text-red-700"
                : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-lg font-semibold mb-2">Low Stock</h2>
            <p className="text-2xl font-bold">{lowStockMaterials.length}</p>
          </div>
          <div className="bg-gradient-to-br bg-[#610F95] text-white p-6 rounded-xl shadow-lg transform transition hover:scale-105">
            <h2 className="text-lg font-semibold mb-2">Inventory Value</h2>
            <p className="text-2xl font-bold">
              Rs.
              {materials
                .reduce((acc, m) => acc + m.unitPrice * m.quantity, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockMaterials.length > 0 && (
          <div className="bg-red-100 text-red-700 p-5 rounded-xl font-semibold text-center shadow mb-8 border border-red-300 animate-pulse">
            ⚠️ Low Stock Alert! {lowStockMaterials.length} material(s) are below
            their re-order level.
          </div>
        )}

        {/* Purchases Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-900">
            Monthly Purchases
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyPurchasesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#065F46", fontWeight: "500" }}
              />
              <YAxis tick={{ fill: "#065F46", fontWeight: "500" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalCost"
                stroke="#065F46"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Materials Table */}
          <div className="bg-white p-6 rounded-2xl shadow-lg overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 text-green-900">
              Recent Materials
            </h2>
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {["MaterialID", "Name", "Re-Order Level", "Quantity"].map(
                    (header) => (
                      <th
                        key={header}
                        className="text-left px-4 py-2 bg-green-50 text-green-900 font-semibold border-b-2"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {materials.slice(-5).map((m) => (
                  <tr
                    key={m._id}
                    className={`transition hover:bg-green-100 rounded-lg ${
                      m.quantity <= m.reOrderLevel
                        ? "bg-red-100 text-red-700"
                        : "bg-white text-green-900"
                    }`}
                  >
                    <td className="px-4 py-2">{m.materialId}</td>
                    <td className="px-4 py-2">{m.name}</td>
                    <td className="px-4 py-2">{m.reOrderLevel}</td>
                    <td className="px-4 py-2">{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Suppliers Table */}
          <div className="bg-white p-6 rounded-2xl shadow-lg overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4 text-green-900">
              Recent Suppliers
            </h2>
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  {["Supplier ID", "Name", "Contact"].map((header) => (
                    <th
                      key={header}
                      className="text-left px-4 py-2 bg-green-50 text-green-900 font-semibold border-b-2"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.slice(-5).map((s) => (
                  <tr
                    key={s._id}
                    className="transition hover:bg-green-100 rounded-lg"
                  >
                    <td className="px-4 py-2">{s.supplierId}</td>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InventoryDashboard;

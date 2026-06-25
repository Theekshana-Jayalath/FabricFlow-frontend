// Report.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EXPENSE_URL = "http://localhost:5000/api/expenses";
const PURCHASE_URL = "http://localhost:5000/api/Purchase";
const PAYROLL_URL = "http://localhost:5000/api/payrolls";
const ORDERS_URL = "http://localhost:5000/api/orders";

const FinanceReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, purRes, payRes, ordRes] = await Promise.all([
          axios.get(EXPENSE_URL),
          axios.get(PURCHASE_URL),
          axios.get(PAYROLL_URL),
          axios.get(ORDERS_URL),
        ]);
        setExpenses(expRes.data.expenses || []);
        setPurchases(purRes.data.purchases || []);
        setPayrolls(payRes.data.payrolls || []);
        setOrders(
          Array.isArray(ordRes.data)
            ? ordRes.data
            : ordRes.data.orders
            ? ordRes.data.orders
            : ordRes.data.data || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatMonth = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const calculateMonthlyTotals = () => {
    const totals = {};
    const add = (m, t, amt) => {
      if (!totals[m])
        totals[m] = { income: 0, expenses: 0, purchases: 0, payroll: 0 };
      totals[m][t] += amt;
    };
    expenses.forEach((e) => add(formatMonth(e.date), "expenses", +e.amount));
    purchases.forEach((p) => add(formatMonth(p.date), "purchases", +(p.totalCost || 0)));
    payrolls.forEach((p) => add(formatMonth(p.date), "payroll", +(p.netsalary || 0)));
    orders.forEach((o) => add(formatMonth(o.orderDate), "income", +(o.totalAmount || 0)));
    return totals;
  };

  const monthlyTotals = calculateMonthlyTotals();
  const months = Object.keys(monthlyTotals).sort();
  const filteredMonths = months.filter((m) =>
    selectedMonth ? m === selectedMonth : selectedYear ? m.startsWith(selectedYear) : true
  );

  const chartData = {
    labels: filteredMonths,
    datasets: [
      { label: "Income", data: filteredMonths.map((m) => monthlyTotals[m].income), backgroundColor: "#00756D" },
      { label: "Expenses", data: filteredMonths.map((m) => monthlyTotals[m].expenses), backgroundColor: "#ef4444" },
      { label: "Purchases", data: filteredMonths.map((m) => monthlyTotals[m].purchases), backgroundColor: "#3b82f6" },
      { label: "Payroll", data: filteredMonths.map((m) => monthlyTotals[m].payroll), backgroundColor: "#facc15" },
    ],
  };

  // PDF Download (Enhanced Styling)
  const downloadTablePDF = () => {
  const doc = new jsPDF();

  // ===== HEADER WITH GREEN BACKGROUND =====
  doc.setFillColor(0, 77, 64); // Tailwind green-900 style
  doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");

  // Circle Logo
  doc.setFillColor(255, 255, 255);
  doc.circle(15, 15, 8, "F");
  doc.setTextColor(0, 77, 64);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FF", 15, 18, { align: "center" });

  // FABRIC FLOW Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("FABRIC FLOW", 32, 15);

  // Subtitle (Changed to Report Summary)
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Management System", 32, 22);

  // ===== WHITE TITLE BOX =====
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 40, doc.internal.pageSize.width - 20, 25, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 77, 64);
  doc.text(
    ` PROFIT & LOSS REPORT SUMMARy (${selectedMonth || selectedYear || "All"})`,
    doc.internal.pageSize.getWidth() / 2,
    53,
    { align: "center" }
  );

  // ===== META INFO (DATE + TIME + MONTH) =====
  const now = new Date();
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(33, 33, 33);
  doc.text(`Report Generated: ${now.toLocaleString()}`, 14, 70);
  doc.text(`Month/Year: ${selectedMonth || selectedYear || "All"}`, 14, 76);

  // Calculate Totals
  let tIncome = 0, tExp = 0, tPur = 0, tPay = 0;
  filteredMonths.forEach((m) => {
    const d = monthlyTotals[m];
    tIncome += d.income; tExp += d.expenses; tPur += d.purchases; tPay += d.payroll;
  });
  const grandExp = tExp + tPur + tPay;
  const profit = tIncome - grandExp;

  // ===== TABLE =====
  autoTable(doc, {
    startY: 90,
    head: [["Description", "Income (Rs)", "Expense (Rs)"]],
    body: [
      ["Income (Orders)", tIncome.toFixed(2), ""],
      ["Expenses", "", tExp.toFixed(2)],
      ["Purchases", "", tPur.toFixed(2)],
      ["Payroll", "", tPay.toFixed(2)],
      ["Total", tIncome.toFixed(2), grandExp.toFixed(2)],
    ],
    theme: "grid",
    styles: { fontSize: 11, halign: "center", valign: "middle", lineColor: [200, 200, 200] },
    headStyles: { fillColor: [0, 77, 64], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // ===== SUMMARY BOX (Now Always Header Green) =====
  const summaryY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(0, 77, 64); // use header color, no red/green difference
  doc.roundedRect(10, summaryY, doc.internal.pageSize.width - 20, 20, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Net ${profit >= 0 ? "Profit" : "Loss"}: Rs ${profit.toFixed(2)}`,
    doc.internal.pageSize.getWidth() / 2,
    summaryY + 13,
    { align: "center" }
  );

  // ===== FOOTER =====
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Fabric Flow Management System | Confidential Document",
    doc.internal.pageSize.getWidth() / 2,
    pageHeight - 10,
    { align: "center" }
  );

  doc.save(`FabricFlow_ReportSummary_${selectedMonth || selectedYear || "All"}.pdf`);
};

  if (loading) return <div className="p-6 text-center">Loading report…</div>;

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-[#005654] tracking-wide">
            FABRIC FLOW
          </h1>
          <p className="text-lg text-gray-600 mt-1">Profit / Loss Report</p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6 justify-center">
          <label className="font-medium">Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); setSelectedYear(""); }}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
          <label className="font-medium">Year:</label>
          <input
            type="number"
            min="2000"
            max="2100"
            placeholder="YYYY"
            value={selectedYear}
            onChange={(e) => { setSelectedYear(e.target.value); setSelectedMonth(""); }}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
          {(selectedMonth || selectedYear) && (
            <button
              onClick={() => { setSelectedMonth(""); setSelectedYear(""); }}
              className="text-sm text-red-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Chart */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#005654] mb-4">Monthly Profit & Loss</h2>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
            }}
          />
        </div>

        {/* Download Button */}
        <div className="text-center mb-8">
          <button
            onClick={downloadTablePDF}
            className="
              bg-gradient-to-r bg-[#005654]
              hover:bg-[#00756D]
              text-white font-bold
              px-8 py-3
              rounded-full
              shadow-lg
              transform transition
              duration-300
              hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2
            "
          >
            📄 Download Fabric Flow PDF
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-2xl p-6 overflow-auto">
          <h2 className="text-2xl font-semibold text-[#005654] mb-4">Monthly Breakdown</h2>
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-[#005654] text-white">
              <tr>
                <th className="p-3 border">Month</th>
                <th className="p-3 border">Income (Rs)</th>
                <th className="p-3 border">Expenses (Rs)</th>
                <th className="p-3 border">Purchases (Rs)</th>
                <th className="p-3 border">Payroll (Rs)</th>
                <th className="p-3 border">Profit (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {filteredMonths.map((m) => {
                const d = monthlyTotals[m];
                const profit = d.income - (d.expenses + d.purchases + d.payroll);
                return (
                  <tr key={m} className="text-center hover:bg-green-50">
                    <td className="p-3 border">{m}</td>
                    <td className="p-3 border">Rs {d.income.toFixed(2)}</td>
                    <td className="p-3 border">Rs {d.expenses.toFixed(2)}</td>
                    <td className="p-3 border">Rs {d.purchases.toFixed(2)}</td>
                    <td className="p-3 border">Rs {d.payroll.toFixed(2)}</td>
                    <td className={`p-3 border font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      Rs {profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceReport;
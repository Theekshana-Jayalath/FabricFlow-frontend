import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const API_URL = "http://localhost:5000/api/payrolls";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    empId: "",
    empName: "",
    payrollId: "",
    date: "",
    basicSalary: "",
    workingDays: 30,
    absentDays: "",
    overtimeHours: "",
    otRate: "",
    allowances: [{ title: "", amount: "" }],
    deductions: [{ title: "", amount: "" }],
  });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(API_URL);
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Calculations --- */
  const calculateTotals = (data) => {
    const basic = Number(data.basicSalary) || 0;
    const working = Number(data.workingDays) || 1;
    const absent = Number(data.absentDays) || 0;
    const otHours = Number(data.overtimeHours) || 0;
    const otRate = Number(data.otRate) || 0;

    const totalAllowances = (data.allowances || []).reduce(
      (sum, a) => sum + (Number(a.amount) || 0),
      0
    );
    const totalDeductions = (data.deductions || []).reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    const otAmount = otHours * otRate * (basic / working / 8);
    const noPay = (basic / working) * absent;
    const epfEmployee = basic * 0.08;
    const grossSalary = basic + totalAllowances + otAmount;
    const netSalary = grossSalary - (epfEmployee + noPay + totalDeductions);

    return { otAmount, noPay, epfEmployee, grossSalary, netSalary };
  };

  const totals = calculateTotals(formData);

  /** --- Monthly Payroll Chart Data --- */
  const getMonthlyPayrollData = () => {
    const monthlyTotals = {};
    payrolls.forEach((p) => {
      const date = new Date(p.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = { name: monthYear, netSalary: 0 };
      }
      monthlyTotals[monthYear].netSalary += Number(p.netsalary || 0);
    });
    return Object.values(monthlyTotals).sort((a, b) => a.name.localeCompare(b.name));
  };

  const chartData = getMonthlyPayrollData();

  /** --- Save or Update payroll --- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.empName || !formData.basicSalary) {
      setError("Employee name and basic salary required");
      return;
    }
    const calc = calculateTotals(formData);

    const allowances = (formData.allowances || []).filter(
      (a) => a.title && a.amount
    );
    const deductions = (formData.deductions || []).filter(
      (d) => d.title && d.amount
    );

    const payload = {
      ...formData,
      empId: formData.empId || `EMP${Date.now()}`,
      payrollId: formData.payrollId || `PAY${Date.now()}`,
      date: formData.date || new Date().toISOString().split("T")[0],
      otAmount: calc.otAmount,
      noPay: calc.noPay,
      epfEmployee: calc.epfEmployee,
      totalAllowances: allowances.reduce((s, a) => s + Number(a.amount), 0),
      totalDeductions: deductions.reduce((s, d) => s + Number(d.amount), 0),
      netsalary: calc.netSalary,
      allowances,
      deductions,
    };

    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, payload);
        setPayrolls(
          payrolls.map((p) => (p._id === editingId ? res.data.payroll : p))
        );
        setEditingId(null);
      } else {
        const res = await axios.post(API_URL, payload);
        setPayrolls([...payrolls, res.data.payroll]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to save payroll");
    }
  };

  const resetForm = () => {
    setFormData({
      empId: "",
      empName: "",
      payrollId: "",
      date: "",
      basicSalary: "",
      workingDays: 30,
      absentDays: "",
      overtimeHours: "",
      otRate: "",
      allowances: [{ title: "", amount: "" }],
      deductions: [{ title: "", amount: "" }],
    });
    setError("");
    setShowForm(false);
    setEditingId(null);
  };

  /** --- Delete with confirmation --- */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payroll record?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setPayrolls(payrolls.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Edit with confirmation --- */
  const handleEdit = (p) => {
    const confirmEdit = window.confirm(
      `Do you want to update the payroll record for ${p.empName}?`
    );
    if (!confirmEdit) return;

    setFormData({
      empId: p.empId,
      empName: p.empName,
      payrollId: p.payrollId,
      date: p.date,
      basicSalary: p.basicSalary,
      workingDays: p.workingDays,
      absentDays: p.absentDays,
      overtimeHours: p.overtimeHours,
      otRate: p.otRate,
      allowances: p.allowances.length ? p.allowances : [{ title: "", amount: 0 }],
      deductions: p.deductions.length ? p.deductions : [{ title: "", amount: 0 }],
    });
    setEditingId(p._id);
    setShowForm(true);
  };

 /** --- Download single payslip PDF --- */
const downloadPDF = (p) => {
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

  // --- Payroll info ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  const today = new Date();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear();
  doc.text(`Payroll Date: ${p.date}`, 14, 35);
  doc.text(`Download Month: ${month} ${year}`, 14, 40);
  doc.text(`Employee ID: ${p.empId}`, 14, 45);
  doc.text(`Payroll ID: ${p.payrollId}`, 14, 50);

  // --- Basic Salary Table ---
  autoTable(doc, {
    startY: 60,
    head: [["Item", "Amount (Rs)"]],
    body: [
      ["Basic Salary", p.basicSalary.toFixed(2)],
      ["Overtime Amount", p.otAmount.toFixed(2)],
      ["No Pay Deduction", p.noPay.toFixed(2)],
      ["EPF Employee (8%)", p.epfEmployee.toFixed(2)],
    ],
    theme: "grid",
  });

  // --- Allowances Table ---
  if (p.allowances && p.allowances.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Allowance", "Amount (Rs)"]],
      body: p.allowances.map((a) => [a.title, a.amount]),
      theme: "grid",
    });
  }

  // --- Deductions Table ---
  if (p.deductions && p.deductions.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Deduction", "Amount (Rs)"]],
      body: p.deductions.map((d) => [d.title, d.amount]),
      theme: "grid",
    });
  }

  // --- Net Salary ---
  const netY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(0, 90, 84); // same as header
  doc.rect(0, netY - 8, 210, 10, "F");
  doc.text(`Net Salary: Rs ${p.netsalary.toFixed(2)}`, 105, netY, { align: "center" });

  doc.save(`${p.empName}_Payslip.pdf`);
};

  /** --- Summary Chart Data --- */
  const totalSalary = payrolls.reduce((s, p) => s + (p.basicSalary || 0), 0);
  const totalNet = payrolls.reduce((s, p) => s + (p.netsalary || 0), 0);
  const totalDeduct = payrolls.reduce(
    (s, p) =>
      s + (p.deductions || []).reduce((a, b) => a + (Number(b.amount) || 0), 0),
    0
  );

  const summaryChartData = [
    { name: "Basic Salary", amount: totalSalary },
    { name: "Deductions", amount: totalDeduct },
    { name: "Net Salary", amount: totalNet },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div>
      <button
  className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded"
  onClick={() => setShowForm(true)}
>
  ➕ Add Payroll
</button>
</div>


      {/* Main content */}
      <main className="flex-1 p-6">
        
        {/* Payroll Form */}
        {showForm && (
          <form
            className="bg-white p-6 rounded shadow-md max-w-3xl mb-6"
            onSubmit={handleSubmit}
          >
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Employee name & salary */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Employee Name</label>
                <input
                  type="text"
                  value={formData.empName}
                  onChange={(e) =>
                    setFormData({ ...formData, empName: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold">Basic Salary</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basicSalary: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* Other fields */}
            <div className="mb-4 grid grid-cols-4 gap-4">
              <div>
                <label className="font-semibold">Working Days</label>
                <input
                  type="number"
                  value={formData.workingDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workingDays: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Absent Days</label>
                <input
                  type="number"
                  value={formData.absentDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      absentDays: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">Overtime Hours</label>
                <input
                  type="number"
                  value={formData.overtimeHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      overtimeHours: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="font-semibold">OT Rate</label>
                <input
                  type="number"
                  value={formData.otRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      otRate: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Allowances */}
            <h3 className="font-semibold mt-4 mb-2">Allowances</h3>
            {formData.allowances.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={a.title}
                  onChange={(e) => {
                    const arr = [...formData.allowances];
                    arr[i].title = e.target.value;
                    setFormData({ ...formData, allowances: arr });
                  }}
                  className="p-2 border rounded flex-1"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={a.amount}
                  onChange={(e) => {
                    const arr = [...formData.allowances];
                    arr[i].amount = Number(e.target.value);
                    setFormData({ ...formData, allowances: arr });
                  }}
                  className="p-2 border rounded flex-1"
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 rounded"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      allowances: formData.allowances.filter(
                        (_, idx) => idx !== i
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              onClick={() =>
                setFormData({
                  ...formData,
                  allowances: [...formData.allowances, { title: "", amount: 0 }],
                })
              }
            >
              + Add Allowance
            </button>

            {/* Deductions */}
            <h3 className="font-semibold mt-4 mb-2">Deductions</h3>
            {formData.deductions.map((d, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={d.title}
                  onChange={(e) => {
                    const arr = [...formData.deductions];
                    arr[i].title = e.target.value;
                    setFormData({ ...formData, deductions: arr });
                  }}
                  className="p-2 border rounded flex-1"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={d.amount}
                  onChange={(e) => {
                    const arr = [...formData.deductions];
                    arr[i].amount = Number(e.target.value);
                    setFormData({ ...formData, deductions: arr });
                  }}
                  className="p-2 border rounded flex-1"
                />
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 rounded"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      deductions: formData.deductions.filter(
                        (_, idx) => idx !== i
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              onClick={() =>
                setFormData({
                  ...formData,
                  deductions: [...formData.deductions, { title: "", amount: 0 }],
                })
              }
            >
              + Add Deduction
            </button>

            {/* Totals */}
            <div className="mb-4 bg-gray-100 p-4 rounded">
              <p>Overtime Amount: Rs {totals.otAmount.toFixed(2)}</p>
              <p>No Pay Deduction: Rs {totals.noPay.toFixed(2)}</p>
              <p>EPF Employee: Rs {totals.epfEmployee.toFixed(2)}</p>
              <p className="font-semibold">
                Net Salary: Rs {totals.netSalary.toFixed(2)}
              </p>
            </div>

            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {editingId ? "Update Payroll" : "Save Payroll"}
            </button>
          </form>
        )}

        {/* Payroll Records Table */}
        <div className="bg-white p-6 rounded shadow-md mb-6 overflow-auto">
          <h3 className="text-xl font-semibold mb-4">Payroll Records</h3>
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Employee</th>
                <th className="border px-2 py-1">Basic Salary</th>
                <th className="border px-2 py-1">Overtime</th>
                <th className="border px-2 py-1">No Pay</th>
                <th className="border px-2 py-1">EPF</th>
                <th className="border px-2 py-1">Net Salary</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p._id}>
                  <td className="border px-2 py-1">{p.empName}</td>
                  <td className="border px-2 py-1">Rs {p.basicSalary}</td>
                  <td className="border px-2 py-1">Rs {p.otAmount.toFixed(2)}</td>
                  <td className="border px-2 py-1">Rs {p.noPay.toFixed(2)}</td>
                  <td className="border px-2 py-1">Rs {p.epfEmployee.toFixed(2)}</td>
                  <td className="border px-2 py-1">Rs {p.netsalary.toFixed(2)}</td>
                  <td className="border px-2 py-1">{p.date}</td>
                  <td className="border px-2 py-1 flex flex-wrap gap-2">
                    <button
                      className="bg-yellow-500 text-white px-2 rounded"
                      onClick={() => handleEdit(p)}
                    >
                      Update
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 rounded"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-blue-600 text-white px-2 rounded"
                      onClick={() => downloadPDF(p)}
                    >
                      Download 
                    </button>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Chart */}
        
      </main>
    </div>
  );
};

export default Payroll;
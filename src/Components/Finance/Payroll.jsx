import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://localhost:5000/api/payrolls";

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    empId: "",
    empName: "",
    payrollId: "",
    date: "",
    basicSalary: 0,
    workingDays: 30,
    absentDays: 0,
    overtimeHours: 0,
    otRate: 0,
    allowances: [{ title: "", amount: 0 }],
    deductions: [{ title: "", amount: 0 }],
  });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // track which payroll is being edited

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(API_URL);
      setPayrolls(res.data.payrolls);
    } catch (err) {
      console.error(err);
    }
  };

  // REAL-TIME CALCULATIONS
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.empName || !formData.basicSalary) {
      setError("Employee name and basic salary required");
      return;
    }

    const payload = {
      ...formData,
      empId: formData.empId || `EMP ${Date.now()}`,
      payrollId: formData.payrollId || `PAY ${Date.now()}`,
      date: formData.date || new Date().toISOString().split("T")[0],
      otAmount: totals.otAmount,
      noPay: totals.noPay,
      epfEmployee: totals.epfEmployee,
      netsalary: totals.netSalary,
    };

    try {
      if (editingId) {
        // Update existing payroll
        const res = await axios.put(`${API_URL}/${editingId}`, payload);
        setPayrolls(
          payrolls.map((p) => (p._id === editingId ? res.data.payroll : p))
        );
        setEditingId(null);
      } else {
        // Add new payroll
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
      basicSalary: 0,
      workingDays: 30,
      absentDays: 0,
      overtimeHours: 0,
      otRate: 0,
      allowances: [{ title: "", amount: 0 }],
      deductions: [{ title: "", amount: 0 }],
    });
    setError("");
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setPayrolls(payrolls.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (p) => {
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

  const downloadPDF = (p) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Payslip - ${p.empName}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${p.date}`, 14, 28);
    doc.text(`Basic Salary: $${p.basicSalary}`, 14, 36);

    doc.text("Allowances:", 14, 44);
    doc.autoTable({
      startY: 48,
      head: [["Title", "Amount"]],
      body: (p.allowances || []).map((a) => [a.title, `$${a.amount}`]),
    });

    const y = doc.previousAutoTable.finalY + 10;
    doc.text("Deductions:", 14, y);
    doc.autoTable({
      startY: y + 4,
      head: [["Title", "Amount"]],
      body: (p.deductions || []).map((d) => [d.title, `$${d.amount}`]),
    });

    const y2 = doc.previousAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Net Salary: $${p.netsalary.toFixed(2)}`, 14, y2);
    doc.save(`${p.empName}_Payslip.pdf`);
  };

  // CHART DATA
  const totalSalary = payrolls.reduce((sum, p) => sum + p.basicSalary, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + p.netsalary, 0);
  const totalDeduct = payrolls.reduce(
    (sum, p) => sum + (p.deductions || []).reduce((a, b) => a + b.amount, 0),
    0
  );

  const chartData = [
    { name: "Basic Salary", amount: totalSalary },
    { name: "Deductions", amount: totalDeduct },
    { name: "Net Salary", amount: totalNet },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-6">Payroll Menu</h3>
        <button
          className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          ➕ Add Payroll
        </button>
        <button
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
          onClick={() => setShowForm(false)}
        >
          📊 Payroll Summary
        </button>
      </aside>

      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-4">Payroll</h2>

        {/* PAYROLL FORM */}
        {showForm && (
          <form
            className="bg-white p-6 rounded shadow-md max-w-3xl mb-6"
            onSubmit={handleSubmit}
          >
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Employee & Basic Salary */}
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

            {/* Working Days, Absent Days, OT */}
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
                    setFormData({ ...formData, otRate: Number(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Allowances & Deductions */}
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
                  onClick={() => {
                    const arr = formData.allowances.filter((_, idx) => idx !== i);
                    setFormData({ ...formData, allowances: arr });
                  }}
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
                  onClick={() => {
                    const arr = formData.deductions.filter((_, idx) => idx !== i);
                    setFormData({ ...formData, deductions: arr });
                  }}
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

            {/* CALCULATED TOTALS */}
            <div className="mb-4 bg-gray-100 p-4 rounded">
              <p>Overtime Amount: Rs{totals.otAmount.toFixed(2)}</p>
              <p>No Pay Deduction: Rs{totals.noPay.toFixed(2)}</p>
              <p>EPF Employee: Rs{totals.epfEmployee.toFixed(2)}</p>
              <p className="font-semibold">
                Net Salary: Rs{totals.netSalary.toFixed(2)}
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

        {/* PAYROLL TABLE */}
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-4">Payroll Records</h3>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Employee</th>
                <th className="border px-2 py-1">Basic Salary</th>
                <th className="border px-2 py-1">Net Salary</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p._id}>
                  <td className="border px-2 py-1">{p.empName}</td>
                  <td className="border px-2 py-1">Rs{p.basicSalary}</td>
                  <td className="border px-2 py-1">Rs{p.netsalary.toFixed(2)}</td>
                  <td className="border px-2 py-1">{p.date}</td>
                  <td className="border px-2 py-1 flex gap-2">
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
                      className="bg-blue-500 text-white px-2 rounded"
                      onClick={() => downloadPDF(p)}
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAYROLL SUMMARY CHART */}
        {!showForm && (
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-xl font-semibold mb-4">Payroll Summary</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
};

export default Payroll;

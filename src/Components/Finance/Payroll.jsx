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

  // ===== Search state =====
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payroll record?"))
      return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setPayrolls(payrolls.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (p) => {
    if (!window.confirm(`Do you want to update payroll for ${p.empName}?`))
      return;
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
    doc.setFillColor(0, 77, 64);
    doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("FABRIC FLOW", 14, 18);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Payroll Management System", 14, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    const infoY = 40;
    const infoSpacing = 6;
    doc.text(`Employee: ${p.empName}`, 14, infoY);
    doc.text(`Payroll ID: ${p.payrollId}`, 14, infoY + infoSpacing);
    doc.text(`Employee ID: ${p.empId}`, 14, infoY + infoSpacing * 2);
    doc.text(`Payroll Date: ${p.date}`, 14, infoY + infoSpacing * 3);

    autoTable(doc, {
      startY: infoY + infoSpacing * 5,
      head: [["Item", "Amount (Rs)"]],
      body: [
        ["Basic Salary", p.basicSalary.toFixed(2)],
        ["Overtime", p.otAmount.toFixed(2)],
        ["No Pay Deduction", p.noPay.toFixed(2)],
        ["EPF Employee (8%)", p.epfEmployee.toFixed(2)],
        ["Net Salary", p.netsalary.toFixed(2)],
      ],
      theme: "grid",
      headStyles: { fillColor: [0, 77, 64], textColor: 255 },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      styles: { fontSize: 11, cellPadding: 4 },
    });

    if (p.allowances && p.allowances.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 6,
        head: [["Allowance", "Amount (Rs)"]],
        body: p.allowances.map((a) => [a.title, a.amount.toFixed(2)]),
        theme: "grid",
        headStyles: { fillColor: [0, 77, 64], textColor: 255 },
        styles: { fontSize: 11, cellPadding: 4 },
      });
    }

    if (p.deductions && p.deductions.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 6,
        head: [["Deduction", "Amount (Rs)"]],
        body: p.deductions.map((d) => [d.title, d.amount.toFixed(2)]),
        theme: "grid",
        headStyles: { fillColor: [0, 77, 64], textColor: 255 },
        styles: { fontSize: 11, cellPadding: 4 },
      });
    }

    const netY = doc.lastAutoTable.finalY + 20;
    doc.setFillColor(0, 77, 64);
    const barWidth = 150;
    const pageWidth = doc.internal.pageSize.width;
    const barX = (pageWidth - barWidth) / 2;
    doc.rect(barX, netY - 6, barWidth, 10, "F");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`Net Salary: Rs ${p.netsalary.toFixed(2)}`, pageWidth / 2, netY, { align: "center" });

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

    doc.save(`${p.empName}_Payslip.pdf`);
  };

  // ===== Filter payrolls by search term =====
  const displayedPayrolls = payrolls.filter((p) =>
    p.empName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
<<<<<<< Updated upstream
    <div className="flex min-h-screen bg-gray-100">
      <div>
=======
    <div className="p-6">
      {/* Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#005654] text-white rounded hover:bg-[#00756D]"
        >
          Add Payroll
        </button>

        <input
          type="text"
          placeholder="Search by Employee Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg border border-green-300 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-green-900"
        />
      </div>


      {/* ===== Add/Update Payroll Form (full original code) ===== */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mb-6 space-y-4"
        >
          {error && (
            <p className="text-red-600 font-semibold text-sm">{error}</p>
          )}

          {/* Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Employee Name</label>
              <input
                type="text"
                value={formData.empName}
                onChange={(e) =>
                  setFormData({ ...formData, empName: e.target.value })
                }
                required
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Basic Salary</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basicSalary: Number(e.target.value),
                  })
                }
                required
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          {/* Working/Absent/OT */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Working Days</label>
              <input
                type="number"
                value={formData.workingDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workingDays: Number(e.target.value),
                  })
                }
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Absent Days</label>
              <input
                type="number"
                value={formData.absentDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    absentDays: Number(e.target.value),
                  })
                }
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Overtime Hours</label>
              <input
                type="number"
                value={formData.overtimeHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overtimeHours: Number(e.target.value),
                  })
                }
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">OT Rate</label>
              <input
                type="number"
                value={formData.otRate}
                onChange={(e) =>
                  setFormData({ ...formData, otRate: Number(e.target.value) })
                }
                className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          {/* Allowances */}
          <div>
            <h3 className="font-semibold mb-2">Allowances</h3>
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
                  className="border border-gray-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-green-600"
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
                  className="border border-gray-300 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      allowances: formData.allowances.filter(
                        (_, idx) => idx !== i
                      ),
                    })
                  }
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  allowances: [...formData.allowances, { title: "", amount: 0 }],
                })
              }
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Allowance
            </button>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-semibold mb-2">Deductions</h3>
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
                  className="border border-gray-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-green-600"
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
                  className="border border-gray-300 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      deductions: formData.deductions.filter(
                        (_, idx) => idx !== i
                      ),
                    })
                  }
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  deductions: [...formData.deductions, { title: "", amount: 0 }],
                })
              }
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Deduction
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-[#005654] text-white rounded hover:bg-[#00756D]"
            >
              {editingId ? "Update Payroll" : "Save Payroll"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ===== Payroll Table ===== */}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Payroll Records</h3>
        <table className="min-w-full bg-white border border-gray-200 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Employee</th>
              <th className="py-2 px-4 border-b">Basic Salary</th>
              <th className="py-2 px-4 border-b">Overtime</th>
              <th className="py-2 px-4 border-b">No Pay</th>
              <th className="py-2 px-4 border-b">EPF</th>
              <th className="py-2 px-4 border-b">Net Salary</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedPayrolls.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{p.empName}</td>
                <td className="py-2 px-4 border-b">Rs {p.basicSalary}</td>
                <td className="py-2 px-4 border-b">Rs {p.otAmount.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">Rs {p.noPay.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">Rs {p.epfEmployee.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">Rs {p.netsalary.toFixed(2)}</td>
                <td className="py-2 px-4 border-b">{p.date}</td>
                <td className="py-2 px-4 border-b flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-yellow-600 hover:text-yellow-800 border border-yellow-600 hover:border-yellow-800 px-2 py-1 rounded text-sm font-medium transition"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 px-2 py-1 rounded text-sm font-medium transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => downloadPDF(p)}
                    className="text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 px-2 py-1 rounded text-sm font-medium transition"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
            {displayedPayrolls.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;

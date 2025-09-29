import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaEdit, FaTrash, FaFilePdf, FaPrint } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./Invoices.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const URL = "http://localhost:5000/api/invoices"; // backend API

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    InvoiceId: "",
    Issuedate: "",
    PaymentStatus: "Pending",
    Amount: "",
    Description: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(URL);
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addInvoice = async () => {
    try {
      const res = await axios.post(URL, formData);
      setInvoices([...invoices, res.data.invoice]);
      resetForm();
    } catch (err) {
      console.error("Error adding invoice:", err);
      setError("Error adding invoice");
    }
  };

  const updateInvoice = async () => {
    try {
      const res = await axios.put(`${URL}/${editId}`, formData);
      setInvoices(
        invoices.map((inv) => (inv._id === editId ? res.data.invoice : inv))
      );
      resetForm();
    } catch (err) {
      console.error("Error updating invoice:", err);
      setError("Error updating invoice");
    }
  };

  const resetForm = () => {
    setFormData({
      InvoiceId: "",
      Issuedate: "",
      PaymentStatus: "Pending",
      Amount: "",
      Description: "",
    });
    setShowForm(false);
    setEditId(null);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateInvoice();
    } else {
      addInvoice();
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URL}/${id}`);
      setInvoices(invoices.filter((inv) => inv._id !== id));
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  const handleEdit = (invoice) => {
    setFormData({
      InvoiceId: invoice.InvoiceId,
      Issuedate: invoice.Issuedate?.substring(0, 10) || "",
      PaymentStatus: invoice.PaymentStatus,
      Amount: invoice.Amount,
      Description: invoice.Description,
    });
    setEditId(invoice._id);
    setShowForm(true);
  };

  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Field", "Value"]],
      body: [
        ["Invoice ID", invoice.InvoiceId],
        ["Issue Date", invoice.Issuedate],
        ["Amount", `$${invoice.Amount}`],
        ["Status", invoice.PaymentStatus],
        ["Description", invoice.Description],
      ],
    });
    doc.save(`invoice_${invoice.InvoiceId}.pdf`);
  };

  const printInvoice = (invoice) => {
    const printContent = `
      <h2>Invoice #${invoice.InvoiceId}</h2>
      <p><strong>Issue Date:</strong> ${invoice.Issuedate}</p>
      <p><strong>Amount:</strong> $${invoice.Amount}</p>
      <p><strong>Status:</strong> ${invoice.PaymentStatus}</p>
      <p><strong>Description:</strong> ${invoice.Description}</p>
    `;
    const newWin = window.open("", "", "width=600,height=400");
    newWin.document.write(printContent);
    newWin.document.close();
    newWin.print();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.InvoiceId?.toLowerCase().includes(search.toLowerCase()) ||
      inv.Description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus ? inv.PaymentStatus === filterStatus : true;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.Amount || 0), 0);
  const totalPaid = invoices
    .filter((inv) => inv.PaymentStatus === "Paid")
    .reduce((sum, inv) => sum + Number(inv.Amount || 0), 0);
  const totalPending = invoices
    .filter((inv) => inv.PaymentStatus === "Pending")
    .reduce((sum, inv) => sum + Number(inv.Amount || 0), 0);
  const totalOverdue = invoices
    .filter((inv) => inv.PaymentStatus === "Overdue")
    .reduce((sum, inv) => sum + Number(inv.Amount || 0), 0);

  const pieData = {
    labels: ["Paid", "Pending", "Overdue"],
    datasets: [
      {
        data: [totalPaid, totalPending, totalOverdue],
        backgroundColor: ["#10b981", "#facc15", "#ef4444"],
        hoverBackgroundColor: ["#059669", "#eab308", "#dc2626"],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Invoices Summary by Payment Status" },
    },
  };

  return (
    <div className="flex h-screen bg-[#FEFAF4] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f4c5c] shadow-lg p-4 text-white">
        <h3 className="text-xl font-semibold mb-6">Invoices Menu</h3>
        <ul className="space-y-4">
          <li>
            <button
              className="flex items-center gap-2 w-full p-2 rounded hover:bg-[#107896] transition"
              onClick={() => {
                setShowForm(true);
                setFormData({
                  InvoiceId: "",
                  Issuedate: "",
                  PaymentStatus: "Pending",
                  Amount: "",
                  Description: "",
                });
                setEditId(null);
              }}
            >
              ➕ Create Invoice
            </button>
          </li>
          <li>
            <button
              className="flex items-center gap-2 w-full p-2 rounded hover:bg-[#107896] transition"
              onClick={() => setShowForm(false)}
            >
              📊 Invoices Summary
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-4">Invoices</h2>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 w-full max-w-2xl">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Invoice ID</label>
                <input
                  type="text"
                  name="InvoiceId"
                  value={formData.InvoiceId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Issue Date</label>
                <input
                  type="date"
                  name="Issuedate"
                  value={formData.Issuedate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  name="Amount"
                  value={formData.Amount}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Payment Status</label>
                <select
                  name="PaymentStatus"
                  value={formData.PaymentStatus}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Description</label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  {editId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoices Table + Summary */}
        {!showForm && (
          <>
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Search by InvoiceId or Description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded w-1/3"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <table className="w-full bg-white shadow-md rounded table-auto mb-6">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Invoice ID</th>
                  <th className="p-2">Issue Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="p-2">{inv.InvoiceId}</td>
                    <td className="p-2">{inv.Issuedate?.substring(0, 10)}</td>
                    <td className="p-2">${inv.Amount}</td>
                    <td className="p-2">{inv.PaymentStatus}</td>
                    <td className="p-2">{inv.Description}</td>
                    <td className="p-2 flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                        title="Edit Invoice"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => downloadPDF(inv)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                        title="Download PDF"
                      >
                        <FaFilePdf />
                      </button>
                      <button
                        onClick={() => printInvoice(inv)}
                        className="bg-indigo-500 text-white p-1 rounded hover:bg-indigo-600"
                        title="Print Invoice"
                      >
                        <FaPrint />
                      </button>
                      <button
                        onClick={() => handleDelete(inv._id)}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        title="Delete Invoice"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ Total Revenue Display */}
            <div className="flex justify-end mb-6">
              <div className="bg-green-100 text-green-800 font-semibold p-3 rounded shadow">
                Total Revenue: ${totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Pie Chart Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Invoices Summary</h3>
              <p><strong>Total Amount:</strong> ${totalAmount}</p>
              <div style={{ maxWidth: "300px", margin: "0 auto" }}>
                <Pie data={pieData} options={pieOptions} width={300} height={300} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Invoices;

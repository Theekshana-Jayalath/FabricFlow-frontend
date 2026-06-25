import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";

function Supplier() {
  const API_BASE = "http://localhost:5000/api/Supplier"; // Updated API path

  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoaded, setSupplierLoaded] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newSupplier, setNewSupplier] = useState({ supplierId: "", name: "", contact: "" });
  const [editSupplier, setEditSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Validation for contact: exactly 10 digits
  const isValidContact = (contact) => {
    const regex = /^\d{10}$/; // exactly 10 digits
    return regex.test(contact);
  };

  // Fetch suppliers
  useEffect(() => {
    if (!supplierLoaded) {
      axios
        .get(API_BASE)
        .then((res) => {
          setSuppliers(res.data);
          setSupplierLoaded(true);
        })
        .catch((err) => console.error("Failed to fetch suppliers:", err));
    }
  }, [supplierLoaded]);

  // Generate new supplierId
  const generateSupplierId = () => {
    if (!suppliers.length) return "SUP-001";
    const ids = suppliers
      .map((s) => s.supplierId)
      .filter((id) => id?.startsWith("SUP-"))
      .map((id) => parseInt(id.split("-")[1]))
      .filter((num) => !isNaN(num));
    const maxId = ids.length ? Math.max(...ids) : 0;
    return `SUP-${(maxId + 1).toString().padStart(3, "0")}`;
  };

  const openAddModal = () => {
    setNewSupplier({ supplierId: generateSupplierId(), name: "", contact: "" });
    setShowAddModal(true);
  };

  const handleChange = (e) => setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditSupplier({ ...editSupplier, [e.target.name]: e.target.value });

  // Add supplier
  const handleAddSupplier = () => {
    if (!isValidContact(newSupplier.contact)) {
      alert("Contact must be exactly 10 digits!");
      return;
    }

    if (suppliers.some((s) => s.contact === newSupplier.contact)) {
      alert("Contact already exists!");
      return;
    }
    axios
      .post(API_BASE, newSupplier)
      .then((res) => {
        setSuppliers([...suppliers, res.data]);
        alert("Supplier added successfully!");
        setShowAddModal(false);
      })
      .catch((err) => alert("Error adding supplier: " + err));
  };

  // Update supplier
  const handleUpdateSupplier = () => {
    if (!isValidContact(editSupplier.contact)) {
      alert("Contact must be exactly 10 digits!");
      return;
    }

    if (suppliers.some((s) => s.contact === editSupplier.contact && s._id !== editSupplier._id)) {
      alert("Contact already exists!");
      return;
    }
    axios
      .put(`${API_BASE}/${editSupplier._id}`, editSupplier)
      .then((res) => {
        setSuppliers(suppliers.map((s) => (s._id === editSupplier._id ? res.data : s)));
        alert("Supplier updated successfully!");
        setShowEditModal(false);
        setEditSupplier(null);
      })
      .catch((err) => alert("Error updating supplier: " + err));
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(
    (s) =>
      (s.supplierId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contact || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
  
      <div className="flex-1 overflow-y-auto font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">Suppliers List</h1>
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border border-green-300 shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-900"
          />
        </div>

        <button
          className="fixed bottom-8 right-8 bg-[#005A54] text-white p-5 rounded-full shadow-lg flex items-center justify-center hover:bg-[#00756D] transition"
          onClick={openAddModal}
        >
          <FaPlus size={20} />
        </button>

        <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 bg-green-50 font-semibold text-green-900">ID</th>
                <th className="text-left px-4 py-2 bg-green-50 font-semibold text-green-900">Name</th>
                <th className="text-left px-4 py-2 bg-green-50 font-semibold text-green-900">Contact</th>
                <th className="text-left px-4 py-2 bg-green-50 font-semibold text-green-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s._id} className="bg-white rounded-lg shadow-sm hover:bg-green-100">
                  <td className="px-4 py-2">{s.supplierId}</td>
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{s.contact}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="bg-[#005A54] text-white px-3 py-1 rounded-md hover:bg-[#00756D] transition"
                      onClick={() => {
                        setEditSupplier(s);
                        setShowEditModal(true);
                      }}
                    >
                      <CiEdit size={20} />
                    </button>
                    <button
                      className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 transition"
                      onClick={() => {
                        if (!confirm("Are you sure?")) return;
                        axios
                          .delete(`${API_BASE}/${s._id}`)
                          .then(() => setSuppliers(suppliers.filter((sup) => sup._id !== s._id)))
                          .catch((err) => alert("Error deleting supplier: " + err));
                      }}
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-xl font-bold text-center mb-6 text-green-900">Add Supplier</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Supplier ID</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="text"
                    name="supplierId"
                    value={newSupplier.supplierId}
                    readOnly
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Name</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="text"
                    name="name"
                    value={newSupplier.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Contact</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="text"
                    name="contact"
                    value={newSupplier.contact}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#005A54] text-white px-4 py-2 rounded hover:bg-[#00756D]"
                  onClick={handleAddSupplier}
                >
                  Add Supplier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editSupplier && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-xl font-bold text-center mb-6 text-green-900">Edit Supplier</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Supplier ID</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="text"
                    name="supplierId"
                    value={editSupplier.supplierId}
                    readOnly
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Name</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="text"
                    name="name"
                    value={editSupplier.name}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Contact</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="text"
                    name="contact"
                    value={editSupplier.contact}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#005A54] text-white px-4 py-2 rounded hover:bg-[#00756D]"
                  onClick={handleUpdateSupplier}
                >
                  Update Supplier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Supplier;

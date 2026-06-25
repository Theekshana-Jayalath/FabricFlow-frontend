import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseLoaded, setPurchaseLoaded] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newPurchase, setNewPurchase] = useState({
    purchaseId: "",
    supplierId: "",
    materialId: "",
    quantity: "",
    unitPrice: "",
    date: ""
  });

  const [editPurchase, setEditPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [filteredMaterialsEdit, setFilteredMaterialsEdit] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!purchaseLoaded) {
      axios.get("https://fabricflow-backend1.onrender.com/api/Purchase")
        .then((res) => {
          setPurchases(res.data.purchases || res.data);
          setPurchaseLoaded(true);
        })
        .catch((err) => console.error("Failed to fetch purchases:", err));

      axios.get("https://fabricflow-backend1.onrender.com/api/Supplier")
        .then((res) => setSuppliers(res.data.suppliers || res.data))
        .catch((err) => console.error("Failed to fetch suppliers:", err));

      axios.get("https://fabricflow-backend1.onrender.com/api/Material")
        .then((res) => setMaterials(res.data.materials || res.data))
        .catch((err) => console.error("Failed to fetch materials:", err));
    }
  }, [purchaseLoaded]);

  const generatePurchaseId = () => {
    if (!purchases.length) return "PUR-001";
    const ids = purchases
      .map(p => p.purchaseId)
      .filter(id => id?.startsWith("PUR-"))
      .map(id => parseInt(id.split("-")[1]))
      .filter(num => !isNaN(num));
    const maxId = ids.length ? Math.max(...ids) : 0;
    const nextId = (maxId + 1).toString().padStart(3, "0");
    return `PUR-${nextId}`;
  };

  const openAddModal = () => {
    setNewPurchase({
      purchaseId: generatePurchaseId(),
      supplierId: "",
      materialId: "",
      quantity: "",
      unitPrice: "",
      date: ""
    });
    setFilteredMaterials([]);
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedPurchase = { ...newPurchase, [name]: value };
    setNewPurchase(updatedPurchase);

    // Update filtered materials for Add Modal
    if (name === "supplierId") {
      const supplierMaterials = materials.filter(m =>
        (m.supplierId?._id || m.supplierId) === value
      );
      setFilteredMaterials(supplierMaterials);
      setNewPurchase(prev => ({ ...prev, materialId: "" }));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const updatedPurchase = { ...editPurchase, [name]: value };
    setEditPurchase(updatedPurchase);

    // Update filtered materials for Edit Modal
    if (name === "supplierId") {
      const supplierMaterials = materials.filter(m =>
        (m.supplierId?._id || m.supplierId) === value
      );
      setFilteredMaterialsEdit(supplierMaterials);
      setEditPurchase(prev => ({ ...prev, materialId: "" }));
    }
  };

  const handleAddPurchase = () => {
    if (!newPurchase.supplierId || !newPurchase.materialId) {
      alert("Please fill all required fields!");
      return;
    }

    if (parseInt(newPurchase.quantity) <= 0) {
      alert("Quantity must be greater than 0!");
      return;
    }

    if (parseFloat(newPurchase.unitPrice) <= 0) {
      alert("Unit price must be greater than 0!");
      return;
    }

    const purchaseToAdd = {
      ...newPurchase,
      quantity: parseInt(newPurchase.quantity),
      unitPrice: parseFloat(newPurchase.unitPrice),
      date: newPurchase.date || new Date()
    };

    axios.post("https://fabricflow-backend1.onrender.com/api/Purchase", purchaseToAdd)
      .then((res) => {
        const created = res.data.purchase || res.data;
        const supplierObj = suppliers.find(s => s._id === created.supplierId) || { name: "N/A" };
        const materialObj = materials.find(m => m._id === created.materialId) || { name: "N/A" };

        setPurchases([
          ...purchases,
          {
            ...created,
            supplierId: supplierObj,
            materialId: materialObj
          }
        ]);
        alert("Purchase added successfully!");
        setShowAddModal(false);
      })
      .catch((err) => alert("Error adding purchase: " + err));
  };

  const handleUpdatePurchase = () => {
    if (parseInt(editPurchase.quantity) <= 0) {
      alert("Quantity must be greater than 0!");
      return;
    }

    if (parseFloat(editPurchase.unitPrice) <= 0) {
      alert("Unit price must be greater than 0!");
      return;
    }

    const updatedPurchase = {
      ...editPurchase,
      quantity: parseInt(editPurchase.quantity),
      unitPrice: parseFloat(editPurchase.unitPrice),
      supplierId: editPurchase.supplierId?._id || editPurchase.supplierId,
      materialId: editPurchase.materialId?._id || editPurchase.materialId
    };

    axios.put(`https://fabricflow-backend1.onrender.com/api/Purchase/${editPurchase._id}`, updatedPurchase)
      .then((res) => {
        const updated = res.data.purchase || res.data;
        const supplierObj = suppliers.find(s => s._id === updated.supplierId) || { name: "N/A" };
        const materialObj = materials.find(m => m._id === updated.materialId) || { name: "N/A" };

        setPurchases(
          purchases.map((p) =>
            p._id === updated._id
              ? { ...updated, supplierId: supplierObj, materialId: materialObj }
              : p
          )
        );

        alert("Purchase updated successfully!");
        setShowEditModal(false);
        setEditPurchase(null);
      })
      .catch((err) => alert("Error updating purchase: " + err));
  };

  const filteredPurchases = purchases.filter(p =>
    (p.purchaseId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplierId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.materialId?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">

      <div className="flex-1 overflow-y-auto font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">Purchase List</h1>
          <input
            type="text"
            placeholder="Search purchases..."
            className="px-4 py-2 rounded-lg border border-green-300 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-green-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="fixed bottom-8 right-8 bg-[#005A54] text-white p-5 rounded-full flex items-center justify-center shadow-lg hover:bg-[#00756D] transition"
          onClick={openAddModal}
        >
          <FaPlus size={20} />
        </button>

        <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto mt-4">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                {["ID", "Supplier", "Material", "Quantity", "Unit Price", "Total Cost", "Date", "Actions"].map((header) => (
                  <th key={header} className="text-left px-4 py-2 bg-green-50 text-green-900 font-semibold border-b-2">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p) => (
                <tr key={p._id} className="bg-white rounded-lg shadow-sm hover:bg-green-100">
                  <td className="px-4 py-2">{p.purchaseId}</td>
                  <td className="px-4 py-2">{p.supplierId?.name || "N/A"}</td>
                  <td className="px-4 py-2">{p.materialId?.name || "N/A"}</td>
                  <td className="px-4 py-2">{p.quantity}</td>
                  <td className="px-4 py-2">{p.unitPrice?.toFixed(2)}</td>
                  <td className="px-4 py-2">{p.totalCost?.toFixed(2)}</td>
                  <td className="px-4 py-2">{p.date ? new Date(p.date).toLocaleDateString() : "N/A"}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      className="bg-[#005A54] text-white px-3 py-1 rounded hover:bg-[#00756D]"
                      onClick={() => { 
                        setEditPurchase(p); 
                        const supplierMaterials = materials.filter(m =>
                          (m.supplierId?._id || m.supplierId) === (p.supplierId?._id || p.supplierId)
                        );
                        setFilteredMaterialsEdit(supplierMaterials);
                        setShowEditModal(true); 
                      }}
                    >
                      <CiEdit size={20} />
                    </button>
                    <button
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      onClick={() => {
                        if (!confirm("Are you sure?")) return;
                        axios.delete(`https://fabricflow-backend1.onrender.com/api/Purchase/${p._id}`)
                          .then(() => setPurchases(purchases.filter(pc => pc._id !== p._id)))
                          .catch(err => alert("Error deleting purchase: " + err));
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
              <h3 className="text-xl font-bold text-center mb-6 text-green-900">Add Purchase</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Purchase ID</label>
                  <input className="border rounded px-3 py-2" type="text" name="purchaseId" value={newPurchase.purchaseId} readOnly />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Quantity</label>
                  <input className="border rounded px-3 py-2" type="number" name="quantity" value={newPurchase.quantity} onChange={handleChange} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Unit Price</label>
                  <input className="border rounded px-3 py-2" type="number" name="unitPrice" value={newPurchase.unitPrice} onChange={handleChange} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Date</label>
                  <input className="border rounded px-3 py-2" type="date" name="date" value={newPurchase.date} onChange={handleChange} max={today} />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Supplier</label>
                  <select className="border rounded px-3 py-2" name="supplierId" value={newPurchase.supplierId || ""} onChange={handleChange}>
                    <option value="">Select Supplier</option>
                    {[...new Map(suppliers.map(s => [s.name, s])).values()].map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Material</label>
                  <select className="border rounded px-3 py-2" name="materialId" value={newPurchase.materialId || ""} onChange={handleChange}>
                    <option value="">Select Material</option>
                    {filteredMaterials.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="bg-[#005A54] text-white px-4 py-2 rounded hover:bg-[#00756D]" onClick={handleAddPurchase}>Add Purchase</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editPurchase && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-xl font-bold text-center mb-6 text-green-900">Edit Purchase</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Purchase ID</label>
                  <input className="border rounded px-3 py-2" type="text" name="purchaseId" value={editPurchase.purchaseId} readOnly />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Quantity</label>
                  <input className="border rounded px-3 py-2" type="number" name="quantity" value={editPurchase.quantity} onChange={handleEditChange} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Unit Price</label>
                  <input className="border rounded px-3 py-2" type="number" name="unitPrice" value={editPurchase.unitPrice} onChange={handleEditChange} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Date</label>
                  <input className="border rounded px-3 py-2" type="date" name="date" value={editPurchase.date?.substring(0, 10)} onChange={handleEditChange} max={today} />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Supplier</label>
                  <select className="border rounded px-3 py-2" name="supplierId" value={editPurchase.supplierId?._id || editPurchase.supplierId || ""} onChange={handleEditChange}>
                    <option value="">Select Supplier</option>
                    {[...new Map(suppliers.map(s => [s.name, s])).values()].map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Material</label>
                  <select className="border rounded px-3 py-2" name="materialId" value={editPurchase.materialId?._id || editPurchase.materialId || ""} onChange={handleEditChange}>
                    <option value="">Select Material</option>
                    {filteredMaterialsEdit.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="bg-[#005A54] text-white px-4 py-2 rounded hover:bg[#00756D]" onClick={handleUpdatePurchase}>Update Purchase</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Purchases;

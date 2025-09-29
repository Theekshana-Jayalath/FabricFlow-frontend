import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

function Materials() {
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newMaterial, setNewMaterial] = useState({
    materialId: "",
    name: "",
    unit: "Meters",
    unitPrice: "",
    reOrderLevel: "",
    quantity: "",
    supplierId: ""
  });

  const [editMaterial, setEditMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const allMaterials = [
    "Cotton", "Linen", "Poplin", "Oxford", "Twill",
    "Chambray", "Flannel", "Jersey", "Pima Cotton", "Modal",
    "Denim", "Chino", "Wool", "Gabardine", "Corduroy",
    "Polyester Blend", "Linen Blend", "Twill", "Stretch Cotton", "Satin"
  ];

  // --- Fetch helpers ---
  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/Material");
      setMaterials(res.data.materials || res.data || []);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/Supplier");
      setSuppliers(res.data.suppliers || res.data || []);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchSuppliers();
  }, []);

  const handleOpenAddModal = () => {
    let nextId = 1;
    if (materials.length > 0) {
      const numericIds = materials
        .map(m => parseInt(String(m.materialId || "").replace(/[^0-9]/g, "")))
        .filter(n => !isNaN(n));
      if (numericIds.length) nextId = Math.max(...numericIds) + 1;
    }
    setNewMaterial({
      materialId: "M" + nextId.toString().padStart(3, "0"),
      name: "",
      unit: "Meters",
      unitPrice: "",
      reOrderLevel: 2000, // set default in state
      quantity: "",
      supplierId: ""
    });
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditMaterial(prev => ({ ...prev, [name]: value }));
  };

  const validateMaterial = (material) => {
    if (!material.materialId || !String(material.materialId).trim()) return "Material ID is required.";
    if (!material.name || !String(material.name).trim()) return "Name is required.";
    if (!material.unit) return "Unit must be selected.";
    if (material.unitPrice !== "" && Number(material.unitPrice) < 0) return "Unit Price cannot be negative.";
    if (material.reOrderLevel !== "" && Number(material.reOrderLevel) < 0) return "Reorder Level cannot be negative.";
    if (material.quantity !== "" && Number(material.quantity) < 0) return "Quantity cannot be negative.";
    if (!material.supplierId) return "Supplier must be selected.";
    if (materials.some(m => m.name === material.name && m._id !== material._id)) 
      return "This material name already exists!";
    return null;
  };

  const handleAddMaterial = async () => {
    if (materials.some((m) => m.materialId === newMaterial.materialId)) {
      alert("Material ID already exists!");
      return;
    }

    const materialToAdd = {
      ...newMaterial,
      unitPrice: newMaterial.unitPrice === "" ? 0 : parseFloat(newMaterial.unitPrice),
      reOrderLevel: newMaterial.reOrderLevel === "" ? 0 : parseInt(newMaterial.reOrderLevel),
      quantity: newMaterial.quantity === "" ? 0 : parseInt(newMaterial.quantity),
      supplierId: newMaterial.supplierId
    };

    const errorMessage = validateMaterial(materialToAdd);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/Material", materialToAdd);
      await fetchMaterials();
      alert("Material added successfully!");
      setShowAddModal(false);
      setNewMaterial({
        materialId: "",
        name: "",
        unit: "Meters",
        unitPrice: "",
        reOrderLevel: "",
        quantity: "",
        supplierId: ""
      });
    } catch (err) {
      alert("Error adding material: " + (err.message || err));
    }
  };

  const handleUpdateMaterial = async () => {
    if (!editMaterial) return;
    const updatedMaterial = {
      ...editMaterial,
      unitPrice: editMaterial.unitPrice === "" ? 0 : parseFloat(editMaterial.unitPrice),
      reOrderLevel: editMaterial.reOrderLevel === "" ? 0 : parseInt(editMaterial.reOrderLevel),
      quantity: editMaterial.quantity === "" ? 0 : parseInt(editMaterial.quantity),
      supplierId: editMaterial.supplierId?._id || editMaterial.supplierId
    };

    const errorMessage = validateMaterial(updatedMaterial);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/Material/${editMaterial._id}`, updatedMaterial);
      await fetchMaterials();
      alert("Material updated successfully!");
      setShowEditModal(false);
      setEditMaterial(null);
    } catch (err) {
      alert("Error updating material: " + (err.message || err));
    }
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure?")) return;
    axios.delete(`http://localhost:5000/api/Material/${id}`)
      .then(() => setMaterials(prev => prev.filter(mat => mat._id !== id)))
      .catch(err => alert("Error deleting material: " + (err.message || err)));
  };

  const openEdit = (m) => {
    const materialCopy = {
      ...m,
      supplierId: m.supplierId?._id || m.supplierId || "",
      reOrderLevel: m.reOrderLevel || 2000 // ensure it's set in state
    };
    setEditMaterial(materialCopy);
    setShowEditModal(true);
  };

  const filteredMaterials = materials.filter((m) =>
    (m.materialId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.supplierId?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-8 bg-green-50 overflow-y-auto font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">Material List</h1>
          <input
            type="text"
            placeholder="Search materials..."
            className="px-4 py-2 border rounded-lg w-72 text-green-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="fixed bottom-8 right-8 bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
          onClick={handleOpenAddModal}
        >
          <FaPlus size={20} />
        </button>

        <div className="bg-white p-8 rounded-xl shadow-lg mt-6 overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr>
                {["ID","Name","Unit","Unit Price","Reorder Level","Quantity","Supplier","Actions"].map((th, idx) => (
                  <th key={idx} className="text-left p-3 bg-green-50 text-green-900 font-semibold border-b-2 border-green-200">{th}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-green-700">No materials found</td>
                </tr>
              )}
              {filteredMaterials.map(m => (
                <tr key={m._id} className={`${(m.quantity || 0) <= (m.reOrderLevel || 0) ? "bg-red-100 text-red-700" : "bg-white text-green-900"}`}>
                  <td className="p-3 bg-white rounded">{m.materialId}</td>
                  <td className="p-3 bg-white rounded">{m.name}</td>
                  <td className="p-3 bg-white rounded">{m.unit}</td>
                  <td className="p-3 bg-white rounded">{Number(m.unitPrice || 0).toFixed(2)}</td>
                  <td className="p-3 bg-white rounded">{m.reOrderLevel}</td>
                  <td className="p-3 bg-white rounded">{m.quantity}</td>
                  <td className="p-3 bg-white rounded">{m.supplierId?.name || "N/A"}</td>
                  <td className="p-3 bg-white rounded flex gap-2">
                    <button className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700" onClick={() => openEdit(m)}>
                      <CiEdit size={18} />
                    </button>
                    <button className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500" onClick={() => handleDelete(m._id)}>
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-xl font-bold text-center mb-6 text-green-900">Add Material</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Material ID</label>
                  <input className="border rounded px-3 py-2" type="text" name="materialId" value={newMaterial.materialId} readOnly />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Material Name</label>
                  <select className="border rounded px-3 py-2" name="name" value={newMaterial.name || ""} onChange={handleChange}>
                    <option value="">Select Material Name</option>
                    {allMaterials.map((mat, idx)=>(<option key={idx} value={mat} disabled={materials.some(m => m.name===mat)}>{mat}</option>))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Unit</label>
                  <input className="border rounded px-3 py-2" type="text" name="unit" value="Meters" readOnly />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Unit Price</label>
                  <input className="border rounded px-3 py-2" type="number" name="unitPrice" value={newMaterial.unitPrice} onChange={handleChange} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Reorder Level</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="number"
                    name="reOrderLevel"
                    value={newMaterial.reOrderLevel} 
                    readOnly
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Quantity</label>
                  <input className="border rounded px-3 py-2" type="number" name="quantity" value={newMaterial.quantity} onChange={handleChange} />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Supplier</label>
                  <select className="border rounded px-3 py-2" name="supplierId" value={newMaterial.supplierId} onChange={handleChange}>
                    <option value="">Select Supplier</option>
                    {[...new Map(suppliers.map(s=>[s.name,s])).values()].map(s=>(<option key={s._id} value={s._id}>{s.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={()=>setShowAddModal(false)}>Cancel</button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleAddMaterial}>Add Material</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editMaterial && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-2xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-xl font-bold text-center mb-6 text-green-900">Edit Material</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Material ID</label>
                  <input className="border rounded px-3 py-2" type="text" name="materialId" value={editMaterial.materialId || ""} readOnly />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Material Name</label>
                  <select className="border rounded px-3 py-2" name="name" value={editMaterial.name || ""} onChange={handleEditChange}>
                    <option value="">Select Material Name</option>
                    {allMaterials.map((mat, idx)=>(<option key={idx} value={mat} disabled={materials.some(m=>m.name===mat && m._id!==editMaterial._id)}>{mat}</option>))}
                    {editMaterial.name && !allMaterials.includes(editMaterial.name) && <option value={editMaterial.name}>{editMaterial.name}</option>}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Unit</label>
                  <input className="border rounded px-3 py-2" type="text" value="Meters" readOnly />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Unit Price</label>
                  <input className="border rounded px-3 py-2" type="number" name="unitPrice" value={editMaterial.unitPrice} onChange={handleEditChange} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Reorder Level</label>
                  <input
                    className="border rounded px-3 py-2"
                    type="number"
                    name="reOrderLevel"
                    value={editMaterial.reOrderLevel} // now bound to state
                    readOnly
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-green-900 mb-1">Quantity</label>
                  <input className="border rounded px-3 py-2" type="number" name="quantity" value={editMaterial.quantity} onChange={handleEditChange} />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="font-semibold text-green-900 mb-1">Supplier</label>
                  <select className="border rounded px-3 py-2" name="supplierId" value={editMaterial.supplierId || ""} onChange={handleEditChange}>
                    <option value="">Select Supplier</option>
                    {[...new Map(suppliers.map(s=>[s.name,s])).values()].map(s=>(<option key={s._id} value={s._id}>{s.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={()=>setShowEditModal(false)}>Cancel</button>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={handleUpdateMaterial}>Update Material</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Materials;

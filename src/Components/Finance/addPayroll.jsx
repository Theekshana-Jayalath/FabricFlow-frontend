import React from "react";

const AddPayroll = ({
  formData,
  setFormData,
  totals,
  handleSubmit,
  editingId,
  error,
}) => {
  return (
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
  );
};

export default AddPayroll;

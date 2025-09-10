import React from "react";

function EmployeeDisplay({ employee }) {
  if (!employee) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <p className="text-gray-500">No employee data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-[#EF6869]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(employee).map(([key, value]) => {
          // Skip internal fields like _id, __v
          if (key.startsWith('_')) return null;
          
          return (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-semibold text-[#EF6869] uppercase tracking-wide">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-gray-700 mt-1">
                {value || 'N/A'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeDisplay;

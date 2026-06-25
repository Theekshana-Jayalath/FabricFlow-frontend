import React, { useEffect, useState } from "react";
import UserDisplay from "../UserDisplay/UserDisplay.jsx";
import axios from "axios";

const URL = "https://fabricflow-backend1.onrender.com/users";

const fetchHandler = async () => {
  try {
    const response = await axios.get(URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

function UserDetails() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHandler().then((data) => {
      setUsers(data?.users || data || []);
      setAllUsers(data?.users || data || []);
    });
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setUsers(allUsers);
      return;
    }

    const filteredUsers = allUsers.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setUsers(filteredUsers);
  };

  const downloadUserDetails = () => {
    const csvContent = convertToCSV(users);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = window.URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "user_details.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");

    const csvRows = data.map((row) =>
      headers.map((header) => `"${row[header] || ""}"`).join(",")
    );

    return [csvHeaders, ...csvRows].join("\n");
  };

  return (
    <div>
      <div className="p-5">
        <div className="flex gap-3 mb-5">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 flex-1"
          />
          <button
            onClick={handleSearch}
            className="bg-[#005A54] text-white px-4 py-2 rounded hover:bg-[#EF6869] transition-colors"
          >
            Search
          </button>
          <button
            onClick={downloadUserDetails}
            className="bg-[#EF6869] text-white px-4 py-2 rounded hover:bg-[#005A54] transition-colors"
          >
            Download CSV
          </button>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#005A54] to-[#EF6869] text-white p-8 rounded-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome to FabricFlow</h1>
          <p className="text-lg opacity-90">Your complete apparel management solution</p>
        </div>

        {/* User Display */}
        <div className="users-container">
          {users && users.length > 0 ? (
            users.map((user, i) => (
              <div key={i}>
                <UserDisplay user={user} />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found or backend not connected</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure your backend server is running on https://fabricflow-backend1.onrender.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetails;

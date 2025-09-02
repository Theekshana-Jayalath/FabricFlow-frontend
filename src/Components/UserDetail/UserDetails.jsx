import React, { useEffect, useState } from "react";
import Nav from "../Nav/Nav.jsx";
import UserDisplay from "../UserDisplay/UserDisplay.jsx";
import axios from "axios";

const URL = "http://localhost:5000/users";

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
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (usersArray) => {
    if (!usersArray || usersArray.length === 0) return "";

    const headers = Object.keys(usersArray[0]).join(",");
    const rows = usersArray
      .map((user) =>
        Object.values(user)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");

    return `${headers}\n${rows}`;
  };

  return (
    <div>
      <Nav />
      <div className="p-5">
        <div className="flex gap-3 mb-5">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded flex-1 max-w-md"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={downloadUserDetails}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download User Details
          </button>
        </div>

        {users && users.length > 0 ? (
          users.map((user, i) => <UserDisplay key={i} user={user} />)
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
}

export default UserDetails;

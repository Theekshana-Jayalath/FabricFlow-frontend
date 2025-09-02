import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaUserEdit, FaTrashAlt, FaUser, FaEnvelope, FaHome, FaBirthdayCake,
  FaPhone, FaVenusMars, FaCalendarAlt
} from "react-icons/fa";
import "./UserDisplay.css";

function UserDisplay({ user, onDelete }) {
  const { _id, name, gmail, age, address, phone, gender, dob } = user;
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.2)", transition: { duration: 0.3 } },
    tap: { scale: 0.95 }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : "Not provided";
  const formatGender = (gender) => gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "Not specified";

  const handleUpdate = () => navigate(`/UserDetails/${_id}`, { state: { user } });

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await axios.delete(`http://localhost:5000/users/${_id}`);
      if (response.status === 200 || response.status === 204) {
        alert(`User "${name}" deleted successfully!`);
        onDelete ? onDelete(_id) : window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
      console.error(err);
    }
  };

  return (
    <motion.div className="user-card" variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -5 }}>
      <div className="user-header">
        <div className="user-avatar"><FaUser className="avatar-icon" /></div>
        <h2 className="user-name">{name}</h2>
        <span className="user-id">ID: {_id}</span>
      </div>

      <div className="user-details">
        <div className="detail-item"><FaEnvelope className="detail-icon" /><span className="detail-value">{gmail}</span></div>
        <div className="detail-item"><FaBirthdayCake className="detail-icon" /><span className="detail-value">{age}</span></div>
        <div className="detail-item"><FaHome className="detail-icon" /><span className="detail-value">{address}</span></div>
        {phone && <div className="detail-item"><FaPhone className="detail-icon" /><span className="detail-value">{phone}</span></div>}
        {gender && <div className="detail-item"><FaVenusMars className="detail-icon" /><span className="detail-value">{formatGender(gender)}</span></div>}
        {dob && <div className="detail-item"><FaCalendarAlt className="detail-icon" /><span className="detail-value">{formatDate(dob)}</span></div>}
      </div>

      <div className="user-actions">
        <motion.button className="update-btn" variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={handleUpdate}><FaUserEdit /> Update</motion.button>
        <motion.button className="delete-btn" variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={handleDelete}><FaTrashAlt /> Delete</motion.button>
      </div>
    </motion.div>
  );
}

export default UserDisplay;

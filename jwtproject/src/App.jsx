import { useState, useEffect } from "react";
import axios from "axios";
import API from "./api";
import "./App.css";

// Create axios instance only once
const api = axios.create({ baseURL: API });

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("user");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [slots, setSlots] = useState([]);

  // Booking fields
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [amount, setAmount] = useState("");

  // Create slot
  const [slotNumber, setSlotNumber] = useState("");
  const [slotType, setSlotType] = useState("normal");
  const [floor, setFloor] = useState("G");

  const fetchSlots = async () => {
    try {
      const res = await api.get("/slots");
      setSlots(res.data);
    } catch (err) {
      console.log("Error fetching slots", err.response?.data);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      setIsLoggedIn(true);
      setRole(role || "user");
      fetchSlots();
    }
  }, []);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { username, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      setRole(res.data.role);
      setIsLoggedIn(true);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Login failed");
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", { username, password, role });
      alert("Registered. Login now.");
    } catch (err) {
      alert(err.response?.data || "Register failed");
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setSlots([]);
  };

  // Create Slot
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post("/slots", {
        slotNumber,
        slotType,
        floor,
      });
      setSlotNumber("");
      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Slot create failed");
    }
  };

  // Book Slot
  const handleBook = async (id) => {
    try {
      await api.post(`/book/${id}`, {
        vehicleNumber,
        vehicleType,
        userName,
        phone,
        startTime,
        endTime,
        paymentStatus,
        amount,
      });

      fetchSlots();
      alert("Booked!");
    } catch (err) {
      alert(err.response?.data || "Booking failed");
    }
  };

  // Cancel booking
  const handleCancel = async (id) => {
    await api.post(`/cancel/${id}`);
    fetchSlots();
  };

  // Delete slot
  const handleDelete = async (id) => {
    await api.delete(`/slots/${id}`);
    fetchSlots();
  };

  return (
    <div className="container">
      {!isLoggedIn ? (
        <div className="auth-box">
          {/* Login */}
          <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button>Login</button>
          </form>

          {/* Register */}
          <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <select onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button>Register</button>
          </form>
        </div>
      ) : (
        <>
          <h1>Parking Slots</h1>
          <button onClick={logout}>Logout</button>
          <p>Logged in as: <b>{role}</b></p>

          {role === "admin" && (
            <form onSubmit={handleCreateSlot} className="create-slot">
              <h3>Create Slot</h3>
              <input type="number" placeholder="Slot Number" value={slotNumber} onChange={(e) => setSlotNumber(e.target.value)} />
              <select value={slotType} onChange={(e) => setSlotType(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="ev">EV</option>
                <option value="vip">VIP</option>
              </select>
              <select value={floor} onChange={(e) => setFloor(e.target.value)}>
                <option value="G">G</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <button>Create</button>
            </form>
          )}

          {/* Booking form */}
          <div className="booking-form">
            <h3>Booking Details</h3>
            <input placeholder="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
            <input placeholder="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
            <input placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          {/* Slots */}
          <ul className="slots">
            {slots.map((s) => (
              <li key={s._id} className="slot-card">
                <h3>Slot {s.slotNumber}</h3>
                <p>Type: {s.slotType}</p>
                <p>Floor: {s.floor}</p>
                <p>Status: {s.isBooked ? "Booked" : "Available"}</p>

                {!s.isBooked && <button onClick={() => handleBook(s._id)}>Book</button>}
                {s.isBooked && <button onClick={() => handleCancel(s._id)}>Cancel</button>}

                {role === "admin" && (
                  <button onClick={() => handleDelete(s._id)}>Delete</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

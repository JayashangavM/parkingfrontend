import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // Auth state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Slots
  const [slots, setSlots] = useState([]);
  const [slotNumber, setSlotNumber] = useState("");
  const [slotTypeCreate, setSlotTypeCreate] = useState("normal");
  const [slotFloorCreate, setSlotFloorCreate] = useState("G");

  // Booking fields
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [amount, setAmount] = useState("");
  const [slotType, setSlotType] = useState("normal");
  const [floor, setFloor] = useState("G");



  // Axios instance with token automatically attached
  const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Fetch slots
  const fetchSlots = async () => {
    try {
      const res = await api.get("/api/slots");
      setSlots(res.data);
    } catch (err) {
      console.error("Fetch slots error:", err.response?.data || err.message);
    }
  };

  // Load user role from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setRole(decoded.role);
        setIsLoggedIn(true);
        fetchSlots();
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/login", { username, password });
      localStorage.setItem("token", res.data.token);
      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
      setRole(decoded.role);
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
      await api.post("/api/register", { username, password, role });
      alert("User registered. Please login now.");
    } catch (err) {
      alert(err.response?.data || "Register failed");
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole("user");
    setSlots([]);
  };

  // ADMIN: Create slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/slots", {
        slotNumber: Number(slotNumber),
        slotType: slotTypeCreate,
        floor: slotFloorCreate,
      });
      setSlotNumber("");
      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Create slot failed");
    }
  };

  // BOOK slot
  const handleBook = async (slotId) => {
    try {
      if (!vehicleNumber || !userName) {
        alert("Vehicle number and your name required");
        return;
      }

      await api.post(`/api/book/${slotId}`, {
        vehicleNumber,
        vehicleType,
        userName,
        phone,
        startTime,
        endTime,
        paymentStatus,
        amount: Number(amount) || 0,
        slotType,
        floor,
      });

      // Clear booking fields
      setVehicleNumber("");
      setVehicleType("");
      setUserName("");
      setPhone("");
      setStartTime("");
      setEndTime("");
      setPaymentStatus("pending");
      setAmount("");
      setSlotType("normal");
      setFloor("G");

      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Booking failed");
    }
  };

  // CANCEL booking
  const handleCancel = async (slotId) => {
    try {
      await api.post(`/api/cancel/${slotId}`);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Cancel failed");
    }
  };

  // DELETE slot (admin)
  const handleDelete = async (slotId) => {
    try {
      await api.delete(`/api/slots/${slotId}`);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Delete failed");
    }
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="auth-container">
          <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit">Login</button>
            </form>
          </div>

          <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <select onChange={(e) => setRole(e.target.value)} defaultValue="user">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <h1>Parking Slots</h1>
          <div className="logged-in-info">
            Logged in as: <b>{role}</b> <button onClick={logout}>Logout</button>
          </div>

          {/* Admin: create slot */}
          {role === "admin" && (
            <form onSubmit={handleAddSlot}>
              <input type="number" placeholder="Slot Number" value={slotNumber} onChange={(e) => setSlotNumber(e.target.value)} />
              <select value={slotTypeCreate} onChange={(e) => setSlotTypeCreate(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="ev">EV</option>
                <option value="vip">VIP</option>
                <option value="handicap">Handicap</option>
              </select>
              <select value={slotFloorCreate} onChange={(e) => setSlotFloorCreate(e.target.value)}>
                <option value="G">G</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <button type="submit">Add Slot</button>
            </form>
          )}

          {/* Slots */}
          <ul>
            {slots.map((slot) => (
              <li key={slot._id} className="slot-card">
                <div className="slot-info">
                  <strong>Slot {slot.slotNumber}</strong> ({slot.slotType} - Floor {slot.floor})<br />
                  <span className={slot.isBooked ? "booked" : "available"}>{slot.isBooked ? "Booked" : "Available"}</span>
                  {slot.isBooked && (
                    <div className="booking-details">
                      <div>Booked by: {slot.bookedBy?.username}</div>
                      <div>Vehicle: {slot.vehicleNumber} ({slot.vehicleType})</div>
                      <div>Phone: {slot.phone}</div>
                      <div>Time: {slot.startTime ? new Date(slot.startTime).toLocaleString() : "-"} → {slot.endTime ? new Date(slot.endTime).toLocaleString() : "-"}</div>
                      <div>Payment: {slot.paymentStatus} ₹{slot.amount}</div>
                    </div>
                  )}
                </div>

                <div className="slot-buttons">
                  {!slot.isBooked && <button onClick={() => handleBook(slot._id)}>Book</button>}
                  {slot.isBooked && <button onClick={() => handleCancel(slot._id)}>Cancel</button>}
                  {role === "admin" && <button onClick={() => handleDelete(slot._id)}>Delete</button>}
                </div>
              </li>
            ))}
          </ul>

          {/* Booking form for users */}
          <h3>Booking Details (fill before booking)</h3>
          <div className="booking-form">
            <input placeholder="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
            <input placeholder="Vehicle Type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
            <input placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            <select value={slotType} onChange={(e) => setSlotType(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="ev">EV</option>
              <option value="vip">VIP</option>
              <option value="handicap">Handicap</option>
            </select>
            <select value={floor} onChange={(e) => setFloor(e.target.value)}>
              <option value="G">G</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

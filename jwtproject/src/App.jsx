import { useEffect, useState } from "react";
import api from "./api"; // Axios instance
import "./App.css";

function App() {
  // ===== Login state =====
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ===== Register state =====
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("user");

  // ===== Auth & role =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("user");

  // ===== Slots =====
  const [slots, setSlots] = useState([]);
  const [slotNumber, setSlotNumber] = useState("");
  const [slotTypeCreate, setSlotTypeCreate] = useState("normal");
  const [slotFloorCreate, setSlotFloorCreate] = useState("G");

  // ===== Booking form =====
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

  // ===== Fetch slots =====
  const fetchSlots = async () => {
    try {
      const res = await api.get("/api/slots");
      setSlots(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ===== Load user from token =====
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

  // ===== Login =====
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/login", {
        username: loginUsername,
        password: loginPassword,
      });
      localStorage.setItem("token", res.data.token);
      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
      setRole(decoded.role);
      setIsLoggedIn(true);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Login failed");
    }
  };

  // ===== Register =====
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/register", {
        username: registerUsername,
        password: registerPassword,
        role: registerRole,
      });
      alert("User registered. Please login now.");
      setRegisterUsername("");
      setRegisterPassword("");
      setRegisterRole("user");
    } catch (err) {
      alert(err.response?.data || "Register failed");
    }
  };

  // ===== Logout =====
  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole("user");
    setSlots([]);
  };

  // ===== Admin: Add slot =====
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

  // ===== Book slot =====
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
      // Clear booking form
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

  // ===== Cancel booking =====
  const handleCancel = async (slotId) => {
    try {
      await api.post(`/api/cancel/${slotId}`);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data || "Cancel failed");
    }
  };

  // ===== Delete slot (admin) =====
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
              <input
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
          </div>
          <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <select
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
              >
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
            Logged in as: <b>{role}</b>{" "}
            <button onClick={logout}>Logout</button>
          </div>

          {/* Admin: Create slot */}
          {role === "admin" && (
            <form onSubmit={handleAddSlot}>
              <input
                type="number"
                placeholder="Slot Number"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                required
              />
              <select
                value={slotTypeCreate}
                onChange={(e) => setSlotTypeCreate(e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="ev">EV</option>
                <option value="vip">VIP</option>
                <option value="handicap">Handicap</option>
              </select>
              <select
                value={slotFloorCreate}
                onChange={(e) => setSlotFloorCreate(e.target.value)}
              >
                <option value="G">G</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <button type="submit">Add Slot</button>
            </form>
          )}

          {/* Slots list */}
          <ul>
            {slots.map((slot) => (
              <li key={slot._id} className="slot-card">
                <div className="slot-info">
                  <strong>Slot {slot.slotNumber}</strong> ({slot.slotType} - Floor{" "}
                  {slot.floor})
                  <br />
                  <span className={slot.isBooked ? "booked" : "available"}>
                    {slot.isBooked ? "Booked" : "Available"}
                  </span>
                  {slot.isBooked && (
                    <div className="booking-details">
                      <div>Booked by: {slot.bookedBy?.username}</div>
                      <div>
                        Vehicle: {slot.vehicleNumber} ({slot.vehicleType})
                      </div>
                      <div>Phone: {slot.phone}</div>
                      <div>
                        Time:{" "}
                        {slot.startTime
                          ? new Date(slot.startTime).toLocaleString()
                          : "-"}{" "}
                        →{" "}
                        {slot.endTime
                          ? new Date(slot.endTime).toLocaleString()
                          : "-"}
                      </div>
                      <div>
                        Payment: {slot.paymentStatus} ₹{slot.amount}
                      </div>
                    </div>
                  )}
                </div>
                <div className="slot-buttons">
                  {!slot.isBooked && (
                    <button
                      onClick={() => handleBook(slot._id)}
                      disabled={!vehicleNumber || !userName}
                    >
                      Book
                    </button>
                  )}
                  {slot.isBooked && <button onClick={() => handleCancel(slot._id)}>Cancel</button>}
                  {role === "admin" && (
                    <button onClick={() => handleDelete(slot._id)}>Delete</button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Booking form */}
          <h3>Booking Details (fill before booking)</h3>
          <div className="booking-form">
            <input
              placeholder="Vehicle Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
            <input
              placeholder="Vehicle Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />
            <input
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
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

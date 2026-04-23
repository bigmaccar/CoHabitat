import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from 'axios';

function Settings() {
    const userId = localStorage.getItem("userId");
    const householdId = localStorage.getItem("householdId");

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [maxOccupants, setMaxOccupants] = useState("");
    const [message, setMessage] = useState("");

    async function handleCreateHousehold(e) {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:7000/api/household", {
                name,
                address,
                city,
                state,
                zipCode,
                maxOccupants: parseInt(maxOccupants),
                createdBy: userId
            });
            localStorage.setItem("householdId", res.data._id);
            setMessage("Household created successfully!");
            setShowForm(false);
        } catch (err) {
            setMessage(err.response?.data?.errorMessage || "Failed to create household.");
        }
    }

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Roommates"><figure><img src={require('./images/roommates.png')} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require('./images/bill.png')} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require('./images/calendar.png')} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to="/Lists"><figure><img src={require('./images/list.png')} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li className="active"><Link to="/Settings"><figure><img src={require('./images/settings.png')} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body" style={{ padding: "20px" }}>
                <h1>Settings</h1>

                <Link to="/ApartmentListing" style={{ fontSize: 20 }}>List Your Apartment</Link>

                <hr style={{ margin: "20px 0" }} />

                <h2>Household</h2>
                {householdId
                    ? <p>Household ID: {householdId}</p>
                    : <p>You are not part of a household yet.</p>
                }

                {!householdId && (
                    <button className="btnGreen" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "Create Household"}
                    </button>
                )}

                {message && <p style={{ color: message.includes("success") ? "green" : "red" }}>{message}</p>}

                {showForm && (
                    <form className="billAddForm" onSubmit={handleCreateHousehold}>
                        <div>
                            <label>Household Name</label>
                            <input type="text" placeholder="e.g. The Green House" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label>Address</label>
                            <input type="text" placeholder="123 Main St" value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <div>
                            <label>City</label>
                            <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                        </div>
                        <div>
                            <label>State</label>
                            <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} />
                        </div>
                        <div>
                            <label>Zip Code</label>
                            <input type="text" placeholder="12345" value={zipCode} onChange={e => setZipCode(e.target.value)} />
                        </div>
                        <div>
                            <label>Max Occupants</label>
                            <input type="number" placeholder="e.g. 4" value={maxOccupants} onChange={e => setMaxOccupants(e.target.value)} min="1" />
                        </div>
                        <button className="btnGreen" type="submit">Create</button>
                    </form>
                )}
            </div>
        </section>
    );
}

export default Settings;

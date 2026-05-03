import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from 'axios';

function SubmitTicket() {
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
                <h1>Submit a Ticket</h1>
                <form>
                    <label for="type">Ticket Type:</label>
                        <select name="type" id="type">
                            <option value="website">Website Issue/Bug</option>
                            <option value="roommate">Roommate Issue</option>
                            <option value="user">Issue With A Non-Roommate</option>
                        </select>
                    <h2>Description:</h2>
                    <textarea />
                    <input type = "submit">Submit</input>
                </form>
            </div>
        </section>
    );
}

export default SubmitTicket;

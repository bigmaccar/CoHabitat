import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:7000/api";

function AdminHome(){
    const [summary, setSummary] = useState({
        users: 0,
        households: 0,
        tickets: 0
    });
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchSummary() {
            try {
                const [users, households, tickets] = await Promise.all([
                    axios.get(`${API_BASE}/users`),
                    axios.get(`${API_BASE}/households`),
                    axios.get(`${API_BASE}/supportTickets`)
                ]);
                setSummary({
                    users: Array.isArray(users.data) ? users.data.length : 0,
                    households: Array.isArray(households.data) ? households.data.length : 0,
                    tickets: Array.isArray(tickets.data) ? tickets.data.length : 0
                });
                setError("");
            } catch (err) {
                setError(err.response?.data?.message || "Admin summary could not be loaded.");
            }
        }

        fetchSummary();
    }, []);

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Tickets"><figure><img src={require("./images/list.png")} className="icon" alt="Tickets"/><figcaption>Tickets</figcaption></figure></Link></li>
                        <li><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body adminPage">
                <h1>Admin Dashboard</h1>
                {error && <p style={{color: "red"}}>{error}</p>}
                <div className="adminSummaryGrid">
                    <Link className="adminSummaryCard" to="/Tickets">
                        <h2>{summary.tickets}</h2>
                        <p>Support Tickets</p>
                    </Link>
                    <Link className="adminSummaryCard" to="/AllUsers">
                        <h2>{summary.users}</h2>
                        <p>Users</p>
                    </Link>
                    <Link className="adminSummaryCard" to="/AllHouseholds">
                        <h2>{summary.households}</h2>
                        <p>Households</p>
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default AdminHome;

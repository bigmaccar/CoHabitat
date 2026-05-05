import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function Roommates() {
    const [roommates, setRoommates] = useState([]);
    const [household, setHousehold] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const householdId = localStorage.getItem("householdId");
                if (!householdId) {
                    setHousehold(null);
                    setRoommates([]);
                    setError("");
                    return;
                }

                const [householdsResponse, usersResponse] = await Promise.all([
                    axios.get("http://localhost:7000/api/households"),
                    axios.get("http://localhost:7000/api/users")
                ]);

                const currentHousehold = householdsResponse.data.find(item => item._id === householdId);
                if (!currentHousehold) {
                    setHousehold(null);
                    setRoommates([]);
                    setError("Household could not be found.");
                    return;
                }

                const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
                const memberUsers = currentHousehold.members.map(member => {
                    const user = users.find(item => item._id === String(member.userId));
                    return user ? { ...user, isAdmin: member.isAdmin } : null;
                }).filter(Boolean);

                setHousehold(currentHousehold);
                setRoommates(memberUsers);
                setError("");
            } catch (error) {
                setError(error.response?.data?.message || error.response?.data?.errorMessage || "Roommates could not be loaded.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li className="active"><Link to="/Roommates"><figure><img src={require("./images/roommates.png")} className="icon" alt="Roommates" /><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require("./images/bill.png")} className="icon" alt="Bills" /><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require("./images/calendar.png")} className="icon" alt="Calendar" /><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to="/Lists"><figure><img src={require("./images/list.png")} className="icon" alt="Lists" /><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require("./images/settings.png")} className="icon" alt="Settings" /><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style={{ marginLeft: 40 }}>Roommates</h1>
                {household && <p style={{ marginLeft: 40 }}>{household.name}</p>}
                {loading && <p style={{ marginLeft: 40 }}>Loading roommates...</p>}
                {error && <p style={{ marginLeft: 40, color: "red" }}>{error}</p>}
                {!loading && !error && !household && <p style={{ marginLeft: 40 }}>You are not part of a household yet.</p>}
                <div className="roommates">
                    <ul>
                        {roommates.map(roommate => (
                            <li key={roommate._id}>
                                <img src={require("./images/person.png")} alt="Roommate" />
                                {`${roommate.firstName || ""} ${roommate.lastName || ""}`.trim() || roommate.email}
                                {roommate.isAdmin && <img src={require("./images/crown.png")} alt="admin" />}
                            </li>
                        ))}
                        <li><Link to="/ApartmentListing">+ List Apartment</Link></li>
                    </ul>
                </div>
            </div>
        </section>
    );
}

export default Roommates;

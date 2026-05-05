import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

function memberName(user) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Roommate";
}

function Roommates() {
    const userId = localStorage.getItem("userId");
    const householdId = localStorage.getItem("householdId");
    const [roommates, setRoommates] = useState([]);
    const [household, setHousehold] = useState(null);
    const [memberEmail, setMemberEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchData = useCallback(async () => {
        try {
            if (!householdId) {
                setHousehold(null);
                setRoommates([]);
                setMessage("");
                return;
            }

            const [householdResponse, usersResponse] = await Promise.all([
                axios.get("http://localhost:7000/api/household", {
                    params: { id: householdId }
                }),
                axios.get("http://localhost:7000/api/users")
            ]);

            const currentHousehold = householdResponse.data;
            const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
            const memberUsers = (currentHousehold.members || []).map(member => {
                const user = users.find(item => String(item._id) === String(member.userId));
                return user ? { ...user, isAdmin: member.isAdmin } : null;
            }).filter(Boolean);

            setHousehold(currentHousehold);
            setRoommates(memberUsers);
            setMessage("");
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Roommates could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [householdId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function handleAddMember(e) {
        e.preventDefault();
        const cleanEmail = memberEmail.trim().toLowerCase();
        if (!cleanEmail) {
            setMessage("Enter an email address.");
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/household/" + householdId + "/members", {
                email: cleanEmail
            });
            setMemberEmail("");
            setMessage("Roommate added.");
            fetchData();
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Roommate could not be added.");
        }
    }

    async function handleRemoveMember(memberId) {
        try {
            await axios.delete("http://localhost:7000/api/household/" + householdId + "/members/" + memberId);
            setMessage("Roommate removed.");
            fetchData();
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Roommate could not be removed.");
        }
    }

    const currentMember = (household?.members || []).find(member => String(member.userId) === String(userId));
    const isCurrentUserAdmin = Boolean(currentMember?.isAdmin);

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
                {household && (
                    <div style={{ marginLeft: 40 }}>
                        <p><strong>{household.name}</strong></p>
                        <p>Household ID: {household._id}</p>
                    </div>
                )}
                {loading && <p style={{ marginLeft: 40 }}>Loading roommates...</p>}
                {message && <p style={{ marginLeft: 40, color: message.includes("added") || message.includes("removed") ? "green" : "red" }}>{message}</p>}
                {!loading && !household && (
                    <p style={{ marginLeft: 40 }}>You are not part of a household yet. Go to <Link to="/Settings">Settings</Link> to create or join one.</p>
                )}
                {household && (
                    <form className="billAddForm" style={{ marginLeft: 40, width: 420 }} onSubmit={handleAddMember}>
                        <h2>Add Roommate</h2>
                        <label>Email</label>
                        <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="roommate@example.com" />
                        <button className="btnGreen" type="submit">Add Roommate</button>
                    </form>
                )}
                <div className="roommates">
                    <ul>
                        {roommates.map(roommate => (
                            <li key={roommate._id}>
                                <img src={require("./images/person.png")} alt="Roommate" />
                                {memberName(roommate)}
                                {roommate.isAdmin && <img src={require("./images/crown.png")} alt="admin" />}
                                {isCurrentUserAdmin && String(roommate._id) !== String(userId) && (
                                    <button className="btnRed" type="button" onClick={() => handleRemoveMember(roommate._id)}>Remove</button>
                                )}
                            </li>
                        ))}
                        {household && <li><Link to="/ApartmentListing">+ List Apartment</Link></li>}
                    </ul>
                </div>
            </div>
        </section>
    );
}

export default Roommates;

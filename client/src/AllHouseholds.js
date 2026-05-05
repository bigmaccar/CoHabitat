import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:7000/api";

function getFullName(user) {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "Unknown user";
}

function AllHouseholds(){
    const supportUserId = localStorage.getItem("userId");
    const [households, setHouseholds] = useState([]);
    const [users, setUsers] = useState([]);
    const [editHouseholds, setEditHouseholds] = useState({});
    const [moderationReason, setModerationReason] = useState("Household policy review");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const [allHouseholds, allUsers] = await Promise.all([
                axios.get(`${API_BASE}/households`),
                axios.get(`${API_BASE}/users`)
            ]);
            setHouseholds(Array.isArray(allHouseholds.data) ? allHouseholds.data : []);
            setUsers(Array.isArray(allUsers.data) ? allUsers.data : []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.errorMessage || "Households could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function getEditableHousehold(household) {
        return editHouseholds[household._id] || {
            name: household.name || "",
            address: household.address || "",
            city: household.city || "",
            state: household.state || "",
            zipCode: household.zipCode || "",
            maxOccupants: household.maxOccupants || ""
        };
    }

    function updateEditField(householdId, field, value) {
        setEditHouseholds(currentEdits => ({
            ...currentEdits,
            [householdId]: {
                ...getEditableHousehold(households.find(household => household._id === householdId) || {}),
                ...currentEdits[householdId],
                [field]: value
            }
        }));
    }

    function updateHouseholdInState(updatedHousehold) {
        setHouseholds(currentHouseholds => currentHouseholds.map(household => {
            return household._id === updatedHousehold._id ? updatedHousehold : household;
        }));
    }

    function findUser(userId) {
        return users.find(user => String(user._id) === String(userId));
    }

    async function saveHousehold(household) {
        try {
            const editHousehold = getEditableHousehold(household);
            const res = await axios.put(`${API_BASE}/update/household/${household._id}`, editHousehold);
            updateHouseholdInState(res.data);
            setStatusMessage("Household updated.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Household could not be updated.");
        }
    }

    async function toggleSuspended(household) {
        try {
            const nextSuspended = !household.isSuspended;
            const res = await axios.put(`${API_BASE}/update/household/${household._id}`, {
                isSuspended: nextSuspended,
                moderationNotes: [
                    ...(household.moderationNotes || []),
                    {
                        action: nextSuspended ? "suspended" : "unsuspended",
                        reason: moderationReason,
                        byUserId: supportUserId,
                        createdAt: new Date()
                    }
                ]
            });
            updateHouseholdInState(res.data);
            setStatusMessage(nextSuspended ? "Household suspended." : "Household unsuspended.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Household status could not be updated.");
        }
    }

    async function removeMember(householdId, userId) {
        try {
            const res = await axios.delete(`${API_BASE}/household/${householdId}/members/${userId}`);
            updateHouseholdInState(res.data);
            setStatusMessage("Member removed.");
            await fetchData();
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Member could not be removed.");
        }
    }

    async function deleteHousehold(household) {
        if (!window.confirm(`Delete ${household.name || "this household"}?`)) {
            return;
        }

        try {
            await axios.delete(`${API_BASE}/delete/household/${household._id}`);
            setHouseholds(currentHouseholds => currentHouseholds.filter(item => item._id !== household._id));
            setStatusMessage("Household deleted.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "Household could not be deleted.");
        }
    }

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Tickets"><figure><img src={require("./images/list.png")} className="icon" alt="Tickets"/><figcaption>Tickets</figcaption></figure></Link></li>
                        <li className="active"><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body adminPage">
                <h1>All Households</h1>
                <div className="adminToolbar">
                    <label htmlFor="householdReason">Moderation reason</label>
                    <input
                        id="householdReason"
                        type="text"
                        value={moderationReason}
                        onChange={e => setModerationReason(e.target.value)}
                    />
                </div>
                {loading && <p>Loading households...</p>}
                {error && <p style={{color: "red"}}>{error}</p>}
                {statusMessage && <p>{statusMessage}</p>}
                {!loading && !error && households.length === 0 && <p>No households found.</p>}
                <ul className="adminCardList">
                    {households.map(household => {
                        const editHousehold = getEditableHousehold(household);
                        return (
                            <li className="adminCard" key={household._id}>
                                <div className="adminCardHeader">
                                    <div>
                                        <h2>{household.name || "Unnamed household"}</h2>
                                        <p>{[household.address, household.city, household.state, household.zipCode].filter(Boolean).join(", ")}</p>
                                    </div>
                                    <span className={household.isSuspended ? "statusPill warning" : "statusPill"}>
                                        {household.isSuspended ? "Suspended" : "Active"}
                                    </span>
                                </div>
                                <div className="adminFormGrid">
                                    <label>
                                        Name
                                        <input value={editHousehold.name} onChange={e => updateEditField(household._id, "name", e.target.value)} />
                                    </label>
                                    <label>
                                        Address
                                        <input value={editHousehold.address} onChange={e => updateEditField(household._id, "address", e.target.value)} />
                                    </label>
                                    <label>
                                        City
                                        <input value={editHousehold.city} onChange={e => updateEditField(household._id, "city", e.target.value)} />
                                    </label>
                                    <label>
                                        State
                                        <input value={editHousehold.state} onChange={e => updateEditField(household._id, "state", e.target.value)} />
                                    </label>
                                    <label>
                                        Zip code
                                        <input value={editHousehold.zipCode} onChange={e => updateEditField(household._id, "zipCode", e.target.value)} />
                                    </label>
                                    <label>
                                        Max occupants
                                        <input type="number" value={editHousehold.maxOccupants} onChange={e => updateEditField(household._id, "maxOccupants", e.target.value)} />
                                    </label>
                                </div>
                                <div className="adminActions">
                                    <button onClick={() => saveHousehold(household)}>Save Household</button>
                                    <button className={household.isSuspended ? "btnOutline" : "btnRed"} onClick={() => toggleSuspended(household)}>
                                        {household.isSuspended ? "Unsuspend Household" : "Suspend Household"}
                                    </button>
                                    <button className="btnRed" onClick={() => deleteHousehold(household)}>Delete Household</button>
                                </div>
                                <h3>Members</h3>
                                {household.members && household.members.length > 0 ? (
                                    <ul className="adminMembers">
                                        {household.members.map(member => {
                                            const memberUser = findUser(member.userId);
                                            return (
                                                <li key={String(member.userId)}>
                                                    {getFullName(memberUser)} {member.isAdmin && "(admin)"}
                                                    <button className="smallChatButton btnRed" onClick={() => removeMember(household._id, member.userId)}>Remove</button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p>No members.</p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

export default AllHouseholds;

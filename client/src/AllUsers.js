import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:7000/api";

function getFullName(user) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User";
}

function getHouseholdId(user) {
    const household = user.households?.[0];
    return household?.householdId?._id || household?.householdId || "";
}

function AllUsers(){
    const supportUserId = localStorage.getItem("userId");
    const [users, setUsers] = useState([]);
    const [households, setHouseholds] = useState([]);
    const [editUsers, setEditUsers] = useState({});
    const [reason, setReason] = useState("Policy violation");
    const [durationDays, setDurationDays] = useState("30");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const [allUsers, allHouseholds] = await Promise.all([
                axios.get(`${API_BASE}/users`),
                axios.get(`${API_BASE}/households`)
            ]);
            setUsers(Array.isArray(allUsers.data) ? allUsers.data : []);
            setHouseholds(Array.isArray(allHouseholds.data) ? allHouseholds.data : []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Users could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    function getEditableUser(user) {
        return editUsers[user._id] || {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            bio: user.bio || "",
            preferredLocation: user.preferredLocation || "",
            budgetMin: user.budgetMin || "",
            budgetMax: user.budgetMax || ""
        };
    }

    function getHouseholdName(householdId) {
        const household = households.find(item => String(item._id) === String(householdId));
        return household?.name || "No household";
    }

    function updateEditField(userId, field, value) {
        setEditUsers(currentEdits => ({
            ...currentEdits,
            [userId]: {
                ...getEditableUser(users.find(user => user._id === userId) || {}),
                ...currentEdits[userId],
                [field]: value
            }
        }));
    }

    function updateUserInState(updatedUser) {
        setUsers(currentUsers => currentUsers.map(user => user._id === updatedUser._id ? updatedUser : user));
    }

    async function saveUser(user) {
        try {
            const editUser = getEditableUser(user);
            const res = await axios.put(`${API_BASE}/update/user/${user._id}`, editUser);
            updateUserInState(res.data);
            setStatusMessage("User updated.");
        } catch (err) {
            setStatusMessage(err.response?.data?.message || "User could not be updated.");
        }
    }

    async function banUser(user) {
        if (!reason.trim()) {
            setStatusMessage("Enter a reason before banning a user.");
            return;
        }

        try {
            const res = await axios.post(`${API_BASE}/moderation/ban`, {
                targetUserId: user._id,
                reason: reason.trim(),
                durationDays: Number(durationDays) || 30,
                byUserId: supportUserId
            });
            updateUserInState(res.data.user);
            setStatusMessage("User banned.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "User could not be banned.");
        }
    }

    async function unbanUser(user) {
        try {
            const res = await axios.put(`${API_BASE}/update/user/${user._id}`, {
                isBanned: false,
                bannedUntil: null
            });
            updateUserInState(res.data);
            setStatusMessage("User unbanned.");
        } catch (err) {
            setStatusMessage(err.response?.data?.message || "User could not be unbanned.");
        }
    }

    async function kickUser(user) {
        const householdId = getHouseholdId(user);
        if (!householdId) {
            setStatusMessage("This user is not in a household.");
            return;
        }
        if (!reason.trim()) {
            setStatusMessage("Enter a reason before kicking a user.");
            return;
        }

        try {
            await axios.post(`${API_BASE}/moderation/kick`, {
                targetUserId: user._id,
                householdId,
                reason: reason.trim(),
                byUserId: supportUserId
            });
            await fetchData();
            setStatusMessage("User removed from household.");
        } catch (err) {
            setStatusMessage(err.response?.data?.errorMessage || "User could not be kicked.");
        }
    }

    async function deleteUser(user) {
        if (!window.confirm(`Delete ${getFullName(user)}?`)) {
            return;
        }

        try {
            await axios.delete(`${API_BASE}/delete/user/${user._id}`);
            setUsers(currentUsers => currentUsers.filter(item => item._id !== user._id));
            setStatusMessage("User deleted.");
        } catch (err) {
            setStatusMessage(err.response?.data?.message || "User could not be deleted.");
        }
    }

    function getUserStatus(user) {
        if (user.isBanned) {
            return user.bannedUntil ? `Banned until ${new Date(user.bannedUntil).toLocaleDateString()}` : "Banned";
        }
        if (user.isKicked) {
            return "Kicked from a household";
        }
        return "Active";
    }

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Tickets"><figure><img src={require("./images/list.png")} className="icon" alt="Tickets"/><figcaption>Tickets</figcaption></figure></Link></li>
                        <li><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                        <li className="active"><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body adminPage">
                <h1>All Users</h1>
                <div className="adminToolbar">
                    <label htmlFor="moderationReason">Moderation reason</label>
                    <input
                        id="moderationReason"
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                    <label htmlFor="banDuration">Ban length in days</label>
                    <input
                        id="banDuration"
                        type="number"
                        min="1"
                        value={durationDays}
                        onChange={e => setDurationDays(e.target.value)}
                    />
                </div>
                {loading && <p>Loading users...</p>}
                {error && <p style={{color: "red"}}>{error}</p>}
                {statusMessage && <p>{statusMessage}</p>}
                {!loading && !error && users.length === 0 && <p>No users found.</p>}
                <ul className="adminCardList">
                    {users.map(user => {
                        const editUser = getEditableUser(user);
                        const householdId = getHouseholdId(user);
                        const isCurrentSupportUser = String(user._id) === String(supportUserId);
                        return (
                            <li className="adminCard" key={user._id}>
                                <div className="adminCardHeader">
                                    <div>
                                        <h2>{getFullName(user)}</h2>
                                        <p>{user.email}</p>
                                    </div>
                                    <span className={user.isBanned ? "statusPill warning" : "statusPill"}>{getUserStatus(user)}</span>
                                </div>
                                <p><strong>Household:</strong> {getHouseholdName(householdId)}</p>
                                {isCurrentSupportUser && <p><strong>This is the current support account.</strong></p>}
                                <div className="adminFormGrid">
                                    <label>
                                        First name
                                        <input value={editUser.firstName} onChange={e => updateEditField(user._id, "firstName", e.target.value)} />
                                    </label>
                                    <label>
                                        Last name
                                        <input value={editUser.lastName} onChange={e => updateEditField(user._id, "lastName", e.target.value)} />
                                    </label>
                                    <label>
                                        Email
                                        <input value={editUser.email} onChange={e => updateEditField(user._id, "email", e.target.value)} />
                                    </label>
                                    <label>
                                        Location
                                        <input value={editUser.preferredLocation} onChange={e => updateEditField(user._id, "preferredLocation", e.target.value)} />
                                    </label>
                                    <label>
                                        Min budget
                                        <input type="number" value={editUser.budgetMin} onChange={e => updateEditField(user._id, "budgetMin", e.target.value)} />
                                    </label>
                                    <label>
                                        Max budget
                                        <input type="number" value={editUser.budgetMax} onChange={e => updateEditField(user._id, "budgetMax", e.target.value)} />
                                    </label>
                                </div>
                                <div className="adminActions">
                                    <button onClick={() => saveUser(user)}>Save User</button>
                                    {user.isBanned ? (
                                        <button className="btnOutline" onClick={() => unbanUser(user)} disabled={isCurrentSupportUser}>Unban User</button>
                                    ) : (
                                        <button className="btnRed" onClick={() => banUser(user)} disabled={isCurrentSupportUser}>Ban User</button>
                                    )}
                                    <button className="btnOutline" onClick={() => kickUser(user)} disabled={!householdId || isCurrentSupportUser}>Kick From Household</button>
                                    <button className="btnRed" onClick={() => deleteUser(user)} disabled={isCurrentSupportUser}>Delete User</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

export default AllUsers;

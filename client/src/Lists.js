import { Link } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const categories = [
    { key: "chore", title: "Chores" },
    { key: "grocery", title: "Groceries" },
    { key: "agreement", title: "Household Agreements" }
];

function Lists(){
    const householdId = localStorage.getItem("householdId") || "";
    const userId = localStorage.getItem("userId") || "";
    const [items, setItems] = useState([]);
    const [roommates, setRoommates] = useState([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("chore");
    const [assignedTo, setAssignedTo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchItems = useCallback(async () => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        try {
            const [itemsRes, householdRes, usersRes] = await Promise.all([
                axios.get("http://localhost:7000/api/chores", { params: { householdId } }),
                axios.get("http://localhost:7000/api/household", { params: { id: householdId } }),
                axios.get("http://localhost:7000/api/users")
            ]);
            const users = Array.isArray(usersRes.data) ? usersRes.data : [];
            const memberUsers = (householdRes.data.members || []).map(member => {
                const user = users.find(item => String(item._id) === String(member.userId));
                return user ? { ...user, isAdmin: member.isAdmin } : null;
            }).filter(Boolean);
            setRoommates(memberUsers);
            setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
            setMessage("");
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Lists could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [householdId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    function getRoommateName(roommateId) {
        const roommate = roommates.find(item => String(item._id) === String(roommateId));
        return roommate ? `${roommate.firstName || ""} ${roommate.lastName || ""}`.trim() || roommate.email : "";
    }

    async function handleAddItem(e) {
        e.preventDefault();
        if (!householdId) {
            setMessage("Create or join a household before using lists.");
            return;
        }
        if (!title.trim()) {
            setMessage("Title is required.");
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/chore", {
                householdId,
                createdBy: userId,
                assignedTo: category === "chore" ? assignedTo : undefined,
                title,
                category,
                dueDate: category === "chore" ? dueDate : undefined,
                notes,
                status: "pending"
            });
            setTitle("");
            setAssignedTo("");
            setDueDate("");
            setNotes("");
            setMessage("Item added.");
            fetchItems();
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Item could not be added.");
        }
    }

    async function toggleItem(item) {
        try {
            await axios.put("http://localhost:7000/api/update/chore/" + item._id, {
                status: item.status === "completed" ? "pending" : "completed"
            });
            fetchItems();
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Item could not be updated.");
        }
    }

    async function deleteItem(itemId) {
        try {
            await axios.delete("http://localhost:7000/api/delete/chore/" + itemId);
            setMessage("Item deleted.");
            fetchItems();
        } catch (error) {
            setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Item could not be deleted.");
        }
    }

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Roommates"><figure><img src={require("./images/roommates.png")} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require("./images/bill.png")} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require("./images/calendar.png")} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li className="active"><Link to="/Lists"><figure><img src={require("./images/list.png")} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require("./images/settings.png")} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style={{marginLeft: 40}}>Lists</h1>
                {!householdId && <p style={{marginLeft: 40}}>Create or join a household in <Link to="/Settings">Settings</Link> before using lists.</p>}
                {loading && <p style={{marginLeft: 40}}>Loading lists...</p>}
                {message && <p style={{marginLeft: 40, color: message.includes("added") || message.includes("deleted") ? "green" : "red"}}>{message}</p>}
                {householdId && (
                    <form className="billAddForm" style={{marginLeft: 40, width: 460}} onSubmit={handleAddItem}>
                        <h2>Add Item</h2>
                        <label>List</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            {categories.map(item => <option key={item.key} value={item.key}>{item.title}</option>)}
                        </select>
                        <label>Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" />
                        {category === "chore" && (
                            <>
                                <label>Assign To</label>
                                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {roommates.map(roommate => (
                                        <option key={roommate._id} value={roommate._id}>{getRoommateName(roommate._id)}</option>
                                    ))}
                                </select>
                                <label>Due Date</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                            </>
                        )}
                        <label>Notes</label>
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional details" />
                        <button className="btnGreen" type="submit">Add</button>
                    </form>
                )}
                <div className="listsGrid">
                    {categories.map(section => {
                        const sectionItems = items.filter(item => (item.category || "chore") === section.key);
                        return (
                            <div className="listsWrapper" key={section.key}>
                                <h2>{section.title}</h2>
                                <div className="list">
                                    {sectionItems.length === 0 && <p>No items yet.</p>}
                                    {sectionItems.map(item => (
                                        <div className="sharedListItem" key={item._id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={item.status === "completed"}
                                                    onChange={() => toggleItem(item)}
                                                />
                                                {item.title}
                                            </label>
                                            {item.assignedTo && <p>Assigned to: {getRoommateName(item.assignedTo)}</p>}
                                            {item.dueDate && <p>Due: {new Date(item.dueDate).toLocaleDateString()}</p>}
                                            {item.notes && <p>{item.notes}</p>}
                                            <button className="btnRed" type="button" onClick={() => deleteItem(item._id)}>Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Lists;

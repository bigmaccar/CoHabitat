import { Link } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

function SubmitTicket() {
    const userId = localStorage.getItem("userId");
    const householdId = localStorage.getItem("householdId");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("bug");
    const [priority, setPriority] = useState("low");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!householdId) {
            setMessage("You need to create or join a household before submitting a ticket.");
            return;
        }
        if (!title.trim() || !description.trim()) {
            setMessage("Please enter a title and description.");
            return;
        }

        setSubmitting(true);
        try {
            await axios.post("http://localhost:7000/api/supportTicket", {
                householdId,
                reporterId: userId,
                title: title.trim(),
                description: description.trim(),
                type,
                priority
            });
            setTitle("");
            setDescription("");
            setType("bug");
            setPriority("low");
            setMessage("Ticket submitted successfully.");
        } catch (err) {
            setMessage(err.response?.data?.errorMessage || "Ticket could not be submitted.");
        } finally {
            setSubmitting(false);
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
                        <li><Link to="/Lists"><figure><img src={require("./images/list.png")} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li className="active"><Link to="/Settings"><figure><img src={require("./images/settings.png")} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body" style={{ padding: "20px" }}>
                <h1>Submit a Ticket</h1>
                {message && <p>{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="title">Title:</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Brief issue title"
                        />
                    </div>
                    <div>
                        <label htmlFor="type">Ticket Type:</label>
                        <select id="type" name="type" value={type} onChange={e => setType(e.target.value)}>
                            <option value="apartment">Apartment</option>
                            <option value="billing">Billing</option>
                            <option value="safety">Safety</option>
                            <option value="bug">Website Issue/Bug</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority">Priority:</label>
                        <select id="priority" name="priority" value={priority} onChange={e => setPriority(e.target.value)}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe the issue."
                        />
                    </div>
                    <input type="submit" value={submitting ? "Submitting..." : "Submit"} disabled={submitting} />
                </form>
            </div>
        </section>
    );
}

export default SubmitTicket;

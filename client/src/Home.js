import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function formatMoney(value) {
    const amount = Number(value) || 0;
    return `$${amount.toFixed(2)}`;
}

function formatDate(value) {
    if (!value) {
        return "No due date";
    }
    const date = new Date(value);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString();
}

function getRemainingAmount(bill) {
    return (bill.shares || []).filter(share => !share.isPaid).reduce((sum, share) => sum + (Number(share.amountOwed) || 0), 0);
}

function getBillProgress(bills) {
    const total = bills.reduce((sum, bill) => sum + (Number(bill.totalAmount) || 0), 0);
    const remaining = bills.reduce((sum, bill) => sum + getRemainingAmount(bill), 0);
    const paid = Math.max(total - remaining, 0);
    const percentPaid = total > 0 ? Math.round((paid / total) * 100) : 0;

    return { total, paid, remaining, percentPaid };
}

function getNextDueBill(bills) {
    return [...bills]
        .filter(bill => bill.dueDate)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
}

function Home(){
    const householdId = localStorage.getItem("householdId");
    const [household, setHousehold] = useState(null);
    const [bills, setBills] = useState([]);
    const [items, setItems] = useState([]);
    const [events, setEvents] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(Boolean(householdId));

    useEffect(() => {
        async function fetchDashboard() {
            if (!householdId) {
                setLoading(false);
                return;
            }

            try {
                const [householdRes, billsRes, itemsRes, eventsRes] = await Promise.all([
                    axios.get("http://localhost:7000/api/household", { params: { id: householdId } }),
                    axios.get("http://localhost:7000/api/bill/household", { params: { householdId } }),
                    axios.get("http://localhost:7000/api/chores", { params: { householdId } }),
                    axios.get("http://localhost:7000/api/events", { params: { householdId } })
                ]);

                setHousehold(householdRes.data);
                setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
                setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
                setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
                setMessage("");
            } catch (error) {
                setMessage(error.response?.data?.message || error.response?.data?.errorMessage || "Dashboard could not be loaded.");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, [householdId]);

    const billProgress = getBillProgress(bills);
    const nextDueBill = getNextDueBill(bills);
    const openItems = items.filter(item => item.status !== "completed");
    const recentItems = openItems.slice(0, 4);
    const upcomingEvents = [...events]
        .filter(event => event.startDateTime && new Date(event.startDateTime) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
        .slice(0, 4);

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Roommates"><figure><img src={require(".//images/roommates.png")} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require(".//images/bill.png")} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require(".//images/calendar.png")} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to="/Lists"><figure><img src={require(".//images/list.png")} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require(".//images/settings.png")} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                {!householdId ? (
                    <div style={{ padding: "40px" }}>
                        <h2>Welcome to CoHabitat!</h2>
                        <p>You are not part of a household yet. Go to <Link to="/Settings">Settings</Link> to create one.</p>
                    </div>
                ) : (
                    <div className="homeDashboard">
                        <section className="homeHero">
                            <div>
                                <p className="homeEyebrow">Household Dashboard</p>
                                <h1>{household?.name || "Your Household"}</h1>
                                <p>
                                    {[household?.address, household?.city, household?.state, household?.zipCode].filter(Boolean).join(", ") || "Add your household address in Settings."}
                                </p>
                            </div>
                            <Link className="homeHeroLink" to="/Settings">Manage Household</Link>
                        </section>

                        {loading && <p className="homeStatus">Loading household dashboard...</p>}
                        {message && <p className="messageErrorNotice">{message}</p>}

                        <section className="homeSummaryGrid">
                            <div className="homeCard homeBillCard">
                                <div className="homeCardHeader">
                                    <h2>Bills & Rent</h2>
                                    <Link to="/Bills">Edit Bills</Link>
                                </div>
                                {bills.length === 0 ? (
                                    <p>No bills yet. Add rent or utilities from Bills.</p>
                                ) : (
                                    <>
                                        <p className="homeBigNumber">{formatMoney(billProgress.remaining)}</p>
                                        <p>remaining out of {formatMoney(billProgress.total)}</p>
                                        <progress max="100" value={billProgress.percentPaid}></progress>
                                        <p>{billProgress.percentPaid}% paid</p>
                                        {nextDueBill && (
                                            <p><strong>Next due:</strong> {nextDueBill.billName} on {formatDate(nextDueBill.dueDate)}</p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="homeCard">
                                <div className="homeCardHeader">
                                    <h2>Lists</h2>
                                    <Link to="/Lists">Open Lists</Link>
                                </div>
                                {recentItems.length === 0 ? (
                                    <p>No open list items. Add chores, groceries, or agreements from Lists.</p>
                                ) : (
                                    <ul className="homeList">
                                        {recentItems.map(item => (
                                            <li key={item._id}>
                                                <strong>{item.title}</strong>
                                                <span>{item.category || "chore"} · {item.dueDate ? formatDate(item.dueDate) : "No due date"}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="homeCard">
                                <div className="homeCardHeader">
                                    <h2>Calendar</h2>
                                    <Link to="/Calendar">Open Calendar</Link>
                                </div>
                                {upcomingEvents.length === 0 ? (
                                    <p>No upcoming events. Add reminders from Calendar.</p>
                                ) : (
                                    <ul className="homeList">
                                        {upcomingEvents.map(event => (
                                            <li key={event._id}>
                                                <strong>{event.title}</strong>
                                                <span>{new Date(event.startDateTime).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>

                        <section className="homeQuickActions">
                            <Link to="/Bills">Add or change rent</Link>
                            <Link to="/Lists">Create a list item</Link>
                            <Link to="/Calendar">Add calendar event</Link>
                            <Link to="/Roommates">Manage roommates</Link>
                        </section>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Home;

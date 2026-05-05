import { Link } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Calendar(){
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [peopleOver, setPeopleOver] = useState(false);
    const [message, setMessage] = useState("");

    async function handleDeleteEvent(id) {
        try {
            await axios.delete(`http://localhost:7000/api/delete/event/${id}`);
            setEvents(prev => prev.filter(event => event._id !== id));
        } catch (err) {
            console.log(err);
        }
    }

    async function handleCreateEvent(e) {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        const householdId = localStorage.getItem("householdId");
        const createdBy = localStorage.getItem("userId");
        if (!householdId) {
            setMessage("Create or join a household before adding calendar events.");
            setSubmitting(false);
            return;
        }
        try {
            await axios.post("http://localhost:7000/api/event", {
                householdId,
                createdBy,
                title,
                description,
                type,
                startDateTime,
                endDateTime,
                peopleOver
            });
            const res = await axios.get("http://localhost:7000/api/events", {
                params: { householdId }
            });
            setEvents(res.data);
            setShowForm(false);
            setTitle("");
            setDescription("");
            setType("");
            setStartDateTime("");
            setEndDateTime("");
            setPeopleOver(false);
            setMessage("Event created.");
        } catch (err) {
            setMessage(err.response?.data?.message || err.response?.data?.errorMessage || "Event could not be created.");
        }
        setSubmitting(false);
    }

    useEffect(() => {
        const householdId = localStorage.getItem("householdId");
        if (!householdId) return;
        async function fetchEvents() {
            try {
                const res = await axios.get("http://localhost:7000/api/events", {
                    params: { householdId }
                });
                setEvents(res.data);
            } catch (err) {
                console.log(err);
            }
        }
        fetchEvents();
    }, [currentMonth, currentYear]);

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to = "/Roommates"><figure><img src={require('.//images/roommates.png')} className = "icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to = "/Bills"><figure><img src={require('.//images/bill.png')} className = "icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li className = "active"><Link to = "/Calendar"><figure><img src={require('.//images/calendar.png')} className = "icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to = "/Lists"><figure><img src={require('.//images/list.png')} className = "icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to = "/Settings"><figure><img src={require('.//images/settings.png')} className = "icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style={{marginLeft: 40}}>Calendar</h1>
                {!localStorage.getItem("householdId") && <p style={{marginLeft: 40}}>Create or join a household in <Link to="/Settings">Settings</Link> before using the calendar.</p>}
                {message && <p style={{marginLeft: 40, color: message.includes("created") ? "green" : "red"}}>{message}</p>}

                {showForm ? (
                    <div style={{padding: 40}}>
                        <h2>Create Event</h2>
                        <form onSubmit={handleCreateEvent}>
                            <label>Name: </label><br/>
                            <input type="text" placeholder="Event name" value={title} onChange={e => setTitle(e.target.value)} required /><br/><br/>

                            <label>Desc: </label><br/>
                            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} /><br/><br/>

                            <label>Type: </label><br/>
                            <select value={type} onChange={e => setType(e.target.value)}>
                                <option value="">Select type</option>
                                <option value="event">Event</option>
                                <option value="reminder">Reminder</option>
                                <option value="chore">Chore</option>
                            </select><br/><br/>

                            <label>Start Date & Time: </label><br/>
                            <input type="datetime-local" value={startDateTime} onChange={e => setStartDateTime(e.target.value)} required /><br/><br/>

                            <label>End Date & Time: </label><br/>
                            <input type="datetime-local" value={endDateTime} onChange={e => setEndDateTime(e.target.value)} /><br/><br/>

                            <label>People over? </label>
                            <input type="checkbox" checked={peopleOver} onChange={e => setPeopleOver(e.target.checked)} /><br/><br/>

                            <input type="submit" value="Create Event" disabled={submitting} />
                            <button type="button" onClick={() => setShowForm(false)} style={{marginLeft: 10}}>Cancel</button>
                        </form>
                    </div>
                ) : selectedDay ? (
                    <div style={{padding: 40}}>
                        <button onClick={() => setSelectedDay(null)}>← Back</button>
                        <h2 style={{marginTop: 16}}>{selectedDay.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
                        {events.filter(event => {
                            const start = new Date(event.startDateTime);
                            const end = event.endDateTime ? new Date(event.endDateTime) : start;
                            const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                            const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                            return selectedDay >= startDay && selectedDay <= endDay;
                        }).length === 0 ? (
                            <p>No events this day.</p>
                        ) : (
                            events.filter(event => {
                                const start = new Date(event.startDateTime);
                                const end = event.endDateTime ? new Date(event.endDateTime) : start;
                                const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                                const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                                return selectedDay >= startDay && selectedDay <= endDay;
                            }).map(event => (
                                <div key={event._id} style={{borderLeft: '4px solid #68B684', padding: '8px 16px', marginTop: 12}}>
                                    <strong>{event.title}</strong>
                                    <p style={{margin: '4px 0', fontSize: 14}}>
                                        {new Date(event.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                        {event.endDateTime && ` – ${new Date(event.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`}
                                    </p>
                                    {event.description && <p style={{margin: 0, fontSize: 14, color: '#555'}}>{event.description}</p>}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                <div style={{padding: 40}}>
                
                    <div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20}}>
                        <button onClick={() => {
                            if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                            else setCurrentMonth(currentMonth - 1);
                        }}>{"<"}</button>

                        <h2>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}</h2>

                        <button onClick={() => {
                            if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                            else setCurrentMonth(currentMonth + 1);
                        }}>{">"}</button>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold'}}>
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>


                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4}}>
                        {Array(new Date(currentYear, currentMonth, 1).getDay()).fill(null).map((_, i) => (
                            <div key={'empty-' + i}></div>
                        ))}
                        {Array(new Date(currentYear, currentMonth + 1, 0).getDate()).fill(null).map((_, i) => {
                            const dayNum = i + 1;
                            const dayEvents = events.filter(event => {
                                const start = new Date(event.startDateTime);
                                const end = event.endDateTime ? new Date(event.endDateTime) : start;
                                const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                                const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
                                const thisDay = new Date(currentYear, currentMonth, dayNum);
                                return thisDay >= startDay && thisDay <= endDay;
                            });
                            return (
                                <div key={dayNum} onClick={() => setSelectedDay(new Date(currentYear, currentMonth, dayNum))} style={{border: '1px solid #ccc', minHeight: 80, padding: 4, cursor: 'pointer'}}>
                                    <strong>{dayNum}</strong>
                                    {dayEvents.map(event => (
                                        <div key={event._id} style={{backgroundColor: '#68B684', color: 'white', borderRadius: 4, padding: '2px 4px', marginTop: 2, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <span>{event.title}</span>
                                            <span onClick={e => { e.stopPropagation(); handleDeleteEvent(event._id); }} style={{cursor: 'pointer', marginLeft: 6}}>×</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <button onClick={() => setShowForm(true)} style={{marginTop: 20}}>+ Create Event</button>
                </div>
                )}
            </div>
        </section>
    )

}

export default Calendar;

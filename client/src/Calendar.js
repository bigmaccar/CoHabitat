import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Calendar(){
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [peopleOver, setPeopleOver] = useState(false);

    async function handleCreateEvent(e) {
        e.preventDefault();
        const householdId = localStorage.getItem("householdId");
        const createdBy = localStorage.getItem("userId");
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
        } catch (err) {
            console.log(err);
        }
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
        <section class="layout">
            <div class="leftSide">
                <div class = "sidebar">
                    <center><ul>
                        <li><Link to = "/Roommates"><figure><img src={require('.//images/roommates.png')} class = "icon"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to = "/Bills"><figure><img src={require('.//images/bill.png')} class = "icon"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li class = "active"><Link to = "/Calendar"><figure><img src={require('.//images/calendar.png')} class = "icon"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to = "/Lists"><figure><img src={require('.//images/list.png')} class = "icon"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to = "/Settings"><figure><img src={require('.//images/settings.png')} class = "icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div class="body">
                <h1 style={{marginLeft: 40}}>Calendar</h1>

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

                            <input type="submit" value="Create Event" />
                            <button type="button" onClick={() => setShowForm(false)} style={{marginLeft: 10}}>Cancel</button>
                        </form>
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

                    {/* Day labels */}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 'bold'}}>
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>

                    {/* Grid cells */}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4}}>
                        {Array(new Date(currentYear, currentMonth, 1).getDay()).fill(null).map((_, i) => (
                            <div key={'empty-' + i}></div>
                        ))}
                        {Array(new Date(currentYear, currentMonth + 1, 0).getDate()).fill(null).map((_, i) => {
                            const dayNum = i + 1;
                            const dayEvents = events.filter(event => {
                                const d = new Date(event.startDateTime);
                                return d.getUTCFullYear() === currentYear &&
                                       d.getUTCMonth() === currentMonth &&
                                       d.getUTCDate() === dayNum;
                            });
                            return (
                                <div key={dayNum} style={{border: '1px solid #ccc', minHeight: 80, padding: 4}}>
                                    <strong>{dayNum}</strong>
                                    {dayEvents.map(event => (
                                        <div key={event._id} style={{backgroundColor: '#68B684', color: 'white', borderRadius: 4, padding: '2px 4px', marginTop: 2, fontSize: 12}}>
                                            {event.title}
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
import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from 'axios';

function Roommates() {
    const [roommates, setRoommates] = useState([]);
    const [household, setHousehold] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const householdId = localStorage.getItem('householdId');
                const householdResponse = await axios.get("http://localhost:9000/getHouseholdById", { body: { _id: householdId } });
                setHousehold(householdResponse.data);
                var roomies = [];
                for (var i = 0; i < householdResponse.data.members.length; i++) {
                    const userResponse = await axios.get("http://localhost:9000/getUserById", { body: { _id: householdResponse.data.members[i].userId } });
                    roomies.push(userResponse);
                }
                setRoommates(roomies);
            } catch (error) {
                console.log("Error while fetching data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <section class="layout">
            <div class="leftSide">
                <div class="sidebar">
                    <center><ul>
                        <li class="active"><Link to="/Roommates"><figure><img src={require('.//images/roommates.png')} class="icon" /><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require('.//images/bill.png')} class="icon" /><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require('.//images/calendar.png')} class="icon" /><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to="/Lists"><figure><img src={require('.//images/list.png')} class="icon" /><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require('.//images/settings.png')} class="icon" /><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div class="body">
                <h1 style={{ marginLeft: 40 }}>Roommates</h1>
                <div class="roommates">
                    <ul>
                        {roommates.map(roommate => (
                            <li><img src={require('./images/person.png')} />{roommate.firstName + " " + roommate.lastName}{roommate.isAdmin && (
                                <img src={require('./images/crown.png')} alt="admin" />
                            )}</li>
                        ))}
                        <li><Link to="/ApartmentListing">+ List Apartment</Link></li>
                    </ul>
                </div>
            </div>
        </section>
    )

}

export default Roommates;

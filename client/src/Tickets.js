import { Link } from "react-router-dom";
import React from "react";

function Tickets(){
    const householdId = localStorage.getItem("householdId");

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li class = "active"><Link to="/Tickets"><figure><img src={require('.//images/list.png')} className="icon"/><figcaption>Tickets</figcaption></figure></Link></li>
                        <li><Link to="/AllHouseholds"><figure><img src={require('.//images/homeIcon.png')} className="icon"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require('.//images/roommates.png')} className="icon"/><figcaption>Users</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require('.//images/settings.png')} className="icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style = {{marginLeft: 40}}>Tickets</h1>
                <div class = "ticketsWrapper"> {/* The wrapper is the box itself, contains all of the information. Duplicate this and the information in it per list*/}
                    <h2>Issue #1</h2> {/* issue name */}
                    <div class = "ticket"> {/* This is the actual list information, contained in the box. header/id/name/value/label changes with data*/}
                        <ul>
                            <li>User: User 1</li>
                            <li>Household: Household 1</li>
                            <li>Type: x</li>
                        </ul>
                    </div>
                </div>
                <div class = "ticketsWrapper"> {/* The wrapper is the box itself, contains all of the information. Duplicate this and the information in it per list*/}
                    <h2>Issue #2</h2>
                    <div class = "ticket"> {/* This is the actual list information, contained in the box. header/id/name/value/label changes with data*/}
                        <ul>
                            <li>User: User 1</li>
                            <li>Household: Household 1</li>
                            <li>Type: x</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Tickets;
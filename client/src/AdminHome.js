import { Link } from "react-router-dom";
import React from "react";

function AdminHome(){
    const householdId = localStorage.getItem("householdId");

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Tickets"><figure><img src={require('.//images/list.png')} className="icon"/><figcaption>Tickets</figcaption></figure></Link></li>
                        <li><Link to="/AllHouseholds"><figure><img src={require('.//images/homeIcon.png')} className="icon"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require('.//images/roommates.png')} className="icon"/><figcaption>Users</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require('.//images/settings.png')} className="icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                    <>
                        <div className="apartment">
                            <h1>ADMIN</h1>
                        </div>
                        <div className="wrapper">
                            <h3>Your Tickets/Issues</h3>
                        </div>
                    </>
            </div>
        </section>
    );
}

export default AdminHome;
import { Link } from "react-router-dom";
import React from "react";

function AllUsers(){
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
            <div className="body">
                <h1 style = {{marginLeft: 40}}>All Users</h1>
                <ul>
                    <li>User 1 <button>Edit Info</button></li> {/* update with options to edit, message, ban,etc*/}
                </ul>
            </div>
        </section>
    );
}

export default AllUsers;

import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function AllUsers(){

    const [users, setUsers] = useState([]);

    useEffect(() => {
            const fetchData = async () => {
                try {
                    const allUsers = await axios.get("http://localhost:9000/getAllUsers");
                    setUsers(allUsers);
                } catch (error) {
                    console.log("Error while fetching data", error);
                }
            };
            fetchData();
        }, []);

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
                    {users.map(user => (
                        <li><img src={require('./images/person.png')} />{user.firstName + " " + user.lastName}{user.isAdmin && (
                            <img src={require('./images/crown.png')} alt="admin" />
                        )} <button>Edit User Info</button> <button>Message User</button><button>Suspend/Ban User</button>
                            <button>Delete User Info</button></li> 
                    ))} {/* buttons don't do anything currently */}
                </ul>
            </div>
        </section>
    );
}

export default AllUsers;

import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function AllUsers(){

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
            const fetchData = async () => {
                try {
                    const allUsers = await axios.get("http://localhost:7000/api/users");
                    setUsers(Array.isArray(allUsers.data) ? allUsers.data : []);
                    setError("");
                } catch (error) {
                    setError(error.response?.data?.message || "Users could not be loaded.");
                } finally {
                    setLoading(false);
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
                {loading && <p style={{marginLeft: 40}}>Loading users...</p>}
                {error && <p style={{marginLeft: 40, color: "red"}}>{error}</p>}
                {!loading && !error && users.length === 0 && <p style={{marginLeft: 40}}>No users found.</p>}
                <ul>
                    {users.map(user => (
                        <li key={user._id}><img src={require('./images/person.png')} alt="User" />{`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}{user.isAdmin && (
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

import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function AllHouseholds(){

    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
            const fetchData = async () => {
                try {
                    const allHouseholds = await axios.get("http://localhost:7000/api/households");
                    setHouseholds(Array.isArray(allHouseholds.data) ? allHouseholds.data : []);
                    setError("");
                } catch (error) {
                    setError(error.response?.data?.errorMessage || "Households could not be loaded.");
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
                        <li className="active"><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style = {{marginLeft: 40}}>All Households</h1>
                {loading && <p style={{marginLeft: 40}}>Loading households...</p>}
                {error && <p style={{marginLeft: 40, color: "red"}}>{error}</p>}
                {!loading && !error && households.length === 0 && <p style={{marginLeft: 40}}>No households found.</p>}
                <ul>
                    {households.map(household => (
                        <li key={household._id}><img src={require('./images/homeIcon.png')} alt="Household" />{household.name || "Unnamed household"}
                        <button>Edit Household Info</button> <button>Message Household Owner</button><button>Suspend/Ban Household</button>
                            <button>Delete Household Info</button></li> 
                    ))} {/* buttons don't do anything currently */}
                </ul>
            </div>
        </section>
    );
}

export default AllHouseholds;

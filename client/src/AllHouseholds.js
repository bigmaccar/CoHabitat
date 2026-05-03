import { Link } from "react-router-dom";
import React from "react";

function AllHouseholds(){

    const [households, setHouseholds] = useState([]);

    useEffect(() => {
            const fetchData = async () => {
                try {
                    const allHouseholds = await axios.get("http://localhost:9000/getAllHouseholds");
                    setHouseholds(allHouseholds);
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
                        <li className="active"><Link to="/AllHouseholds"><figure><img src={require("./images/homeIcon.png")} className="icon" alt="Households"/><figcaption>Households</figcaption></figure></Link></li>
                        <li><Link to="/AllUsers"><figure><img src={require("./images/roommates.png")} className="icon" alt="Users"/><figcaption>Users</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style = {{marginLeft: 40}}>All Households</h1>
                <ul>
                    {households.map(household => (
                        <li><img src={require('./images/homeIcon.png')} />{household.name}
                        <button>Edit Household Info</button> <button>Message Household Owner</button><button>Suspend/Ban Household</button>
                            <button>Delete Household Info</button></li> 
                    ))} {/* buttons don't do anything currently */}
                </ul>
            </div>
        </section>
    );
}

export default AllHouseholds;

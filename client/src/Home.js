import { Link } from "react-router-dom";
import React from "react";

function Home(){
    const householdId = localStorage.getItem("householdId");

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Roommates"><figure><img src={require('.//images/roommates.png')} className="icon"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require('.//images/bill.png')} className="icon"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require('.//images/calendar.png')} className="icon"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to="/Lists"><figure><img src={require('.//images/list.png')} className="icon"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require('.//images/settings.png')} className="icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                {!householdId ? (
                    <div style={{ padding: "40px" }}>
                        <h2>Welcome to CoHabitat!</h2>
                        <p>You are not part of a household yet. Go to <Link to="/Settings">Settings</Link> to create one.</p>
                    </div>
                ) : (
                    <>
                        <div className="apartment">
                            <h1>APARTMENT</h1>
                        </div>
                        <div className="wrapper">
                            <h3>Info</h3>
                            <strong><h2>DUE: MAY 24th</h2></strong>
                            <h2>$600/$1000</h2>
                            <progress max="100" value="60"></progress>
                        </div>
                        <div className="container">
                            <div>List 1</div>
                            <div>List 2</div>
                            <div>Calendar</div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default Home;
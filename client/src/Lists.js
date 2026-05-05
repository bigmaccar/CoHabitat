import { Link } from "react-router-dom";
import React from "react";

function Lists(){

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Roommates"><figure><img src={require("./images/roommates.png")} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require("./images/bill.png")} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require("./images/calendar.png")} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li className="active"><Link to="/Lists"><figure><img src={require("./images/list.png")} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require("./images/settings.png")} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style={{marginLeft: 40}}>Lists</h1>
                <Link to="/List" style={{marginLeft: 40, fontSize: 30}}>+ Make New List</Link>
                <div className="listsWrapper">
                    <h2>Groceries</h2>
                    <div className="list">
                        <input type="checkbox" id="groceries1" name="groceries1" value="eggs"/>
                        <label htmlFor="groceries1"> Eggs</label><br />
                        <input type="checkbox" id="groceries2" name="groceries2" value="milk"/>
                        <label htmlFor="groceries2"> Milk</label><br />
                        <input type="checkbox" id="groceries3" name="groceries3" value="bread"/>
                        <label htmlFor="groceries3"> Bread</label><br />
                    </div>
                </div>
                <div className="listsWrapper">
                    <h2>Party Supplies</h2>
                    <div className="list">
                        <input type="checkbox" id="party1" name="party1" value="snacks"/>
                        <label htmlFor="party1"> Snacks</label><br />
                        <input type="checkbox" id="party2" name="party2" value="streamers"/>
                        <label htmlFor="party2"> Streamers</label><br />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Lists;

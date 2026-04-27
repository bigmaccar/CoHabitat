import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

function ApartmentListing(){
    const [isFilled, setIsFilled] = useState(false);

    useEffect(() => {
        setIsFilled(localStorage.getItem("apartment1Filled") === "true");
    }, []);

    function updateListingStatus(filledStatus) {
        setIsFilled(filledStatus);
        localStorage.setItem("apartment1Filled", filledStatus.toString());
    }

    return (
        <section className="layout">
            <div className="leftSide">
                <div className="sidebar">
                    <center><ul>
                        <li><Link to="/Roommates"><figure><img src={require("./images/roommates.png")} className="icon" alt="Roommates"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to="/Bills"><figure><img src={require("./images/bill.png")} className="icon" alt="Bills"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to="/Calendar"><figure><img src={require("./images/calendar.png")} className="icon" alt="Calendar"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to="/Lists"><figure><img src={require("./images/list.png")} className="icon" alt="Lists"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to="/Settings"><figure><img src={require("./images/settings.png")} className="icon" alt="Settings"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div className="body">
                <h1 style={{marginLeft: 40}}>List Apartment</h1>
                <div className="apartmentInfo">
                    <div className="apartmentListing">
                        <h2>Information</h2>
                        <label htmlFor="name">Apartment Name: </label>
                        <input type="text" id="name" name="name" />
                        <br />
                        <label htmlFor="address">Address: </label>
                        <input type="text" id="address" name="address" />
                        <br />
                        <label htmlFor="city">City: </label>
                        <input type="text" id="city" name="city" />
                        <br />
                        <label htmlFor="state">State: </label>
                        <input type="text" id="state" name="state" />
                        <br />
                        <label htmlFor="zipcode">Zip Code: </label>
                        <input type="text" id="zipcode" name="zipcode" />
                        <br />
                    </div>
                    <div className="apartmentListing">
                        <h2>Description</h2>
                        <textarea />
                    </div>
                    <div className="apartmentListing">
                        <h2>Options</h2>
                        <h3>Apartment Size</h3>
                        <input type="checkbox" id="option1" name="option1" value="small" />
                        <label htmlFor="option1"> Small</label><br />
                        <input type="checkbox" id="option2" name="option2" value="medium" />
                        <label htmlFor="option2"> Medium</label><br />
                        <input type="checkbox" id="option3" name="option3" value="large" />
                        <label htmlFor="option3"> Large</label><br />

                        <div className="listingStatusCard">
                            <h3>Listing Status</h3>
                            <p>{isFilled ? "Filled - inquiries are closed." : "Open - accepting inquiries."}</p>
                            <button onClick={() => updateListingStatus(true)} disabled={isFilled}>Mark as Filled</button>
                            <button onClick={() => updateListingStatus(false)} disabled={!isFilled}>Reopen Listing</button>
                        </div>
                    </div>
                </div>
                <br />
                <center><input type="submit" value="Submit" /></center>
            </div>
        </section>
    )

}

export default ApartmentListing;

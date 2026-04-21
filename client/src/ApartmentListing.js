import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function ApartmentListing(){

    return (
        <section class="layout">
            <div class="leftSide">
                <div class = "sidebar">
                    <center><ul>
                        <li><Link to = "/Roommates"><figure><img src={require('.//images/roommates.png')} class = "icon"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to = "/Bills"><figure><img src={require('.//images/bill.png')} class = "icon"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to = "/Calendar"><figure><img src={require('.//images/calendar.png')} class = "icon"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to = "/Lists"><figure><img src={require('.//images/list.png')} class = "icon"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to = "/Settings"><figure><img src={require('.//images/settings.png')} class = "icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div class="body">
                <h1 style = {{marginLeft: 40}}>List Apartment</h1>
                <div class = "apartmentInfo">
                    <div class = "apartmentListing">
                        <h2>Information</h2>
                        <label for = "name">Apartment Name: </label>
                        <input type = "text" id="name" name="name"></input>
                        <br></br>
                        <label for = "address">Address: </label>
                        <input type = "text" id="address" name="address"></input>
                        <br></br>
                        <label for = "city">City: </label>
                        <input type = "text" id="city" name="city"></input>
                        <br></br>
                        <label for = "state">State: </label>
                        <input type = "text" id="state" name="state"></input>
                        <br></br>
                        <label for = "zipcode">Zip Code: </label>
                        <input type = "text" id="zipcode" name="zipcode"></input>
                        <br></br>
                    </div>
                    <div class = "apartmentListing">
                        <h2>Description</h2>
                        <textarea/>
                    </div>
                    <div class = "apartmentListing"> {/* no clue why the checkboxes look like that tbh*/}
                        <h2>Options</h2>
                        <h3>Apartment Size</h3>
                        <input type="checkbox" id="option1" name="option1" value="small"/>
                        <label for="option1"> Small</label><br></br>
                        <input type="checkbox" id="option2" name="option2" value="medium"/>
                        <label for="option2"> Medium</label><br></br>
                        <input type="checkbox" id="option3" name="option3" value="large"/>
                        <label for="option3"> Large</label><br></br>
                    </div>
                </div>
                <br></br>
                <center><input type = "submit" value = "Submit"></input></center> {/* Go to search after this */}
            </div>
        </section>
    )

}

export default ApartmentListing;
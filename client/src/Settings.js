import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Settings(){

    return (
        <section class="layout">
            <div class="leftSide">
                <div class = "sidebar">
                    <center><ul>
                        <li><Link to = "/Roommates"><figure><img src={require('.//images/roommates.png')} class = "icon"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to = "/Bills"><figure><img src={require('.//images/bill.png')} class = "icon"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to = "/Calendar"><figure><img src={require('.//images/calendar.png')} class = "icon"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to = "/Lists"><figure><img src={require('.//images/list.png')} class = "icon"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li class = "active"><Link to = "/Settings"><figure><img src={require('.//images/settings.png')} class = "icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div class="body">
                <h1 style = {{marginLeft: 40}}>Settings</h1>
                <Link to = "/ApartmentListing" style = {{marginLeft: 40, fontSize: 30}}>List Your Apartment</Link>
                {/*Can include different settings, such as update permissions, add/remove roommates, delete apartment, etc*/}
            </div>
        </section>
    )

}

export default Settings;
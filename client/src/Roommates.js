import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Roommates(){

    return (
        <section class="layout">
            <div class="leftSide">
                <div class = "sidebar">
                    <center><ul>
                        <li class = "active"><Link to = "/Roommates"><figure><img src={require('.//images/roommates.png')} class = "icon"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to = "/Bills"><figure><img src={require('.//images/bill.png')} class = "icon"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to = "/Calendar"><figure><img src={require('.//images/calendar.png')} class = "icon"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to = "/Lists"><figure><img src={require('.//images/list.png')} class = "icon"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to = "/Settings"><figure><img src={require('.//images/settings.png')} class = "icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div class="body">
                <h1 style = {{marginLeft: 40}}>Roommates</h1>
                <div class = "roommates">
                    <ul>
                        <li><img src={require('.//images/person.png')}/> Roommate 1 <img src={require('.//images/crown.png')}/> </li> {/* Crown for owner*/}
                        <li><img src={require('.//images/person.png')}/> Roommate 2</li>
                        <li><Link to = "/ApartmentListing">+ List Apartment</Link></li>
                    </ul>
                </div>
            </div>
        </section>
    )

}

export default Roommates;
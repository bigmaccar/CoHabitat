import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Bills(){

    return (
        <section class="layout">
            <div class="leftSide">
                <div class = "sidebar">
                    <center><ul>
                        <li><Link to = "/Roommates"><figure><img src={require('.//images/roommates.png')} class = "icon"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li class = "active"><Link to = "/Bills"><figure><img src={require('.//images/bill.png')} class = "icon"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to = "/Calendar"><figure><img src={require('.//images/calendar.png')} class = "icon"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li><Link to = "/Lists"><figure><img src={require('.//images/list.png')} class = "icon"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to = "/Settings"><figure><img src={require('.//images/settings.png')} class = "icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div class="body">
                <h1 style = {{marginLeft: 40}}>Bills</h1>
                <center><div class = "bills">
                    <strong><h2>DUE: MAY 24th</h2></strong>
                    <h2>$600/$1000</h2>
                    <progress max = "100" value = "60"></progress> {/* Update this plus h2 after updating bill*/}
                    <button>Pay Bill</button>
                    <button>Update Total</button>
                    <button>Change Due Date</button>
                    <button>Change Split</button>
                </div></center>
            </div>
        </section>
    )

}

export default Bills;
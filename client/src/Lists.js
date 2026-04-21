import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Lists(){

    return (
        <section class="layout">
            <div class="leftSide">
                <div class = "sidebar">
                    <center><ul>
                        <li><Link to = "/Roommates"><figure><img src={require('.//images/roommates.png')} class = "icon"/><figcaption>Roommates</figcaption></figure></Link></li>
                        <li><Link to = "/Bills"><figure><img src={require('.//images/bill.png')} class = "icon"/><figcaption>Bills</figcaption></figure></Link></li>
                        <li><Link to = "/Calendar"><figure><img src={require('.//images/calendar.png')} class = "icon"/><figcaption>Calendar</figcaption></figure></Link></li>
                        <li class = "active"><Link to = "/Lists"><figure><img src={require('.//images/list.png')} class = "icon"/><figcaption>Lists</figcaption></figure></Link></li>
                        <li><Link to = "/Settings"><figure><img src={require('.//images/settings.png')} class = "icon"/><figcaption>Settings</figcaption></figure></Link></li>
                    </ul></center>
                </div>
            </div>
            <div class="body">
                <h1 style = {{marginLeft: 40}}>Lists</h1>
                <Link to = "/List" style = {{marginLeft: 40, fontSize: 30}}>+ Make New List</Link> 
                <div class = "listsWrapper"> {/* The wrapper is the box itself, contains all of the information. Duplicate this and the information in it per list*/}
                    <h2>Groceries</h2>
                    <div class = "list"> {/* This is the actual list information, contained in the box. header/id/name/value/label changes with data*/}
                        <input type="checkbox" id="groceries1" name="groceries1" value="eggs"/>
                        <label for="groceries1"> Eggs</label><br></br>
                        <input type="checkbox" id="groceries2" name="groceries2" value="milk"/>
                        <label for="groceries2"> Milk</label><br></br>
                        <input type="checkbox" id="groceries3" name="groceries3" value="bread"/>
                        <label for="groceries3"> Bread</label><br></br>
                    </div>
                </div>
                <div class = "listsWrapper"> {/* The wrapper is the box itself, contains all of the information. Duplicate this and the information in it per list*/}
                    <h2>Party Supplies</h2>
                    <div class = "list"> {/* This is the actual list information, contained in the box. header/id/name/value/label changes with data*/}
                        <input type="checkbox" id="party1" name="party1" value="snacks"/>
                        <label for="party1"> Snacks</label><br></br>
                        <input type="checkbox" id="party2" name="party2" value="streamers"/>
                        <label for="party2"> Streamers</label><br></br>
                    </div>
                </div>
            </div>
        </section>
    )

}

export default Lists;
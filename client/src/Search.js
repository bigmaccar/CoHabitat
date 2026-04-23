import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Search(){

    return (
        <>
        <section class="layoutSearch">
            <div class="sidebarSearch">
                <div class = "search">
                    <h1>Apartment Search</h1>
                    <Link to = "/Apartment">Temp apartment page - make into full page, delete this link later</Link>
                </div>
                <input type="text" placeholder="Search" class = "search"></input>
                <br></br>
                <div class = "apartmentListWrapper"> {/* The wrapper is the box itself, contains all of the information. Duplicate this and the information in it per apartment*/}
                    <div class = "apartmentListImage">
                        <img src={require('.//images/apartment1.jpg')}/>
                    </div>
                    <div class = "apartmentList"> {/* This is the actual apartment information, contained in the box*/}
                        <h1>Apartment 1</h1> {/*Link container to Apartment */}
                        <p>desc</p>
                        <p>more information</p>
                    </div>
                </div>
                <div class = "apartmentListWrapper">
                    <div class = "apartmentListImage">
                        <img src={require('.//images/apartment2.jpg')}/>
                    </div>
                    <div class = "apartmentList"> {/* This is the actual apartment information, contained in the box*/}
                        <h1>Apartment 2</h1> {/* Link container to Apartment */}
                        <p>desc</p>
                        <p>more information</p>
                    </div>
                </div>
            </div>
            <div class="bodySearch">
                <div class = "filters"> {/* Update later with decided filters. Currently includes different option types*/}
                    <p>OPTION 1</p>
                    <label class="switch" for="option1">
                        <input type="checkbox" id="option1" value = "option1"/>
                        <span class="slider round"></span>
                    </label>
                    <p>OPTION 2</p>
                    <input type="checkbox" id="size1" name="size1" value="small"/>
                    <label for="option2"> Small</label><br></br>
                    <input type="checkbox" id="size2" name="size2" value="large"/>
                    <label for="size2"> Large</label><br></br>
                    <p>OPTION 3</p>
                    <div class="slidecontainer">
                    <input type="range" min="1" max="100" value="50" class="sliderBar" id="myRange"/>
                    </div>
                </div>
            </div>
        </section></>
    )

}

export default Search;
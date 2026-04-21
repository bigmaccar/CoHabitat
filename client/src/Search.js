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
                </div>
                <input type="text" placeholder="Search"></input>
                <br></br>
                <div class = "apartmentListWrapper">
                    <div class = "apartmentList">
                        <p>testing</p>
                        <h1>Apartment Name</h1>
                        <p>desc</p>
                        <p>sample photo somewhere</p>
                    </div>
                </div>
                <div class = "apartmentListWrapper">
                    <div class = "apartmentList">
                        <p>second apartment</p>
                        <h1>Apartment Name 2</h1>
                        <p>desc 2</p>
                        <p>sample photo somewhere maybe</p>
                    </div>
                </div>
            </div>
            <div class="bodySearch">
                <div class = "filters">
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
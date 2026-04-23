import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Apartment(){

    return (
        <>
        <section class="layoutApartment">
            <div class="sidebarApartment">
                <div class = "apartmentPage">
                    <Link to = "/Search">Back to Search</Link>
                    <h1>Apartment 1</h1>
                <img src={require('.//images/apartment1.jpg')} class = "apartmentPageImage"/>
                <div class = "containerApartment">
                    <div></div>
                    <button>Save</button>
                    <button>Message</button>
                    <button>Apply</button>
                </div>
                </div>
            </div>
            <div class="bodyApartment">
               <div class = "apartmentPage2">
                    <h1>Information</h1>
                    <p>info, add desc here</p>
                </div>
            </div>
        </section></>
    )

}

export default Apartment;
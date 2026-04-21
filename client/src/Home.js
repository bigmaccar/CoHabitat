import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Home(){

    return (
        <section class="layout">
            <div class="leftSide">
                <div class = "sidebar">
                    <ul>
                        <li><a>ROOMATES PLACEHOLDER</a></li>
                        <li><a>BILLS PLACEHOLDER</a></li>
                        <li><a>CALENDAR PLACEHOLDER</a></li>
                        <li><a>LISTS PLACEHOLDER</a></li>
                        <li><a>SETTINGS PLACEHOLDER</a></li>
                    </ul>
                </div>
            </div>
            <div class="body">
                <div class = "apartment">
                    <h1>APARTMENT</h1>
                </div>
                <div class = "wrapper">
                    <h3>Info</h3>
                </div>
                <div class = "container">
                    <div>List 1</div>
                    <div>List 2</div>
                    <div>Calendar</div>
                </div>
            </div>
            <div class="footer">any footer info is needed ig</div>
        </section>
    )

}

export default Home;
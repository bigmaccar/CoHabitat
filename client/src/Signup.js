import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Signup(){

    return (
        <form>
            <center>
                <div class = "login">
                    <label for = "firstname">First Name: </label>
                    <input type = "text" placeholder="Enter first name." id="firstname" name="firstname"></input>
                    <br></br>
                    <label for = "lastname">Last Name: </label>
                    <input type = "text" placeholder="Enter last name." id="lastname" name="lastname"></input>
                    <br></br>
                    <label for = "email">Email: </label>
                    <input type = "text" placeholder="Enter email." id="email" name="email"></input>
                    <br></br>
                    <label for = "username">Username: </label>
                    <input type = "text" placeholder="Enter username." id="username" name="username"></input>
                    <br></br>
                    <label for = "password">Password: </label>
                    <input type = "text" placeholder="Enter password." id="password" name="password"></input>
                    <br></br>
                    <br></br>
                    <input type = "submit" value = "Submit"></input>
                    <p>Already have an account? <Link to="/Login">Login here.</Link></p>
                </div>
            </center>
        </form>
    )

}

export default Signup;
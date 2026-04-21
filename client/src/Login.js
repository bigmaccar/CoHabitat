import { BrowserRouter, Link, Routes, Route, Navigate } from "react-router-dom";
import React, {useState, useEffect} from "react";
import axios from 'axios';

function Login(){

    return (
        <form>
            <center>
                <div class = "login">
                    <label for = "username">Username: </label>
                    <input type = "text" placeholder="Enter username." id="username" name="username"></input>
                    <br></br>
                    <label for = "password">Password: </label>
                    <input type = "text" placeholder="Enter password." id="password" name="password"></input>
                    <br></br>
                    <br></br>
                    <input type = "submit" value = "Submit"></input>
                    <p>Don't have an account? <Link to="/Signup">Sign up here.</Link></p>
                </div>
            </center>
        </form>
    )

}

export default Login;
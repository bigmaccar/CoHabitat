import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from 'axios';

function Signup() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSignup(e) {
        e.preventDefault();
        try {
            await axios.post("http://localhost:7000/api/user", {
                firstName,
                lastName,
                email,
                password
            });
            navigate("/Login");
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed.");
        }
    }

    return (
        <form onSubmit={handleSignup}>
            <center>
                <div className="login">
                    <h2>Sign Up</h2>
                    <label htmlFor="firstname">First Name: </label>
                    <input type="text" placeholder="Enter first name." id="firstname" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <br />
                    <label htmlFor="lastname">Last Name: </label>
                    <input type="text" placeholder="Enter last name." id="lastname" value={lastName} onChange={e => setLastName(e.target.value)} />
                    <br />
                    <label htmlFor="email">Email: </label>
                    <input type="text" placeholder="Enter email." id="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <br />
                    <label htmlFor="password">Password: </label>
                    <input type="password" placeholder="Enter password." id="password" value={password} onChange={e => setPassword(e.target.value)} />
                    <br /><br />
                    {error && <p style={{color: "red"}}>{error}</p>}
                    <input type="submit" value="Sign Up" />
                    <p>Already have an account? <Link to="/Login">Login here.</Link></p>
                </div>
            </center>
        </form>
    );
}

export default Signup;

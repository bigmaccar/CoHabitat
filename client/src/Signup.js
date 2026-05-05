import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

function splitTags(value) {
    return value.split(",").map(tag => tag.trim()).filter(Boolean);
}

function Signup() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [preferredLocation, setPreferredLocation] = useState("");
    const [budgetMax, setBudgetMax] = useState("");
    const [lifestyleTags, setLifestyleTags] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSignup(e) {
        e.preventDefault();
        const cleanFirstName = firstName.trim();
        const cleanLastName = lastName.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanFirstName || !cleanLastName || !cleanEmail || !password) {
            setError("Please fill out first name, last name, email, and password.");
            setSuccess("");
            return;
        }
        if (!cleanEmail.includes("@")) {
            setError("Please enter a valid email address.");
            setSuccess("");
            return;
        }

        try {
            await axios.post("http://localhost:7000/api/user", {
                firstName: cleanFirstName,
                lastName: cleanLastName,
                email: cleanEmail,
                password,
                preferredLocation: preferredLocation.trim(),
                budgetMax: budgetMax ? parseFloat(budgetMax) : null,
                lifestyleTags: splitTags(lifestyleTags)
            });
            setError("");
            setSuccess("Account created. Please log in.");
            navigate("/Login");
        } catch (err) {
            setSuccess("");
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
                    <br />
                    <h3>Roommate Preferences</h3>
                    <label htmlFor="preferredLocation">Preferred Location: </label>
                    <input type="text" placeholder="Albany, NY" id="preferredLocation" value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} />
                    <br />
                    <label htmlFor="budgetMax">Max Budget: </label>
                    <input type="number" placeholder="1000" id="budgetMax" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} min="0" />
                    <br />
                    <label htmlFor="lifestyleTags">Lifestyle Tags: </label>
                    <input type="text" placeholder="quiet, clean, early riser" id="lifestyleTags" value={lifestyleTags} onChange={e => setLifestyleTags(e.target.value)} />
                    <br /><br />
                    {error && <p style={{color: "red"}}>{error}</p>}
                    {success && <p style={{color: "green"}}>{success}</p>}
                    <input type="submit" value="Sign Up" />
                    <p>Already have an account? <Link to="/Login">Login here.</Link></p>
                </div>
            </center>
        </form>
    );
}

export default Signup;
